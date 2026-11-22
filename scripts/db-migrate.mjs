// Apply the SQL migrations in db/migrations/ to the Neon database, in order, once each.
//
//   npm run db:migrate            apply pending migrations (fails if no database is configured)
//   npm run db:check              connect, list applied migrations and row counts; changes nothing
//   node scripts/db-migrate.mjs --if-configured
//                                 as db:migrate, but a quiet no-op when no database is set
//                                 (used by `npm run build`, so deploys keep the schema current)
//
// Uses DATABASE_URL_UNPOOLED (Neon's direct connection) when present, as Neon advises for
// schema changes, otherwise DATABASE_URL. Reads .env.local / .env if they exist.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import pg from "pg";

const root = path.resolve(import.meta.dirname, "..");
for (const file of [".env.local", ".env"]) {
  const p = path.join(root, file);
  if (existsSync(p)) process.loadEnvFile(p); // existing environment variables win
}

const args = new Set(process.argv.slice(2));
const CHECK = args.has("--check");
const IF_CONFIGURED = args.has("--if-configured");

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) {
  if (IF_CONFIGURED) {
    console.log("db: no DATABASE_URL set, skipping migrations");
    process.exit(0);
  }
  console.error("db: set DATABASE_URL (run `neon env pull`, or add it to .env.local)");
  process.exit(1);
}

const dir = path.join(root, "db", "migrations");
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
const client = new pg.Client({ connectionString: url, connectionTimeoutMillis: 15_000 });

try {
  await client.connect();
  const host = new URL(url).hostname;
  await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`);
  const applied = new Set((await client.query("SELECT name FROM schema_migrations")).rows.map((r) => r.name));

  if (CHECK) {
    console.log(`db: connected to ${host}`);
    for (const f of files) console.log(`  ${applied.has(f) ? "applied" : "PENDING"}  ${f}`);
    for (const table of ["enquiries", "newsletter_subscribers"]) {
      const exists = (await client.query("SELECT to_regclass($1) AS t", [table])).rows[0].t;
      console.log(`  ${table}: ${exists ? `${(await client.query(`SELECT count(*)::int AS n FROM ${table}`)).rows[0].n} rows` : "missing"}`);
    }
  } else {
    let count = 0;
    for (const f of files) {
      if (applied.has(f)) continue;
      const sql = readFileSync(path.join(dir, f), "utf8");
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [f]);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw new Error(`${f}: ${error.message}`);
      }
      console.log(`db: applied ${f}`);
      count++;
    }
    console.log(`db: ${host} is up to date (${count} migration${count === 1 ? "" : "s"} applied now, ${files.length} in total)`);
  }
} catch (error) {
  console.error(`db: ${error.message}`);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
