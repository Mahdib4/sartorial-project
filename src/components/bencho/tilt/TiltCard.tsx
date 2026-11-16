"use client";

/* Plain <img> on purpose: the caller hands over src / srcSet / sizes and
   the crop is the block's own (object-fit: cover). */
/* eslint-disable @next/next/no-img-element */

import {
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import "./TiltCard.css";

/* ══ Tilt ═════════════════════════════════════════════════
   Adapted from Bencho (blocks/tilt, MIT — see ../LICENSE.md).
   A picture card that gives under the pointer.

   IT SINKS, IT DOES NOT LIFT. Every tilt card on the internet
   rotates TOWARD the cursor: the corner you are nearest rises
   to meet you and the card reads as a slab of glass catching
   the light. This one does the opposite — the point you are
   over goes AWAY, and the far side comes up. The difference
   is one minus sign and it is the whole component: a surface
   that rises to your finger is being displayed to you, and a
   surface that gives under it is being touched.

   Cursor at the top → the top edge has to go back, which is a
   POSITIVE rotateX; cursor at the right → the right edge goes
   back, which is a positive rotateY. Hence `rx = -ny` and
   `ry = +nx`, the negation of the usual pair.

   THE ROTATION ALONE IS NOT ENOUGH. What makes it a press is
   that the darkest point tracks the pointer: a depression
   catches shadow at its deepest, and the rim opposite catches
   light. Those two gradients are doing at least as much of
   the work as the transform is.

   ONE PAIR OF NUMBERS IS THE STATE. Two springs hold where
   the pointer is, normalised to -1..1, and the rotation, both
   gradients and the shadow are all read off them. Nothing
   here has a transition of its own.

   What changed from the Bencho demo: the picture is a real
   <img> handed in as a prop; the card fills its container's
   width at a given aspect ratio instead of being 260 × 320,
   and the depth of the room follows that size; children are
   drawn as a layer over the photograph, turning with it. */

export type Shot = { src: string; alt: string; srcSet?: string; sizes?: string };

export type TiltCardProps = {
  image: Shot;
  /** the most either axis turns, in degrees (0..20) */
  tilt?: number;
  /** how dark the dent gets, 0..100 */
  shade?: number;
  /** the card's radius, px (0..40) */
  corner?: number;
  /** how much of the drop shadow under the card is drawn, 0..100 */
  shadow?: number;
  /** CSS aspect-ratio of the card */
  aspect?: string;
  className?: string;
  /** drawn above the photograph, inside the card, so it turns with it */
  children?: ReactNode;
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/* ── one spring, for everything that settles (Bencho lab/spring) ──
   Frames, not milliseconds: `dt` is in sixtieths of a second and the
   damping is RAISED to it rather than multiplied by it, so a dropped
   frame decays the same energy as the two frames it replaced. The loop
   parks itself the moment the value has settled. */
const springOf = (tune: number) => ({
  k: 0.08 + (tune / 100) * 0.16,
  d: 0.62 + (tune / 100) * 0.2,
});

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

/* ── how deep the room is ──────────────────────────────────
   The one number that decides whether this reads as a card
   turning or as a poster being sheared. Perspective is the
   distance from the viewer to the screen, so a small number is
   a face close to the glass.

   The demo's 800px against its 320px card: two and a half card
   heights back — far enough that the foreshortening is a
   suggestion rather than a fisheye, close enough that the
   corners are visibly different sizes. Kept as that RATIO, in
   units of the card's own height (cqh — the frame is a size
   container), so a card twice the size is not twice as close. */
const DEPTH = 250;

/* how far the whole card retreats while it is being touched,
   in the same units: the demo's 14px of 320. Small on purpose —
   past about half as much again it stops being a press and
   becomes a zoom. */
const SINK = 4.375;

export function TiltCard({
  image,
  tilt = 6,
  shade = 60,
  corner = 0,
  shadow = 100,
  aspect = "3 / 4",
  className,
  children,
}: TiltCardProps) {
  const skin = useRef<HTMLDivElement | null>(null);
  const [at, setAt] = useState({ x: 0, y: 0 });
  const [on, setOn] = useState(false);
  const still = useStill();

  /* ── the state, and there is only this ───────────────────
     Where the pointer is, as -1..1 on each axis, sprung. The
     spring is on the POSITION rather than on the rotation, so
     the gradients and the transform can never disagree about
     where the finger is.

     Sprung rather than tracked one-to-one because a card with
     no weight follows the cursor exactly and reads as a
     texture pinned to the mouse. The lag is what gives it
     mass, and the settle on the way out is the only reason
     leaving the card feels like anything at all. */
  const sx = useSpring(on ? at.x : 0, 50, still);
  const sy = useSpring(on ? at.y : 0, 50, still);
  /* one more for how much of any of this applies, so the
     shadow and the sheen fade rather than cutting */
  const lit = useSpring(on ? 1 : 0, 50, still);

  const max = clamp(tilt, 0, 20);
  const rx = -sy * max;
  const ry = sx * max;

  /* the pointer in the card's own terms, as a PERCENTAGE, so
     the gradients land in the same place at any size */
  const px = ((sx + 1) / 2) * 100;
  const py = ((sy + 1) / 2) * 100;

  const dark = (clamp(shade, 0, 100) / 100) * 0.55 * lit;
  const rim = (clamp(shade, 0, 100) / 100) * 0.34 * lit;
  const cast = clamp(shadow, 0, 100) / 100;

  const track = (e: PointerEvent<HTMLDivElement>) => {
    const el = skin.current;
    if (!el) return;
    /* measured from the FRAME, which never moves. Reading the
       card instead would be asking a rotating object where it
       is, and near the edges it has already turned away from
       the pointer that is asking. */
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    setAt({
      x: clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1),
      y: clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1),
    });
    setOn(true);
  };

  return (
    <div
      className={className ? `tlt ${className}` : "tlt"}
      ref={skin}
      style={{ aspectRatio: aspect }}
      /* pointer, not mouse: the same handler carries a finger
         dragged across the card, so a phone gets the effect
         while it is being touched rather than getting nothing
         at all. */
      onPointerMove={track}
      /* ── `out` with a containment test, NOT `leave` ───────
         Which is what leave IS — written out so a pointer that
         goes carrying `relatedTarget: null` still lets the card
         up. Null counts as outside, which is also the honest
         answer for a real pointer leaving the window. */
      onPointerOut={(e: PointerEvent<HTMLDivElement>) => {
        const el = skin.current;
        const to = e.relatedTarget as Node | null;
        if (!el || !to || !el.contains(to)) setOn(false);
      }}
      /* a touch taken over by a scroll never reports leaving */
      onPointerCancel={() => setOn(false)}
    >
      <div
        className="tlt-card"
        style={
          {
            borderRadius: clamp(corner, 0, 40),
            /* The perspective is written into the card's own
               transform rather than set on the frame, because it
               is a length in the frame's container units and those
               only resolve on something INSIDE the frame. It comes
               first and the card fills the frame, so the vanishing
               point is still the middle of the room and does not
               ride along with the rotation.

               translateZ next, so the retreat is measured in the
               room's axes rather than in the card's own — after a
               rotation, the card's z points somewhere off to the
               side and "back" stops meaning back. */
            transform: `perspective(${DEPTH}cqh) translateZ(${(-SINK * lit).toFixed(3)}cqh) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg)`,
            /* ── the shadow TIGHTENS ────────────────────────
               A thing pressed into a surface has less air under
               it, so the gap closes and the shadow draws in.
               Growing it on hover is the reflex — it is what a
               card that LIFTS would do — and it fights every
               other cue here. */
            boxShadow:
              cast > 0
                ? `0 ${mix(20, 9, lit).toFixed(2)}px ${mix(44, 24, lit).toFixed(2)}px -8px rgba(var(--shadow-rgb, 23, 24, 26), ${(mix(0.22, 0.15, lit) * cast).toFixed(3)})`
                : "none",
          } as CSSProperties
        }
      >
        <img
          className="tlt-img"
          src={image.src}
          srcSet={image.srcSet}
          sizes={image.sizes}
          alt={image.alt}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
        {/* ── the dent, and the rim opposite it ───────────
            The shadow pools where the surface is deepest,
            which is under the pointer, and the light catches
            the far edge that has risen — so the two are
            placed at mirrored points and neither is centred
            on anything. This is the layer that makes the
            transform read as a press. */}
        <span
          className="tlt-sheen"
          aria-hidden="true"
          style={{
            backgroundImage: `radial-gradient(42% 34% at ${px.toFixed(2)}% ${py.toFixed(2)}%, rgba(var(--shadow-rgb, 23, 24, 26), ${dark.toFixed(3)}) 0%, rgba(var(--shadow-rgb, 23, 24, 26), 0) 100%), radial-gradient(52% 42% at ${(100 - px).toFixed(2)}% ${(100 - py).toFixed(2)}%, rgba(255, 255, 255, ${rim.toFixed(3)}) 0%, rgba(255, 255, 255, 0) 100%)`,
          }}
        />
        {children != null && children !== false ? (
          <div className="tlt-over">{children}</div>
        ) : null}
      </div>
    </div>
  );
}
