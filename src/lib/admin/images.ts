import { randomBytes } from "node:crypto";
import sharp from "sharp";
import { db } from "@/lib/db";
import { putObject } from "@/lib/r2";
import type { UploadedImage } from "@/data/types";

const WIDTHS = [480, 800, 1280, 1920];

/**
 * The most pixels a photograph may have (50 megapixels, e.g. 8000 × 6250). A
 * phone's largest photos are under this, and the admin shrinks photos to 2400 px
 * before sending them; the limit stops one small, highly compressed file from
 * taking gigabytes of memory to open.
 */
export const MAX_PIXELS = 50_000_000;

/** Thrown for a photograph with more than MAX_PIXELS pixels. */
export class ImageTooLarge extends Error {
  constructor() {
    super("This photograph is too large to process. Use a copy under 7,000 pixels on each side.");
    this.name = "ImageTooLarge";
  }
}

/**
 * Turn one uploaded photograph into the site's web renditions (WebP at 480, 800,
 * 1280 and 1920 px wide, never larger than the original), store them in R2 under
 * media/img/uploads/…, and record the photograph in the database.
 */
export async function storeUpload(input: Buffer, name: string): Promise<UploadedImage> {
  // Reading the size does not open the whole image, so an oversized one is refused before it uses any memory.
  const meta = await sharp(input, { failOn: "none", limitInputPixels: false }).metadata();
  if ((meta.width ?? 0) * (meta.height ?? 0) > MAX_PIXELS) throw new ImageTooLarge();
  const turned = (meta.orientation ?? 1) >= 5; // EXIF orientations 5–8 swap width and height
  const srcW = (turned ? meta.height : meta.width) ?? 0;
  const srcH = (turned ? meta.width : meta.height) ?? 0;
  if (!srcW || !srcH) throw new Error("Not a readable image");

  const widths = WIDTHS.filter((w) => w <= srcW);
  if (!widths.length || widths[widths.length - 1] < Math.min(srcW, 1920)) widths.push(Math.min(srcW, 1920));
  const id = `uploads/${new Date().toISOString().slice(0, 7).replace("-", "")}/${randomBytes(6).toString("hex")}`;

  // Open the original once, turned upright (the camera's orientation) and shrunk to the largest
  // rendition; every rendition is then made from those pixels, one after another.
  const { data, info } = await sharp(input, { failOn: "none", limitInputPixels: MAX_PIXELS })
    .rotate()
    .resize({ width: widths[widths.length - 1], withoutEnlargement: true })
    .toColourspace("srgb")
    .raw()
    .toBuffer({ resolveWithObject: true })
    .catch((error: unknown) => {
      throw error instanceof Error && /pixel limit/i.test(error.message) ? new ImageTooLarge() : error;
    });
  const pixels = () => sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } });

  for (const w of widths) {
    const buf = await pixels().resize({ width: w, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
    await putObject(`media/img/${id}-${w}.webp`, buf, "image/webp");
  }

  const largest = widths[widths.length - 1];
  const h = Math.round((srcH / srcW) * largest);
  const tiny = await pixels().resize({ width: 16 }).webp({ quality: 40 }).toBuffer();
  const stats = await pixels().resize({ width: 32, height: 32, fit: "fill" }).stats();
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
