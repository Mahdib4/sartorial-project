// Copy pieces from the built-in catalogue (src/data/products.ts, categories.ts) into the
// database, for catalogues added in code after the site's first run.
//
//   npm run db:import-catalogue                 add categories and products the database does not have yet
//   npm run db:import-catalogue -- --photos=a,b also replace the photographs and films of these existing
//                                               products with the ones in the code
//
// It never changes or removes anything else, so edits made in the admin are kept.
// (On the very first run the website copies the whole built-in catalogue by itself.)
// Needs Node 22.6+ (it reads the TypeScript data files directly) and DATABASE_URL.

import { existsSync } from "node:fs";
import path from "node:path";
import pg from "pg";

const root = path.resolve(import.meta.dirname, "..");
for (const file of [".env.local", ".env"]) {
  const p = path.join(root, file);
  if (existsSync(p)) process.loadEnvFile(p);
}
const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) {
  console.error("catalogue: set DATABASE_URL first");
  process.exit(1);
}
const photos = new Set((process.argv.find((a) => a.startsWith("--photos=")) ?? "").slice(9).split(",").filter(Boolean));

const { PRODUCTS } = await import(path.join(root, "src/data/products.ts"));
const { CATEGORIES } = await import(path.join(root, "src/data/categories.ts"));
const client = new pg.Client({ connectionString: url });
await client.connect();
let categories = 0;
let products = 0;
let updated = 0;
try {
  await client.query("BEGIN");
  for (const [i, c] of CATEGORIES.entries()) {
    const r = await client.query(
      `INSERT INTO categories (key, slug, collection, name, blurb, intro, preview, film, sizes, edit, position)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10::jsonb,$11) ON CONFLICT (key) DO NOTHING`,
      [c.key, c.slug, c.collection, c.name, c.blurb, c.intro, JSON.stringify(c.preview), c.film ?? null, c.sizes, c.edit ? JSON.stringify(c.edit) : null, i],
    );
    categories += r.rowCount;
  }
  for (const [i, p] of PRODUCTS.entries()) {
    const r = await client.query(
      `INSERT INTO products (slug, name, category, images, videos, colour, colour_family, fabric, code, occasions, summary, description, details, note, price, position)
       VALUES ($1,$2,$3,$4::jsonb,$5::jsonb,$6,$7,$8,$9,$10::jsonb,$11,$12,$13::jsonb,$14,$15,$16) ON CONFLICT (slug) DO NOTHING`,
      [p.slug, p.name, p.category, JSON.stringify(p.images), JSON.stringify(p.videos ?? []), p.colour, p.colourFamily, p.fabric ?? null, p.code ?? null,
        JSON.stringify(p.occasions), p.summary, p.description, JSON.stringify(p.details), p.note ?? null, p.price ?? null, i],
    );
    products += r.rowCount;
    if (!r.rowCount && photos.has(p.slug)) {
      await client.query("UPDATE products SET images = $2::jsonb, videos = $3::jsonb, updated_at = now() WHERE slug = $1", [p.slug, JSON.stringify(p.images), JSON.stringify(p.videos ?? [])]);
      updated++;
    }
  }
  await client.query("COMMIT");
  console.log(`catalogue: added ${categories} categories and ${products} products; updated photographs of ${updated}. Open any page of the site (or redeploy) to see them.`);
} catch (error) {
  await client.query("ROLLBACK");
  console.error(`catalogue: ${error.message}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
