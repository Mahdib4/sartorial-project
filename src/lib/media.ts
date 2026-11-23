import manifest from "@/data/media.generated.json";
import type { MediaImage, MediaVideo } from "@/data/types";

const IMAGES = manifest.images as Record<string, MediaImage>;

/**
 * Photographs uploaded through the admin. They are stored in Cloudflare R2 and
 * recorded in the database; the catalogue loader registers them here so the same
 * shot()/thumb() helpers work for them. Uploads never change once made, so the
 * registry can be shared by every request.
 */
const UPLOADS = new Map<string, MediaImage>();
/** The public address of the R2 bucket (not a secret). */
export const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL || "https://pub-815592e32d694078bff17fcd968c91d8.r2.dev").replace(/\/+$/, "");

export function registerUploads(records: Array<MediaImage & { id: string }>): void {
  for (const r of records) if (!UPLOADS.has(r.id)) UPLOADS.set(r.id, r);
}

const isUpload = (id: string) => id.startsWith("uploads/");
const record = (id: string): MediaImage | undefined => (isUpload(id) ? UPLOADS.get(id) : IMAGES[id]);
/** The URL of one rendition of an uploaded photograph, in R2. */
export function uploadUrl(id: string, width: number): string {
  return `${R2_PUBLIC_URL}/media/img/${id}-${width}.webp`;
}
const VIDEOS = manifest.videos as Record<string, MediaVideo>;

/** Everything a component needs to render one photo. Plain data, safe to pass to client components. */
export type Shot = {
  id: string;
  src: string;
  srcSet: string;
  width: number;
  height: number;
  /** Tiny blurred preview, inlined. */
  blur: string;
  /** Backdrop colour sampled from the photo's corners. */
  bg: string;
  /** True for product-on-white photographs, which are shown whole rather than cropped. */
  flat: boolean;
  /** Where the subject sits (CSS object-position), when the photo needs a specific anchor. */
  position?: string;
  /** A studio photograph on a levelled white backdrop: catalogue frames show it whole. */
  cut?: boolean;
};

export type Film = {
  id: string;
  src: string;
  width: number;
  height: number;
  duration: number;
  portrait: boolean;
  poster: string;
  posterSrcSet: string;
  blur: string;
  audio: boolean;
};

/**
 * Where the web-ready media are served from. Empty: from this site (public/media/).
 * Set NEXT_PUBLIC_MEDIA_URL to the Cloudflare R2 bucket's public address (its
 * r2.dev URL or, better, a custom domain) once `npm run media:upload` has copied
 * public/media there; every photo, film and poster then loads from the bucket.
 */
const MEDIA_BASE = (process.env.NEXT_PUBLIC_MEDIA_URL ?? "").replace(/\/+$/, "");

/** The URL of a file under public/media, e.g. mediaUrl("img/a-480.webp"). */
export function mediaUrl(path: string): string {
  return `${MEDIA_BASE}/media/${path.replace(/^\/+/, "")}`;
}

const imgPath = (id: string, width: number) => (isUpload(id) ? uploadUrl(id, width) : mediaUrl(`img/${id}-${width}.webp`));

export function hasImage(id: string): boolean {
  return Boolean(record(id));
}

/** Every built-in photograph's id (for the admin's photo library). */
export function builtInImageIds(): string[] {
  return Object.keys(IMAGES);
}

export function shot(id: string): Shot {
  const m = record(id);
  if (!m) throw new Error(`Unknown image id "${id}". Run "npm run media" or check the id.`);
  const largestUseful = m.widths.find((w) => w >= 1280) ?? m.widths[m.widths.length - 1];
  return {
    id,
    src: imgPath(id, largestUseful),
    srcSet: m.widths.map((w) => `${imgPath(id, w)} ${w}w`).join(", "),
    width: m.w,
    height: m.h,
    blur: m.blur,
    bg: m.bg,
    flat: Boolean(m.flat),
    ...(m.focus ? { position: m.focus } : {}),
    ...(m.cut ? { cut: true } : {}),
  };
}

/** A lighter Shot for places that render many small thumbnails (search, bag, menus). */
export function thumb(id: string): Pick<Shot, "id" | "src" | "srcSet" | "width" | "height" | "bg" | "flat" | "position" | "cut"> {
  const m = record(id);
  if (!m) throw new Error(`Unknown image id "${id}".`);
  const widths = m.widths.filter((w) => w <= 800);
  const use = widths.length ? widths : [m.widths[0]];
  return {
    id,
    src: imgPath(id, use[0]),
    srcSet: use.map((w) => `${imgPath(id, w)} ${w}w`).join(", "),
    width: m.w,
    height: m.h,
    bg: m.bg,
    flat: Boolean(m.flat),
    ...(m.focus ? { position: m.focus } : {}),
    ...(m.cut ? { cut: true } : {}),
  };
}

export function hasFilm(id: string): boolean {
  return id in VIDEOS;
}

export function film(id: string): Film {
  const m = VIDEOS[id];
  if (!m) throw new Error(`Unknown video id "${id}". Run "npm run media" or check the id.`);
  const posterPath = (w: number) => mediaUrl(`video/${id}-poster-${w}.webp`);
  const widths = m.poster.widths;
  return {
    id,
    src: mediaUrl(`video/${id}.mp4`),
    width: m.w,
    height: m.h,
    duration: m.duration,
    portrait: m.h > m.w,
    poster: posterPath(widths[widths.length - 1]),
    posterSrcSet: widths.map((w) => `${posterPath(w)} ${w}w`).join(", "),
    blur: m.poster.blur,
    audio: Boolean(m.audio),
  };
}

/** The photo an `edit/…` or `still/…` id was cut from, if any. */
export function sourceOf(id: string): string | undefined {
  return IMAGES[id]?.from;
}
