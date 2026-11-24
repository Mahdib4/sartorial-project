/** Small helpers shared by the admin's server actions (and the money parser its forms also use). */

export type FormState = { error?: string; saved?: string } | null;

export function text(form: FormData, key: string, max = 500): string {
  const v = form.get(key);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export function bool(form: FormData, key: string): boolean {
  const v = form.get(key);
  return v === "on" || v === "true" || v === "1";
}

/** Bengali digits (০–৯) as ASCII digits, so "৪৫০০০" reads as 45000. */
export function asciiDigits(value: string): string {
  return value.replace(/[০-৯]/g, (d) => String(d.charCodeAt(0) - 0x09e6));
}

/**
 * A whole number typed in a field (an id, a position, a percentage), or null
 * when it is empty or is not a whole number. "1.5" is null, never 15.
 */
export function int(form: FormData, key: string): number | null {
  const v = asciiDigits(text(form, key, 40)).replace(/\s/g, "").replace(/%$/, "");
  const m = /^(-?\d{1,15})(?:\.0+)?$/.exec(v);
  if (!m) return null;
  const n = Number.parseInt(m[1], 10);
  return Number.isSafeInteger(n) ? n : null;
}

/** The largest price the shop's prices can hold (and far more than any piece costs). */
export const MAX_PRICE = 99_999_999;

export type Money = { value: number | null; error?: undefined } | { value?: undefined; error: string };

/**
 * An amount of taka as the house might type it: "45000", "45,000", "৳45,000",
 * "BDT 45000", "Tk 45,000/-", "45000.00" or in Bengali digits. Empty is null.
 * Anything else is refused with a plain message, never quietly changed:
 * "45000.50", "45k" or "-500" are errors, not 4500050, 45 or 500.
 *
 *   money("45,000.00", "price") → { value: 45000 }
 *   money("45000.5", "price")   → { error: "Type the price in whole taka, for example 45000." }
 */
export function money(raw: string, what = "price", example = "45000"): Money {
  const v = asciiDigits(raw.replace(/\u00a0/g, " ").trim())
    .replace(/\s*\/-$/, "")
    .replace(/^(?:৳|bdt|tk\.?|taka|টাকা)\s*/i, "")
    .replace(/\s*(?:৳|bdt|tk\.?|taka|টাকা)$/i, "");
  if (!v) return { value: null };
  // Plain digits, or digits grouped by commas or spaces ("45,000", "4,50,000"), then at most ".00".
  // A comma anywhere else ("45000,00") is refused rather than read as 4500000.
  const m = /^(\d+|\d{1,3}(?:[, ]\d{2,3})*[, ]\d{3})(?:\.0{1,2})?$/.exec(v);
  if (!m) return { error: `Type the ${what} in whole taka, for example ${example}.` };
  const n = Number(m[1].replace(/[, ]/g, ""));
  if (!Number.isSafeInteger(n) || n > MAX_PRICE) return { error: `That ${what} looks too large.` };
  return { value: n };
}

/** money() for a form field. */
export function moneyField(form: FormData, key: string, what?: string, example?: string): Money {
  return money(text(form, key, 60), what, example);
}

/** A JSON array of strings posted by one of the admin's pickers. */
export function list(form: FormData, key: string, max = 200): string[] {
  try {
    const v = JSON.parse(text(form, key, 100_000) || "[]");
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").map((x) => x.trim()).filter(Boolean).slice(0, max) : [];
  } catch {
    return [];
  }
}

/** One entry per line of a textarea. */
export function lines(form: FormData, key: string, max = 40): string[] {
  return text(form, key, 10_000)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, max);
}

/** "Ivory Paisley Jacquard Achkan" → "ivory-paisley-jacquard-achkan" */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** A <input type="datetime-local"> value (Dhaka time) as an ISO timestamp, or null. */
export function dateTime(form: FormData, key: string): string | null {
  const v = text(form, key, 40);
  if (!v) return null;
  const d = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(v) ? v : `${v}:00+06:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Postgres unique-violation and foreign-key errors, in plain words. */
export function dbMessage(error: unknown): string {
  const code = (error as { code?: string })?.code;
  if (code === "23505") return "That web address is already used by another item. Choose a different one.";
  if (code === "23503") return "This is still in use elsewhere (for example a category that has products). Move or remove those first.";
  if (code === "22003") return "One of the numbers is too large. Check the prices and amounts.";
  if (error instanceof Error && error.message === "NO_DATABASE") return "The database is not connected.";
  console.error("admin:", error);
  return "Something went wrong while saving. Please try again.";
}
