/**
 * Media build configuration.
 *
 * `build-media.mjs` walks the client's content folder (the Google Drive
 * "WEB" folder, downloaded locally) and turns every photo into responsive
 * WebP files and every clip into a web-ready MP4 + poster.
 *
 * Everything here is *additional* instruction on top of that automatic pass:
 *   - CROPS:  detail crops cut from existing photos (used to illustrate
 *             categories that have no photography of their own yet).
 *   - VIDEO_OVERRIDES: per-clip trims (e.g. removing baked-in title cards
 *             so a clip loops cleanly) and audio handling.
 *   - EDITS:  multi-segment edits assembled from one source clip (the hero).
 */

/** Widths generated for every photo. */
export const IMAGE_WIDTHS = [480, 800, 1280, 1920];
export const IMAGE_QUALITY = 76;

/**
 * Detail crops. `from` is a media id (path under the content root, slugged).
 * `box` is [x, y, width, height] as fractions of the source photo.
 * `focus` (optional) is the CSS object-position used when the crop is itself
 * cropped by a frame, so the subject (a shoe, a tie) stays in view.
 */
export const CROPS = {
  // ── Footwear ──────────────────────────────────────────────
  "edit/footwear-tassel-loafers": { from: "classic/trousers/tailored-single-pleat-trouser-dark-brown-01", box: [0.06, 0.4, 0.88, 0.6], focus: "50% 100%" },
  "edit/footwear-black-loafers": { from: "classic/suits/classic-grey-two-piece-suit-01", box: [0.14, 0.62, 0.5, 0.38], focus: "50% 100%" },
  "edit/footwear-black-loafers-seated": { from: "classic/suits/classic-grey-two-piece-suit-03", box: [0.02, 0.6, 0.58, 0.4], focus: "50% 100%" },
  "edit/footwear-suede-loafers": { from: "classic/shirts/twin-pocket-safari-shirt-pale-pink-02", box: [0.2, 0.56, 0.6, 0.44], focus: "50% 100%" },
  "edit/footwear-heritage-loafers": { from: "heritage/jodhpuri-jackets/ivory-embossed-open-front-jodhpuri-jacket-01", box: [0.18, 0.64, 0.56, 0.36], focus: "50% 100%" },
  "edit/footwear-brown-laceups": { from: "classic/suits/light-grey-double-breasted-peak-lapel-suit-01", box: [0.16, 0.62, 0.52, 0.38], focus: "50% 100%" },
  "edit/footwear-brown-laceups-seated": { from: "classic/suits/light-grey-double-breasted-peak-lapel-suit-02", box: [0.0, 0.6, 0.56, 0.4], focus: "50% 100%" },
  "edit/footwear-black-oxfords": { from: "classic/shirts/the-classic-crisp-dress-shirt-white-01", box: [0.12, 0.6, 0.6, 0.4], focus: "50% 100%" },
  "edit/footwear-monk-straps": { from: "classic/trousers/tailored-side-tab-trousers-stack-01", box: [0.08, 0.62, 0.72, 0.38], focus: "50% 100%" },
  "edit/footwear-monk-straps-2": { from: "classic/trousers/tailored-side-tab-trousers-stack-02", box: [0.3, 0.62, 0.66, 0.38], focus: "50% 100%" },
  "edit/footwear-tan-monks": { from: "heritage/achkans/powder-blue-silk-embroidered-collar-achkan-01", box: [0.12, 0.64, 0.6, 0.36], focus: "50% 100%" },
  "edit/footwear-suede-derbies": { from: "classic/suits/mid-grey-flannel-two-piece-suit-01", box: [0.12, 0.54, 0.62, 0.46], focus: "50% 100%" },
  "edit/footwear-suede-derbies-2": { from: "classic/suits/mid-grey-flannel-two-piece-suit-04", box: [0.3, 0.6, 0.6, 0.4], focus: "50% 100%" },
  "edit/footwear-brogues": { from: "classic/sports-jackets/charcoal-textured-wool-sports-jacket-01", box: [0.0, 0.58, 0.46, 0.42], focus: "50% 100%" },
  "edit/footwear-black-heritage": { from: "heritage/achkans/black-velvet-embroidered-collar-achkan-03", box: [0.46, 0.58, 0.54, 0.42], focus: "50% 100%" },

  // ── Ties ──────────────────────────────────────────────────
  "edit/tie-paisley": { from: "classic/blazers/classic-navy-worsted-blazer-01", box: [0.24, 0.1, 0.52, 0.52], focus: "50% 40%" },
  "edit/tie-navy-dot": { from: "classic/suits/classic-charcoal-double-breasted-worsted-suit-01", box: [0.14, 0.0, 0.6, 0.48], focus: "50% 40%" },
  "edit/tie-gold-print": { from: "classic/suits/classic-charcoal-single-breasted-worsted-suit-01", box: [0.18, 0.0, 0.6, 0.48], focus: "50% 40%" },
  "edit/tie-rust-print": { from: "classic/suits/deep-navy-three-piece-peak-lapel-suit-03", box: [0.18, 0.06, 0.6, 0.42], focus: "50% 40%" },
  "edit/tie-green": { from: "classic/suits/classic-grey-two-piece-suit-02", box: [0.26, 0.06, 0.48, 0.34], focus: "50% 40%" },
  "edit/tie-grey-tweed": { from: "classic/sports-jackets/light-grey-micro-check-sports-jacket-01", box: [0.26, 0.06, 0.52, 0.5], focus: "50% 40%" },

  // ── Pocket squares ────────────────────────────────────────
  "edit/pocket-square-white": { from: "classic/blazers/classic-navy-worsted-blazer-01", box: [0.34, 0.2, 0.5, 0.5], focus: "50% 45%" },
  "edit/pocket-square-purple": { from: "classic/blazers/tobacco-brown-hopsack-blazer-01", box: [0.3, 0.2, 0.52, 0.52], focus: "50% 45%" },
  "edit/pocket-square-grey-suit": { from: "classic/suits/light-grey-double-breasted-peak-lapel-suit-03", box: [0.2, 0.2, 0.62, 0.42], focus: "50% 45%" },
  "edit/pocket-square-velvet": { from: "heritage/achkans/black-velvet-embroidered-collar-achkan-02", box: [0.3, 0.22, 0.62, 0.42], focus: "50% 45%" },
  "edit/pocket-square-bandhgala": { from: "heritage/bandhgala-suits/midnight-navy-bandhgala-suit-04", box: [0.2, 0.42, 0.72, 0.48], focus: "50% 45%" },
  "edit/pocket-square-brocade": { from: "heritage/jodhpuri-jackets/champagne-gold-brocade-jodhpuri-jacket-03", box: [0.24, 0.36, 0.66, 0.5], focus: "50% 45%" },
  "edit/pocket-square-nehru": { from: "heritage/jodhpuri-jackets/taupe-silk-wool-nehru-jacket-03", box: [0.2, 0.18, 0.7, 0.56], focus: "50% 45%" },

  // ── Cufflinks (shirt cuffs) ───────────────────────────────
  "edit/cuff-tuxedo": { from: "classic/suits/midnight-navy-double-breasted-tuxedo-02", box: [0.14, 0.44, 0.72, 0.5], focus: "50% 55%" },
  "edit/cuff-velvet": { from: "classic/suits/tobacco-brown-velvet-dinner-suit-03", box: [0.14, 0.5, 0.72, 0.48], focus: "50% 55%" },
  "edit/cuff-charcoal": { from: "classic/suits/classic-charcoal-single-breasted-worsted-suit-01", box: [0.08, 0.2, 0.7, 0.44], focus: "50% 55%" },
  "edit/cuff-safari": { from: "classic/shirts/twin-pocket-safari-shirt-pale-pink-05", box: [0.0, 0.3, 0.6, 0.6], focus: "50% 55%" },
  "edit/cuff-navy-suit": { from: "classic/suits/deep-navy-three-piece-peak-lapel-suit-03", box: [0.1, 0.52, 0.72, 0.46], focus: "50% 55%" },
  "edit/cuff-barrel": { from: "classic/shirts/the-button-down-collar-shirt-burgundy-white-dress-stripe-02", box: [0.1, 0.42, 0.62, 0.5], focus: "50% 55%" },

  // ── Belts (waist details) ─────────────────────────────────
  "edit/belt-black-trouser": { from: "classic/shirts/the-classic-crisp-dress-shirt-white-03", box: [0.1, 0.5, 0.8, 0.5], focus: "50% 30%" },
  "edit/belt-pleat": { from: "classic/trousers/tailored-single-pleat-trouser-dark-brown-01", box: [0.1, 0.0, 0.8, 0.46], focus: "50% 30%" },
  "edit/belt-white-trouser": { from: "classic/shirts/twin-pocket-safari-shirt-pale-pink-04", box: [0.1, 0.42, 0.8, 0.56], focus: "50% 30%" },
  "edit/belt-drawstring": { from: "classic/trousers/tailored-wool-drawstring-trouser-mid-grey-03", box: [0.06, 0.02, 0.86, 0.5], focus: "50% 30%" },

  // ── Kurtas (worn beneath jackets) ─────────────────────────
  "edit/kurta-under-brocade": { from: "heritage/jodhpuri-jackets/blush-peach-floral-brocade-nehru-jacket-02", box: [0.14, 0.3, 0.72, 0.56] },
  "edit/kurta-under-sage": { from: "heritage/jodhpuri-jackets/sage-green-brocade-nehru-jacket-01", box: [0.1, 0.4, 0.8, 0.6] },
  "edit/kurta-under-taupe": { from: "heritage/jodhpuri-jackets/taupe-silk-wool-nehru-jacket-02", box: [0.14, 0.34, 0.74, 0.62] },
  "edit/kurta-under-ivory": { from: "heritage/jodhpuri-jackets/ivory-embossed-open-front-jodhpuri-jacket-02", box: [0.1, 0.34, 0.8, 0.62] },

  // ── Heritage trousers ─────────────────────────────────────
  "edit/trouser-ivory-achkan": { from: "heritage/achkans/mocha-brown-silk-embroidered-collar-achkan-01", box: [0.1, 0.54, 0.72, 0.46], focus: "50% 60%" },
  "edit/trouser-champagne": { from: "heritage/jodhpuri-jackets/champagne-gold-brocade-jodhpuri-jacket-01", box: [0.12, 0.5, 0.74, 0.5], focus: "50% 60%" },
  "edit/trouser-apricot": { from: "heritage/sherwanis/apricot-raw-silk-zardosi-sherwani-01", box: [0.14, 0.56, 0.72, 0.44], focus: "50% 60%" },
  "edit/trouser-emerald": { from: "heritage/sherwanis/emerald-dupioni-silk-sherwani-with-zardosi-01", box: [0.14, 0.56, 0.72, 0.44], focus: "50% 60%" },
  "edit/trouser-blue-achkan": { from: "heritage/achkans/powder-blue-silk-embroidered-collar-achkan-02", box: [0.1, 0.52, 0.74, 0.48], focus: "50% 60%" },
};

/**
 * Per-clip overrides, keyed by media id.
 *   trim:  [start, end] in seconds — removes baked-in title cards so the clip loops cleanly.
 *   audio: keep the soundtrack (only for films played with controls). Default: stripped.
 *   poster: timestamp (seconds, within the trimmed clip) used for the poster frame.
 *   long:  encode at higher quality for full-film playback.
 *   crop:  [width, height, x, y] in source pixels, applied before scaling (removes baked-in letterbox bars).
 */
export const VIDEO_OVERRIDES = {
  "classic/suits/vitale-barberis-canonico-bespoke-suit-tailoring-film": { audio: true, long: true, poster: 67 },
  // This film was delivered letterboxed: 120px black bars top and bottom are cropped away.
  "heritage/sherwanis/sartorial-heritage-zardosi-sherwanis-collection-showcase": { trim: [3.85, 20.3], poster: 2, crop: [1920, 840, 0, 120] },
  "heritage/sherwanis/champagne-gold-zardosi-sherwani-with-velvet-stole-showcase": { trim: [0.2, 12.1], poster: 2.8 },
  "heritage/sherwanis/crimson-red-embellished-sherwani-showcase": { trim: [0.2, 13.1], poster: 4.7 },
  "heritage/sherwanis/midnight-navy-gold-zardosi-floral-sherwani-showcase": { trim: [0.2, 15.5], poster: 10.8 },
  "heritage/jodhpuri-jackets/midnight-navy-geometric-weave-jodhpuri-jacket-showcase": { trim: [0.6, 7.6], poster: 3.8 },
};

/**
 * Still frames lifted from clips, for pieces the client has filmed but not yet
 * photographed. `at` is seconds into the SOURCE clip; `box` as for CROPS.
 */
const CHAMPAGNE = "heritage/sherwanis/champagne-gold-zardosi-sherwani-with-velvet-stole-showcase";
const CRIMSON = "heritage/sherwanis/crimson-red-embellished-sherwani-showcase";
const NAVY_ZARDOSI = "heritage/sherwanis/midnight-navy-gold-zardosi-floral-sherwani-showcase";
const NAVY_JODHPURI = "heritage/jodhpuri-jackets/midnight-navy-geometric-weave-jodhpuri-jacket-showcase";
const OCHRE_1 = "heritage/achkans/ochre-gold-brocade-achkan-detail-01";
const OCHRE_2 = "heritage/achkans/ochre-gold-brocade-achkan-detail-02";
const ATELIER_FILM = "classic/suits/vitale-barberis-canonico-bespoke-suit-tailoring-film";
const PORTRAIT = 0.45; // 4:5 window inside a 16:9 frame

export const STILLS = {
  "still/champagne-gold-zardosi-sherwani-01": { from: CHAMPAGNE, at: 3.0, box: [0.28, 0, PORTRAIT, 1] },
  "still/champagne-gold-zardosi-sherwani-02": { from: CHAMPAGNE, at: 9.4, box: [0.3, 0, PORTRAIT, 1] },
  "still/champagne-gold-zardosi-sherwani-03": { from: CHAMPAGNE, at: 6.8 },
  "still/champagne-gold-zardosi-sherwani-04": { from: CHAMPAGNE, at: 10.8 },
  "still/crimson-red-embellished-sherwani-01": { from: CRIMSON, at: 4.9, box: [0.4, 0, PORTRAIT, 1] },
  "still/crimson-red-embellished-sherwani-02": { from: CRIMSON, at: 7.9 },
  "still/crimson-red-embellished-sherwani-03": { from: CRIMSON, at: 9.6 },
  "still/crimson-red-embellished-sherwani-04": { from: CRIMSON, at: 12.3, box: [0.5, 0, PORTRAIT, 1] },
  "still/midnight-navy-gold-zardosi-sherwani-01": { from: NAVY_ZARDOSI, at: 11.0, box: [0.34, 0, PORTRAIT, 1] },
  "still/midnight-navy-gold-zardosi-sherwani-02": { from: NAVY_ZARDOSI, at: 2.2 },
  "still/midnight-navy-gold-zardosi-sherwani-03": { from: NAVY_ZARDOSI, at: 0.5 },
  "still/midnight-navy-gold-zardosi-sherwani-04": { from: NAVY_ZARDOSI, at: 12.8, box: [0.3, 0, PORTRAIT, 1] },
  "still/midnight-navy-geometric-weave-jodhpuri-jacket-01": { from: NAVY_JODHPURI, at: 4.4, box: [0.3, 0, PORTRAIT, 1] },
  "still/midnight-navy-geometric-weave-jodhpuri-jacket-02": { from: NAVY_JODHPURI, at: 2.4 },
  "still/midnight-navy-geometric-weave-jodhpuri-jacket-03": { from: NAVY_JODHPURI, at: 6.3 },
  "still/ochre-gold-brocade-achkan-01": { from: OCHRE_2, at: 0.5 },
  "still/ochre-gold-brocade-achkan-02": { from: OCHRE_1, at: 7.9 },
  "still/ochre-gold-brocade-achkan-03": { from: OCHRE_2, at: 4.2 },
  "still/ochre-gold-brocade-achkan-04": { from: OCHRE_1, at: 6.0 },
  "still/ochre-gold-brocade-achkan-05": { from: OCHRE_2, at: 5.5 },

  // Frames from the atelier film, used to illustrate the bespoke process.
  "still/atelier-pattern": { from: ATELIER_FILM, at: 15.6 },
  "still/atelier-cloth": { from: ATELIER_FILM, at: 37.2 },
  "still/atelier-stitch": { from: ATELIER_FILM, at: 67.2 },
  "still/atelier-canvas": { from: ATELIER_FILM, at: 71.6 },
  "still/atelier-label": { from: ATELIER_FILM, at: 91.2 },
  "still/atelier-basting": { from: ATELIER_FILM, at: 103.0 },
  "still/atelier-lapel": { from: ATELIER_FILM, at: 108.6 },
  "still/atelier-buttonhole": { from: ATELIER_FILM, at: 133.4 },
};

/**
 * Multi-segment edits. Each produces one silent, looping MP4 per `outputs` entry.
 * `segments` are [start, end] in seconds of the source clip; `cropX` (0–1) picks the
 * horizontal centre of a portrait crop for that segment when the output is portrait.
 */
const HERO_SOURCE = "classic/suits/vitale-barberis-canonico-bespoke-suit-tailoring-film";
const HERO_SEGMENTS = [
  { t: [65.65, 69.9], cropX: 0.4 },
  { t: [70.5, 73.45], cropX: 0.5 },
  { t: [101.25, 105.4], cropX: 0.42 },
  { t: [107.4, 110.65], cropX: 0.52 },
  { t: [89.3, 92.5], cropX: 0.62 },
  { t: [19.8, 24.3], cropX: 0.56 },
  { t: [131.6, 135.9], cropX: 0.42 },
  { t: [139.6, 144.6], cropX: 0.45 },
];

export const EDITS = {
  "film/hero-desktop": { from: HERO_SOURCE, segments: HERO_SEGMENTS, width: 1600, height: 900, crf: 28 },
  "film/hero-tablet": { from: HERO_SOURCE, segments: HERO_SEGMENTS, width: 1280, height: 720, crf: 27 },
  "film/hero-mobile": { from: HERO_SOURCE, segments: HERO_SEGMENTS, width: 720, height: 1280, crf: 27, portrait: true },
};
