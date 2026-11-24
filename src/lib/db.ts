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
 *
 * Timeouts keep a slow or unreachable database from holding a page or a form
 * for long: getting a connection gives up after 5 seconds, and a query with no
 * answer after 8 seconds fails (the connection is then closed, not reused).
 * The query limit is kept by this client (`query_timeout`) rather than sent to
 * Postgres as `statement_timeout`, a start-up setting that Neon's pooled
 * connections may refuse. Every query the site makes takes milliseconds; the
 * enquiry and newsletter endpoints catch a timed-out query like any other
 * database error.
 */
let pool: Pool | null | undefined;

export function db(): Pool | null {
  if (pool !== undefined) return pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    pool = null;
    return pool;
  }
  pool = new Pool({ connectionString, max: 5, idleTimeoutMillis: 5_000, connectionTimeoutMillis: 5_000, query_timeout: 8_000 });
  // Neon closes idle connections when a compute suspends; without a listener that would crash the function.
  pool.on("error", (error) => console.error("db: idle connection error", error.message));
  // On Vercel Fluid compute, release idle connections before the instance is suspended.
  attachDatabasePool(pool);
  return pool;
}
