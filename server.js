require('./lib/env');
const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const sharp = require('sharp');

const store = require('./lib/store');
const seo = require('./lib/seo');
const { renderHome, renderPage } = require('./lib/render');
const { notifyLead, telegram } = require('./lib/notify');
const schema = require('./lib/schema');

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const SECRET = process.env.SESSION_SECRET || crypto.createHash('sha256').update('so:' + ADMIN_PASSWORD).digest('hex');

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(compression());
app.use(cookieParser());
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'SAMEORIGIN',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  });
  next();
});

const C = () => store.getContent();
const BASE = (req) => seo.baseUrl(C(), req);
const LANGS = seo.LANGS;

// ---------- public site ----------
app.get('/healthz', (req, res) => res.json({ ok: true }));

app.get('/', (req, res) => {
  const c = C();
  const pref = (req.acceptsLanguages(...LANGS) || c.site.defaultLang || 'en');
  res.set('Vary', 'Accept-Language');
  res.redirect(302, '/' + pref);
});

app.get(['/en', '/es'], (req, res) => {
  const lang = req.path.slice(1);
  res.set('Cache-Control', 'public, max-age=0, must-revalidate');
  res.type('html').send(renderHome(C(), lang, BASE(req)));
});
app.get(['/en/', '/es/'], (req, res) => res.redirect(301, req.path.slice(0, -1)));

app.get(/^\/(en|es)\/p\/([\w-]+)$/, (req, res, next) => {
  const page = C().pages.find((p) => p.slug === req.params[1]);
  if (!page) return next();
  res.type('html').send(renderPage(C(), req.params[0], BASE(req), page));
});

app.get(/^\/(en|es)\.md$/, (req, res) => {
  res.type('text/markdown; charset=utf-8').send(seo.pageMarkdown(C(), req.params[0], BASE(req)));
});
app.get('/robots.txt', (req, res) => res.type('text/plain').send(seo.robots(C(), BASE(req))));
app.get('/sitemap.xml', (req, res) => res.type('application/xml').send(seo.sitemap(C(), BASE(req))));
app.get('/llms.txt', (req, res) => res.type('text/plain; charset=utf-8').send(seo.llmsTxt(C(), BASE(req))));
app.get('/llms-full.txt', (req, res) => res.type('text/plain; charset=utf-8').send(seo.llmsFull(C(), BASE(req))));
app.get(/^\/([a-f0-9]{8,128})\.txt$/, (req, res, next) => {
  if (req.params[0] !== C().integrations.indexNowKey) return next();
  res.type('text/plain').send(req.params[0]);
});

app.use('/uploads', express.static(store.UPLOAD_DIR, {
  maxAge: '30d', immutable: true,
  setHeaders: (res, p) => { if (p.endsWith('.svg')) res.set('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'"); }
}));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1h', index: false }));

// ---------- leads ----------
const hits = new Map();
function rateLimit(key, max, windowMs) {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
  arr.push(now); hits.set(key, arr);
  return arr.length > max;
}
setInterval(() => hits.clear(), 60 * 60 * 1000).unref();

app.post('/api/lead', express.json({ limit: '20kb' }), async (req, res) => {
  const b = req.body || {};
  if (b.website) return res.json({ ok: true }); // honeypot
  if (rateLimit('lead:' + req.ip, 5, 10 * 60 * 1000)) return res.status(429).json({ error: 'Too many requests' });
  const s = (v, n) => String(v || '').trim().slice(0, n);
  const lead = {
    name: s(b.name, 120), phone: s(b.phone, 40), email: s(b.email, 160), town: s(b.town, 120),
    service: s(b.service, 120), message: s(b.message, 3000), lang: LANGS.includes(b.lang) ? b.lang : 'en',
    page: s(b.page, 300), eventId: s(b.eventId, 80), fbp: s(b.fbp, 120), fbc: s(b.fbc, 300), ip: req.ip
  };
  if (!lead.name || !/\d{6,}/.test(lead.phone.replace(/\D/g, ''))) return res.status(400).json({ error: 'Name and phone are required' });
  const saved = store.addLead(lead);
  notifyLead(C(), saved, req).catch(() => {});
  res.json({ ok: true });
});

// ---------- admin auth ----------
const sign = (v) => crypto.createHmac('sha256', SECRET).update(v).digest('hex');
function makeToken() { const exp = String(Date.now() + 7 * 24 * 3600 * 1000); return exp + '.' + sign(exp); }
function validToken(tok) {
  if (!tok || !ADMIN_PASSWORD) return false;
  const [exp, sig] = String(tok).split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const good = sign(exp);
  return sig.length === good.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good));
}
const auth = (req, res, next) => (validToken(req.cookies.admin) ? next() : res.status(401).json({ error: 'unauthorized' }));

const admin = express.Router();
admin.use(express.json({ limit: '5mb' }));
admin.use((req, res, next) => { res.set('Cache-Control', 'no-store'); res.set('X-Robots-Tag', 'noindex, nofollow'); next(); });

admin.post('/login', (req, res) => {
  if (!ADMIN_PASSWORD) return res.status(503).json({ error: 'ADMIN_PASSWORD is not set on the server' });
  if (rateLimit('login:' + req.ip, 8, 15 * 60 * 1000)) return res.status(429).json({ error: 'Too many attempts, wait 15 min' });
  const p = String(req.body?.password || '');
  const a = crypto.createHash('sha256').update(p).digest(), b = crypto.createHash('sha256').update(ADMIN_PASSWORD).digest();
  if (!crypto.timingSafeEqual(a, b)) return res.status(401).json({ error: 'Wrong password' });
  res.cookie('admin', makeToken(), { httpOnly: true, sameSite: 'strict', secure: req.secure, maxAge: 7 * 24 * 3600 * 1000, path: '/' });
  res.json({ ok: true });
});
admin.post('/logout', (req, res) => { res.clearCookie('admin', { path: '/' }); res.json({ ok: true }); });
admin.get('/me', (req, res) => res.json({ auth: validToken(req.cookies.admin), configured: !!ADMIN_PASSWORD }));

admin.get('/schema', auth, (req, res) => res.json(schema));
admin.get('/content', auth, (req, res) => res.json(C()));
admin.put('/content', auth, async (req, res) => {
  if (!req.body || typeof req.body !== 'object' || !req.body.site) return res.status(400).json({ error: 'bad content' });
  const saved = store.saveContent(req.body);
  const ping = await seo.pingIndexNow(saved, BASE(req)).catch(() => null);
  res.json({ ok: true, content: saved, indexNow: ping });
});
admin.post('/reset', auth, (req, res) => res.json({ ok: true, content: store.resetContent() }));
admin.get('/backups', auth, (req, res) => res.json(store.listBackups()));
admin.post('/backups/:name/restore', auth, (req, res) => {
  try { res.json({ ok: true, content: store.restoreBackup(req.params.name) }); } catch (e) { res.status(400).json({ error: e.message }); }
});
admin.post('/indexnow', auth, async (req, res) => res.json(await seo.pingIndexNow(C(), BASE(req))));
admin.post('/test-telegram', auth, async (req, res) => {
  try { await telegram(C(), { name: 'Test', phone: '+34 600 000 000', service: 'Test message from admin', lang: 'en' }); res.json({ ok: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// uploads
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });
admin.post('/upload', auth, upload.single('file'), async (req, res) => {
  const f = req.file;
  if (!f) return res.status(400).json({ error: 'no file' });
  const id = Date.now().toString(36) + '-' + crypto.randomBytes(3).toString('hex');
  try {
    const ext = path.extname(f.originalname).toLowerCase();
    if (['.svg', '.ico'].includes(ext)) {
      fs.writeFileSync(path.join(store.UPLOAD_DIR, id + ext), f.buffer);
      return res.json({ url: `/uploads/${id}${ext}` });
    }
    const img = sharp(f.buffer, { failOn: 'none' }).rotate();
    await img.clone().resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(store.UPLOAD_DIR, id + '.webp'));
    await img.clone().resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true }).webp({ quality: 76 }).toFile(path.join(store.UPLOAD_DIR, id + '-800.webp'));
    await img.clone().resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(store.UPLOAD_DIR, id + '-og.jpg'));
    res.json({ url: `/uploads/${id}.webp` });
  } catch (e) { res.status(400).json({ error: 'Not an image: ' + e.message }); }
});
admin.get('/uploads', auth, (req, res) => {
  const files = fs.readdirSync(store.UPLOAD_DIR)
    .filter((f) => !/-800\.webp$|-og\.jpg$/.test(f))
    .map((f) => ({ url: '/uploads/' + f, mtime: fs.statSync(path.join(store.UPLOAD_DIR, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  res.json(files);
});
admin.delete('/uploads/:name', auth, (req, res) => {
  const n = path.basename(req.params.name);
  const stem = n.replace(/\.\w+$/, '');
  for (const f of [n, stem + '-800.webp', stem + '-og.jpg']) { try { fs.unlinkSync(path.join(store.UPLOAD_DIR, f)); } catch {} }
  res.json({ ok: true });
});

// leads
admin.get('/leads', auth, (req, res) => res.json(store.getLeads()));
admin.patch('/leads/:id', auth, (req, res) => res.json(store.updateLead(req.params.id, { status: String(req.body?.status || 'new').slice(0, 20), note: String(req.body?.note ?? '').slice(0, 2000) })));
admin.delete('/leads/:id', auth, (req, res) => { store.deleteLead(req.params.id); res.json({ ok: true }); });
admin.get('/leads.csv', auth, (req, res) => {
  const cols = ['createdAt', 'status', 'name', 'phone', 'email', 'town', 'service', 'message', 'lang', 'note'];
  const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [cols.join(','), ...store.getLeads().map((l) => cols.map((k) => q(l[k])).join(','))].join('\n');
  res.set('Content-Disposition', 'attachment; filename="leads.csv"').type('text/csv').send('﻿' + csv);
});

app.use('/admin/api', admin);
app.get(['/admin', '/admin/'], (req, res) => {
  res.set({ 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' });
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});
app.use('/admin', express.static(path.join(__dirname, 'admin'), { index: false }));

// ---------- 404 ----------
app.use((req, res) => {
  const lang = req.path.startsWith('/es') ? 'es' : 'en';
  res.status(404).type('html').send(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>404</title><style>body{font:18px system-ui;display:grid;place-items:center;min-height:90vh;margin:0;background:#f8f6f1;color:#24324d;text-align:center}a{color:#24324d}</style><div><h1>404</h1><p>${lang === 'es' ? 'Página no encontrada.' : 'Page not found.'}</p><p><a href="/${lang}">${lang === 'es' ? 'Volver al inicio' : 'Back to home'}</a></p></div>`);
});

app.listen(PORT, () => {
  console.log(`Site running on http://localhost:${PORT}  (data: ${store.DATA_DIR})`);
  if (!ADMIN_PASSWORD) console.warn('⚠️  ADMIN_PASSWORD is not set — the admin panel is locked until you set it.');
});
