#!/usr/bin/env node
/**
 * Sartorial media build.
 *
 *   node scripts/build-media.mjs <content-folder>
 *   SARTORIAL_CONTENT=<content-folder> npm run media
 *
 * <content-folder> is the client's "WEB" Google Drive folder, downloaded locally
 * (it contains Clothing/, Accessories/, Footwear/ …).
 *
 * Output
 *   public/media/img/<id>-<width>.webp     responsive photos
 *   public/media/video/<id>.mp4            silent, web-ready clips (+ <id>-poster-*.webp)
 *   src/data/media.generated.json          the manifest the site reads
 *
 * Requirements: Node 20+, `sharp` (installed with the project) and `ffmpeg`/`ffprobe`
 * on the PATH for video. Photos alone work without ffmpeg (pass --no-video).
 * The build is incremental: existing outputs are kept unless --force is passed.
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readdir, rename, stat, writeFile, readFile, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { CROPS, EDITS, IMAGE_QUALITY, IMAGE_WIDTHS, STILLS, VIDEO_OVERRIDES } from "./media.config.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const SRC = path.resolve(args.find((a) => !a.startsWith("--")) ?? process.env.SARTORIAL_CONTENT ?? "content");
const FORCE = flags.has("--force");
const NO_VIDEO = flags.has("--no-video");
/** Re-level studio photographs even though they are already built (after tuning levelBackdrop). */
const REFRESH_CUTS = flags.has("--refresh-cuts");
const OUT_IMG = path.join(ROOT, "public/media/img");
const OUT_VID = path.join(ROOT, "public/media/video");
const MANIFEST = path.join(ROOT, "src/data/media.generated.json");

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"]);
const VIDEO_EXT = new Set([".mp4", ".mov", ".m4v", ".webm"]);

sharp.cache(false);
sharp.concurrency(2);

if (!existsSync(SRC)) {
  console.error(`Content folder not found: ${SRC}\nUsage: node scripts/build-media.mjs <content-folder>`);
  process.exit(1);
}

/** "Clothing/Classic/Suits/Charcoal Suit - 01.jpeg" → "classic/suits/charcoal-suit-01" */
export function toId(rel) {
  const noExt = rel.replace(/\.[^.\\/]+$/, "");
  const parts = noExt.split(/[\\/]/).map((s) =>
    s
      .normalize("NFKD")
      .replace(/&/g, " and ")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase(),
  );
  if (parts[0] === "clothing") parts.shift();
  return parts.join("/");
}

async function walk(dir, base = dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full, base)));
    else out.push(path.relative(base, full));
  }
  return out;
}

async function pool(items, limit, worker) {
  let index = 0;
  const failures = [];
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (index < items.length) {
        const item = items[index++];
        try {
          await worker(item);
        } catch (error) {
          failures.push({ item, error });
          console.error(`  ✗ ${typeof item === "string" ? item : item.id}: ${error.message}`);
        }
      }
    }),
  );
  return failures;
}

function run(cmd, cmdArgs) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, cmdArgs, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", (d) => (stderr += d));
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0 ? resolve(stdout) : reject(new Error(`${cmd} exited ${code}: ${stderr.slice(-600)}`)),
    );
  });
}

const hex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");

/**
 * Backdrop colour, and whether the photo is a product on a plain light ground.
 * Flat-lays often run corner to corner, so two light, matching corners are
 * enough; the backdrop colour is then taken from those corners only.
 */
async function backdrop(pipeline, width, height) {
  const patch = Math.max(8, Math.round(Math.min(width, height) * 0.04));
  const corners = [
    { left: 0, top: 0 },
    { left: width - patch, top: 0 },
    { left: 0, top: height - patch },
    { left: width - patch, top: height - patch },
  ];
  const means = [];
  const floors = [];
  for (const c of corners) {
    // Read the patch's pixels directly: sharp's stats() reports on the whole
    // input image and ignores extract().
    const { data, info } = await pipeline
      .clone()
      .extract({ ...c, width: patch, height: patch })
      .raw()
      .toBuffer({ resolveWithObject: true });
    const sums = [0, 0, 0];
    for (let i = 0; i < data.length; i += info.channels) {
      sums[0] += data[i];
      sums[1] += data[i + 1];
      sums[2] += data[i + 2];
      floors.push(Math.min(data[i], data[i + 1], data[i + 2]));
    }
    const pixels = data.length / info.channels;
    means.push(sums.map((v) => v / pixels));
  }
  // The darkest the backdrop gets at its corners (ignoring the odd speck).
  floors.sort((a, b) => a - b);
  const floor = floors[Math.floor(floors.length * 0.01)];
  const luminance = (m) => 0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2];
  const average = (list) => [0, 1, 2].map((i) => list.reduce((s, m) => s + m[i], 0) / list.length);
  const spread = (list) => Math.max(...[0, 1, 2].map((i) => Math.max(...list.map((m) => m[i])) - Math.min(...list.map((m) => m[i]))));
  const light = means.filter((m) => luminance(m) > 212);
  const flat = light.length >= 2 && spread(light) < 26;
  const avg = average(flat ? light : means);
  const toHex = (m) => `#${hex(m[0])}${hex(m[1])}${hex(m[2])}`;
  // All four corners plain and light: a studio photograph on a white sweep.
  const studio = light.length === 4 && spread(means) < 26;
  return { bg: toHex(avg), flat, studio, floor };
}

/**
 * Level a studio photograph's backdrop to pure white, leaving the garment's own
 * colours untouched: only pixels that are already near-white are lifted. A
 * levelled photo can then be shown whole in a frame of any shape, with the frame
 * simply continuing its backdrop.
 */
async function levelBackdrop(buffer, floor) {
  const { data, info } = await sharp(buffer).raw().toBuffer({ resolveWithObject: true });
  // Everything as light as the backdrop's darkest corner becomes white; tones a
  // little darker than that (soft shadows) are eased towards it.
  const HI = Math.max(190, Math.min(240, floor - 3));
  const LO = HI - 30;
  for (let i = 0; i < data.length; i += info.channels) {
    const floor = Math.min(data[i], data[i + 1], data[i + 2]);
    if (floor <= LO) continue;
    const x = Math.min(1, (floor - LO) / (HI - LO));
    const t = x * x * (3 - 2 * x);
    data[i] += (255 - data[i]) * t;
    data[i + 1] += (255 - data[i + 1]) * t;
    data[i + 2] += (255 - data[i + 2]) * t;
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } }).png({ compressionLevel: 1 }).toBuffer();
}

const outBaseFor = (id) => path.join(OUT_IMG, id);

/** Produce the responsive set + manifest record for one (optionally cropped) photo. */
async function buildImage(id, file, box) {
  const meta = await sharp(file).metadata();
  const rotated = (meta.orientation ?? 1) >= 5;
  let width = rotated ? meta.height : meta.width;
  let height = rotated ? meta.width : meta.height;
  // Materialise orientation (and any crop) once at a working size, then derive every width from it.
  let base = sharp(file).rotate();
  if (box) {
    const [x, y, w, h] = box;
    const region = {
      left: Math.round(x * width),
      top: Math.round(y * height),
      width: Math.min(Math.round(w * width), width - Math.round(x * width)),
      height: Math.min(Math.round(h * height), height - Math.round(y * height)),
    };
    base = sharp(await sharp(file).rotate().toBuffer()).extract(region);
    width = region.width;
    height = region.height;
  }
  const maxW = Math.max(...IMAGE_WIDTHS);
  const working = await base
    .resize({ width: Math.min(width, maxW), withoutEnlargement: true })
    .toColourspace("srgb")
    .removeAlpha()
    .toBuffer({ resolveWithObject: true });
  const workW = working.info.width;
  const workH = working.info.height;

  // Landscape studio photographs (trousers laid flat) get their backdrop levelled,
  // so catalogue frames can show them whole. See levelBackdrop().
  const { bg, flat, studio, floor } = await backdrop(sharp(working.data), workW, workH);
  const cut = studio && workW / workH >= 1.2;
  const pixels = cut ? await levelBackdrop(working.data, floor) : working.data;

  const widths = IMAGE_WIDTHS.filter((w) => w <= workW);
  if (widths.length === 0 || widths[widths.length - 1] < workW * 0.85) widths.push(workW);

  const outBase = outBaseFor(id);
  await mkdir(path.dirname(outBase), { recursive: true });
  // Re-encode when the treatment of this photo has changed since the last build.
  const stale = cut !== Boolean(previous.images[id]?.cut) || (cut && REFRESH_CUTS);
  for (const w of widths) {
    const out = `${outBase}-${w}.webp`;
    if (!FORCE && !stale && existsSync(out)) continue;
    await sharp(pixels)
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: IMAGE_QUALITY, effort: 5 })
      .toFile(out);
  }

  const blurBuffer = await sharp(pixels).resize({ width: 20 }).blur(1).webp({ quality: 40 }).toBuffer();
  return {
    w: workW,
    h: workH,
    widths,
    blur: `data:image/webp;base64,${blurBuffer.toString("base64")}`,
    bg: cut ? "#ffffff" : bg,
    ...(flat ? { flat: true } : {}),
    ...(cut ? { cut: true } : {}),
  };
}

async function probe(file) {
  const json = JSON.parse(
    await run("ffprobe", ["-v", "error", "-print_format", "json", "-show_streams", "-show_format", file]),
  );
  const v = json.streams.find((s) => s.codec_type === "video");
  let width = v.width;
  let height = v.height;
  const rotation = (v.side_data_list ?? []).find((s) => "rotation" in s)?.rotation ?? 0;
  if (Math.abs(rotation) === 90 || Math.abs(rotation) === 270) [width, height] = [height, width];
  return { width, height, duration: Number(json.format.duration), hasAudio: json.streams.some((s) => s.codec_type === "audio") };
}

const even = (n) => 2 * Math.round(n / 2);

async function buildPoster(id, videoFile, at) {
  const tmp = path.join(OUT_VID, `${id}-poster.png`);
  await mkdir(path.dirname(tmp), { recursive: true });
  await run("ffmpeg", ["-v", "error", "-y", "-ss", String(at), "-i", videoFile, "-frames:v", "1", tmp]);
  const meta = await sharp(tmp).metadata();
  const widths = [480, 960, 1600].filter((w) => w <= meta.width);
  if (widths.length === 0 || widths[widths.length - 1] < meta.width * 0.8) widths.push(meta.width);
  for (const w of widths) {
    await sharp(tmp).resize({ width: w }).webp({ quality: 72 }).toFile(path.join(OUT_VID, `${id}-poster-${w}.webp`));
  }
  const blur = await sharp(tmp).resize({ width: 20 }).blur(1).webp({ quality: 40 }).toBuffer();
  await unlink(tmp);
  return { widths, blur: `data:image/webp;base64,${blur.toString("base64")}` };
}

async function buildVideo(id, file) {
  const info = await probe(file);
  const o = VIDEO_OVERRIDES[id] ?? {};
  if (o.crop) {
    info.width = o.crop[0];
    info.height = o.crop[1];
  }
  const portrait = info.height > info.width;
  const [tw, th] = portrait ? [720, 1280] : [1280, 720];
  const scale = Math.min(tw / info.width, th / info.height, 1);
  const w = even(info.width * scale);
  const h = even(info.height * scale);
  const out = path.join(OUT_VID, `${id}.mp4`);
  await mkdir(path.dirname(out), { recursive: true });
  const [start, end] = o.trim ?? [0, info.duration];
  if (FORCE || !existsSync(out)) {
    const a = ["-v", "error", "-y"];
    if (o.trim) a.push("-ss", String(start), "-to", String(end));
    const crop = o.crop ? `crop=${o.crop.join(":")},` : "";
    a.push("-i", file, "-vf", `${crop}scale=${w}:${h}:flags=lanczos,fps=30`, "-c:v", "libx264", "-preset", "slow");
    a.push("-crf", String(o.long ? 25 : 27), "-profile:v", "high", "-pix_fmt", "yuv420p", "-movflags", "+faststart");
    if (o.audio && info.hasAudio) a.push("-c:a", "aac", "-b:a", "128k", "-ac", "2");
    else a.push("-an");
    const tmp = `${out}.part.mp4`;
    a.push("-map_metadata", "-1", tmp);
    await run("ffmpeg", a);
    await rename(tmp, out);
  }
  const poster = await buildPoster(id, out, Math.min(o.poster ?? 1, Math.max(0, end - start - 0.2)));
  return { w, h, duration: Math.round((end - start) * 10) / 10, poster, ...(o.audio && info.hasAudio ? { audio: true } : {}) };
}

async function buildEdit(id, edit, sourceFile) {
  const info = await probe(sourceFile);
  const out = path.join(OUT_VID, `${id}.mp4`);
  await mkdir(path.dirname(out), { recursive: true });
  const duration = edit.segments.reduce((s, seg) => s + (seg.t[1] - seg.t[0]), 0);
  if (FORCE || !existsSync(out)) {
    // One seeked input per segment: decoding stays bounded to the seconds we keep.
    const inputs = [];
    const parts = [];
    edit.segments.forEach((seg, i) => {
      inputs.push("-ss", String(seg.t[0]), "-t", String(Math.round((seg.t[1] - seg.t[0]) * 1000) / 1000), "-i", sourceFile);
      let chain = `[${i}:v]setpts=PTS-STARTPTS`;
      if (edit.portrait) {
        const cropW = even((info.height * edit.width) / edit.height);
        const x = Math.max(0, Math.min(info.width - cropW, Math.round(info.width * (seg.cropX ?? 0.5) - cropW / 2)));
        chain += `,crop=${cropW}:${info.height}:${x}:0`;
      }
      chain += `,scale=${edit.width}:${edit.height}:flags=lanczos,fps=30,setsar=1[v${i}]`;
      parts.push(chain);
    });
    const concat = `${edit.segments.map((_, i) => `[v${i}]`).join("")}concat=n=${edit.segments.length}:v=1:a=0[out]`;
    const tmp = `${out}.part.mp4`;
    await run("ffmpeg", [
      "-v", "error", "-y", ...inputs,
      "-filter_complex", `${parts.join(";")};${concat}`,
      "-map", "[out]", "-c:v", "libx264", "-preset", "slow", "-crf", String(edit.crf ?? 27),
      "-profile:v", "high", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", "-map_metadata", "-1", tmp,
    ]);
    await rename(tmp, out);
  }
  const poster = await buildPoster(id, out, 0.4);
  return { w: edit.width, h: edit.height, duration: Math.round(duration * 10) / 10, poster };
}

// ── Run ────────────────────────────────────────────────────────

const files = (await walk(SRC)).filter((f) => !/ Copy\.[A-Za-z0-9]+$/.test(f)).sort();
const imageFiles = files.filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()));
const videoFiles = files.filter((f) => VIDEO_EXT.has(path.extname(f).toLowerCase()));
const byId = new Map(files.map((f) => [toId(f), f]));

let manifest = { images: {}, videos: {} };
if (!FORCE && existsSync(MANIFEST)) manifest = JSON.parse(await readFile(MANIFEST, "utf8"));
// What the last build recorded, so a photo is re-encoded if its treatment changes.
const previous = structuredClone(manifest);

console.log(`Content: ${SRC}\n${imageFiles.length} photos, ${videoFiles.length} clips, ${Object.keys(CROPS).length} crops, ${Object.keys(STILLS).length} stills, ${Object.keys(EDITS).length} edits`);

const started = Date.now();
const failures = [];

failures.push(
  ...(await pool(imageFiles, 4, async (rel) => {
    const id = toId(rel);
    manifest.images[id] = { ...(await buildImage(id, path.join(SRC, rel))), name: path.basename(rel).replace(/\.[^.]+$/, "") };
  })),
);
console.log(`photos done (${Math.round((Date.now() - started) / 1000)}s)`);

failures.push(
  ...(await pool(Object.entries(CROPS).map(([id, c]) => ({ id, ...c })), 4, async (crop) => {
    const rel = byId.get(crop.from);
    if (!rel) throw new Error(`crop source not found: ${crop.from}`);
    manifest.images[crop.id] = { ...(await buildImage(crop.id, path.join(SRC, rel), crop.box)), from: crop.from, ...(crop.focus ? { focus: crop.focus } : {}) };
  })),
);
console.log(`crops done (${Math.round((Date.now() - started) / 1000)}s)`);

if (!NO_VIDEO) {
  failures.push(
    ...(await pool(videoFiles, 3, async (rel) => {
      const id = toId(rel);
      manifest.videos[id] = { ...(await buildVideo(id, path.join(SRC, rel))), name: path.basename(rel).replace(/\.[^.]+$/, "") };
    })),
  );
  failures.push(
    ...(await pool(Object.entries(STILLS).map(([id, s]) => ({ id, ...s })), 3, async (still) => {
      const rel = byId.get(still.from);
      if (!rel) throw new Error(`still source not found: ${still.from}`);
      const frame = path.join(OUT_IMG, `${still.id}.frame.png`);
      await mkdir(path.dirname(frame), { recursive: true });
      await run("ffmpeg", ["-v", "error", "-y", "-ss", String(still.at), "-i", path.join(SRC, rel), "-frames:v", "1", frame]);
      manifest.images[still.id] = { ...(await buildImage(still.id, frame, still.box)), from: still.from };
      await unlink(frame);
    })),
  );
  failures.push(
    ...(await pool(Object.entries(EDITS).map(([id, e]) => ({ id, ...e })), 2, async (edit) => {
      const rel = byId.get(edit.from);
      if (!rel) throw new Error(`edit source not found: ${edit.from}`);
      manifest.videos[edit.id] = await buildEdit(edit.id, edit, path.join(SRC, rel));
    })),
  );
  console.log(`video done (${Math.round((Date.now() - started) / 1000)}s)`);
}

const sorted = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
await mkdir(path.dirname(MANIFEST), { recursive: true });
await writeFile(MANIFEST, JSON.stringify({ images: sorted(manifest.images), videos: sorted(manifest.videos) }, null, 1));

const size = async (dir) => {
  let total = 0;
  if (!existsSync(dir)) return 0;
  for (const f of await walk(dir)) total += (await stat(path.join(dir, f))).size;
  return total;
};
console.log(
  `Wrote ${Object.keys(manifest.images).length} photos (${Math.round((await size(OUT_IMG)) / 1048576)} MB) and ` +
    `${Object.keys(manifest.videos).length} clips (${Math.round((await size(OUT_VID)) / 1048576)} MB).`,
);
if (failures.length) {
  console.error(`${failures.length} item(s) failed.`);
  process.exit(1);
}
