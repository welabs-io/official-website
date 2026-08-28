import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { parseContactPayload } from '@/lib/contact';

export const runtime = 'nodejs';

const MAX_BODY_BYTES = 8_000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const requestsByIp = new Map<string, number[]>();

function isRateLimited(ip: string) {
  const now = Date.now();
  const recent = (requestsByIp.get(ip) ?? []).filter((time) => now - time < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  requestsByIp.set(ip, recent);
  return recent.length > RATE_LIMIT_MAX_REQUESTS;
}

function clientIp(req: Request) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown';
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(req: Request) {
  try {
    const contentLength = Number(req.headers.get('content-length') ?? 0);
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'payload_too_large' }, { status: 413 });
    }

    if (isRateLimited(clientIp(req))) {
      return NextResponse.json(
        { error: 'rate_limited' },
        { status: 429, headers: { 'Retry-After': '600' } },
      );
    }

    const rawBody = await req.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'payload_too_large' }, { status: 413 });
    }
    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
    }
    const parsed = parseContactPayload(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
    if (parsed.data.isBot) return NextResponse.json({ ok: true });
    const { name: cleanName, email: cleanEmail, message: cleanMessage, lang: cleanLang } = parsed.data;

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.CONTACT_FROM || 'Imagine Apps <contato@imagineapps.com.br>';
    const to = process.env.CONTACT_TO || 'contato@imagineapps.com.br';

    if (!apiKey) {
      console.error('RESEND_API_KEY not configured');
      return NextResponse.json({ error: 'server_not_configured' }, { status: 500 });
    }

    const resend = new Resend(apiKey);

    const subject = `[Site] Novo contato de ${cleanName.replace(/[\r\n]/g, ' ')}`;
    const html = `
      <h2>Novo contato pelo site (${cleanLang})</h2>
      <p><strong>Nome:</strong> ${escapeHtml(cleanName)}</p>
      <p><strong>E-mail:</strong> ${escapeHtml(cleanEmail)}</p>
      <p><strong>Mensagem:</strong></p>
      <pre style="white-space: pre-wrap; font-family: inherit;">${escapeHtml(cleanMessage)}</pre>
    `;

    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: cleanEmail,
      subject,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'send_failed' }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('contact route error:', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
