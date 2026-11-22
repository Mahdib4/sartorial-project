import { attachDatabasePool } from "@vercel/functions";
import { Pool } from "pg";

/**
 * The Postgres connection (Neon), for route handlers only.
 *
 * Reads DATABASE_URL: Neon's pooled connection string, which `neon env pull`
 * (or `neon deploy`) writes to .env.local and which must also be set in the
 * hosting provider's environment. Schema changes go through
 * `npm run db:migrate` (db/migrations/), never through this pool.
 *
 * Returns null when no database is configured, so every caller can degrade
 * gracefully: the site never depends on the database to take an enquiry.
 */
let pool: Pool | null | undefined;

export function db(): Pool | null {
  if (pool !== undefined) return pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    pool = null;
    return pool;
  }
  pool = new Pool({ connectionString, max: 5, idleTimeoutMillis: 5_000, connectionTimeoutMillis: 8_000 });
  // On Vercel Fluid compute, release idle connections before the instance is suspended.
  attachDatabasePool(pool);
  return pool;
}
