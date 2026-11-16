"use client";

import type { CSSProperties } from "react";
import { CITY_SPAN, LOGO, WORD_SPAN } from "@/components/brand/logo";
import "./preloader.css";

/** Between the tiger's eyes: its outline draws outward from here, so the gaze arrives first
 * (the silhouette of the head, which spans the whole face, comes last). */
const GAZE = { x: 659, y: 48 };
/** How long the outline takes to spread from the eyes to the edge of the head. */
const SPREAD = 0.5;
/** Specks smaller than this (logo px) are not drawn as lines, only inked: drawn, they flicker like dust. */
const SPECK = 10;

const vars = (v: Record<string, string | number>) => v as CSSProperties;

/**
 * The opening of the site: the Sartorial Dhaka logo assembling itself on ivory,
 * then dissolving into the page. SARTORIAL rises letter by letter from its baseline,
 * the tiger is drawn above it and inked in, DHAKA settles beneath, and the ivory
 * fades away.
 *
 * Every shape is the logo's own (see components/brand/logo.ts), placed at its
 * original position, so the finished frame is the logo exactly. It is rendered on
 * the server and driven by CSS (preloader.css), so it is on screen from the first
 * paint and runs without waiting for JavaScript. (It is a client component only so
 * its path data travels once, in a cached script, not in every page's payload.) The script in the document head
 * (lib/intro-script.ts) plays it once per visit, lets a click, key or scroll skip it, and
 * tells the page when the curtain lifts.
 */
export function Preloader() {
  const { width, height, word, city, tiger } = LOGO;

  const centre = (box: number[]) => ({ x: box[0] + box[2] / 2, y: box[1] + box[3] / 2 });
  const distance = tiger.contours.map((c) => {
    const p = centre(c.box);
    return Math.hypot(p.x - GAZE.x, p.y - GAZE.y);
  });
  const far = Math.max(...distance);
  const ink = tiger.contours.map((c) => c.d).join("");

  return (
    <div className="pl" aria-hidden="true">
      <svg className="pl-logo" viewBox={`0 0 ${width} ${height}`} focusable="false">
        <defs>
          {/* The letters rise out of these, so each appears from its own baseline */}
          <clipPath id="pl-word-slot">
            <rect x={-40} y={WORD_SPAN.top - 80} width={width + 80} height={WORD_SPAN.height + 81} />
          </clipPath>
          <clipPath id="pl-city-slot">
            <rect x={-40} y={CITY_SPAN.top - 24} width={width + 80} height={CITY_SPAN.height + 25} />
          </clipPath>
          {/* The tiger's lines are drawn inside its own shapes, so they never add weight to the finished mark */}
          <clipPath id="pl-tiger-shape">
            <use href="#pl-ink" clipRule="evenodd" />
          </clipPath>
        </defs>

        <g clipPath="url(#pl-word-slot)">
          {word.map((glyph, i) => (
            <path key={`${glyph.char}${i}`} className="pl-glyph" d={glyph.d} style={vars({ "--pl-i": i })} />
          ))}
        </g>

        <g className="pl-tiger">
          <path id="pl-ink" className="pl-tiger-ink" d={ink} fillRule="evenodd" />
          <g className="pl-tiger-lines" clipPath="url(#pl-tiger-shape)">
            {tiger.contours.map((c, i) =>
              Math.max(c.box[2], c.box[3]) < SPECK ? null : (
                <path key={i} d={c.d} pathLength={1} style={vars({ "--pl-d": `${((c.box[2] > 100 ? 1 : distance[i] / far) * SPREAD).toFixed(3)}s` })} />
              ),
            )}
          </g>
        </g>

        <g clipPath="url(#pl-city-slot)">
          {city.map((glyph, i) => (
            <path key={`${glyph.char}${i}`} className="pl-glyph pl-glyph-city" d={glyph.d} style={vars({ "--pl-i": i })} />
          ))}
        </g>
      </svg>
    </div>
  );
}
