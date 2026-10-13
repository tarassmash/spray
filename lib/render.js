const fs = require('fs');
const path = require('path');
const { LANGS, t, lines, abs, jsonLd } = require('./seo');
const { UPLOAD_DIR } = require('./store');

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const attr = esc;

const ICON = {
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1l-2.22 2.23z" fill="currentColor"/></svg>',
  wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.15l-.3-.18-3 .78.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.25-.12-1.47-.72-1.7-.8s-.39-.13-.56.12-.64.8-.79.97-.29.19-.54.06a6.7 6.7 0 01-3.33-2.9c-.25-.43.25-.4.72-1.34a.45.45 0 00-.02-.43c-.06-.12-.56-1.35-.77-1.85s-.4-.42-.56-.43h-.48a.92.92 0 00-.66.31 2.8 2.8 0 00-.87 2.07 4.85 4.85 0 001.02 2.58 11.1 11.1 0 004.25 3.76c1.58.68 2.2.74 3 .62a2.55 2.55 0 001.68-1.18 2.1 2.1 0 00.14-1.18c-.06-.11-.23-.17-.48-.3z"/></svg>',
  fb: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 21v-7.5H16l.4-3h-2.9V8.6c0-.87.25-1.46 1.5-1.46H16.6V4.46A21 21 0 0014.3 4.3c-2.3 0-3.8 1.4-3.8 3.95v2.25H8v3h2.5V21h3z"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3.5l2.6 5.3 5.9.86-4.25 4.14 1 5.85L12 16.9l-5.25 2.75 1-5.85L3.5 9.66l5.9-.86z"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};

// Responsive image: uploaded images have a -800 variant created on upload.
const variantCache = new Map();
function img(src, alt, { sizes = '100vw', eager = false, w = 1200, h = 800, cls = '' } = {}) {
  if (!src) return '';
  let srcset = '';
  const m = /^\/uploads\/([\w-]+)\.webp$/.exec(src);
  if (m) {
    const v = `/uploads/${m[1]}-800.webp`;
    if (!variantCache.has(v)) variantCache.set(v, fs.existsSync(path.join(UPLOAD_DIR, `${m[1]}-800.webp`)));
    if (variantCache.get(v)) srcset = ` srcset="${attr(v)} 800w, ${attr(src)} 1920w" sizes="${attr(sizes)}"`;
  }
  return `<img src="${attr(src)}"${srcset} alt="${attr(alt)}" width="${w}" height="${h}"${cls ? ` class="${cls}"` : ''} ${eager ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"'}>`;
}

// Tiny markdown for custom pages: ## headings, lists, **bold**, *italic*, [links](url), paragraphs.
function md(src) {
  const inline = (s) => esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*|mailto:[^\s)]+|tel:[^\s)]+)\)/g, '<a href="$2">$1</a>');
  const out = [];
  let list = null;
  for (const raw of String(src || '').split('\n')) {
    const line = raw.trimEnd();
    const li = /^\s*[-*]\s+(.*)/.exec(line);
    if (li) { if (!list) { list = []; } list.push(`<li>${inline(li[1])}</li>`); continue; }
    if (list) { out.push(`<ul>${list.join('')}</ul>`); list = null; }
    const h = /^(#{1,4})\s+(.*)/.exec(line);
    if (h) { const n = Math.min(4, h[1].length + 1); out.push(`<h${n}>${inline(h[2])}</h${n}>`); continue; }
    if (line.trim()) out.push(`<p>${inline(line)}</p>`);
  }
  if (list) out.push(`<ul>${list.join('')}</ul>`);
  return out.join('\n');
}

function head(c, lang, { base, url, title, description, alternates, page }) {
  const s = c.site, th = c.theme, I = c.integrations;
  const ogSrc = String(c.seo.ogImage || c.hero.image || '').replace(/^(\/uploads\/[\w-]+)\.webp$/, '$1-og.jpg');
  const og = abs(base, ogSrc);
  const fonts = [th.fontHeading, th.fontBody].filter(Boolean).map((f) => f.trim()).filter((f, i, a) => a.indexOf(f) === i);
  const fontUrl = fonts.length ? `https://fonts.googleapis.com/css2?${fonts.map((f) => `family=${encodeURIComponent(f).replace(/%20/g, '+')}:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500`).join('&')}&display=swap` : '';
  const consent = I.consentBanner ? 'denied' : 'granted';
  const tracking = [];
  if (I.ga4Id || I.gtmId) {
    tracking.push(`<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{ad_storage:'${consent}',analytics_storage:'${consent}',ad_user_data:'${consent}',ad_personalization:'${consent}',wait_for_update:500});try{if(localStorage.getItem('consent')==='granted')gtag('consent','update',{ad_storage:'granted',analytics_storage:'granted',ad_user_data:'granted',ad_personalization:'granted'})}catch(e){}</script>`);
  }
  if (I.gtmId) tracking.push(`<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${attr(I.gtmId)}');</script>`);
  if (I.ga4Id) tracking.push(`<script async src="https://www.googletagmanager.com/gtag/js?id=${attr(I.ga4Id)}"></script><script>gtag('js',new Date());gtag('config','${attr(I.ga4Id)}');</script>`);
  if (I.fbPixelId) tracking.push(`<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');${I.consentBanner ? "try{if(localStorage.getItem('consent')!=='granted')fbq('consent','revoke')}catch(e){fbq('consent','revoke')}" : ''}fbq('init','${attr(I.fbPixelId)}');fbq('track','PageView');</script>`);

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${attr(description)}">
${c.seo[lang]?.keywords && !page ? `<meta name="keywords" content="${attr(c.seo[lang].keywords)}">` : ''}
<meta name="robots" content="${c.seo.indexing ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' : 'noindex, nofollow'}">
<link rel="canonical" href="${attr(url)}">
${alternates.map(([l, u]) => `<link rel="alternate" hreflang="${l}" href="${attr(u)}">`).join('\n')}
<meta name="theme-color" content="${attr(th.primary)}">
<meta name="geo.region" content="${attr(s.country)}-A">
<meta name="geo.placename" content="${attr(s.locality)}">
${s.lat ? `<meta name="geo.position" content="${attr(s.lat)};${attr(s.lng)}"><meta name="ICBM" content="${attr(s.lat)}, ${attr(s.lng)}">` : ''}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${attr(s.name)}">
<meta property="og:title" content="${attr(title)}">
<meta property="og:description" content="${attr(description)}">
<meta property="og:url" content="${attr(url)}">
<meta property="og:locale" content="${lang === 'es' ? 'es_ES' : 'en_GB'}">
<meta property="og:locale:alternate" content="${lang === 'es' ? 'en_GB' : 'es_ES'}">
${og ? `<meta property="og:image" content="${attr(og)}"><meta property="og:image:alt" content="${attr(t(c.hero.alt, lang))}"><meta name="twitter:image" content="${attr(og)}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${attr(title)}">
<meta name="twitter:description" content="${attr(description)}">
${I.gscVerification ? `<meta name="google-site-verification" content="${attr(I.gscVerification)}">` : ''}
${I.bingVerification ? `<meta name="msvalidate.01" content="${attr(I.bingVerification)}">` : ''}
${I.yandexVerification ? `<meta name="yandex-verification" content="${attr(I.yandexVerification)}">` : ''}
${I.fbDomainVerification ? `<meta name="facebook-domain-verification" content="${attr(I.fbDomainVerification)}">` : ''}
<link rel="icon" href="${attr(s.favicon || '/favicon.svg')}">
<link rel="apple-touch-icon" href="${attr(s.favicon || '/favicon.svg')}">
<link rel="alternate" type="text/markdown" href="${base}/${lang}.md" title="Markdown version">
<link rel="sitemap" type="application/xml" href="/sitemap.xml">
${fontUrl ? `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="${attr(fontUrl)}">` : ''}
${!page && c.hero.image ? `<link rel="preload" as="image" href="${attr(c.hero.image)}" fetchpriority="high">` : ''}
<style>:root{--primary:${th.primary};--accent:${th.accent};--accent-soft:${th.accentSoft};--bg:${th.bg};--surface:${th.surface};--text:${th.text};--muted:${th.muted};--radius:${Number(th.radius) || 14}px;--font-h:'${th.fontHeading}',Georgia,serif;--font-b:'${th.fontBody}',system-ui,sans-serif}</style>
<link rel="stylesheet" href="/site.css?v=${encodeURIComponent((c.meta?.updatedAt || '').slice(0, 19))}">
<script type="application/ld+json">${jsonLd(c, lang, { base, url, page })}</script>
${tracking.join('\n')}
${I.headCode || ''}
</head>`;
}

function header(c, lang, home) {
  const s = c.site, u = c.ui, other = lang === 'en' ? 'es' : 'en';
  const h = home ? '' : `/${lang}`;
  const nav = [
    ['services', u.navServices], ['process', u.navProcess], ['gallery', u.navGallery], ['reviews', u.navReviews], ['faq', u.navFaq]
  ].filter(([id]) => c.sections[id]).map(([id, l]) => `<a href="${h}#${id}">${esc(t(l, lang))}</a>`).join('');
  return `<a class="skip" href="#main">Skip to content</a>
<header class="hdr" id="top">
  <div class="wrap hdr-in">
    <a class="brand" href="/${lang}" aria-label="${attr(s.name)}">${s.logo ? `<img src="${attr(s.logo)}" alt="${attr(s.name)}" height="36">` : `<span class="brand-mark" aria-hidden="true"></span><span>${esc(s.name)}</span>`}</a>
    <nav class="nav" id="nav" aria-label="Main">${nav}</nav>
    <div class="hdr-act">
      <a class="lang" href="/${other}" hreflang="${other}" lang="${other}">${other.toUpperCase()}</a>
      <a class="btn btn-sm btn-primary hdr-phone" href="tel:${attr(s.phone.replace(/[^\d+]/g, ''))}" data-track="call">${ICON.phone}<span>${esc(s.phone)}</span></a>
      <button class="burger" aria-label="Menu" aria-controls="nav" aria-expanded="false"><span></span><span></span></button>
    </div>
  </div>
</header>`;
}

function footer(c, lang) {
  const s = c.site, u = c.ui, year = new Date().getFullYear();
  const pages = c.pages.filter((p) => p.inFooter && p.slug).map((p) => `<a href="/${lang}/p/${attr(p.slug)}">${esc(t(p.title, lang))}</a>`).join(' · ');
  const wa = `https://wa.me/${s.whatsapp}?text=${encodeURIComponent(t(s.whatsappText, lang))}`;
  return `<footer class="ftr">
  <div class="wrap ftr-in">
    <div>
      <div class="brand brand-inv"><span class="brand-mark" aria-hidden="true"></span><span>${esc(s.name)}</span></div>
      <p>${esc(t(c.footer.tagline, lang))}</p>
      <p class="muted-inv">${esc(t(c.footer.area, lang))}</p>
    </div>
    <div class="ftr-links">
      <a href="tel:${attr(s.phone.replace(/[^\d+]/g, ''))}" data-track="call">${esc(s.phone)}</a>
      ${s.email ? `<a href="mailto:${attr(s.email)}">${esc(s.email)}</a>` : ''}
      ${s.facebook ? `<a href="${attr(s.facebook)}" rel="noopener" target="_blank">Facebook</a>` : ''}
      ${s.instagram ? `<a href="${attr(s.instagram)}" rel="noopener" target="_blank">Instagram</a>` : ''}
    </div>
    <div class="ftr-links">
      <span><a href="/es" hreflang="es" lang="es">Español</a> · <a href="/en" hreflang="en" lang="en">English</a></span>
      ${pages ? `<span>${pages}</span>` : ''}
    </div>
  </div>
  <div class="wrap ftr-bottom">© ${year} ${esc(s.name)} · ${esc(t(u.rights, lang))}</div>
</footer>
<a class="wa-float" href="${attr(wa)}" target="_blank" rel="noopener" data-track="whatsapp" aria-label="WhatsApp">${ICON.wa}</a>
${c.integrations.consentBanner && (c.integrations.ga4Id || c.integrations.gtmId || c.integrations.fbPixelId) ? `<div class="cookie" id="cookie" hidden role="dialog" aria-live="polite" aria-label="Cookies">
  <p>${esc(t(u.cookieText, lang))} <a href="/${lang}/p/cookies">${esc(t(u.cookieMore, lang))}</a></p>
  <div class="cookie-btns"><button class="btn btn-sm btn-ghost" data-consent="denied">${esc(t(u.cookieReject, lang))}</button><button class="btn btn-sm btn-primary" data-consent="granted">${esc(t(u.cookieAccept, lang))}</button></div>
</div>` : ''}
${c.integrations.gtmId ? `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${attr(c.integrations.gtmId)}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>` : ''}
<script>window.SITE=${JSON.stringify({ lang, ok: t(u.formSuccess, lang), err: t(u.formError, lang) }).replace(/</g, '\\u003c')}</script>
<script src="/site.js" defer></script>
${c.integrations.bodyCode || ''}`;
}

const sectionHead = (eyebrow, title, text, lang, center) => `<div class="sh${center ? ' sh-c' : ''}">
  ${t(eyebrow, lang) ? `<p class="eyebrow">${esc(t(eyebrow, lang))}</p>` : ''}
  <h2>${esc(t(title, lang))}</h2>
  ${t(text, lang) ? `<p class="lead">${esc(t(text, lang))}</p>` : ''}
</div>`;

const galCols = (n) => (n <= 2 ? Math.max(n, 1) : n === 4 ? 2 : n % 3 === 0 ? 3 : n % 4 === 0 ? 4 : 3);

function home(c, lang, base) {
  const s = c.site, u = c.ui, S = c.sections;
  const wa = `https://wa.me/${s.whatsapp}?text=${encodeURIComponent(t(s.whatsappText, lang))}`;
  const tel = `tel:${s.phone.replace(/[^\d+]/g, '')}`;
  const out = [];

  out.push(`<section class="hero">
  <div class="wrap hero-in">
    <div class="hero-txt">
      <p class="eyebrow">${esc(t(c.hero.eyebrow, lang))}</p>
      <h1>${esc(t(c.hero.title, lang))} <em>${esc(t(c.hero.titleAccent, lang))}</em></h1>
      <p class="lead">${esc(t(c.hero.text, lang))}</p>
      <div class="cta-row">
        <a class="btn btn-wa" href="${attr(wa)}" target="_blank" rel="noopener" data-track="whatsapp">${ICON.wa}${esc(t(u.ctaWhatsapp, lang))}</a>
        <a class="btn btn-ghost" href="#quote">${esc(t(u.ctaQuote, lang))}</a>
      </div>
      <ul class="badges">${lines(t(c.hero.badges, lang)).map((b) => `<li>${ICON.check}${esc(b)}</li>`).join('')}</ul>
    </div>
    <div class="hero-img">
      ${img(c.hero.image, t(c.hero.alt, lang), { eager: true, sizes: '(max-width: 900px) 100vw, 50vw', w: 1200, h: 1400 })}
      ${c.hero.priceValue ? `<div class="price-tag"><span>${esc(t(c.hero.priceLabel, lang))}</span><strong>${esc(c.hero.priceValue)}</strong></div>` : ''}
    </div>
  </div>
</section>`);

  if (S.services) out.push(`<section class="sec" id="services">
  <div class="wrap">
    ${sectionHead(c.services.eyebrow, c.services.title, c.services.text, lang)}
    <div class="cards">
      ${c.services.items.map((it) => `<article class="card">
        <div class="card-img">${img(it.image, t(it.alt, lang), { sizes: '(max-width: 900px) 100vw, 33vw', w: 720, h: 480 })}</div>
        <div class="card-body">
          <div class="card-top"><h3>${esc(t(it.title, lang))}</h3>${it.price ? `<p class="price"><span>${esc(t(u.from, lang))}</span> ${esc(it.price)} €</p>` : ''}</div>
          <p>${esc(t(it.text, lang))}</p>
          <ul class="ticks">${lines(t(it.bullets, lang)).map((b) => `<li>${ICON.check}${esc(b)}</li>`).join('')}</ul>
          <a class="link" href="#quote">${esc(t(u.ctaQuote, lang))} ${ICON.arrow}</a>
        </div>
      </article>`).join('')}
    </div>
    ${t(c.services.note, lang) ? `<p class="note">${esc(t(c.services.note, lang))}</p>` : ''}
  </div>
</section>`);

  if (S.process) out.push(`<section class="sec sec-alt" id="process">
  <div class="wrap split">
    <div>
      ${sectionHead(c.process.eyebrow, c.process.title, c.process.text, lang)}
      <ol class="steps">${c.process.steps.map((st, i) => `<li><span class="num">${String(i + 1).padStart(2, '0')}</span><div><h3>${esc(t(st.title, lang))}</h3><p>${esc(t(st.text, lang))}</p></div></li>`).join('')}</ol>
    </div>
    <div class="split-img">${img(c.process.image, t(c.process.alt, lang), { sizes: '(max-width: 900px) 100vw, 45vw', w: 900, h: 1100 })}</div>
  </div>
</section>`);

  if (S.compare) out.push(`<section class="sec" id="compare">
  <div class="wrap narrow">
    ${sectionHead(c.compare.eyebrow, c.compare.title, '', lang, true)}
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th scope="col"><span class="sr">—</span></th><th scope="col" class="win">${esc(t(c.compare.colA, lang))}</th><th scope="col">${esc(t(c.compare.colB, lang))}</th></tr></thead>
      <tbody>${c.compare.rows.map((r) => `<tr><th scope="row">${esc(t(r.label, lang))}</th><td class="win">${ICON.check}${esc(t(r.a, lang))}</td><td>${esc(t(r.b, lang))}</td></tr>`).join('')}</tbody>
    </table></div>
  </div>
</section>`);

  if (S.gallery) out.push(`<section class="sec sec-alt" id="gallery">
  <div class="wrap">
    ${sectionHead(c.gallery.eyebrow, c.gallery.title, c.gallery.text, lang)}
    <div class="gal" style="--cols:${galCols(c.gallery.items.length)}">${c.gallery.items.map((g, i) => `<figure><button class="gal-btn" data-full="${attr(g.image)}" aria-label="${attr(t(g.alt, lang))}">${img(g.image, t(g.alt, lang), { sizes: '(max-width: 520px) 100vw, (max-width: 900px) 50vw, 40vw', w: 800, h: 600 })}</button><figcaption>${esc(t(g.caption, lang))}</figcaption></figure>`).join('')}</div>
  </div>
  <dialog class="lightbox" id="lightbox"><button class="lb-close" aria-label="Close">×</button><img alt=""></dialog>
</section>`);

  if (S.reviews) out.push(`<section class="sec" id="reviews">
  <div class="wrap">
    <div class="sh-row">${sectionHead(c.reviews.eyebrow, c.reviews.title, c.reviews.text, lang)}
    ${c.reviews.linkUrl ? `<a class="btn btn-ghost" href="${attr(c.reviews.linkUrl)}" target="_blank" rel="noopener">${ICON.fb}${esc(t(c.reviews.linkLabel, lang))}</a>` : ''}</div>
    <ul class="reviews">${c.reviews.items.map((r) => {
      const ini = r.name.split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
      const n = Math.max(0, Math.min(5, Number(r.rating) || 0));
      return `<li class="review">
        <div class="stars" aria-label="${n}/5">${ICON.star.repeat(n)}</div>
        ${t(r.text, lang) ? `<blockquote>${esc(t(r.text, lang))}</blockquote>` : ''}
        <span class="tag">${esc(t(r.service, lang))}</span>
        <div class="who"><span class="avatar" aria-hidden="true">${esc(ini)}</span><div><strong>${esc(r.name)}</strong><span>${ICON.pin}${esc(r.town)}</span></div></div>
      </li>`;
    }).join('')}</ul>
  </div>
</section>`);

  if (S.about) out.push(`<section class="sec sec-dark" id="about">
  <div class="wrap split split-top">
    <div>${sectionHead(c.about.eyebrow, c.about.title, '', lang)}<p class="lead">${esc(t(c.about.text, lang))}</p></div>
    <dl class="facts">${c.about.facts.map((f) => `<div><dt>${esc(t(f.label, lang))}</dt><dd>${esc(t(f.value, lang))}</dd></div>`).join('')}</dl>
  </div>
</section>`);

  if (S.area) out.push(`<section class="sec" id="area">
  <div class="wrap">
    ${sectionHead(c.area.eyebrow, c.area.title, c.area.text, lang)}
    <ul class="towns">${lines(c.area.towns).map((x) => `<li>${ICON.pin}${esc(x)}</li>`).join('')}</ul>
  </div>
</section>`);

  if (S.faq) out.push(`<section class="sec sec-alt" id="faq">
  <div class="wrap narrow">
    ${sectionHead(c.faq.eyebrow, c.faq.title, '', lang, true)}
    <div class="faq">${c.faq.items.map((f, i) => `<details${i === 0 ? ' open' : ''}><summary><h3>${esc(t(f.q, lang))}</h3><span class="plus" aria-hidden="true"></span></summary><p>${esc(t(f.a, lang))}</p></details>`).join('')}</div>
  </div>
</section>`);

  if (S.quote) out.push(`<section class="sec" id="quote">
  <div class="wrap quote">
    <div>
      ${sectionHead(c.quote.eyebrow, c.quote.title, c.quote.text, lang)}
      <div class="contacts">
        <a class="contact" href="${attr(tel)}" data-track="call">${ICON.phone}<span><small>${esc(t(u.callUs, lang))}</small>${esc(s.phone)}</span></a>
        <a class="contact contact-wa" href="${attr(wa)}" target="_blank" rel="noopener" data-track="whatsapp">${ICON.wa}<span><small>WhatsApp</small>${esc(s.phone)}</span></a>
        ${s.facebook ? `<a class="contact" href="${attr(s.facebook)}" target="_blank" rel="noopener">${ICON.fb}<span><small>Facebook</small>${esc(s.facebook.replace(/^https?:\/\/(www\.)?facebook\.com\//, ''))}</span></a>` : ''}
      </div>
    </div>
    <form class="form" id="lead-form" novalidate>
      <div class="hp" aria-hidden="true"><label>Bot <input name="website" tabindex="-1" autocomplete="off"></label></div>
      <div class="row2">
        <label>${esc(t(u.formName, lang))}<input name="name" required autocomplete="name" maxlength="120"></label>
        <label>${esc(t(u.formPhone, lang))}<input name="phone" type="tel" required autocomplete="tel" maxlength="40"></label>
      </div>
      <div class="row2">
        <label>${esc(t(u.formEmail, lang))}<input name="email" type="email" autocomplete="email" maxlength="160"></label>
        <label>${esc(t(u.formTown, lang))}<input name="town" maxlength="120" list="towns"></label>
      </div>
      <datalist id="towns">${lines(c.area.towns).map((x) => `<option value="${attr(x)}">`).join('')}</datalist>
      <label>${esc(t(u.formService, lang))}<select name="service">${lines(t(c.quote.options, lang)).map((o) => `<option>${esc(o)}</option>`).join('')}</select></label>
      <label>${esc(t(u.formMessage, lang))}<textarea name="message" rows="4" maxlength="3000"></textarea></label>
      <button class="btn btn-primary btn-block" type="submit">${esc(t(u.formSend, lang))}</button>
      <p class="form-note">${esc(t(c.quote.privacy, lang))}</p>
      <p class="form-msg" role="status" aria-live="polite"></p>
    </form>
  </div>
</section>`);

  return out.join('\n');
}

function renderHome(c, lang, base) {
  const url = `${base}/${lang}`;
  const alternates = [...LANGS.map((l) => [l, `${base}/${l}`]), ['x-default', `${base}/${c.site.defaultLang || 'en'}`]];
  const seo = c.seo[lang] || c.seo.en;
  return `${head(c, lang, { base, url, title: seo.title, description: seo.description, alternates })}
<body>
${header(c, lang, true)}
<main id="main">
${home(c, lang, base)}
</main>
${footer(c, lang)}
</body></html>`;
}

function renderPage(c, lang, base, page) {
  const url = `${base}/${lang}/p/${page.slug}`;
  const alternates = [...LANGS.map((l) => [l, `${base}/${l}/p/${page.slug}`]), ['x-default', `${base}/${c.site.defaultLang || 'en'}/p/${page.slug}`]];
  const title = `${t(page.title, lang)} | ${c.site.name}`;
  return `${head(c, lang, { base, url, title, description: t(page.description, lang) || t(page.title, lang), alternates, page })}
<body>
${header(c, lang, false)}
<main id="main" class="page">
  <div class="wrap narrow">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="/${lang}">${esc(t(c.ui.home, lang))}</a> / <span>${esc(t(page.title, lang))}</span></nav>
    <h1>${esc(t(page.title, lang))}</h1>
    <div class="prose">${md(t(page.body, lang))}</div>
  </div>
</main>
${footer(c, lang)}
</body></html>`;
}

module.exports = { renderHome, renderPage, esc };
