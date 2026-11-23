"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { HOME_SECTIONS } from "@/data/seed";
import { CATALOG_TAG } from "@/data/store";
import type { ContactSettings, HomeSettings, SocialSettings } from "@/data/types";
import { checkPassword, createSession, hashPassword, requireAdmin } from "@/lib/admin/auth";
import { bool, dbMessage, lines, list, text, type FormState } from "@/lib/admin/form";
import { db } from "@/lib/db";
import { EMAIL_PATTERN } from "@/lib/enquiry";

/** Write one settings entry (contact, social, home or admin). */
async function store(key: string, value: unknown): Promise<void> {
  const pool = db();
  if (!pool) throw new Error("NO_DATABASE");
  await pool.query(
    `INSERT INTO settings (key, value, updated_at) VALUES ($1, $2::jsonb, now())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [key, JSON.stringify(value)],
  );
}

/** The home page: which sections show, and the four pieces in each of the two features. */
export async function saveHome(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const value: HomeSettings = {
    sections: Object.fromEntries(HOME_SECTIONS.map((s) => [s.key, bool(form, `section-${s.key}`)])) as HomeSettings["sections"],
    heritagePicks: [...new Set(list(form, "heritagePicks", 4))],
    classicPicks: [...new Set(list(form, "classicPicks", 4))],
  };
  try {
    await store("home", value);
  } catch (error) {
    return { error: dbMessage(error) };
  }
  updateTag(CATALOG_TAG);
  redirect("/admin/homepage?saved=1");
}

/**
 * A WhatsApp number as digits in international format, or null when it cannot be one.
 * A Bangladeshi mobile written the local way (01XXX XXXXXX) gets its country code (880):
 * a ten-digit number starting with 1 cannot be international (+1 numbers have eleven).
 */
function whatsappDigits(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (!raw.trim().startsWith("+") && digits.startsWith("00")) digits = digits.slice(2);
  if (/^01[3-9]\d{8}$/.test(digits)) digits = `880${digits.slice(1)}`;
  else if (/^1[3-9]\d{8}$/.test(digits)) digits = `880${digits}`; // the same, written without the leading 0
  if (digits.startsWith("0")) return null;
  return digits.length >= 8 && digits.length <= 15 ? digits : null;
}

/** Where orders go, and the contact details shown on the website. */
export async function saveContact(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const raw = text(form, "whatsapp", 40);
  const whatsapp = whatsappDigits(raw);
  const email = text(form, "email", 160);

  if (!raw) return { error: "Enter the WhatsApp number that should receive orders." };
  if (!whatsapp) return { error: "That WhatsApp number does not look right. Write it with the country code, e.g. +880 1772 121294." };
  if (email && !EMAIL_PATTERN.test(email)) return { error: "That email address does not look right, e.g. hello@example.com." };

  const value: ContactSettings = {
    whatsapp,
    phone: text(form, "phone", 40),
    email,
    address: lines(form, "address", 6),
    hours: text(form, "hours", 200),
  };
  try {
    await store("contact", value);
  } catch (error) {
    return { error: dbMessage(error) };
  }
  updateTag(CATALOG_TAG);
  redirect("/admin/settings?saved=contact");
}

const SOCIAL: Array<{ key: keyof SocialSettings; label: string; example: string }> = [
  { key: "instagram", label: "Instagram", example: "https://www.instagram.com/sartorial" },
  { key: "facebook", label: "Facebook", example: "https://www.facebook.com/sartorial" },
  { key: "youtube", label: "YouTube", example: "https://www.youtube.com/@sartorial" },
];

/** A full https:// link, adding "https://" when it was left off. Null when it is not a usable link. */
function httpsLink(raw: string): string | null {
  const value = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw.replace(/^\/+/, "")}`;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || !url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** Links to the house's social pages, shown in the footer. */
export async function saveSocial(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const value: SocialSettings = { instagram: "", facebook: "", youtube: "" };
  for (const s of SOCIAL) {
    const raw = text(form, s.key, 300);
    if (!raw) continue;
    const link = httpsLink(raw);
    if (!link) return { error: `The ${s.label} link should be the full address of the page, starting with https://, e.g. ${s.example}` };
    value[s.key] = link;
  }
  try {
    await store("social", value);
  } catch (error) {
    return { error: dbMessage(error) };
  }
  updateTag(CATALOG_TAG);
  redirect("/admin/settings?saved=social");
}

/** Change the admin password. This browser stays signed in; every other signed-in device is signed out. */
export async function changePassword(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  // Read the same way the sign-in page does (surrounding spaces ignored), so the new password works there.
  const current = text(form, "current", 200);
  const next = text(form, "password", 200);
  const confirm = text(form, "confirm", 200);

  if (!current) return { error: "Enter your current password." };
  if (!(await checkPassword(current))) return { error: "The current password is not right." };
  if (next.length < 10) return { error: "The new password needs at least 10 characters. A short sentence is easy to remember and hard to guess." };
  if (next !== confirm) return { error: "The two new passwords do not match. Type the same password in both boxes." };
  if (next === current) return { error: "The new password is the same as the current one." };

  try {
    await store("admin", hashPassword(next));
    await createSession();
  } catch (error) {
    return { error: dbMessage(error) };
  }
  redirect("/admin/settings?saved=password");
}
