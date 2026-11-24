import { createHash, createHmac, randomBytes, scrypt, scryptSync, timingSafeEqual } from "node:crypto";
import type { Pool } from "pg";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/lib/db";

/**
 * Admin sign-in: one password for the house.
 *
 * The password is ADMIN_PASSWORD (set on the server) until it is changed in
 * Admin → Settings; from then on only the scrypt hash saved in the database
 * counts. Nobody is let in when the database cannot be read: an error never
 * brings ADMIN_PASSWORD back.
 *
 * Each sign-in is a row in admin_sessions, good for 14 days. The browser holds
 * an HTTP-only cookie "<id>.<signature>": the row's random id, signed together
 * with a fingerprint of the current password. A sign-in counts while the
 * signature matches, the row exists and it has not run out. Signing out deletes
 * the row, so a copied cookie stops working too; changing the password deletes
 * every row, signing out every phone and computer.
 */

export const SESSION_COOKIE = "sartorial_admin";
const SESSION_DAYS = 14;
/** Set by src/proxy.ts on admin requests: the page being opened, so signing in can return to it. */
const PATH_HEADER = "x-sartorial-admin-path";

type StoredPassword = { salt: string; hash: string };

function database(): Pool {
  const pool = db();
  if (!pool) throw new Error("NO_DATABASE");
  return pool;
}

/** The saved password from the settings row's value; null when there is no row. */
function parseStored(value: unknown): StoredPassword | null {
  if (value == null) return null;
  const v = value as Partial<StoredPassword>;
  if (typeof v.salt !== "string" || !v.salt || typeof v.hash !== "string" || !/^[0-9a-f]{128}$/.test(v.hash)) {
    // Never treat a damaged saved password as "no password set", which would bring ADMIN_PASSWORD back.
    throw new Error("The saved admin password cannot be read");
  }
  return { salt: v.salt, hash: v.hash };
}

/** The password saved in Settings, or null when none has been saved yet. Throws when the database cannot be read. */
async function storedPassword(pool: Pool): Promise<StoredPassword | null> {
  const { rows } = await pool.query("SELECT value FROM settings WHERE key = 'admin'");
  return parseStored(rows[0]?.value);
}

/** Something that changes whenever the password does, mixed into every session's signature. */
function fingerprint(stored: StoredPassword | null): string | null {
  if (stored) return stored.hash;
  const env = process.env.ADMIN_PASSWORD;
  return env ? createHash("sha256").update(`env:${env}`).digest("hex") : null;
}

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.DATABASE_URL || process.env.ADMIN_PASSWORD || "";
}

function sign(id: string, print: string): string {
  return createHmac("sha256", secret()).update(`${id}|${print}`).digest("base64url");
}

function scryptHash(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => scrypt(password, salt, 64, (error, key) => (error ? reject(error) : resolve(key))));
}

export async function adminConfigured(): Promise<boolean> {
  const pool = db();
  if (!pool) return false;
  try {
    return Boolean((await storedPassword(pool)) || process.env.ADMIN_PASSWORD);
  } catch {
    return false;
  }
}

/**
 * True when `candidate` is the admin password. Throws when the database cannot
 * be read (or is not connected), so callers can say so rather than "wrong password".
 */
export async function checkPassword(candidate: string): Promise<boolean> {
  const stored = await storedPassword(database());
  if (stored) {
    const hash = await scryptHash(candidate, stored.salt);
    return timingSafeEqual(hash, Buffer.from(stored.hash, "hex"));
  }
  const env = process.env.ADMIN_PASSWORD;
  if (!env) return false;
  const a = createHash("sha256").update(candidate).digest();
  const b = createHash("sha256").update(env).digest();
  return timingSafeEqual(a, b);
}

export function hashPassword(password: string): StoredPassword {
  const salt = randomBytes(16).toString("hex");
  return { salt, hash: scryptSync(password, salt, 64).toString("hex") };
}

/** Sign this browser in: a new session row, and the cookie that names it. */
export async function createSession(): Promise<void> {
  const pool = database();
  const print = fingerprint(await storedPassword(pool));
  if (!print || !secret()) throw new Error("Admin password not configured");
  const id = randomBytes(32).toString("base64url");
  const userAgent = (await headers()).get("user-agent")?.slice(0, 300) || null;
  // Sign-ins that have run out are cleared away at the same time.
  const { rows } = await pool.query<{ expires_at: Date }>(
    `WITH expired AS (DELETE FROM admin_sessions WHERE expires_at < now())
     INSERT INTO admin_sessions (id, expires_at, user_agent) VALUES ($1, now() + make_interval(days => $2), $3)
     RETURNING expires_at`,
    [id, SESSION_DAYS, userAgent],
  );
  (await cookies()).set(SESSION_COOKIE, `${id}.${sign(id, print)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: rows[0].expires_at,
  });
}

/** The session id in a cookie value, or null when the value is not shaped like one of ours. */
function sessionId(value: string | undefined): { id: string; signature: string } | null {
  const parts = value?.split(".");
  if (parts?.length !== 2) return null;
  const [id, signature] = parts;
  return /^[A-Za-z0-9_-]{43}$/.test(id) && /^[A-Za-z0-9_-]{43}$/.test(signature) ? { id, signature } : null;
}

/** Sign this browser out, and end the sign-in itself so a copy of the cookie stops working too. */
export async function endSession(): Promise<void> {
  const jar = await cookies();
  const session = sessionId(jar.get(SESSION_COOKIE)?.value);
  // The browser is always signed out, even if the database cannot be reached just now.
  jar.delete(SESSION_COOKIE);
  const pool = db();
  if (!session || !pool) return;
  try {
    await pool.query("DELETE FROM admin_sessions WHERE id = $1", [session.id]);
  } catch (error) {
    console.error("admin: could not end the session in the database", error);
  }
}

/**
 * Save a new admin password and sign out every phone and computer. The caller
 * then signs this browser in again with createSession().
 */
export async function replacePassword(password: string): Promise<void> {
  const client = await database().connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO settings (key, value, updated_at) VALUES ('admin', $1::jsonb, now())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
      [JSON.stringify(hashPassword(password))],
    );
    await client.query("DELETE FROM admin_sessions");
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

/** True if the cookie value names a live session. Any database error counts as signed out. */
export async function verifySession(value: string | undefined): Promise<boolean> {
  const session = sessionId(value);
  const pool = db();
  if (!session || !pool || !secret()) return false;
  try {
    const { rows } = await pool.query<{ admin: unknown; live: boolean }>(
      `SELECT (SELECT value FROM settings WHERE key = 'admin') AS admin,
              EXISTS (SELECT 1 FROM admin_sessions WHERE id = $1 AND expires_at > now()) AS live`,
      [session.id],
    );
    const print = fingerprint(parseStored(rows[0]?.admin));
    if (!print || !rows[0]?.live) return false;
    const expected = Buffer.from(sign(session.id, print));
    const given = Buffer.from(session.signature);
    return expected.length === given.length && timingSafeEqual(expected, given);
  } catch (error) {
    console.error("admin: could not check the sign-in", error);
    return false;
  }
}

/** Checked once per request for each cookie value (a page reads several lists, each guarded). */
const verifyOnce = cache(verifySession);

export async function isAdmin(): Promise<boolean> {
  return verifyOnce((await cookies()).get(SESSION_COOKIE)?.value);
}

/**
 * An admin page to return to after signing in, or null when `value` is not one:
 * a path inside /admin (never another website, and not the sign-in page itself).
 */
export function adminReturnPath(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 1000) return null;
  if (!/^\/admin(?:[/?#]|$)/.test(value) || /^\/admin\/login(?:[/?#]|$)/.test(value)) return null;
  if (value.includes("//") || value.includes("\\") || /[\u0000-\u001f\u007f]/.test(value)) return null;
  return value;
}

/** For admin pages and actions: continue only when signed in; otherwise sign in and come back here. */
export async function requireAdmin(): Promise<void> {
  if (await isAdmin()) return;
  const back = adminReturnPath((await headers()).get(PATH_HEADER));
  redirect(back && back !== "/admin" ? `/admin/login?next=${encodeURIComponent(back)}` : "/admin/login");
}
