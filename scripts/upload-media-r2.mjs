// Copy the web-ready media (public/media/) to a Cloudflare R2 bucket over its S3 API.
//
//   npm run media:upload              upload new and changed files
//   npm run media:upload -- --dry-run list what would be uploaded
//   npm run media:upload -- --force   upload everything again
//
// Needs, in the environment or .env.local (create an R2 API token with
// "Object Read & Write" on the bucket, in Cloudflare → R2 → Manage API tokens):
//   R2_ACCOUNT_ID          Cloudflare account id (the S3 endpoint is https://<id>.r2.cloudflarestorage.com)
//   R2_ACCESS_KEY_ID       the token's Access Key ID
//   R2_SECRET_ACCESS_KEY   the token's Secret Access Key
//   R2_BUCKET              the bucket name
//   R2_ENDPOINT            optional: the full S3 endpoint, instead of R2_ACCOUNT_ID
//
// Files keep their paths under a "media/" prefix, so with NEXT_PUBLIC_MEDIA_URL set
// to the bucket's public address the site finds them at the same relative URLs.
// Media file names never change content in place, so they are cached for a year.

import { createReadStream, existsSync } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const root = path.resolve(import.meta.dirname, "..");
for (const file of [".env.local", ".env"]) {
  const p = path.join(root, file);
  if (existsSync(p)) process.loadEnvFile(p);
}

const args = new Set(process.argv.slice(2));
const DRY = args.has("--dry-run");
const FORCE = args.has("--force");

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env;
const endpoint = process.env.R2_ENDPOINT || (R2_ACCOUNT_ID ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : "");
const missing = Object.entries({ "R2_ACCOUNT_ID or R2_ENDPOINT": endpoint, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET })
  .filter(([, v]) => !v)
  .map(([k]) => k);
if (missing.length) {
  console.error(`r2: missing ${missing.join(", ")} (see the comment at the top of this script)`);
  process.exit(1);
}

const TYPES = { ".webp": "image/webp", ".mp4": "video/mp4", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml" };
const s3 = new S3Client({ region: "auto", endpoint, forcePathStyle: true, credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY } });
const local = path.join(root, "public", "media");

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (TYPES[path.extname(entry.name).toLowerCase()]) out.push(full);
  }
  return out;
}

// What the bucket already has
const remote = new Map();
let token;
do {
  const page = await s3.send(new ListObjectsV2Command({ Bucket: R2_BUCKET, Prefix: "media/", ContinuationToken: token }));
  for (const o of page.Contents ?? []) remote.set(o.Key, o.Size);
  token = page.IsTruncated ? page.NextContinuationToken : undefined;
} while (token);

const files = await walk(local);
const todo = [];
let bytes = 0;
for (const file of files) {
  const key = `media/${path.relative(local, file).split(path.sep).join("/")}`;
  const size = (await stat(file)).size;
  if (!FORCE && remote.get(key) === size) continue;
  todo.push({ file, key, size });
  bytes += size;
}

console.log(`r2: ${files.length} local files, ${remote.size} in ${R2_BUCKET}; ${todo.length} to upload (${Math.round(bytes / 1048576)} MB)${DRY ? " [dry run]" : ""}`);
if (DRY) {
  for (const t of todo.slice(0, 50)) console.log(`  ${t.key}`);
  if (todo.length > 50) console.log(`  … and ${todo.length - 50} more`);
  process.exit(0);
}

let done = 0;
const failures = [];
async function worker() {
  for (let t = todo.shift(); t; t = todo.shift()) {
    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET,
          Key: t.key,
          Body: createReadStream(t.file),
          ContentLength: t.size,
          ContentType: TYPES[path.extname(t.file).toLowerCase()],
          CacheControl: "public, max-age=31536000, immutable",
        }),
      );
      if (++done % 50 === 0) console.log(`r2: ${done} uploaded`);
    } catch (error) {
      failures.push(`${t.key}: ${error.message}`);
    }
  }
}
await Promise.all(Array.from({ length: 8 }, worker));

console.log(`r2: uploaded ${done} file${done === 1 ? "" : "s"}${failures.length ? `, ${failures.length} failed` : ""}`);
for (const f of failures.slice(0, 20)) console.error(`  ${f}`);
if (failures.length) process.exitCode = 1;
else if (process.env.NEXT_PUBLIC_MEDIA_URL) console.log(`r2: the site will serve media from ${process.env.NEXT_PUBLIC_MEDIA_URL}/media/…`);
else console.log("r2: now set NEXT_PUBLIC_MEDIA_URL to the bucket's public address (locally and on Vercel) and redeploy");
