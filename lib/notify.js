const crypto = require('crypto');

const sha = (v) => (v ? crypto.createHash('sha256').update(String(v).trim().toLowerCase()).digest('hex') : undefined);

async function telegram(c, lead) {
  const { telegramBotToken: token, telegramChatId: chat } = c.notifications;
  if (!token || !chat) return;
  const text = [
    `🆕 New lead — ${c.site.name}`,
    `👤 ${lead.name}`, `📞 ${lead.phone}`,
    lead.email && `✉️ ${lead.email}`, lead.town && `📍 ${lead.town}`,
    lead.service && `🛠 ${lead.service}`, lead.message && `💬 ${lead.message}`,
    `🌐 ${lead.lang?.toUpperCase()} · ${lead.page || ''}`
  ].filter(Boolean).join('\n');
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true })
  });
}

async function webhook(c, lead) {
  if (!c.notifications.webhookUrl) return;
  await fetch(c.notifications.webhookUrl, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'lead', site: c.site.name, lead })
  });
}

// Meta Conversions API — server-side Lead event, deduplicated with the browser pixel by event_id.
async function metaCapi(c, lead, req) {
  const I = c.integrations;
  if (!I.fbPixelId || !I.fbCapiToken) return;
  const phone = String(lead.phone || '').replace(/\D/g, '');
  const body = {
    data: [{
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      event_id: lead.eventId,
      action_source: 'website',
      event_source_url: lead.page,
      user_data: {
        em: lead.email ? [sha(lead.email)] : undefined,
        ph: phone ? [sha(phone.length === 9 ? '34' + phone : phone)] : undefined,
        fn: lead.name ? [sha(lead.name.split(/\s+/)[0])] : undefined,
        ct: lead.town ? [sha(lead.town.replace(/\s+/g, ''))] : undefined,
        country: [sha('es')],
        client_ip_address: req.ip,
        client_user_agent: req.get('user-agent'),
        fbp: lead.fbp, fbc: lead.fbc
      },
      custom_data: { content_name: lead.service }
    }],
    test_event_code: I.fbTestEventCode || undefined
  };
  const r = await fetch(`https://graph.facebook.com/v21.0/${encodeURIComponent(I.fbPixelId)}/events?access_token=${encodeURIComponent(I.fbCapiToken)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  if (!r.ok) console.error('Meta CAPI', r.status, await r.text());
}

async function notifyLead(c, lead, req) {
  const jobs = [telegram(c, lead), webhook(c, lead), metaCapi(c, lead, req)];
  const res = await Promise.allSettled(jobs);
  res.forEach((r) => r.status === 'rejected' && console.error('notify error', r.reason?.message));
}

module.exports = { notifyLead, telegram };
