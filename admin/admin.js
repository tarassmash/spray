/* Admin panel — vanilla JS, schema-driven */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const API = '/admin/api';
  let schema = [], content = null, saved = '', current = 'dashboard', leadsCache = [];
  const open = new Set(); // expanded list items

  // ---------- helpers ----------
  function h(tag, attrs = {}, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'html') el.innerHTML = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) if (kid !== null && kid !== undefined && kid !== false) el.append(kid.nodeType ? kid : String(kid));
    return el;
  }
  async function api(path, opts = {}) {
    const r = await fetch(API + path, {
      credentials: 'same-origin', ...opts,
      headers: opts.body && !(opts.body instanceof FormData) ? { 'Content-Type': 'application/json' } : undefined
    });
    if (r.status === 401) { showLogin(); throw new Error('unauthorized'); }
    const data = r.headers.get('content-type')?.includes('json') ? await r.json() : await r.text();
    if (!r.ok) throw new Error(data?.error || r.statusText);
    return data;
  }
  function toast(msg, bad) {
    const t = $('#toast'); t.textContent = msg; t.className = 'toast' + (bad ? ' bad' : ''); t.hidden = false;
    clearTimeout(toast.tm); toast.tm = setTimeout(() => (t.hidden = true), 2800);
  }
  const getAt = (obj, path) => path.reduce((o, k) => (o == null ? o : o[k]), obj);
  function setAt(obj, path, val) {
    let o = obj;
    for (let i = 0; i < path.length - 1; i++) { if (o[path[i]] == null) o[path[i]] = {}; o = o[path[i]]; }
    o[path[path.length - 1]] = val;
    markDirty();
  }
  const splitPath = (p) => (p ? p.split('.') : []);
  function markDirty() {
    const d = JSON.stringify(content) !== saved;
    $('#dirty').hidden = !d; $('#save').disabled = !d;
  }
  const L = (v) => (v && typeof v === 'object' ? v.en || v.es || '' : v || '');

  // ---------- auth ----------
  function showLogin() { $('#app').hidden = true; $('#login').hidden = false; }
  $('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    $('#login-err').textContent = '';
    try {
      const r = await fetch(API + '/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: e.target.password.value }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      boot();
    } catch (err) { $('#login-err').textContent = err.message; }
  });
  $('#logout').addEventListener('click', async () => { await api('/logout', { method: 'POST' }); location.reload(); });

  async function boot() {
    const me = await fetch(API + '/me').then((r) => r.json());
    if (!me.configured) { showLogin(); $('#login-err').textContent = 'На сервере не задана переменная ADMIN_PASSWORD.'; return; }
    if (!me.auth) return showLogin();
    [schema, content] = await Promise.all([api('/schema'), api('/content')]);
    saved = JSON.stringify(content);
    leadsCache = await api('/leads').catch(() => []);
    $('#login').hidden = true; $('#app').hidden = false;
    $('#site-name').textContent = content.site.name;
    current = location.hash.slice(1) || 'dashboard';
    renderTabs(); render();
  }

  // ---------- save ----------
  async function save() {
    try {
      $('#save').disabled = true;
      const r = await api('/content', { method: 'PUT', body: JSON.stringify(content) });
      content = r.content; saved = JSON.stringify(content); markDirty();
      toast('Сохранено ✓' + (r.indexNow?.status ? ' · Bing уведомлён' : ''));
    } catch (e) { toast('Ошибка: ' + e.message, true); markDirty(); }
  }
  $('#save').addEventListener('click', save);
  document.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); if (!$('#save').disabled) save(); } });
  window.addEventListener('beforeunload', (e) => { if (content && JSON.stringify(content) !== saved) { e.preventDefault(); e.returnValue = ''; } });
  $('#menu-btn').addEventListener('click', () => $('.side').classList.toggle('open'));

  // ---------- navigation ----------
  function renderTabs() {
    const nav = $('#tabs'); nav.innerHTML = '';
    const newLeads = leadsCache.filter((l) => l.status === 'new').length;
    for (const t of schema) {
      if (t.group) { nav.append(h('div', { class: 'grp' }, t.group)); continue; }
      nav.append(h('button', {
        class: 'tab' + (t.id === current ? ' active' : ''),
        onclick: () => { current = t.id; location.hash = t.id; $('.side').classList.remove('open'); renderTabs(); render(); window.scrollTo(0, 0); }
      }, h('span', { class: 'ic' }, t.icon || '•'), t.label, t.id === 'leads' && newLeads ? h('span', { class: 'badge' }, newLeads) : null));
    }
  }

  function render() {
    const tab = schema.find((t) => t.id === current) || schema[0];
    $('#tab-title').textContent = tab.label;
    const root = $('#content'); root.innerHTML = ''; titleEls.length = 0;
    if (tab.custom) return customs[tab.custom](root);
    if (tab.help) root.append(h('div', { class: 'help-top' }, tab.help));
    const base = splitPath(tab.path);
    const panel = h('div', { class: 'panel' });
    if (tab.auto === 'i18n') {
      const obj = getAt(content, base) || {};
      for (const k of Object.keys(obj)) panel.append(field({ k, type: 'i18n', label: UI_LABELS[k] || k }, base));
    } else {
      for (const f of tab.fields) panel.append(field(f, base));
    }
    root.append(panel);
    if (tab.actions) {
      const bar = h('div', { class: 'toolbar' });
      for (const a of tab.actions) bar.append(h('button', { class: 'btn', onclick: () => actions[a.id]() }, a.label));
      root.append(bar);
    }
  }

  const UI_LABELS = {
    navServices: 'Меню: Услуги', navProcess: 'Меню: Как работаем', navGallery: 'Меню: Работы', navReviews: 'Меню: Отзывы', navFaq: 'Меню: FAQ',
    ctaQuote: 'Кнопка: бесплатный расчёт', ctaWhatsapp: 'Кнопка: WhatsApp', from: 'Слово «от» перед ценой', callUs: 'Позвоните нам',
    formName: 'Форма: Имя', formPhone: 'Форма: Телефон', formEmail: 'Форма: Email', formTown: 'Форма: Город', formService: 'Форма: Услуга',
    formMessage: 'Форма: Сообщение', formSend: 'Форма: Кнопка отправки', formSuccess: 'Форма: Успешно отправлено', formError: 'Форма: Ошибка',
    cookieText: 'Cookie-баннер: текст', cookieAccept: 'Cookie: Принять', cookieReject: 'Cookie: Отклонить', cookieMore: 'Cookie: ссылка на политику',
    rights: 'Подвал: Все права защищены', home: 'Хлебные крошки: Главная'
  };

  // ---------- fields ----------
  function wrap(f, control, extraLabel) {
    return h('div', { class: 'f' },
      f.type === 'bool' ? null : h('div', { class: 'lbl' }, h('span', {}, f.label), extraLabel || null),
      control,
      f.help ? h('div', { class: 'help' }, f.help) : null);
  }
  function counterFor(f, val) {
    if (!f.counter) return null;
    const c = h('span', { class: 'counter' });
    const upd = (v) => { c.textContent = `${(v || '').length}/${f.counter}`; c.classList.toggle('over', (v || '').length > f.counter); };
    upd(val); c.upd = upd; return c;
  }

  function field(f, base) {
    const path = [...base, f.k];
    const val = getAt(content, path);
    switch (f.type) {
      case 'text': case 'number': case 'secret': {
        const cnt = counterFor(f, val);
        const inp = h('input', { type: f.type === 'secret' ? 'password' : f.type === 'number' ? 'number' : 'text', value: val ?? '', autocomplete: 'off',
          oninput: (e) => { setAt(content, path, e.target.value); cnt?.upd(e.target.value); } });
        if (f.type === 'secret') inp.addEventListener('focus', () => (inp.type = 'text'));
        return wrap(f, inp, cnt);
      }
      case 'textarea': case 'code': {
        const cnt = counterFor(f, val);
        const ta = h('textarea', { class: f.type === 'code' ? 'code' : '', spellcheck: f.type === 'code' ? 'false' : 'true', oninput: (e) => { setAt(content, path, e.target.value); cnt?.upd(e.target.value); } });
        ta.value = val ?? ''; return wrap(f, ta, cnt);
      }
      case 'i18n': case 'i18nArea': {
        const v = val && typeof val === 'object' ? val : { en: '', es: '' };
        if (!val || typeof val !== 'object') setAtSilent(content, path, v);
        const mk = (lang) => {
          const el = f.type === 'i18n' ? h('input', { type: 'text', value: v[lang] ?? '' }) : h('textarea', {});
          if (f.type === 'i18nArea') el.value = v[lang] ?? '';
          el.addEventListener('input', (e) => { setAt(content, [...path, lang], e.target.value); refreshTitles(); });
          return h('div', { class: 'l', 'data-l': lang.toUpperCase() }, el);
        };
        return wrap(f, h('div', { class: 'duo' }, mk('en'), mk('es')));
      }
      case 'bool': {
        const inp = h('input', { type: 'checkbox', onchange: (e) => setAt(content, path, e.target.checked) });
        inp.checked = !!val;
        return wrap(f, h('label', { class: 'switch' }, inp, f.label));
      }
      case 'color': {
        const txt = h('input', { type: 'text', value: val || '' });
        const col = h('input', { type: 'color', value: /^#[0-9a-f]{6}$/i.test(val) ? val : '#000000' });
        col.addEventListener('input', () => { txt.value = col.value; setAt(content, path, col.value); });
        txt.addEventListener('input', () => { if (/^#[0-9a-f]{6}$/i.test(txt.value)) col.value = txt.value; setAt(content, path, txt.value); });
        return wrap(f, h('div', { class: 'color' }, col, txt));
      }
      case 'select': {
        const s = h('select', { onchange: (e) => setAt(content, path, e.target.value) }, f.options.map((o) => h('option', { value: o, selected: o === val }, o)));
        return wrap(f, s);
      }
      case 'image': return wrap(f, imageField(path, val));
      case 'sub': {
        const fs = h('fieldset', { class: 'sub' }, h('legend', {}, f.label));
        for (const sf of f.fields) fs.append(field(sf, splitPath(f.path)));
        return fs;
      }
      case 'list': return listField(f, path);
    }
    return h('div', {}, 'Unknown field ' + f.type);
  }
  function setAtSilent(obj, path, val) { let o = obj; for (let i = 0; i < path.length - 1; i++) o = o[path[i]] ??= {}; o[path[path.length - 1]] = val; }

  function imageField(path, val) {
    const thumb = h('div', { class: 'thumb' });
    const inp = h('input', { type: 'text', value: val || '', placeholder: 'URL изображения' });
    const upd = (v) => { thumb.style.backgroundImage = v ? `url("${v.replace(/"/g, '')}")` : ''; };
    upd(val);
    inp.addEventListener('input', () => { setAt(content, path, inp.value); upd(inp.value); });
    const file = h('input', { type: 'file', accept: 'image/*', hidden: true });
    file.addEventListener('change', async () => {
      if (!file.files[0]) return;
      try {
        toast('Загрузка…');
        const url = await uploadFile(file.files[0]);
        inp.value = url; setAt(content, path, url); upd(url); toast('Загружено ✓');
      } catch (e) { toast(e.message, true); }
    });
    return h('div', { class: 'img-field' }, thumb, inp,
      h('button', { class: 'btn sm', type: 'button', onclick: () => file.click() }, '⇪ Загрузить'),
      h('button', { class: 'btn sm', type: 'button', onclick: () => pick((url) => { inp.value = url; setAt(content, path, url); upd(url); }) }, 'Медиатека'),
      file);
  }
  async function uploadFile(f) {
    const fd = new FormData(); fd.append('file', f);
    const r = await api('/upload', { method: 'POST', body: fd });
    return r.url;
  }

  function emptyFrom(itemSchema) {
    const o = {};
    for (const f of itemSchema) o[f.k] = f.type === 'i18n' || f.type === 'i18nArea' ? { en: '', es: '' } : f.type === 'bool' ? false : '';
    return o;
  }
  const titleEls = [];
  function refreshTitles() { for (const [el, fn] of titleEls) el.textContent = fn(); }

  function listField(f, path) {
    let arr = getAt(content, path);
    if (!Array.isArray(arr)) { arr = []; setAtSilent(content, path, arr); }
    const box = h('div', { class: 'list' });
    const draw = () => {
      box.innerHTML = '';
      arr.forEach((it, i) => {
        const key = path.join('.') + ':' + i;
        const isOpen = open.has(key);
        const tfn = () => L(it[f.titleKey]) || `Элемент ${i + 1}`;
        const title = h('strong', {}, tfn()); titleEls.push([title, tfn]);
        const move = (d) => { const j = i + d; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; open.clear(); markDirty(); draw(); };
        const head = h('div', { class: 'item-head', onclick: (e) => { if (e.target.closest('.ib')) return; isOpen ? open.delete(key) : open.add(key); draw(); } },
          h('span', { class: 'n' }, i + 1), title,
          h('button', { class: 'ib', title: 'Выше', onclick: () => move(-1) }, '↑'),
          h('button', { class: 'ib', title: 'Ниже', onclick: () => move(1) }, '↓'),
          h('button', { class: 'ib', title: 'Дублировать', onclick: () => { arr.splice(i + 1, 0, JSON.parse(JSON.stringify(it))); open.clear(); markDirty(); draw(); } }, '⧉'),
          h('button', { class: 'ib del', title: 'Удалить', onclick: () => { if (confirm('Удалить этот элемент?')) { arr.splice(i, 1); open.clear(); markDirty(); draw(); } } }, '✕'),
          h('span', { class: 'ib' }, isOpen ? '▾' : '▸'));
        const item = h('div', { class: 'item' }, head);
        if (isOpen) {
          const body = h('div', { class: 'item-body' });
          for (const sf of f.item) body.append(field(sf, [...path, i]));
          item.append(body);
        }
        box.append(item);
      });
    };
    draw();
    const add = h('button', { class: 'btn add', type: 'button', onclick: () => { arr.push(emptyFrom(f.item)); open.add(path.join('.') + ':' + (arr.length - 1)); markDirty(); draw(); } }, '+ Добавить');
    return h('div', { class: 'f' }, h('div', { class: 'lbl' }, f.label), f.help ? h('div', { class: 'help' }, f.help) : null, box, add);
  }

  // ---------- media picker ----------
  async function pick(cb) {
    const m = $('#picker'), grid = $('#picker-grid');
    grid.innerHTML = 'Загрузка…'; m.hidden = false;
    const files = await api('/uploads');
    grid.innerHTML = '';
    if (!files.length) grid.append(h('p', { class: 'empty' }, 'Пока нет загруженных файлов'));
    for (const f of files) grid.append(h('div', { class: 'media pick', onclick: () => { cb(f.url); m.hidden = true; } }, h('div', { class: 'ph', style: `background-image:url("${f.url}")` })));
  }
  $('#picker').addEventListener('click', (e) => { if (e.target.id === 'picker' || e.target.hasAttribute('data-close')) $('#picker').hidden = true; });

  // ---------- actions ----------
  const actions = {
    'test-telegram': async () => {
      if (JSON.stringify(content) !== saved) return toast('Сначала сохраните изменения', true);
      try { await api('/test-telegram', { method: 'POST' }); toast('Тест отправлен в Telegram ✓'); } catch (e) { toast(e.message, true); }
    }
  };

  // ---------- custom tabs ----------
  const customs = {
    dashboard(root) {
      const c = content, I = c.integrations, base = (c.site.url || location.origin).replace(/\/$/, '');
      const newL = leadsCache.filter((l) => l.status === 'new').length;
      root.append(h('div', { class: 'stats' },
        h('div', { class: 'stat' }, h('b', {}, newL), h('span', {}, 'новых заявок')),
        h('div', { class: 'stat' }, h('b', {}, leadsCache.length), h('span', {}, 'заявок всего')),
        h('div', { class: 'stat' }, h('b', {}, leadsCache.filter((l) => Date.now() - new Date(l.createdAt) < 30 * 864e5).length), h('span', {}, 'за 30 дней')),
        h('div', { class: 'stat' }, h('b', { style: 'font-size:15px' }, c.meta?.updatedAt ? new Date(c.meta.updatedAt).toLocaleString('ru') : '—'), h('span', {}, 'последнее изменение'))));

      const imgs = [c.hero, ...c.services.items, ...c.gallery.items, c.process];
      const noAlt = imgs.filter((x) => x.image && (!x.alt?.en || !x.alt?.es)).length;
      const ext = imgs.filter((x) => /^https?:\/\//.test(x.image || '')).length;
      const len = (s, a, b) => s.length >= a && s.length <= b;
      const checks = [
        [c.site.url && !/localhost/.test(c.site.url), 'Указан основной домен', 'Основное → Компания и контакты → домен. Влияет на canonical и sitemap.'],
        [I.gscVerification, 'Google Search Console подключён', 'Добавьте код и отправьте sitemap.xml в Search Console.'],
        [I.bingVerification, 'Bing Webmaster подключён', 'ChatGPT Search использует индекс Bing — подключите обязательно.'],
        [I.ga4Id || I.gtmId, 'Google Analytics 4 подключён', 'Вставьте G-XXXX в «Аналитика и пиксели».'],
        [I.fbPixelId, 'Facebook Pixel подключён', 'Для рекламы в Facebook/Instagram.', 'warn'],
        [I.fbPixelId ? I.fbCapiToken : true, 'Meta Conversions API', 'Серверные события повышают точность рекламы.', 'warn'],
        [c.site.googleBusiness, 'Ссылка на Google Business Profile', 'Очень важно для локального поиска и Gemini/Google Maps.'],
        [c.site.street && c.site.postalCode, 'Полный адрес для Schema.org', 'Улица и индекс улучшают локальную выдачу.', 'warn'],
        [len(c.seo.en.title, 30, 70) && len(c.seo.es.title, 30, 70), 'Длина Title в норме (30–70)', `EN ${c.seo.en.title.length}, ES ${c.seo.es.title.length} символов — Google обрежет длинный заголовок`, 'warn'],
        [len(c.seo.en.description, 110, 170) && len(c.seo.es.description, 110, 170), 'Длина Description в норме', `EN ${c.seo.en.description.length}, ES ${c.seo.es.description.length} символов`, 'warn'],
        [!noAlt, 'У всех фото есть ALT на обоих языках', noAlt ? `Без ALT: ${noAlt}` : ''],
        [!ext, 'Все фото загружены на ваш сервер', ext ? `${ext} фото всё ещё грузятся со старого сайта на Netlify — загрузите их через админку` : '', 'warn'],
        [c.seo.aiSummary?.en && c.seo.aiSummary?.es, 'AI-сводка заполнена', 'SEO и AI-поиск → AI-сводка'],
        [c.seo.allowAiSearch && c.seo.allowAiTraining, 'Доступ AI-ботам открыт (ChatGPT, Gemini, Perplexity)', 'SEO и AI-поиск → переключатели'],
        [c.reviews.items.some((r) => r.text?.en), 'Добавлены тексты отзывов', 'Тексты отзывов дают разметку Review — AI-ассистенты любят цитировать отзывы.', 'warn'],
        [c.faq.items.length >= 5, 'FAQ: 5+ вопросов', 'Вопросы-ответы — главный формат, который берут ChatGPT и Gemini.', 'warn'],
        [c.integrations.consentBanner || !(I.ga4Id || I.fbPixelId), 'Cookie-баннер (GDPR) включён', 'Обязателен в Испании при аналитике и пикселе.']
      ];
      const ok = checks.filter((x) => x[0]).length;
      root.append(h('div', { class: 'panel' }, h('h3', {}, `Чек-лист SEO и AI-видимости — ${ok}/${checks.length}`),
        h('div', { class: 'checks' }, checks.map(([pass, title, hint, lvl]) => h('div', { class: 'check ' + (pass ? 'ok' : lvl || 'bad') }, h('i', {}, pass ? '✓' : '!'), h('div', {}, title, hint && !pass ? h('small', {}, hint) : null))))));

      const enc = encodeURIComponent(base + '/en');
      root.append(h('div', { class: 'panel' }, h('h3', {}, 'Полезные ссылки и проверки'), h('div', { class: 'links' },
        [['sitemap.xml', '/sitemap.xml'], ['robots.txt', '/robots.txt'], ['llms.txt (для AI)', '/llms.txt'], ['Markdown EN', '/en.md'], ['Markdown ES', '/es.md'],
          ['Google Rich Results Test', 'https://search.google.com/test/rich-results?url=' + enc], ['Schema Validator', 'https://validator.schema.org/#url=' + enc],
          ['PageSpeed Insights', 'https://pagespeed.web.dev/analysis?url=' + enc], ['Search Console', 'https://search.google.com/search-console'],
          ['Bing Webmaster', 'https://www.bing.com/webmasters'], ['Meta Events Manager', 'https://business.facebook.com/events_manager2'], ['Google Analytics', 'https://analytics.google.com/']]
          .map(([t, u]) => h('a', { class: 'btn sm', href: u, target: '_blank', rel: 'noopener' }, t + ' ↗'))),
        h('div', { class: 'toolbar', style: 'margin:14px 0 0' }, h('button', { class: 'btn', onclick: async () => { const r = await api('/indexnow', { method: 'POST' }); toast(r.status ? `IndexNow: ответ ${r.status}` : 'IndexNow: нужен публичный домен'); } }, '⚡ Сообщить Bing/Yandex об обновлении (IndexNow)'))));
    },

    async leads(root) {
      leadsCache = await api('/leads'); renderTabs();
      let filter = 'all';
      const STATUSES = { new: 'Новая', work: 'В работе', done: 'Выполнена', lost: 'Отказ', spam: 'Спам' };
      const list = h('div', { class: 'leads' });
      const draw = () => {
        list.innerHTML = '';
        const items = leadsCache.filter((l) => filter === 'all' || l.status === filter);
        if (!items.length) list.append(h('div', { class: 'empty' }, 'Заявок пока нет. Они появятся здесь после отправки формы на сайте.'));
        for (const l of items) {
          const wa = 'https://wa.me/' + String(l.phone).replace(/\D/g, '');
          const st = h('select', { onchange: async (e) => { l.status = e.target.value; await api('/leads/' + l.id, { method: 'PATCH', body: JSON.stringify({ status: l.status, note: l.note }) }); renderTabs(); draw(); } },
            Object.entries(STATUSES).map(([k, v]) => h('option', { value: k, selected: l.status === k }, v)));
          const note = h('textarea', { placeholder: 'Заметка…' }); note.value = l.note || '';
          note.addEventListener('change', () => api('/leads/' + l.id, { method: 'PATCH', body: JSON.stringify({ status: l.status, note: note.value }) }).then(() => { l.note = note.value; toast('Заметка сохранена'); }));
          list.append(h('div', { class: 'lead ' + l.status },
            h('div', {}, h('h4', {}, l.name, ' · ', h('a', { href: 'tel:' + l.phone }, l.phone)),
              h('div', { class: 'meta' }, [new Date(l.createdAt).toLocaleString('ru'), l.service, l.town, l.email, (l.lang || '').toUpperCase()].filter(Boolean).join(' · '))),
            h('div', { class: 'acts' }, st, h('a', { class: 'btn sm', href: wa, target: '_blank' }, 'WhatsApp'),
              h('button', { class: 'btn sm danger', onclick: async () => { if (!confirm('Удалить заявку?')) return; await api('/leads/' + l.id, { method: 'DELETE' }); leadsCache = leadsCache.filter((x) => x.id !== l.id); renderTabs(); draw(); } }, '✕')),
            l.message ? h('div', { class: 'msg' }, l.message) : null, note));
        }
      };
      root.append(h('div', { class: 'toolbar' },
        h('select', { onchange: (e) => { filter = e.target.value; draw(); } }, h('option', { value: 'all' }, 'Все'), Object.entries(STATUSES).map(([k, v]) => h('option', { value: k }, v))),
        h('a', { class: 'btn', href: API + '/leads.csv' }, '⇩ Скачать CSV (Excel)')), list);
      draw();
    },

    async media(root) {
      const grid = h('div', { class: 'media-grid' });
      const file = h('input', { type: 'file', accept: 'image/*', multiple: true, hidden: true });
      const drop = h('div', { class: 'drop', onclick: () => file.click() }, 'Перетащите фото сюда или нажмите, чтобы выбрать. Фото автоматически сжимаются в WebP и создаётся версия для соцсетей.');
      const up = async (files) => { for (const f of files) { try { toast('Загрузка ' + f.name); await uploadFile(f); } catch (e) { toast(e.message, true); } } toast('Готово ✓'); load(); };
      file.addEventListener('change', () => up(file.files));
      drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
      drop.addEventListener('dragleave', () => drop.classList.remove('over'));
      drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('over'); up(e.dataTransfer.files); });
      const load = async () => {
        const files = await api('/uploads'); grid.innerHTML = '';
        if (!files.length) grid.append(h('p', { class: 'empty' }, 'Файлов пока нет'));
        for (const f of files) grid.append(h('div', { class: 'media' }, h('div', { class: 'ph', style: `background-image:url("${f.url}")` }),
          h('div', { class: 'row' }, h('button', { class: 'btn sm', onclick: () => { navigator.clipboard?.writeText(f.url); toast('Ссылка скопирована'); } }, 'Копировать'),
            h('button', { class: 'btn sm danger', onclick: async () => { if (!confirm('Удалить файл? Если он используется на сайте, картинка пропадёт.')) return; await api('/uploads/' + f.url.split('/').pop(), { method: 'DELETE' }); load(); } }, '✕'))));
      };
      root.append(drop, file, grid); load();
    },

    async backups(root) {
      const list = await api('/backups');
      const imp = h('input', { type: 'file', accept: 'application/json', hidden: true });
      imp.addEventListener('change', async () => {
        try { const data = JSON.parse(await imp.files[0].text()); if (!data.site) throw new Error('Неверный файл'); content = data; markDirty(); toast('Импортировано — проверьте и нажмите «Сохранить»'); }
        catch (e) { toast(e.message, true); }
      });
      root.append(h('div', { class: 'panel' }, h('h3', {}, 'Экспорт и импорт'),
        h('div', { class: 'toolbar' },
          h('button', { class: 'btn', onclick: () => { const a = h('a', { href: URL.createObjectURL(new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' })), download: 'site-content.json' }); a.click(); } }, '⇩ Скачать весь контент (JSON)'),
          h('button', { class: 'btn', onclick: () => imp.click() }, '⇪ Загрузить из JSON'), imp,
          h('button', { class: 'btn danger', onclick: async () => { if (!confirm('Вернуть весь контент к исходному? Текущая версия сохранится в резервных копиях.')) return; const r = await api('/reset', { method: 'POST' }); content = r.content; saved = JSON.stringify(content); markDirty(); toast('Сброшено'); } }, 'Сбросить к исходному'))));
      root.append(h('div', { class: 'panel' }, h('h3', {}, 'Автоматические копии (последние 20, создаются при каждом сохранении)'),
        list.length ? h('div', { class: 'checks' }, list.map((n) => h('div', { class: 'check ok', style: 'align-items:center' }, h('i', {}, '↺'),
          h('div', { style: 'flex:1' }, n.replace('content-', '').replace('.json', '').replace(/T(\d\d)-(\d\d)-(\d\d).*/, ' $1:$2:$3')),
          h('button', { class: 'btn sm', onclick: async () => { if (!confirm('Восстановить эту версию?')) return; const r = await api(`/backups/${n}/restore`, { method: 'POST' }); content = r.content; saved = JSON.stringify(content); markDirty(); toast('Восстановлено ✓'); } }, 'Восстановить'))))
          : h('p', { class: 'empty' }, 'Копий пока нет')));
    }
  };

  boot().catch((e) => { if (e.message !== 'unauthorized') toast(e.message, true); });
})();
