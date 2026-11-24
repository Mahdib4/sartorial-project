import { ipAddress } from "@vercel/functions/headers";

/**
 * Small limits against scripts, counted per minute in this server instance's
 * memory. They stop a script hammering one instance; for a limit across every
 * instance, add a Vercel Firewall rate-limit rule on POST /api/* as well (see README).
 */
const WINDOW_MS = 60_000;
const hits = new Map<string, { count: number; resetAt: number }>();

/**
 * The visitor's address. On Vercel the platform sets x-real-ip itself (read by
 * ipAddress() from @vercel/functions), so a visitor cannot choose it. Elsewhere,
 * the last address in X-Forwarded-For is the one the nearest proxy saw; the
 * addresses before it are whatever the visitor sent.
 */
export function clientAddress(source: Request | Headers): string {
  // A Request, or headers (Next's headers() object also has a `headers` field of its own, so test for a Request's).
  const headers = source instanceof Request ? source.headers : source;
  const real = ipAddress(headers)?.trim();
  if (real) return real;
  const forwarded = headers.get("x-forwarded-for")?.split(",").map((a) => a.trim()).filter(Boolean);
  return forwarded?.at(-1) || "unknown";
}

/** This minute's count for `key`, starting a fresh minute when the last one is over. */
function entry(key: string, now: number): { count: number; resetAt: number } {
  if (hits.size > 5_000) {
    for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
  }
  let e = hits.get(key);
  if (!e || e.resetAt <= now) {
    e = { count: 0, resetAt: now + WINDOW_MS };
    hits.set(key, e);
  }
  return e;
}

/** True when this request goes over the limit and should be refused with 429. */
export function tooManyRequests(request: Request, bucket: string, limit: number): boolean {
  const e = entry(`${bucket}:${clientAddress(request)}`, Date.now());
  e.count += 1;
  return e.count > limit;
}

/** Wrong passwords allowed a minute from one address, and from everyone together. */
const GUESSES_PER_ADDRESS = 8;
const GUESSES_FROM_EVERYONE = 30;

/**
 * Count one password attempt (signing in, or the current password when changing
 * it): at most 8 a minute from one address and 30 a minute from all addresses
 * together, so a guesser gains nothing by changing address.
 *
 * Returns null when the limit is reached: refuse the attempt without checking
 * the password. Otherwise the attempt is counted straight away (so attempts sent
 * all at once are counted too); call `undo()` when it should not count, because
 * the password was right or could not be checked.
 */
export function passwordAttempt(source: Request | Headers): { undo(): void } | null {
  const now = Date.now();
  const mine = entry(`password:${clientAddress(source)}`, now);
  const everyone = entry("password:*", now);
  if (mine.count >= GUESSES_PER_ADDRESS || everyone.count >= GUESSES_FROM_EVERYONE) return null;
  mine.count += 1;
  everyone.count += 1;
  let undone = false;
  return {
    undo() {
      if (undone) return;
      undone = true;
      mine.count = Math.max(0, mine.count - 1);
      everyone.count = Math.max(0, everyone.count - 1);
    },
  };
}
