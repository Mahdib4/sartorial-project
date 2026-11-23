/** Small helpers shared by the admin's server actions. */

export type FormState = { error?: string; saved?: string } | null;

export function text(form: FormData, key: string, max = 500): string {
  const v = form.get(key);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export function bool(form: FormData, key: string): boolean {
  const v = form.get(key);
  return v === "on" || v === "true" || v === "1";
}

export function int(form: FormData, key: string): number | null {
  const v = text(form, key, 20).replace(/[^\d-]/g, "");
  if (!v) return null;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
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
  if (code === "23505") return "That address (slug) is already used by another item. Choose a different one.";
  if (code === "23503") return "This is still in use elsewhere (for example a category that has products). Move or remove those first.";
  if (error instanceof Error && error.message === "NO_DATABASE") return "The database is not connected.";
  console.error("admin:", error);
  return "Something went wrong while saving. Please try again.";
}
