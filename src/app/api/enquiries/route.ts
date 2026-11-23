import { NextResponse } from "next/server";
import { catalog, productHref, productReference } from "@/data/catalog";
import { db } from "@/lib/db";
import { EMAIL_PATTERN, ENQUIRY_ID_PATTERN, ENQUIRY_KEY_PATTERN } from "@/lib/enquiry";
import { tooManyRequests } from "@/lib/rate-limit";

/**
 * Logs an order enquiry or fitting request in the Neon database.
 *
 * The browser posts here at the moment the visitor presses "Send message" and
 * WhatsApp opens with the same text, so the house has a record of every
 * enquiry under the reference quoted in the message (table `enquiries`).
 * Each piece is checked against the catalogue and stored with its canonical
 * name, product reference and link.
 *
 * A resend from the same form (same reference and private key) updates the
 * record; any other request for an existing reference is refused with 409.
 *
 * Returns 201 when stored, 503 when no database is configured (the visitor's
 * message still goes out on WhatsApp), 4xx for an invalid or repeated request.
 */

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(request: Request) {
  if (tooManyRequests(request, "enquiries", 12)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > 64_000) return NextResponse.json({ error: "too_large" }, { status: 413 });
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const id = str(body.id, 32);
  const key = str(body.key, 64);
  const kind = body.kind === "order" || body.kind === "appointment" ? body.kind : null;
  const channel = body.channel === "email" ? "email" : "whatsapp";
  const name = str(body.name, 120);
  const phone = str(body.phone, 40);
  const email = str(body.email, 254);
  const message = str(body.message, 24_000);

  if (!ENQUIRY_ID_PATTERN.test(id) || !ENQUIRY_KEY_PATTERN.test(key) || !kind || name.length < 2 || !message) {
    return NextResponse.json({ error: "invalid_enquiry" }, { status: 422 });
  }
  if ((email && !EMAIL_PATTERN.test(email)) || (phone.length < 6 && !email)) {
    return NextResponse.json({ error: "invalid_contact" }, { status: 422 });
  }

  const cat = await catalog();
  const rawLines = Array.isArray(body.lines) ? body.lines.slice(0, 100) : [];
  const origin = new URL(request.url).origin;
  const items = [];
  for (const line of rawLines) {
    const l = (line ?? {}) as Record<string, unknown>;
    const product = cat.getProduct(str(l.slug, 160));
    if (!product) return NextResponse.json({ error: "unknown_product" }, { status: 422 });
    const qty = Number.isInteger(l.qty) ? Math.min(Math.max(l.qty as number, 1), 99) : 1;
    items.push({
      slug: product.slug,
      name: product.name,
      reference: productReference(product),
      category: cat.getCategory(product.category)?.name ?? product.category,
      size: str(l.size, 60) || "Not given",
      qty,
      url: `${origin}${productHref(product)}`,
    });
  }

  const pool = db();
  if (!pool) return NextResponse.json({ stored: false, error: "not_configured" }, { status: 503 });

  try {
    // A resend from the same form updates its record; nobody else's request can.
    const result = await pool.query(
      `INSERT INTO enquiries
         (reference, kind, channel, customer_name, phone, email, interest, occasion, preferred_time, notes, items, message, page_url, user_agent, edit_key)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12, $13, $14, $15)
       ON CONFLICT (reference) DO UPDATE SET
         kind = EXCLUDED.kind, channel = EXCLUDED.channel, customer_name = EXCLUDED.customer_name,
         phone = EXCLUDED.phone, email = EXCLUDED.email, interest = EXCLUDED.interest,
         occasion = EXCLUDED.occasion, preferred_time = EXCLUDED.preferred_time, notes = EXCLUDED.notes,
         items = EXCLUDED.items, message = EXCLUDED.message, page_url = EXCLUDED.page_url,
         user_agent = EXCLUDED.user_agent, updated_at = now()
       WHERE enquiries.edit_key = EXCLUDED.edit_key AND enquiries.status = 'new'`,
      [
        id,
        kind,
        channel,
        name,
        phone || null,
        email || null,
        str(body.interest, 60) || null,
        str(body.occasion, 200) || null,
        str(body.preferredTime, 200) || null,
        str(body.notes, 2_000) || null,
        JSON.stringify(items),
        message,
        str(body.pageUrl, 500) || null,
        str(request.headers.get("user-agent"), 300) || null,
        key,
      ],
    );
    if (result.rowCount === 0) return NextResponse.json({ stored: false, error: "reference_taken" }, { status: 409 });
  } catch (error) {
    console.error("enquiries: could not store", id, error instanceof Error ? error.message : error);
    return NextResponse.json({ stored: false, error: "database_error" }, { status: 502 });
  }

  return NextResponse.json({ stored: true, id }, { status: 201 });
}
