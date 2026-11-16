"use client";

/* Plain <img> on purpose: the caller hands over src / srcSet / sizes and
   the crop is the block's own (object-fit: cover). */
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import {
  type CSSProperties,
  type FocusEvent,
  type PointerEvent,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import "./ImageAccordion.css";

/* ══ Image accordion ═══════════════════════════════════════
   Adapted from Bencho (blocks/image-accordion, MIT — see
   ../LICENSE.md). A row of pictures; point at one (or focus
   it) and it opens while the others give up exactly what it
   takes.

   ── THE ROW IS A FIXED WIDTH, AND THAT IS THE COMPONENT ───
   Nothing here grows. The strip is as wide as its container
   whatever is happening inside it, so opening a picture is a
   NEGOTIATION rather than an expansion: every pixel the one
   you are pointing at gains, the others have paid for between
   them. Flex does the arithmetic of who pays — one grow number
   per picture, each on its own spring.

   ── AND THE SWELL CARRIES ─────────────────────────────────
   The neighbours of the open picture open a little too
   (`reach`), so it reads as a force arriving somewhere rather
   than a switch being thrown.

   ── WHY POINTING IS STABLE ────────────────────────────────
   The picture you point at is the one that GROWS. Its edges
   move away from your pointer, never across it, so it cannot
   shrink out from under you and hand the hover to a
   neighbour.

   What changed from the Bencho demo: the pictures, captions
   and links are props; the strip takes its size from its
   container instead of a fixed 340 × 300; a caption sits over
   a scrim at the foot of every panel; and under 768px the
   panels stack (see ImageAccordion.css). */

export type Shot = { src: string; alt: string; srcSet?: string; sizes?: string };

export type ImageAccordionItem = Shot & {
  /** large uppercase caption */
  label: string;
  /** small tracked line above the label */
  sublabel?: string;
  /** when set, the whole panel is a Next <Link> */
  href?: string;
};

export type ImageAccordionProps = {
  /** 2–6 panels; anything past the sixth is ignored */
  items: ImageAccordionItem[];
  /** how much the open picture takes, 0..100 */
  open?: number;
  /** how far the swell carries into its neighbours, 0..100 */
  reach?: number;
  /** the spring, 0..100 */
  bounce?: number;
  /** the air between pictures, px (0..20) */
  gap?: number;
  /** the corner, px. Never larger than the gap — a rounded picture against
      a rounded picture with no air between them shows a notch at each join */
  corner?: number;
  className?: string;
  /** the panel under the pointer / holding focus, or null when there is none */
  onActiveChange?: (index: number | null) => void;
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/* ── one spring, for everything that settles (Bencho lab/spring) ──
   Frames, not milliseconds: `dt` is in sixtieths of a second and the
   damping is RAISED to it rather than multiplied by it, so a dropped
   frame decays the same energy as the two frames it replaced. The loop
   parks itself the moment the value has settled.

   0..100 into stiffness and decay, chosen by damping ratio:
     0   → zeta ~0.85, heavy, arrives without a ring
     50  → zeta ~0.41
     100 → zeta ~0.20, lively, two visible rebounds */
const springOf = (tune: number) => ({
  k: 0.08 + (tune / 100) * 0.16,
  d: 0.62 + (tune / 100) * 0.2,
});

/* Units matter. The snap threshold is absolute, so a caller works in
   pixels or in 0..100 — a spring driven over 0..1 would be "settled"
   before it had visibly moved. */
function useSpring(target: number, tune = 50, instant = false) {
  const [at, setAt] = useState(target);
  const cur = useRef(target);
  const vel = useRef(0);
  /* what `at` was last told, so a settled spring costs no frame */
  const shown = useRef(target);

  useEffect(() => {
    if (instant) {
      cur.current = target;
      vel.current = 0;
      return;
    }
    if (shown.current === target && cur.current === target && vel.current === 0) return;
    const { k, d } = springOf(tune);
    let prev = 0;
    let raf = 0;
    function tick(t: number) {
      const dt = prev ? clamp((t - prev) / 16.67, 0, 2.5) : 1;
      prev = t;
      vel.current += (target - cur.current) * k * dt;
      vel.current *= Math.pow(d, dt);
      cur.current += vel.current * dt;
      if (Math.abs(target - cur.current) < 0.02 && Math.abs(vel.current) < 0.02) {
        cur.current = target;
        vel.current = 0;
        shown.current = target;
        setAt(target);
        raf = 0;
        return;
      }
      shown.current = cur.current;
      setAt(cur.current);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, tune, instant]);

  return instant ? target : at;
}

/* prefers-reduced-motion, read the hydration-safe way: the server and
   the first client render both say "no", then the real answer arrives */
const REDUCE = "(prefers-reduced-motion: reduce)";
const watchStill = (cb: () => void) => {
  const mq = window.matchMedia(REDUCE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const readStill = () => window.matchMedia(REDUCE).matches;
const noStill = () => false;
const useStill = () => useSyncExternalStore(watchStill, readStill, noStill);

/* the most pictures the strip holds: six springs are built whatever
   the count says, because a hook cannot be drawn conditionally */
const MAX = 6;

/* ── the corner FOLLOWS THE GAP ────────────────────────────
   The radius can never be larger than the air it has to fit
   into, and the strip takes the same number as every picture
   in it, so they cannot disagree. */
const RMAX = 12;

/* ── how much the open one takes ───────────────────────────
   As a share of what an unopened picture has. 50 is 1.8, so
   the open picture is nearly three times a resting one. */
const lift = (open: number) => 0.4 + (clamp(open, 0, 100) / 100) * 2.8;

/* ── and how far the swell carries ─────────────────────────
   A gaussian on the distance in pictures. The default of 35
   lands the first neighbour at a tenth. */
const fall = (d: number, reach: number) => {
  const s = 0.35 + (clamp(reach, 0, 100) / 100) * 0.9;
  return Math.exp(-((d / s) ** 2));
};

export function ImageAccordion({
  items,
  open = 50,
  reach = 35,
  bounce = 10,
  gap = 4,
  corner = 0,
  className,
  onActiveChange,
}: ImageAccordionProps) {
  const pics = items.slice(0, MAX);
  const n = pics.length;

  /* which picture the pointer (or focus) is on, by index. Null
     rather than -1 so "none" cannot be confused with the first. */
  const [held, setHeld] = useState<number | null>(null);
  const at = held !== null && held < n ? held : null;
  const still = useStill();

  /* ── one spring each, and NO stagger ───────────────────────
     These are not six things responding in turn, they are one
     width being divided — if the picture at the end gave up its
     share a beat after the one next to it, the strip would
     visibly fail to add up for that beat. Driven over 0..100
     rather than over the grow number itself (see useSpring). */
  const want = (i: number) =>
    at === null || i >= n ? 0 : fall(Math.abs(i - at), reach) * 100;
  const a0 = useSpring(want(0), bounce, still);
  const a1 = useSpring(want(1), bounce, still);
  const a2 = useSpring(want(2), bounce, still);
  const a3 = useSpring(want(3), bounce, still);
  const a4 = useSpring(want(4), bounce, still);
  const a5 = useSpring(want(5), bounce, still);
  const swell = [a0, a1, a2, a3, a4, a5];

  const g = clamp(gap, 0, 20);
  const k = lift(open);
  const r = Math.min(RMAX, g, Math.max(0, corner));

  const point = (i: number | null) => {
    if (i === held) return;
    setHeld(i);
    onActiveChange?.(i);
  };

  if (n === 0) return null;

  return (
    <div
      className={className ? `acc ${className}` : "acc"}
      style={{ "--acc-gap": `${g}px`, "--acc-r": `${r}px` } as CSSProperties}
      /* ── `out` with a containment test, not `leave` ───────
         Which is what leave IS; written out so a pointer that
         walks off carrying `relatedTarget: null` (it left the
         window) still closes the strip. */
      onPointerOut={(e: PointerEvent<HTMLDivElement>) => {
        const to = e.relatedTarget as Node | null;
        if (!to || !e.currentTarget.contains(to)) point(null);
      }}
      onPointerCancel={() => point(null)}
      /* focus leaving the strip closes it, the same way */
      onBlur={(e: FocusEvent<HTMLDivElement>) => {
        const to = e.relatedTarget as Node | null;
        if (!to || !e.currentTarget.contains(to)) point(null);
      }}
    >
      {pics.map((pic, i) => {
        const u = swell[i] / 100;
        const cell = {
          className: "acc-cell",
          "data-open": at === i || undefined,
          /* the whole layout, in one number per picture.
             `flex-basis: 0` (in the sheet) so the grow numbers
             are the entire story and the pictures' own widths
             have no vote. */
          style: { "--acc-grow": (1 + k * u).toFixed(4) } as CSSProperties,
          onPointerEnter: () => point(i),
          /* a keyboard arriving on a panel opens it as a pointer would */
          onFocus: () => point(i),
        };
        const inside = (
          <>
            {/* `cover` re-frames rather than stretching: the scale
                is set by the height, and the height never changes,
                so as the cell widens the crop simply admits more of
                the photograph on both sides. */}
            <img
              className="acc-img"
              src={pic.src}
              srcSet={pic.srcSet}
              sizes={pic.sizes}
              alt={pic.alt}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
            <span className="acc-scrim" aria-hidden="true" />
            <span className="acc-cap">
              {pic.sublabel ? <span className="acc-sub">{pic.sublabel}</span> : null}
              <span className="acc-label">{pic.label}</span>
            </span>
          </>
        );
        return pic.href ? (
          <Link key={i} href={pic.href} {...cell}>
            {inside}
          </Link>
        ) : (
          <div key={i} {...cell}>
            {inside}
          </div>
        );
      })}
    </div>
  );
}
