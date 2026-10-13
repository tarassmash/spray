// Structured data, sitemap, robots.txt, llms.txt, markdown versions, IndexNow.
const LANGS = ['en', 'es'];
const t = (v, lang) => (v && typeof v === 'object' ? (v[lang] ?? v.en ?? '') : v ?? '');
const lines = (s) => String(s || '').split('\n').map((x) => x.trim()).filter(Boolean);

function baseUrl(c, req) {
  const u = (c.site.url || '').trim().replace(/\/+$/, '');
  if (u) return u;
  if (req) return `${req.protocol}://${req.get('host')}`;
  return '';
}
const abs = (base, src) => (!src ? '' : /^https?:\/\//.test(src) ? src : base + (src.startsWith('/') ? '' : '/') + src);

function jsonLd(c, lang, { base, url, page } = {}) {
  const s = c.site;
  const seo = c.seo[lang] || c.seo.en;
  const bizId = base + '/#business';
  const towns = lines(c.area.towns);

  const offers = c.services.items.map((it) => ({
    '@type': 'Offer',
    priceCurrency: 'EUR',
    priceSpecification: { '@type': 'PriceSpecification', minPrice: Number(it.price) || undefined, priceCurrency: 'EUR' },
    availability: 'https://schema.org/InStock',
    areaServed: towns.slice(0, 10).map((n) => ({ '@type': 'City', name: n })),
    itemOffered: {
      '@type': 'Service',
      name: t(it.title, lang),
      description: t(it.text, lang),
      serviceType: t(it.title, lang),
      provider: { '@id': bizId },
      image: abs(base, it.image) || undefined
    }
  }));

  const rated = c.reviews.items.filter((r) => t(r.text, lang) && Number(r.rating));
  const business = {
    '@type': ['HousePainter', 'LocalBusiness'],
    '@id': bizId,
    name: s.name,
    alternateName: s.legalName || undefined,
    description: t(c.seo.aiSummary, lang) || seo.description,
    url: `${base}/${lang}`,
    telephone: s.phone,
    email: s.email || undefined,
    image: [abs(base, c.seo.ogImage || c.hero.image)].filter(Boolean),
    logo: abs(base, s.logo) || undefined,
    priceRange: s.priceRange || undefined,
    currenciesAccepted: 'EUR',
    knowsLanguage: ['en', 'es'],
    address: {
      '@type': 'PostalAddress',
      streetAddress: s.street || undefined,
      addressLocality: s.locality,
      addressRegion: s.region,
      postalCode: s.postalCode || undefined,
      addressCountry: s.country
    },
    geo: s.lat && s.lng ? { '@type': 'GeoCoordinates', latitude: Number(s.lat), longitude: Number(s.lng) } : undefined,
    areaServed: [
      ...(s.lat && s.lng ? [{
        '@type': 'GeoCircle',
        geoMidpoint: { '@type': 'GeoCoordinates', latitude: Number(s.lat), longitude: Number(s.lng) },
        geoRadius: String((Number(s.serviceRadiusKm) || 50) * 1000)
      }] : []),
      ...towns.map((n) => ({ '@type': 'City', name: n }))
    ],
    openingHours: lines(s.openingHours),
    sameAs: [s.facebook, s.instagram, s.googleBusiness].filter(Boolean),
    contactPoint: {
      '@type': 'ContactPoint', telephone: s.phone, contactType: 'customer service',
      availableLanguage: ['English', 'Spanish'], areaServed: 'ES'
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: t(c.services.title, lang),
      itemListElement: offers
    },
    knowsAbout: c.services.items.map((it) => t(it.title, lang))
  };
  if (rated.length) {
    business.review = rated.map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.name },
      reviewRating: { '@type': 'Rating', ratingValue: Number(r.rating), bestRating: 5 },
      reviewBody: t(r.text, lang)
    }));
    business.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: (rated.reduce((a, r) => a + Number(r.rating), 0) / rated.length).toFixed(1),
      reviewCount: rated.length, bestRating: 5
    };
  }

  const website = {
    '@type': 'WebSite', '@id': base + '/#website', url: base + '/', name: s.name,
    inLanguage: ['en', 'es'], publisher: { '@id': bizId }
  };

  const webpage = {
    '@type': 'WebPage', '@id': url + '#webpage', url,
    name: page ? t(page.title, lang) : seo.title,
    description: page ? t(page.description, lang) : seo.description,
    inLanguage: lang, isPartOf: { '@id': base + '/#website' }, about: { '@id': bizId },
    primaryImageOfPage: abs(base, c.seo.ogImage || c.hero.image) || undefined,
    dateModified: c.meta?.updatedAt
  };

  const graph = [business, website, webpage];

  if (!page && c.sections.faq && c.faq.items.length) {
    graph.push({
      '@type': 'FAQPage', '@id': url + '#faq',
      mainEntity: c.faq.items.map((f) => ({
        '@type': 'Question', name: t(f.q, lang),
        acceptedAnswer: { '@type': 'Answer', text: t(f.a, lang) }
      }))
    });
  }
  if (!page && c.process.steps.length) {
    graph.push({
      '@type': 'HowTo', '@id': url + '#process', name: t(c.process.title, lang),
      description: t(c.process.text, lang),
      step: c.process.steps.map((st, i) => ({ '@type': 'HowToStep', position: i + 1, name: t(st.title, lang), text: t(st.text, lang) }))
    });
  }
  if (page) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: s.name, item: `${base}/${lang}` },
        { '@type': 'ListItem', position: 2, name: t(page.title, lang), item: url }
      ]
    });
  }
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, (k, v) => (v === undefined || (Array.isArray(v) && !v.length) ? undefined : v))
    .replace(/</g, '\\u003c');
}

function sitemap(c, base) {
  const lastmod = (c.meta?.updatedAt || new Date().toISOString()).slice(0, 10);
  const groups = [['', 1.0, 'weekly'], ...c.pages.filter((p) => p.slug).map((p) => [`/p/${p.slug}`, 0.4, 'yearly'])];
  const urls = [];
  for (const [suffix, prio, freq] of groups) {
    for (const lang of LANGS) {
      const alts = LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${base}/${l}${suffix}"/>`).join('\n');
      urls.push(`  <url>\n    <loc>${base}/${lang}${suffix}</loc>\n${alts}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${base}/${c.site.defaultLang || 'en'}${suffix}"/>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${prio}</priority>\n  </url>`);
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`;
}

const AI_SEARCH_BOTS = ['OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'Perplexity-User', 'Claude-SearchBot', 'Claude-User', 'DuckAssistBot', 'YouBot', 'MistralAI-User'];
const AI_TRAINING_BOTS = ['GPTBot', 'Google-Extended', 'ClaudeBot', 'anthropic-ai', 'Applebot-Extended', 'CCBot', 'Meta-ExternalAgent', 'Amazonbot', 'cohere-ai', 'Bytespider'];

function robots(c, base) {
  const priv = 'Disallow: /admin\nDisallow: /api/\n';
  const out = [];
  if (!c.seo.indexing) {
    out.push('User-agent: *\nDisallow: /\n');
  } else {
    out.push(`# Search engines\nUser-agent: *\nAllow: /\n${priv}`);
    out.push(`# AI search & answer engines (ChatGPT search, Perplexity, Claude, etc.)\n${AI_SEARCH_BOTS.map((b) => 'User-agent: ' + b).join('\n')}\n${c.seo.allowAiSearch ? 'Allow: /\n' + priv : 'Disallow: /\n'}`);
    out.push(`# AI models (Gemini via Google-Extended, GPT, Claude, Apple Intelligence…)\n${AI_TRAINING_BOTS.map((b) => 'User-agent: ' + b).join('\n')}\n${c.seo.allowAiTraining ? 'Allow: /\n' + priv : 'Disallow: /\n'}`);
  }
  if (c.seo.extraRobots) out.push(c.seo.extraRobots.trim() + '\n');
  out.push(`Sitemap: ${base}/sitemap.xml\n# LLM guide: ${base}/llms.txt\n`);
  return out.join('\n');
}

function pageMarkdown(c, lang, base) {
  const s = c.site;
  const md = [];
  md.push(`# ${s.name} — ${t(c.hero.title, lang)} ${t(c.hero.titleAccent, lang)}`);
  md.push(`> ${t(c.seo.aiSummary, lang) || t(c.seo[lang]?.description, lang)}`);
  md.push(t(c.hero.text, lang));
  md.push(`## ${t(c.services.title, lang)}\n${t(c.services.text, lang)}\n`);
  for (const it of c.services.items) {
    md.push(`### ${t(it.title, lang)} — ${t(c.ui.from, lang)} ${it.price} €\n${t(it.text, lang)}\n${lines(t(it.bullets, lang)).map((b) => '- ' + b).join('\n')}`);
  }
  md.push(`_${t(c.services.note, lang)}_`);
  md.push(`## ${t(c.process.title, lang)}\n${c.process.steps.map((st, i) => `${i + 1}. **${t(st.title, lang)}** — ${t(st.text, lang)}`).join('\n')}`);
  md.push(`## ${t(c.compare.title, lang)}\n| | ${t(c.compare.colA, lang)} | ${t(c.compare.colB, lang)} |\n|---|---|---|\n${c.compare.rows.map((r) => `| ${t(r.label, lang)} | ${t(r.a, lang)} | ${t(r.b, lang)} |`).join('\n')}`);
  md.push(`## ${t(c.about.title, lang)}\n${t(c.about.text, lang)}\n\n${c.about.facts.map((f) => `- **${t(f.label, lang)}:** ${t(f.value, lang)}`).join('\n')}`);
  md.push(`## ${t(c.area.title, lang)}\n${t(c.area.text, lang)} ${lines(c.area.towns).join(', ')}.`);
  const rv = c.reviews.items.map((r) => `- ${r.name} (${r.town}) — ${t(r.service, lang)}${t(r.text, lang) ? ': “' + t(r.text, lang) + '”' : ''}`);
  md.push(`## ${t(c.reviews.title, lang)}\n${rv.join('\n')}\n${c.reviews.linkUrl ? `\n[${t(c.reviews.linkLabel, lang)}](${c.reviews.linkUrl})` : ''}`);
  md.push(`## ${t(c.faq.title, lang)}\n${c.faq.items.map((f) => `### ${t(f.q, lang)}\n${t(f.a, lang)}`).join('\n\n')}`);
  md.push(`## ${t(c.quote.title, lang)}\n${t(c.quote.text, lang)}\n\n- Phone: ${s.phone}\n- WhatsApp: https://wa.me/${s.whatsapp}\n${s.email ? '- Email: ' + s.email + '\n' : ''}${s.facebook ? '- Facebook: ' + s.facebook + '\n' : ''}- Web: ${base}/${lang}`);
  return md.join('\n\n') + '\n';
}

function llmsTxt(c, base) {
  const s = c.site;
  const L = 'en';
  return `# ${s.name}

> ${t(c.seo.aiSummary, L)}

## Key facts
${c.about.facts.map((f) => `- ${t(f.label, L)}: ${t(f.value, L)}`).join('\n')}
- Phone / WhatsApp: ${s.phone}
- Location: ${[s.locality, s.region, 'Spain'].filter(Boolean).join(', ')}${s.lat ? ` (${s.lat}, ${s.lng})` : ''}

## Services and prices
${c.services.items.map((it) => `- ${t(it.title, L)}: from €${it.price}. ${t(it.text, L)}`).join('\n')}

## Service area
${lines(c.area.towns).join(', ')}

## Pages
- [Home (English)](${base}/en): main page with services, prices, process, FAQ and quote form
- [Inicio (Español)](${base}/es): página principal en español
- [Full page as Markdown (EN)](${base}/en.md)
- [Página completa en Markdown (ES)](${base}/es.md)
${c.pages.filter((p) => p.slug).map((p) => `- [${t(p.title, L)}](${base}/en/p/${p.slug})`).join('\n')}

## Optional
- [Full content, both languages](${base}/llms-full.txt)
`;
}

function llmsFull(c, base) {
  return LANGS.map((l) => pageMarkdown(c, l, base)).join('\n\n---\n\n');
}

async function pingIndexNow(c, base) {
  const key = c.integrations.indexNowKey;
  if (!key || !/^https?:\/\//.test(base) || /localhost|127\.0\.0\.1/.test(base)) return { skipped: true };
  const host = new URL(base).host;
  const urlList = [];
  for (const l of LANGS) { urlList.push(`${base}/${l}`); for (const p of c.pages) urlList.push(`${base}/${l}/p/${p.slug}`); }
  try {
    const r = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host, key, keyLocation: `${base}/${key}.txt`, urlList })
    });
    return { status: r.status };
  } catch (e) { return { error: e.message }; }
}

module.exports = { LANGS, t, lines, baseUrl, abs, jsonLd, sitemap, robots, llmsTxt, llmsFull, pageMarkdown, pingIndexNow };
