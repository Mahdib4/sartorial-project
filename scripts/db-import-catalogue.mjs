// Copy pieces from the built-in catalogue (src/data/products.ts, categories.ts) into the
// database, for catalogues added in code after the site's first run.
//
//   npm run db:import-catalogue                     add categories and products the database does not have yet
//   npm run db:import-catalogue -- --photos=a,b     also replace the photographs and films of these existing
//                                                   products with the ones in the code
//   npm run db:import-catalogue -- --include-removed
//                                                   also bring back categories and products that were
//                                                   deleted in the admin
//
// It never changes or removes anything else, so edits made in the admin are kept. Categories
// and products deleted in the admin stay deleted: the admin lists them in removed_items and
// this script leaves them out (it says which) unless you pass --include-removed.
// New categories go at the end of their department and new products at the end of their
// category; reorder them in the admin.
// (On the very first run the website copies the whole built-in catalogue by itself.)
// Needs Node 22.6+ (it reads the TypeScript data files directly), DATABASE_URL and the
// tables from `npm run db:migrate`.

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
const includeRemoved = process.argv.includes("--include-removed");

const { PRODUCTS } = await import(path.join(root, "src/data/products.ts"));
const { CATEGORIES } = await import(path.join(root, "src/data/categories.ts"));
const client = new pg.Client({ connectionString: url });
await client.connect();

const added = { categories: 0, products: 0 };
let updated = 0;
const broughtBack = [];
const leftOut = { categories: [], products: [], homeless: [] };
const notFound = [];
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

try {
  await client.query("BEGIN");
  // If the website is copying in the catalogue for the first time at this very moment, wait for it.
  await client.query("SELECT pg_advisory_xact_lock(hashtext('sartorial:seed'))");

  const categoryKeys = new Set((await client.query("SELECT key FROM categories")).rows.map((r) => r.key));
  const productSlugs = new Set((await client.query("SELECT slug FROM products")).rows.map((r) => r.slug));
  const removed = { category: new Set(), product: new Set() };
  for (const r of (await client.query("SELECT kind, key FROM removed_items")).rows) removed[r.kind]?.add(r.key);

  for (const c of CATEGORIES) {
    if (categoryKeys.has(c.key)) continue;
    if (removed.category.has(c.key) && !includeRemoved) {
      leftOut.categories.push(c.key);
      continue;
    }
    const r = await client.query(
      `INSERT INTO categories (key, slug, collection, name, blurb, intro, preview, film, sizes, edit, position)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10::jsonb, (SELECT coalesce(max(position), 0) + 1 FROM categories WHERE collection = $3))
       ON CONFLICT (key) DO NOTHING`,
      [c.key, c.slug, c.collection, c.name, c.blurb, c.intro, JSON.stringify(c.preview), c.film ?? null, c.sizes, c.edit ? JSON.stringify(c.edit) : null],
    );
    categoryKeys.add(c.key);
    if (!r.rowCount) continue;
    added.categories++;
    if (removed.category.has(c.key)) {
      await client.query("DELETE FROM removed_items WHERE kind = 'category' AND key = $1", [c.key]);
      broughtBack.push(c.key);
    }
  }

  for (const p of PRODUCTS) {
    if (productSlugs.has(p.slug)) {
      if (photos.has(p.slug)) {
        await client.query("UPDATE products SET images = $2::jsonb, videos = $3::jsonb, updated_at = now() WHERE slug = $1", [p.slug, JSON.stringify(p.images), JSON.stringify(p.videos ?? [])]);
        updated++;
      }
      continue;
    }
    if (removed.product.has(p.slug) && !includeRemoved) {
      leftOut.products.push(p.slug);
      continue;
    }
    // Its category was deleted in the admin (and left out above): the product has nowhere to go.
    if (!categoryKeys.has(p.category)) {
      leftOut.homeless.push(p.slug);
      continue;
    }
    const r = await client.query(
      `INSERT INTO products (slug, name, category, images, videos, colour, colour_family, fabric, code, occasions, summary, description, details, note, price, position)
       VALUES ($1,$2,$3,$4::jsonb,$5::jsonb,$6,$7,$8,$9,$10::jsonb,$11,$12,$13::jsonb,$14,$15, (SELECT coalesce(max(position), 0) + 1 FROM products WHERE category = $3))
       ON CONFLICT (slug) DO NOTHING`,
      [p.slug, p.name, p.category, JSON.stringify(p.images), JSON.stringify(p.videos ?? []), p.colour, p.colourFamily, p.fabric ?? null, p.code ?? null,
        JSON.stringify(p.occasions), p.summary, p.description, JSON.stringify(p.details), p.note ?? null, p.price ?? null],
    );
    productSlugs.add(p.slug);
    if (!r.rowCount) continue;
    added.products++;
    if (removed.product.has(p.slug)) {
      await client.query("DELETE FROM removed_items WHERE kind = 'product' AND key = $1", [p.slug]);
      broughtBack.push(p.slug);
    }
  }
  for (const slug of photos) if (!productSlugs.has(slug)) notFound.push(slug);

  await client.query("COMMIT");

  if (added.categories || added.products || updated) {
    console.log(`catalogue: added ${plural(added.categories, "category", "categories")} and ${plural(added.products, "product", "products")}; updated the photographs of ${plural(updated, "product", "products")}.`);
  } else {
    console.log("catalogue: nothing new to add.");
  }
  if (broughtBack.length) console.log(`catalogue: brought back ${plural(broughtBack.length, "item", "items")} that had been deleted in the admin: ${broughtBack.join(", ")}.`);
  const removedCount = leftOut.categories.length + leftOut.products.length;
  if (removedCount) {
    const parts = [leftOut.categories.length ? plural(leftOut.categories.length, "category", "categories") : "", leftOut.products.length ? plural(leftOut.products.length, "product", "products") : ""].filter(Boolean);
    console.log(`catalogue: left out ${parts.join(" and ")} deleted in the admin: ${[...leftOut.categories, ...leftOut.products].join(", ")}.`);
  }
  if (leftOut.homeless.length) {
    console.log(`catalogue: left out ${plural(leftOut.homeless.length, "product", "products")} whose category was deleted in the admin: ${leftOut.homeless.join(", ")}.`);
  }
  if (removedCount || leftOut.homeless.length) console.log("catalogue: to bring these back on purpose, run: npm run db:import-catalogue -- --include-removed");
  if (notFound.length) console.log(`catalogue: --photos: not in the database, so nothing to update: ${notFound.join(", ")}.`);
  if (added.categories || added.products || updated) console.log("catalogue: the website shows the changes within about five minutes (straight away after a redeploy).");
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  if (error.code === "42P01") console.error(`catalogue: the database is missing a table (${error.message}). Run npm run db:migrate first.`);
  else console.error(`catalogue: ${error.message}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
