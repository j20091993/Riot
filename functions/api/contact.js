/**
 * Cloudflare Pages Function — Reach Us / contact form
 *
 * Set in Cloudflare Pages → Settings → Variables and Secrets:
 *   TELEGRAM_BOT_TOKEN
 *   TELEGRAM_CHANNEL_ID  (or TELEGRAM_CHAT_ID)
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeMarkdown(text) {
  if (!text) return '';
  return String(text).replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&');
}

function codeValue(text) {
  if (!text) return '`Not provided`';
  return '`' + String(text).replace(/`/g, "'") + '`';
}

function formatContactMessage(data) {
  return [
    '📬 *New Riot Shop Contact Message*',
    '',
    `👤 *Name:* ${escapeMarkdown(data.name)}`,
    `📧 *Email:* ${codeValue(data.email)}`,
    `📌 *Subject:* ${escapeMarkdown(data.subjectLabel || data.subject)}`,
    '',
    '💬 *Message:*',
    escapeMarkdown(data.message),
  ].join('\n');
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const botToken = env.TELEGRAM_BOT_TOKEN;
    const channelId = env.TELEGRAM_CHANNEL_ID || env.TELEGRAM_CHAT_ID;

    if (!botToken || !channelId) {
      console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: CORS },
      );
    }

    const data = await request.json();
    const name = String(data.name || '').trim();
    const email = String(data.email || '').trim();
    const subject = String(data.subject || '').trim();
    const message = String(data.message || '').trim();

    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: CORS },
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: CORS },
      );
    }

    const text = formatContactMessage({
      name,
      email,
      subject,
      subjectLabel: data.subjectLabel,
      message,
    });

    const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: channelId,
        text,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    });

    const tgData = await tgRes.json();

    if (!tgRes.ok || !tgData.ok) {
      console.error('Telegram API error:', tgData);
      return new Response(
        JSON.stringify({ error: 'Failed to send message' }),
        { status: 502, headers: CORS },
      );
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: CORS });
  } catch (err) {
    console.error('Contact handler error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: CORS },
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}