import { NextResponse } from "next/server";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Newsletter sign-up.
 *
 * Forwards { email, source, subscribedAt } as JSON to NEWSLETTER_WEBHOOK_URL:
 * any endpoint that accepts a JSON POST (a Mailchimp/Klaviyo/Brevo automation
 * hook, Zapier, Make, a Google Apps Script…). Until that variable is set this
 * returns 503 and the form tells the visitor the list is not open yet, so no
 * address is ever silently discarded.
 */
export async function POST(request: Request) {
  let email = "";
  try {
    const body = (await request.json()) as { email?: unknown };
    email = typeof body.email === "string" ? body.email.trim().slice(0, 254) : "";
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  if (!EMAIL.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 422 });
  }

  const webhook = process.env.NEWSLETTER_WEBHOOK_URL;
  if (!webhook) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  try {
    const upstream = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, source: "sartorial-website", subscribedAt: new Date().toISOString() }),
      signal: AbortSignal.timeout(8000),
    });
    if (!upstream.ok) {
      return NextResponse.json({ error: "upstream_failed" }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ error: "upstream_unreachable" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
