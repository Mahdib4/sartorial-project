import { SITE } from "@/config/site";

export type EnquiryLine = { name: string; size: string; qty: number; href: string; reference?: string };

export type EnquiryDetails = {
  kind: "order" | "appointment";
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

/** The plain-text message a visitor sends us, by whichever channel. */
export function composeEnquiry(d: EnquiryDetails): string {
  const out: string[] = [];
  out.push(d.kind === "order" ? `Order enquiry from the ${SITE.name} website` : `Fitting request from the ${SITE.name} website`);
  out.push("");
  out.push(`Name: ${d.name.trim()}`);
  if (d.phone.trim()) out.push(`Phone: ${d.phone.trim()}`);
  if (d.email.trim()) out.push(`Email: ${d.email.trim()}`);
  if (d.interest) out.push(`Interested in: ${d.interest}`);
  if (d.occasion?.trim()) out.push(`Occasion: ${d.occasion.trim()}`);
  if (d.preferredTime?.trim()) out.push(`Preferred time: ${d.preferredTime.trim()}`);
  if (d.lines.length) {
    out.push("");
    out.push(d.kind === "order" ? "Selection:" : "Pieces of interest:");
    d.lines.forEach((line, i) => {
      out.push(`${i + 1}. ${line.name} · ${line.size}${line.qty > 1 ? ` × ${line.qty}` : ""}`);
      out.push(`   ${d.origin}${line.href}`);
    });
  }
  if (d.notes.trim()) {
    out.push("");
    out.push(`Notes: ${d.notes.trim()}`);
  }
  return out.join("\n");
}

export function whatsappLink(message: string): string | null {
  const number = SITE.contact.whatsapp.replace(/\D/g, "");
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(message)}` : null;
}

export function emailLink(message: string, subject: string): string | null {
  return SITE.contact.email ? `mailto:${SITE.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}` : null;
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
