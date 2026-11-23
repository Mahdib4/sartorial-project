import { DeleteObjectsCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

/**
 * Cloudflare R2, over its S3 API: where photographs uploaded in the admin are
 * stored. Needs R2_ACCOUNT_ID (or R2_ENDPOINT), R2_ACCESS_KEY_ID,
 * R2_SECRET_ACCESS_KEY and R2_BUCKET on the server. Files are then served from
 * the bucket's public address (R2_PUBLIC_URL, see lib/media.ts).
 */
let client: S3Client | null | undefined;

export function r2(): { s3: S3Client; bucket: string } | null {
  if (client === undefined) {
    const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env;
    const endpoint = process.env.R2_ENDPOINT || (R2_ACCOUNT_ID ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : "");
    client =
      endpoint && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET
        ? new S3Client({ region: "auto", endpoint, forcePathStyle: true, credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY } })
        : null;
  }
  return client ? { s3: client, bucket: process.env.R2_BUCKET! } : null;
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
