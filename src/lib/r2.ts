import { DeleteObjectsCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

/**
 * Cloudflare R2, over its S3 API: where photographs uploaded in the admin are
 * stored. Needs R2_ACCOUNT_ID (or R2_ENDPOINT), R2_ACCESS_KEY_ID and
 * R2_SECRET_ACCESS_KEY on the server; R2_BUCKET defaults to the house's bucket,
 * sartorial-media. Files are then served from the bucket's public address
 * (R2_PUBLIC_URL, see lib/media.ts).
 */
let client: S3Client | null | undefined;

/** A setting's value, without spaces or line breaks pasted around it (they would break the keys). */
function env(name: string): string {
  return (process.env[name] ?? "").trim();
}

/** The settings photo uploads need (the bucket has a default). */
export const R2_SETTINGS = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY"] as const;

/** The house's bucket, unless R2_BUCKET names another. Its name is not a secret. */
const DEFAULT_BUCKET = "sartorial-media";

function bucket(): string {
  return env("R2_BUCKET") || DEFAULT_BUCKET;
}

/**
 * Which of the settings uploads need are missing on this server (names only, never
 * values), and any other setting whose name looks like an R2 one, which usually
 * means a typo in a name (e.g. "R2_SECRET_KEY" instead of "R2_SECRET_ACCESS_KEY").
 */
export function r2Setup(): { missing: string[]; lookalikes: string[] } {
  const missing = R2_SETTINGS.filter((name) => !(name === "R2_ACCOUNT_ID" ? env("R2_ACCOUNT_ID") || env("R2_ENDPOINT") : env(name)));
  const known = new Set<string>([...R2_SETTINGS, "R2_BUCKET", "R2_ENDPOINT", "R2_PUBLIC_URL"]);
  const lookalikes = Object.keys(process.env).filter((name) => /(^|[^a-z0-9])r2([^a-z0-9]|$)/i.test(name) && !known.has(name));
  return { missing, lookalikes };
}

export function r2(): { s3: S3Client; bucket: string } | null {
  if (client === undefined) {
    const accountId = env("R2_ACCOUNT_ID");
    const endpoint = env("R2_ENDPOINT") || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : "");
    const accessKeyId = env("R2_ACCESS_KEY_ID");
    const secretAccessKey = env("R2_SECRET_ACCESS_KEY");
    client =
      endpoint && accessKeyId && secretAccessKey
        ? new S3Client({ region: "auto", endpoint, forcePathStyle: true, credentials: { accessKeyId, secretAccessKey } })
        : null;
  }
  return client ? { s3: client, bucket: bucket() } : null;
}

export async function putObject(key: string, body: Buffer, contentType: string, cacheControl = "public, max-age=31536000, immutable"): Promise<void> {
  const store = r2();
  if (!store) throw new Error("R2 is not configured");
  await store.s3.send(new PutObjectCommand({ Bucket: store.bucket, Key: key, Body: body, ContentType: contentType, CacheControl: cacheControl }));
}

export async function deleteObjects(keys: string[]): Promise<void> {
  const store = r2();
  if (!store || !keys.length) return;
  await store.s3.send(new DeleteObjectsCommand({ Bucket: store.bucket, Delete: { Objects: keys.map((Key) => ({ Key })) } }));
}
