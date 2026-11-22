import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tooManyRequests } from "@/lib/rate-limit";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Newsletter sign-up.
 *
 * Stores the address in the Neon database (table `newsletter_subscribers`)
 * when DATABASE_URL is set, and/or forwards { email, source, subscribedAt } as
 * JSON to NEWSLETTER_WEBHOOK_URL (a Mailchimp/Klaviyo/Brevo automation hook,
 * Zapier, Make…) when that is set. With neither, it returns 503 and the form
 * tells the visitor the list is not open yet, so no address is silently lost.
 */
export async function POST(request: Request) {
  if (tooManyRequests(request, "newsletter", 5)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  let email = "";
  try {
    const body = (await request.json()) as { email?: unknown };
    email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 254) : "";
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  if (!EMAIL.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 422 });
  }

  const pool = db();
  const webhook = process.env.NEWSLETTER_WEBHOOK_URL;
  if (!pool && !webhook) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  let saved = false;
  if (pool) {
    try {
      await pool.query("INSERT INTO newsletter_subscribers (email, source) VALUES ($1, 'website') ON CONFLICT (email) DO NOTHING", [email]);
      saved = true;
    } catch (error) {
      console.error("newsletter: could not store", error instanceof Error ? error.message : error);
    }
  }

  if (webhook) {
    try {
      const upstream = await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, source: "sartorial-website", subscribedAt: new Date().toISOString() }),
        signal: AbortSignal.timeout(8000),
      });
      if (upstream.ok) saved = true;
    } catch {
      // fall through: reported below if nothing else saved it
    }
  }

  return saved ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "upstream_failed" }, { status: 502 });
}
