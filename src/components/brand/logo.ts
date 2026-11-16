import data from "./logo.generated.json";

/**
 * The Sartorial Dhaka logo as vector paths, traced from the house's own logo file
 * (assets/brand/sartorial-dhaka-logo.jpg) by scripts/trace-logo.py. Nothing here is
 * set in a font or redrawn: each letter and the tiger are the logo's own shapes, at
 * their original positions, in the logo's pixel coordinates (top-left is 0, 0).
 */

/** [x, y, width, height] */
export type Box = [number, number, number, number];
export type Glyph = { char: string; d: string; box: Box };
export type Contour = { d: string; box: Box };

export const LOGO = {
  width: data.width,
  height: data.height,
  /** SARTORIAL, one path per letter */
  word: data.word as Glyph[],
  /** DHAKA, one path per letter */
  city: data.city as Glyph[],
  tiger: {
    box: data.tiger.box as Box,
    /** One closed contour per entry, outlines and holes alike: fill them together with evenodd. */
    contours: data.tiger.contours as Contour[],
  },
};

const span = (glyphs: Glyph[]) => {
  const top = Math.min(...glyphs.map((g) => g.box[1]));
  const bottom = Math.max(...glyphs.map((g) => g.box[1] + g.box[3]));
  return { top, bottom, height: bottom - top };
};

/** Vertical extent of SARTORIAL and of DHAKA. */
export const WORD_SPAN = span(LOGO.word);
export const CITY_SPAN = span(LOGO.city);
