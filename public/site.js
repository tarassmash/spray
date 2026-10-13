(function () {
  var S = window.SITE || {};
  var hasGtag = typeof window.gtag === 'function';
  function ga(name, params) { if (typeof window.gtag === 'function') window.gtag('event', name, params || {}); if (window.dataLayer) window.dataLayer.push({ event: name, ...(params || {}) }); }
  function fb(name, params, opts) { if (typeof window.fbq === 'function') window.fbq('track', name, params || {}, opts || {}); }

  // mobile menu
  var burger = document.querySelector('.burger'), nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
    });
    nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') { nav.classList.remove('open'); burger.setAttribute('aria-expanded', false); } });
  }

  // cookie consent (Google Consent Mode v2 + Meta Pixel consent)
  var banner = document.getElementById('cookie');
  function applyConsent(v) {
    try { localStorage.setItem('consent', v); } catch (e) {}
    if (v === 'granted') {
      if (typeof window.gtag === 'function') window.gtag('consent', 'update', { ad_storage: 'granted', analytics_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' });
      if (typeof window.fbq === 'function') { window.fbq('consent', 'grant'); }
    }
    if (banner) banner.hidden = true;
  }
  if (banner) {
    var saved = null; try { saved = localStorage.getItem('consent'); } catch (e) {}
    if (!saved) banner.hidden = false;
    banner.addEventListener('click', function (e) { var v = e.target.getAttribute('data-consent'); if (v) applyConsent(v); });
  }

  // click tracking
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-track]');
    if (!a) return;
    var kind = a.getAttribute('data-track');
    ga(kind === 'whatsapp' ? 'click_whatsapp' : 'click_call', { link_url: a.href });
    fb('Contact', { content_name: kind });
  });

  // lightbox
  var lb = document.getElementById('lightbox');
  if (lb && lb.showModal) {
    document.querySelectorAll('.gal-btn').forEach(function (b) {
      b.addEventListener('click', function () { lb.querySelector('img').src = b.getAttribute('data-full'); lb.querySelector('img').alt = b.getAttribute('aria-label'); lb.showModal(); });
    });
    lb.addEventListener('click', function () { lb.close(); });
  }

  // lead form
  var form = document.getElementById('lead-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = form.querySelector('.form-msg'), btn = form.querySelector('button[type=submit]');
      var data = Object.fromEntries(new FormData(form).entries());
      if (!data.name || !data.phone) { form.reportValidity(); return; }
      var eventId = 'lead-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
      data.lang = S.lang; data.eventId = eventId; data.page = location.href;
      var m = document.cookie.match(/_fbp=([^;]+)/); if (m) data.fbp = m[1];
      var c = document.cookie.match(/_fbc=([^;]+)/); if (c) data.fbc = c[1];
      btn.disabled = true; msg.className = 'form-msg'; msg.textContent = '…';
      fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function () {
          msg.className = 'form-msg ok'; msg.textContent = S.ok; form.reset();
          ga('generate_lead', { form: 'quote', service: data.service, currency: 'EUR' });
          fb('Lead', { content_name: data.service }, { eventID: eventId });
        })
        .catch(function () { msg.className = 'form-msg err'; msg.textContent = S.err; })
        .finally(function () { btn.disabled = false; });
    });
  }
})();
