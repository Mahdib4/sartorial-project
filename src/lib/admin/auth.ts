import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/lib/db";

/**
 * Admin sign-in: one password for the house.
 *
 * The password is ADMIN_PASSWORD (set on the server) until it is changed in
 * Admin → Settings, after which a scrypt hash in the database is used instead.
 * A signed, HTTP-only cookie keeps the admin signed in for 14 days; changing
 * the password signs every session out.
 */

export const SESSION_COOKIE = "sartorial_admin";
const SESSION_DAYS = 14;

type StoredPassword = { salt: string; hash: string };

async function storedPassword(): Promise<StoredPassword | null> {
  const pool = db();
  if (!pool) return null;
  try {
    const { rows } = await pool.query("SELECT value FROM settings WHERE key = 'admin'");
    const v = rows[0]?.value as Partial<StoredPassword> | undefined;
    return v?.salt && v?.hash ? { salt: v.salt, hash: v.hash } : null;
  } catch {
    return null;
  }
}

/** Something that changes whenever the password does, mixed into every session's signature. */
async function passwordFingerprint(): Promise<string | null> {
  const stored = await storedPassword();
  if (stored) return stored.hash;
  const env = process.env.ADMIN_PASSWORD;
  return env ? createHash("sha256").update(`env:${env}`).digest("hex") : null;
}

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.DATABASE_URL || process.env.ADMIN_PASSWORD || "";
}

export async function adminConfigured(): Promise<boolean> {
  return Boolean(db()) && Boolean((await storedPassword()) || process.env.ADMIN_PASSWORD);
}

export async function checkPassword(candidate: string): Promise<boolean> {
  const stored = await storedPassword();
  if (stored) {
    const hash = scryptSync(candidate, stored.salt, 64);
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

function sign(payload: string, fingerprint: string): string {
  return createHmac("sha256", secret()).update(`${payload}|${fingerprint}`).digest("base64url");
}

export async function createSession(): Promise<void> {
  const fingerprint = await passwordFingerprint();
  if (!fingerprint) throw new Error("Admin password not configured");
  const expires = Date.now() + SESSION_DAYS * 86_400_000;
  const payload = String(expires);
  (await cookies()).set(SESSION_COOKIE, `${payload}.${sign(payload, fingerprint)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expires),
  });
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

/** True if the cookie value is a valid, unexpired session. */
export async function verifySession(value: string | undefined): Promise<boolean> {
  if (!value || !secret()) return false;
  const [payload, signature] = value.split(".");
  if (!payload || !signature || !/^\d+$/.test(payload) || Number(payload) < Date.now()) return false;
  const fingerprint = await passwordFingerprint();
  if (!fingerprint) return false;
  const expected = Buffer.from(sign(payload, fingerprint));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

/** Checked once per request for each cookie value (a page reads several lists, each guarded). */
const verifyOnce = cache(verifySession);

export async function isAdmin(): Promise<boolean> {
  return verifyOnce((await cookies()).get(SESSION_COOKIE)?.value);
}

/** For admin pages and actions: continue only when signed in. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}
