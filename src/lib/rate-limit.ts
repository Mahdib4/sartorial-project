/**
 * A small per-visitor limit for the form endpoints: at most `limit` requests a
 * minute from one address, counted in this server instance's memory. It stops
 * a script hammering one instance; for a limit across every instance, add a
 * Vercel Firewall rate-limit rule on POST /api/* as well (see README).
 */
const WINDOW_MS = 60_000;
const hits = new Map<string, { count: number; resetAt: number }>();

function clientAddress(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

/** True when this request goes over the limit and should be refused with 429. */
export function tooManyRequests(request: Request, bucket: string, limit: number): boolean {
  const now = Date.now();
  if (hits.size > 5_000) {
    for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
  }
  const key = `${bucket}:${clientAddress(request)}`;
  const entry = hits.get(key);
  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > limit;
}
