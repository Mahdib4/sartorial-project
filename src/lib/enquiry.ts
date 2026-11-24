import { SITE } from "@/config/site";
import { formatPrice, pluralise } from "@/lib/format";

export type EnquiryLine = {
  /** The product's slug: its address and its key in the catalogue. */
  slug: string;
  name: string;
  /** The house code where the product has one (e.g. "S0001720"), otherwise the slug. */
  reference: string;
  /** e.g. "Achkans" */
  category: string;
  size: string;
  qty: number;
  href: string;
  /**
   * The price of one piece as the customer was shown it (null: "Price on
   * request"), the price before a reduction, and the offer named beside it.
   * Left out (undefined) for pieces sent without a price, e.g. with a fitting request.
   */
  price?: number | null;
  compareAt?: number | null;
  offer?: string | null;
};

/**
 * The price of a line as the customer saw it, in words:
 * "BDT 42,500 (was BDT 50,000, Eid offer)", "Price on request", or null when
 * the line carries no price.
 */
export function describePrice(line: Pick<EnquiryLine, "price" | "compareAt" | "offer" | "qty">): string | null {
  if (line.price === undefined) return null;
  if (line.price === null) return line.offer ? `${formatPrice(null)} (${line.offer})` : formatPrice(null);
  const notes = [line.compareAt ? `was ${formatPrice(line.compareAt)}` : "", line.offer ?? ""].filter(Boolean);
  return `${formatPrice(line.price)}${line.qty > 1 ? " each" : ""}${notes.length ? ` (${notes.join(", ")})` : ""}`;
}

/** The sum of the priced pieces, and how many pieces are priced on request. */
export function enquiryTotals(lines: Array<Pick<EnquiryLine, "price" | "qty">>): { subtotal: number | null; onRequest: number } {
  let subtotal: number | null = null;
  let onRequest = 0;
  for (const l of lines) {
    if (typeof l.price === "number") subtotal = (subtotal ?? 0) + l.price * l.qty;
    else onRequest += l.qty;
  }
  return { subtotal, onRequest };
}

/** "plus 2 pieces priced on request" */
export function onRequestNote(count: number): string {
  return `plus ${pluralise(count, "piece")} priced on request`;
}

export type EnquiryKind = "order" | "appointment";

export type EnquiryDetails = {
  kind: EnquiryKind;
  /** The enquiry's own reference, quoted in the message and stored with it. */
  id: string;
  name: string;
  phone: string;
  email: string;
  /** Appointment only. */
  interest?: string;
  occasion?: string;
  preferredTime?: string;
  notes: string;
  lines: EnquiryLine[];
  /** e.g. "https://www.sartorial.com.bd": used to make product links absolute. */
  origin: string;
};

/**
 * A short reference for one enquiry, e.g. "SRT-261122-7KQ3": the date it was
 * made and four random characters. Made in the visitor's browser, so it can be
 * in the WhatsApp message the moment they press send.
 */
export function newEnquiryId(now = new Date()): string {
  const date = [now.getFullYear() % 100, now.getMonth() + 1, now.getDate()].map((n) => String(n).padStart(2, "0")).join("");
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // no 0/O or 1/I to misread
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return `SRT-${date}-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("")}`;
}

export const ENQUIRY_ID_PATTERN = /^SRT-\d{6}-[23456789A-HJ-NP-Z]{4}$/;

/**
 * A private key held by the form that made an enquiry: the server only lets a
 * resend from that same form update the record, so a reference seen in a
 * WhatsApp message cannot be used to overwrite someone else's enquiry.
 */
export function newEnquiryKey(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export const ENQUIRY_KEY_PATTERN = /^[0-9a-f]{32}$/;

/**
 * The plain-text message sent to the house on WhatsApp. WhatsApp shows *text*
 * in bold. Every piece carries its reference and its link, so the house can
 * tell exactly which garment is meant.
 */
export function composeEnquiry(d: EnquiryDetails): string {
  const out: string[] = [];
  out.push(d.kind === "order" ? `*New order enquiry: ${SITE.name} website*` : `*Fitting request: ${SITE.name} website*`);
  if (d.id) out.push(`Reference: ${d.id}`);
  out.push("");
  out.push(`Name: ${d.name.trim()}`);
  if (d.phone.trim()) out.push(`Phone: ${d.phone.trim()}`);
  if (d.email.trim()) out.push(`Email: ${d.email.trim()}`);
  if (d.interest) out.push(`Interested in: ${d.interest}`);
  if (d.occasion?.trim()) out.push(`Occasion: ${d.occasion.trim()}`);
  if (d.preferredTime?.trim()) out.push(`Preferred time: ${d.preferredTime.trim()}`);
  if (d.lines.length) {
    const pieces = d.lines.reduce((n, l) => n + l.qty, 0);
    out.push("");
    out.push(d.kind === "order" ? `*Selection (${pieces} piece${pieces === 1 ? "" : "s"})*` : "*Pieces of interest*");
    d.lines.forEach((line, i) => {
      out.push(`${i + 1}. ${line.name} (${line.category})`);
      out.push(`   Product ref: ${line.reference}`);
      out.push(`   Size: ${line.size} · Qty: ${line.qty}`);
      const price = describePrice(line);
      if (price) out.push(`   Price: ${price}`);
      out.push(`   ${d.origin}${line.href}`);
    });
  }
  if (d.notes.trim()) {
    out.push("");
    out.push(`Notes: ${d.notes.trim()}`);
  }
  // The order ends with what the priced pieces come to, so the house sees what the customer was shown.
  const priced = d.lines.filter((l) => l.price !== undefined);
  if (d.kind === "order" && priced.length) {
    const { subtotal, onRequest } = enquiryTotals(priced);
    out.push("");
    out.push(
      subtotal === null
        ? `*Total: ${formatPrice(null)}*`
        : `*Subtotal: ${formatPrice(subtotal)}*${onRequest ? `, ${onRequestNote(onRequest)}` : ""}`,
    );
  }
  return out.join("\n");
}

type Contact = { whatsapp: string; email: string };

/** The house WhatsApp number as digits (from the admin settings, else the site default), or null. */
export function whatsappNumber(contact?: Contact): string | null {
  const number = (contact?.whatsapp || SITE.contact.whatsapp).replace(/\D/g, "");
  return number || null;
}

export function whatsappLink(message: string, contact?: Contact): string | null {
  const number = whatsappNumber(contact);
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(message)}` : null;
}

export function emailLink(message: string, subject: string, contact?: Contact): string | null {
  const email = contact ? contact.email : SITE.contact.email;
  return email ? `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}` : null;
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** What the browser posts to /api/enquiries alongside opening WhatsApp. */
export type EnquiryRecord = {
  id: string;
  /** See newEnquiryKey(). */
  key: string;
  kind: EnquiryKind;
  channel: "whatsapp" | "email";
  name: string;
  phone: string;
  email: string;
  interest?: string;
  occasion?: string;
  preferredTime?: string;
  notes: string;
  lines: Array<Pick<EnquiryLine, "slug" | "size" | "qty">>;
  message: string;
  pageUrl: string;
};

/**
 * Log an enquiry with the house's database. Fire-and-forget: `keepalive` lets
 * the request finish while the browser hands over to WhatsApp, and a missing
 * or unreachable database never stands between a customer and the house.
 */
export function recordEnquiry(record: EnquiryRecord): void {
  try {
    void fetch("/api/enquiries", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(record),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Never block sending.
  }
}
