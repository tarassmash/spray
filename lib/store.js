const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const defaults = require('./defaults');

const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(__dirname, '..', 'data'));
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');

for (const d of [DATA_DIR, UPLOAD_DIR, BACKUP_DIR]) fs.mkdirSync(d, { recursive: true });

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

// Fill fields that exist in defaults but are missing in saved content (after updates of the code).
function merge(def, saved) {
  if (Array.isArray(def)) return Array.isArray(saved) ? saved : def;
  if (isObj(def)) {
    const out = {};
    const src = isObj(saved) ? saved : {};
    for (const k of Object.keys(def)) out[k] = merge(def[k], src[k]);
    for (const k of Object.keys(src)) if (!(k in out)) out[k] = src[k];
    return out;
  }
  return saved === undefined || saved === null ? def : saved;
}

function readJSON(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}
function writeJSON(file, data) {
  const tmp = file + '.' + process.pid + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file);
}

let content = merge(defaults, readJSON(CONTENT_FILE, {}));
if (!content.meta) content.meta = { updatedAt: new Date().toISOString() };
if (!content.integrations.indexNowKey) content.integrations.indexNowKey = crypto.randomBytes(16).toString('hex');
if (!fs.existsSync(CONTENT_FILE)) writeJSON(CONTENT_FILE, content);

function getContent() { return content; }

function saveContent(next) {
  // keep a rolling backup of the previous version (last 20)
  try {
    if (fs.existsSync(CONTENT_FILE)) {
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      fs.copyFileSync(CONTENT_FILE, path.join(BACKUP_DIR, `content-${stamp}.json`));
      const files = fs.readdirSync(BACKUP_DIR).filter((f) => f.startsWith('content-')).sort();
      while (files.length > 20) fs.unlinkSync(path.join(BACKUP_DIR, files.shift()));
    }
  } catch (e) { console.error('backup failed', e.message); }
  content = merge(defaults, next);
  content.meta = { ...(content.meta || {}), updatedAt: new Date().toISOString() };
  writeJSON(CONTENT_FILE, content);
  return content;
}

function resetContent() { return saveContent(JSON.parse(JSON.stringify(defaults))); }

function listBackups() {
  return fs.readdirSync(BACKUP_DIR).filter((f) => f.startsWith('content-')).sort().reverse();
}
function restoreBackup(name) {
  if (!/^content-[\w-]+\.json$/.test(name)) throw new Error('bad name');
  return saveContent(readJSON(path.join(BACKUP_DIR, name), {}));
}

// ---- leads ----
function getLeads() { return readJSON(LEADS_FILE, []); }
function addLead(lead) {
  const leads = getLeads();
  const item = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), status: 'new', ...lead };
  leads.unshift(item);
  writeJSON(LEADS_FILE, leads.slice(0, 5000));
  return item;
}
function updateLead(id, patch) {
  const leads = getLeads();
  const l = leads.find((x) => x.id === id);
  if (l) Object.assign(l, patch);
  writeJSON(LEADS_FILE, leads);
  return l;
}
function deleteLead(id) { writeJSON(LEADS_FILE, getLeads().filter((x) => x.id !== id)); }

module.exports = {
  DATA_DIR, UPLOAD_DIR, getContent, saveContent, resetContent, listBackups, restoreBackup,
  getLeads, addLead, updateLead, deleteLead, defaults
};
