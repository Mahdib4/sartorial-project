import { randomBytes } from "node:crypto";
import sharp from "sharp";
import { db } from "@/lib/db";
import { putObject } from "@/lib/r2";
import type { UploadedImage } from "@/data/types";

const WIDTHS = [480, 800, 1280, 1920];

/**
 * Turn one uploaded photograph into the site's web renditions (WebP at 480, 800,
 * 1280 and 1920 px wide, never larger than the original), store them in R2 under
 * media/img/uploads/…, and record the photograph in the database.
 */
export async function storeUpload(input: Buffer, name: string): Promise<UploadedImage> {
  const base = sharp(input, { failOn: "none" }).rotate(); // honour the camera's orientation
  const meta = await base.metadata();
  const turned = (meta.orientation ?? 1) >= 5; // EXIF orientations 5–8 swap width and height
  const srcW = (turned ? meta.height : meta.width) ?? 0;
  const srcH = (turned ? meta.width : meta.height) ?? 0;
  if (!srcW || !srcH) throw new Error("Not a readable image");

  const widths = WIDTHS.filter((w) => w <= srcW);
  if (!widths.length || widths[widths.length - 1] < Math.min(srcW, 1920)) widths.push(Math.min(srcW, 1920));
  const id = `uploads/${new Date().toISOString().slice(0, 7).replace("-", "")}/${randomBytes(6).toString("hex")}`;

  await Promise.all(
    widths.map(async (w) => {
      const buf = await sharp(input, { failOn: "none" }).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
      await putObject(`media/img/${id}-${w}.webp`, buf, "image/webp");
    }),
  );

  const largest = widths[widths.length - 1];
  const h = Math.round((srcH / srcW) * largest);
  const tiny = await sharp(input, { failOn: "none" }).rotate().resize({ width: 16 }).webp({ quality: 40 }).toBuffer();
  const stats = await sharp(input, { failOn: "none" }).rotate().resize({ width: 32, height: 32, fit: "fill" }).stats();
  const [r, g, b] = stats.channels.map((c) => Math.round(c.mean));
  const record: UploadedImage = {
    id,
    w: largest,
    h,
    widths,
    blur: `data:image/webp;base64,${tiny.toString("base64")}`,
    bg: `#${[r, g, b].map((v) => (v ?? 0).toString(16).padStart(2, "0")).join("")}`,
  };

  const pool = db();
  if (!pool) throw new Error("The database is not connected");
  await pool.query("INSERT INTO media (id, w, h, widths, blur, bg, name) VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7)", [
    id,
    record.w,
    record.h,
    JSON.stringify(widths),
    record.blur,
    record.bg,
    name.slice(0, 200),
  ]);
  return record;
}
