"use client";

import { type CSSProperties, type MouseEvent, useState } from "react";
import { Heart } from "lucide-react";
import "./Like.css";

/* ══ Like ═════════════════════════════════════════════════
   Adapted from Bencho (blocks/like, MIT — see ../LICENSE.md).
   A heart. Press it and the heart vanishes, a disc blooms
   where it was and hollows out into a ring, seven pairs of
   dots burst off the ring, and the heart springs back in,
   filled, past its size and home again. Press again and it
   empties.

   What changed from the Bencho demo: it is CONTROLLED
   (`active` / `onChange`) and carries no count — the rolling
   number is gone, the heart is the whole control; it comes
   bare (the heart alone in a 40 × 40 hit area, for laying over
   a photograph) or as the demo's chip; the heart's size is a
   prop and the burst scales with it; and the press does not
   travel — it sits inside link cards, so it swallows its own
   click. */

const RED = "#e5484d";
/* the confetti: a pair of dots per spoke, never the same colour
   twice in a pair */
const CONFETTI = ["#f48ea7", "#cc8ef5", "#8ce8c3", "#91d2fa", "#f5a524", "#e5484d", "#9fc7fa"];

/* the chip's height, and the bare button's hit area */
const CHIP = 44;
const BARE = 40;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/* ── the effects ───────────────────────────────────────────
   Two ways for a like to land, one knob. Every one plays once
   per press from a layer keyed by the press, and every number
   in them is fixed rather than random: several copies share a
   page, and must all do the same thing. */
const EFFECTS = ["Bloom", "Firework"] as const;
export type LikeEffect = (typeof EFFECTS)[number];

export type LikeProps = {
  /** whether it is liked — the parent owns this */
  active: boolean;
  onChange: (next: boolean) => void;
  /** the accessible name, e.g. "Save to wishlist" */
  label: string;
  /** the heart, px */
  size?: number;
  /** what the liked heart is filled with: red, or the button's own ink */
  color?: "Red" | "Ink";
  /** how the like lands */
  effect?: LikeEffect;
  /** how far the particles fly, 0..100 */
  burst?: number;
  /** "bare": the heart alone, transparent, 40 × 40. "chip": the heart on a slab */
  variant?: "bare" | "chip";
  /** the chip's corner, px (0..22). The bare heart has no surface to round */
  corner?: number;
  className?: string;
};

/* a spread of fixed "random" numbers, one per particle */
const jit = (k: number, seed: number) => {
  const x = Math.sin(k * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const vars = (o: Record<string, string | number>) => o as CSSProperties;

function Burst({ fx, fly, ink, k }: { fx: LikeEffect; fly: number; ink: boolean; k: number }) {
  const c = (i: number) => (ink ? "var(--lk-on)" : CONFETTI[i % CONFETTI.length]);

  if (fx === "Firework") {
    /* thrown up and out, then they fall: the x is steady, the y
       is its own element on a rise-then-drop curve */
    return (
      <>
        {Array.from({ length: 12 }, (_, i) => {
          const a = -Math.PI / 2 + (i / 11 - 0.5) * Math.PI * 1.25;
          const v = (22 + fly * 22 + jit(i, 7) * 10) * k;
          return (
            <span
              key={i}
              className="lk-fw"
              style={vars({
                "--x": `${(Math.cos(a) * v).toFixed(2)}px`,
                "--d": `${(jit(i, 8) * 60).toFixed(0)}ms`,
              })}
            >
              <i style={vars({ "--y": `${(Math.sin(a) * v).toFixed(2)}px`, background: c(i) })} />
            </span>
          );
        })}
      </>
    );
  }
  /* Bloom: a disc that hollows into a ring, and pairs of confetti */
  return (
    <>
      <span className="lk-bloom" />
      {Array.from({ length: 7 }, (_, i) => (
        <span key={i} className="lk-spoke" style={vars({ "--a": `${(i * (360 / 7) - 90).toFixed(2)}deg` })}>
          <i style={vars({ "--c": c(i) })} />
          <i style={vars({ "--c": c(i + 3) })} />
        </span>
      ))}
    </>
  );
}

export function Like({
  active,
  onChange,
  label,
  size = 18,
  color = "Ink",
  effect = "Bloom",
  burst = 50,
  variant = "bare",
  corner = 0,
  className,
}: LikeProps) {
  /* ── a like only LANDS when it was pressed here ───────────
     `beat` counts the presses and `landed` says the like on
     show came from one. A heart that arrives already liked —
     a wishlist read from storage, a like made elsewhere — is
     simply drawn filled: the bloom is an answer to a press,
     and nothing was pressed. */
  const [beat, setBeat] = useState(0);
  const [landed, setLanded] = useState(false);
  const [was, setWas] = useState(active);
  if (was !== active) {
    setWas(active);
    if (!active) setLanded(false);
  }

  const fly = clamp(burst, 0, 100) / 100;
  const s = clamp(size, 10, 64);
  /* everything in the burst was drawn against a 20px heart */
  const k = s / 20;
  const ink = color === "Ink";
  const fx: LikeEffect = EFFECTS.includes(effect) ? effect : "Bloom";
  const chip = variant === "chip";
  const pop = active && landed;

  const press = (e: MouseEvent<HTMLButtonElement>) => {
    /* it lives inside link cards: the press is its own, and must
       neither follow the link nor reach the card's handlers */
    e.preventDefault();
    e.stopPropagation();
    const next = !active;
    if (next) {
      setBeat((b) => b + 1);
      setLanded(true);
    }
    onChange(next);
  };

  const cls = ["lk", className].filter(Boolean).join(" ");

  return (
    <button
      type="button"
      className={cls}
      data-variant={chip ? "chip" : "bare"}
      data-liked={active || undefined}
      data-color={color}
      data-fx={fx}
      aria-pressed={active}
      aria-label={label}
      style={vars({
        "--lk-box": `${chip ? CHIP : BARE}px`,
        "--lk-size": `${s}px`,
        "--lk-k": k.toFixed(4),
        "--r": `${clamp(corner, 0, CHIP / 2)}px`,
        "--lk-on": ink ? "currentColor" : RED,
      })}
      onClick={press}
    >
      <span className="lk-heart">
        {/* keyed by the press, so every like plays once */}
        <span
          key={pop ? `on${beat}` : "off"}
          className="lk-glyph"
          data-on={active || undefined}
          data-pop={pop || undefined}
        >
          <Heart
            size={s}
            strokeWidth={s >= 22 ? 1.75 : 2}
            fill={active ? "currentColor" : "none"}
            aria-hidden="true"
            focusable="false"
          />
        </span>
        {pop && fly > 0 && (
          <span key={beat} className="lk-burst" style={vars({ "--fly": fly })} aria-hidden="true">
            <Burst fx={fx} fly={fly} ink={ink} k={k} />
          </span>
        )}
      </span>
    </button>
  );
}
