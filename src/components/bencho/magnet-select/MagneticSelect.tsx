"use client";

import {
  type CSSProperties,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { motion } from "framer-motion";
import "./MagneticSelect.css";

/* ══ Magnetic select ═══════════════════════════════════════
   Adapted from Bencho (blocks/magnet-select, MIT — see
   ../LICENSE.md). A set of options packed close enough
   together to be in each other's way, and a selection that
   behaves like a magnet rather than a highlight: the one you
   press swells and takes the ink, and the rest are shoved out
   of its way.

   THE POINT IS THE FIELD, NOT THE ITEM. A normal segmented
   control moves an indicator and leaves the layout alone,
   which is why selecting in one feels like bookkeeping. Here
   the choice deforms its neighbourhood, so the answer to
   "which one is selected" is legible from three feet away —
   it is the one everything else is leaning away from.

   Every number still falls out of ONE decision: how far the
   selected chip grows. The room it needs is arithmetic from
   that, the shove is that room plus an aura, and the stagger
   and the tilt decay with real distance.

   ── WHAT CHANGED FROM THE BENCHO DEMO, AND WHY ────────────
   The demo is a hexagon of seven round picture-chips at
   positions written down in a table. This is a chooser for a
   handful of short labels — sizes — so:

   · the options, the selection and the group's name are props,
     and it is a real radiogroup (roving focus, arrow keys);
   · the chips are laid out by the BROWSER — a wrapping row —
     and the field is worked out from where they are measured
     to be, so it reflows with its container and the same
     arithmetic acts along a row, round a corner onto the next
     line, or across a grid;
   · the chip's corner is a knob again and square by default.
     The demo dropped its Corner knob because a square in a
     honeycomb meets its neighbours corner to flat; in rows
     that objection is gone. Its other objection — a tilted
     square sweeps a wider box than it occupies — stands, so
     the tilt is a knob too and is OFF unless asked for;
   · the whole set is slid sideways by whatever it takes to
     keep the shove inside the block's own box, so a row that
     starts at the left edge still starts there and nothing is
     pushed out under a neighbouring column or off a phone. */

export type MagneticSelectOption = { value: string; label: string; disabled?: boolean };

export type MagneticSelectProps = {
  /** 4–8 short labels is what it is drawn for; any number works */
  options: MagneticSelectOption[];
  /** the selected option's value, or null for none — the parent owns this */
  value: string | null;
  onChange: (value: string) => void;
  /** the accessible name of the radiogroup, e.g. "Size" */
  label: string;
  /** the strength of the whole field, 0..100 */
  pull?: number;
  /** how much it overshoots on the way to rest, 0..100 */
  bounce?: number;
  /** how far the set leans toward a cursor near it, 0..100 */
  give?: number;
  /** how much of the demo's tip the shoved chips keep, 0..100 (0 = upright) */
  tilt?: number;
  /** a chip's corner, px — at half its height (22) it is a pill */
  corner?: number;
  className?: string;
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

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

/* a chip's height, and the least it is wide */
const CHIP = 44;
/* the air between chips at rest. The demo packs them 4px off
   touching on a lattice; a row of squares wants a little more
   to read as a row of separate things. */
const GAP = 8;

/* ── how fast the aura falls off, in steps of one chip ─────
   exp() rather than 1/d because an inverse law is violent at
   the first neighbour and flat everywhere after. 2.8 is the
   demo's number: the field reaches a little further, which if
   anything reads as more of a field. */
const SPREAD = 2.8;

/* how far past the set's own edge the lean survives */
const FADE = 44;

const NOW = { duration: 0 } as const;

/* where a chip is, at rest: its centre and its size, in the
   block's own pixels */
type Box = { x: number; y: number; w: number; h: number };
type Layout = { width: number; boxes: Box[] };

const sameLayout = (a: Layout | null, b: Layout) =>
  !!a &&
  a.width === b.width &&
  a.boxes.length === b.boxes.length &&
  a.boxes.every((p, i) => {
    const q = b.boxes[i];
    return p.x === q.x && p.y === q.y && p.w === q.w && p.h === q.h;
  });

export function MagneticSelect({
  options,
  value,
  onChange,
  label,
  pull = 55,
  bounce = 55,
  give = 50,
  tilt = 0,
  corner = 0,
  className,
}: MagneticSelectProps) {
  const n = options.length;
  const p = clamp(pull, 0, 100) / 100;
  const still = useStill();

  /* which one is the magnet. -1 for none: "nothing chosen" is a
     state this can be in, and then there is no field at all. */
  const at = value === null ? -1 : options.findIndex((o) => o.value === value);

  /* ── ONE decision, and the rest is arithmetic ────────────
     GROW is the knob. ROOM is the space the swell physically
     takes on every side — half the extra size, exactly — so
     the neighbours are never merely *near* clear of it. AURA
     is the part that is not arithmetic: the push beyond what
     the geometry demands, which is the difference between a
     set making room and a set being repelled. */
  const grow = 1.16 + 0.22 * p;
  const aura = 3 + 9 * p;
  const tip = 5 * p * (clamp(tilt, 0, 100) / 100);
  /* the neighbours give up a little size as well as ground —
     the magnet takes the mass as well as the space */
  const cower = 0.04 + 0.09 * p;

  /* ── where the chips are, read off the page ──────────────
     The layout is the browser's, so the field has to be told
     where it put things: each chip's resting box, in the
     block's own pixels. offsetLeft and friends ignore
     transforms, which is the point — reading a position off a
     thing this displaces would be a feedback loop.

     Read by an observer, never by hand: it fires once when it
     starts watching, again whenever the block is resized or a
     label's face arrives and changes a chip's width, and that
     is every moment the answer can change. */
  const wrap = useRef<HTMLDivElement | null>(null);
  const chips = useRef<(HTMLButtonElement | null)[]>([]);
  const [layout, setLayout] = useState<Layout | null>(null);
  /* the labels, as one string: a different set is a different layout */
  const names = options.map((o) => o.label).join("\u0001");

  useEffect(() => {
    const el = wrap.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const read = () => {
      const boxes: Box[] = [];
      for (let i = 0; i < n; i += 1) {
        const chip = chips.current[i];
        if (!chip) return;
        boxes.push({
          x: chip.offsetLeft + chip.offsetWidth / 2,
          y: chip.offsetTop + chip.offsetHeight / 2,
          w: chip.offsetWidth,
          h: chip.offsetHeight,
        });
      }
      const next = { width: el.clientWidth, boxes };
      setLayout((was) => (sameLayout(was, next) ? was : next));
    };
    const ro = new ResizeObserver(read);
    ro.observe(el);
    for (let i = 0; i < n; i += 1) {
      const chip = chips.current[i];
      if (chip) ro.observe(chip);
    }
    return () => ro.disconnect();
  }, [n, names]);

  const boxes = layout && layout.boxes.length === n ? layout.boxes : null;
  const magnet = boxes && at >= 0 ? boxes[at] : null;

  /* ── the field, worked out once ──────────────────────────
     With no magnet (or before the first reading) there is no
     field: every chip sits where the browser put it and the
     pushes are all zero. */
  const field = options.map((_, i) => {
    const b = boxes?.[i];
    if (!b || !magnet || i === at) return { far: 0, fall: 0, px: 0, py: 0, ux: 0 };
    const dx = b.x - magnet.x;
    const dy = b.y - magnet.y;
    const gap = Math.hypot(dx, dy);
    /* ── THE DIRECTION IS THE BEARING ──────────────────────
       Straight out along the line from the magnet — so along a
       row it is left or right, and a chip on the line below is
       pushed down and away at whatever angle it actually lies. */
    const ux = gap ? dx / gap : 0;
    const uy = gap ? dy / gap : 0;
    /* the spacing the falloff is measured in: one chip and its
       air, so a neighbour sits at far = 1 */
    const far = gap / ((magnet.w + magnet.h) / 2 + GAP);
    /* the aura, spent — it drives the stagger, the tilt and how
       much size a chip gives up */
    const fall = Math.exp(-(far - 1) / SPREAD);
    /* ── THE PUSH DOES NOT DECAY, and that is the fix ──────
       If a chip near the magnet moved further than the one
       behind it, two chips on the same ray would CLOSE by the
       difference while every other pair opened. Constant, it
       cannot happen: two chips on the same bearing move by the
       same amount and their spacing is exactly what it was.
       Nothing ever compresses; gaps only open.

       ROOM is taken along the bearing, because a chip wider
       than it is tall swells further sideways than it does up. */
    const room = ((Math.abs(ux) * magnet.w + Math.abs(uy) * magnet.h) * (grow - 1)) / 2;
    const push = room + aura;
    return { far, fall, px: ux * push, py: uy * push, ux };
  });

  /* ── and the whole set is slid to stay in its own box ─────
     Shoved from a chip in the middle of a row, the ones to its
     left would leave the block by the left edge — out from
     under the heading they were aligned with, or off the side
     of a phone. So everything, the magnet included, moves over
     by exactly what went out: the row still starts where it
     started, and the room the field needs is taken from the
     far end, where the block keeps it in reserve (--mag-room).

     One vector for every chip, so it changes no gap anywhere:
     the field is the same field, standing somewhere else. */
  let slide = 0;
  if (boxes && magnet && layout) {
    let least = Infinity;
    let most = -Infinity;
    boxes.forEach((b, i) => {
      const half = (b.w * (i === at ? grow : 1)) / 2;
      least = Math.min(least, b.x + field[i].px - half);
      most = Math.max(most, b.x + field[i].px + half);
    });
    if (least < 0) slide = -least;
    else if (most > layout.width) slide = Math.max(layout.width - most, -least);
  }

  /* ── the springs ─────────────────────────────────────────
     Bounce is a DAMPING RATIO, not a damping value: tie it to
     a raw number and the same setting is bouncy on one chip
     and dead on another, because each chip here springs at a
     different stiffness. As a ratio it means the same thing
     everywhere — 0.9 arrives and stops, 0.42 arrives and
     rings — and stiffness is then free to vary. */
  const zeta = 0.9 - 0.48 * (clamp(bounce, 0, 100) / 100);
  const swing = (k: number, mass: number) => ({
    type: "spring" as const,
    stiffness: k,
    damping: 2 * Math.sqrt(k * mass) * zeta,
    mass,
  });

  /* nothing springs until somebody has chosen something here: a
     selection the page arrived with, and the first reading of the
     layout, are simply drawn — a field that assembles itself on
     page load reads as a loading state rather than as a choice */
  const [live, setLive] = useState(false);

  /* ── AND THE SET LEANS TOWARD THE CURSOR ────────────────
     The field is what a chip does about the SELECTION. This is
     what the set does about your hand: come within reach and
     it tips a few pixels your way, and lets go as you leave.

     IT IS THE GROUP THAT LEANS, not the chip: every chip moves
     by one shared vector, so the gaps are exactly what they
     were. AND THE VECTOR IS MEASURED FROM ONE POINT, the set's
     own centre, so there is nothing to hand over to as the
     cursor crosses from chip to chip. The magnitude RAMPS UP
     from that centre — zero where its own direction is
     undefined, full at the set's edge, easing out past it.

     Written straight onto the block as two custom properties
     (the skins read them) rather than through React state: it
     changes every frame the pointer moves anywhere on the page,
     and nothing else about the block does. */
  const hub = useRef({ x: 0, y: 0, r: 1 });
  useEffect(() => {
    if (!boxes || boxes.length === 0) return;
    const xs = boxes.flatMap((b) => [b.x - b.w / 2, b.x + b.w / 2]);
    const ys = boxes.flatMap((b) => [b.y - b.h / 2, b.y + b.h / 2]);
    const x = (Math.min(...xs) + Math.max(...xs)) / 2;
    const y = (Math.min(...ys) + Math.max(...ys)) / 2;
    hub.current = {
      x,
      y,
      r: Math.max(1, ...boxes.map((b) => Math.hypot(b.x - x, b.y - y) + Math.max(b.w, b.h) / 2)),
    };
  }, [boxes]);

  useEffect(() => {
    const el = wrap.current;
    if (!el || !give || still) return;
    let raf = 0;
    let seen: { x: number; y: number } | null = null;
    let last = { x: 0, y: 0 };
    const publish = () => {
      raf = 0;
      let next = { x: 0, y: 0 };
      if (seen) {
        const b = el.getBoundingClientRect();
        const { x: hx, y: hy, r } = hub.current;
        const dx = seen.x - b.left - hx;
        const dy = seen.y - b.top - hy;
        const d = Math.hypot(dx, dy);
        /* nothing at the centre, full at the edge, and gone by
           FADE past it */
        const rise = Math.min(1, d / r);
        const away = d <= r ? 1 : Math.max(0, 1 - (d - r) / FADE);
        /* a few pixels is the whole specification: past about
           seven a chip stops acknowledging you and starts being
           something you are dragging */
        const drawn = rise * away * (2 + (clamp(give, 0, 100) / 100) * 5);
        if (drawn > 0) next = { x: (dx / (d || 1)) * drawn, y: (dy / (d || 1)) * drawn };
      }
      if (next.x === last.x && next.y === last.y) return;
      last = next;
      el.style.setProperty("--lx", `${next.x.toFixed(2)}px`);
      el.style.setProperty("--ly", `${next.y.toFixed(2)}px`);
    };
    const ask = () => {
      if (!raf) raf = requestAnimationFrame(publish);
    };
    const read = (e: PointerEvent) => {
      /* a finger is not a cursor: it has no "near", and it never
         reports leaving, so the set would be left leaning at the
         last place it was touched */
      if (e.pointerType === "touch") return;
      seen = { x: e.clientX, y: e.clientY };
      ask();
    };
    const gone = () => {
      seen = null;
      ask();
    };
    document.addEventListener("pointermove", read, { passive: true });
    document.addEventListener("pointerleave", gone);
    return () => {
      document.removeEventListener("pointermove", read);
      document.removeEventListener("pointerleave", gone);
      cancelAnimationFrame(raf);
      el.style.removeProperty("--lx");
      el.style.removeProperty("--ly");
    };
  }, [give, still]);

  const choose = (i: number) => {
    const o = options[i];
    if (!o || o.disabled) return;
    setLive(true);
    if (o.value !== value) onChange(o.value);
  };

  /* ── one stop for Tab, arrows within ─────────────────────
     A radiogroup is ONE thing to tab to: the checked option, or
     the first that can be chosen when none is. Arrows walk the
     options that can be chosen, round the ends, and choosing
     follows the focus, as it does for any set of radios. */
  const open = (i: number) => !options[i]?.disabled;
  const stop = at >= 0 && open(at) ? at : options.findIndex((o) => !o.disabled);
  const walk = (from: number, dir: 1 | -1) => {
    for (let s = 1; s <= n; s += 1) {
      const j = (((from + dir * s) % n) + n) % n;
      if (open(j)) return j;
    }
    return from;
  };
  const onKey = (i: number) => (e: KeyboardEvent<HTMLButtonElement>) => {
    let j = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") j = walk(i, 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") j = walk(i, -1);
    else if (e.key === "Home") j = walk(-1, 1);
    else if (e.key === "End") j = walk(n, -1);
    else return;
    e.preventDefault();
    if (j < 0 || j === i) return;
    chips.current[j]?.focus();
    choose(j);
  };

  /* the room the field is given at the far end of each row: the
     most a chip is ever slid, which is two shoves' worth */
  const reserve = Math.ceil(2 * ((CHIP * (grow - 1)) / 2 + aura));
  const settled = !live || still;

  return (
    <div
      className={className ? `mag ${className}` : "mag"}
      ref={wrap}
      role="radiogroup"
      aria-label={label}
      style={
        {
          "--mag-chip": `${CHIP}px`,
          "--mag-gap": `${GAP}px`,
          "--mag-room": `${reserve}px`,
          "--mag-r": `${clamp(corner, 0, CHIP / 2)}px`,
        } as CSSProperties
      }
    >
      {options.map((o, i) => {
        const on = i === at;
        const { far, fall, px, py, ux } = field[i];
        /* the far ones are softer, and LATE: 22ms a step. Fire
           them together and the set moves as a slab; stagger them
           and the shove travels outward, which is the difference
           between a layout change and a force. */
        const k = 300 + 280 * (1 - Math.min(far, 3) / 4);
        const wait = far * 0.022;
        const small = magnet && !on ? 1 - cower * fall : 1;

        return (
          <motion.button
            key={o.value}
            ref={(el) => {
              chips.current[i] = el;
            }}
            type="button"
            className="mag-chip"
            role="radio"
            aria-checked={on}
            aria-disabled={o.disabled || undefined}
            disabled={o.disabled}
            tabIndex={i === stop ? 0 : -1}
            data-on={on || undefined}
            data-off={o.disabled || undefined}
            onClick={() => choose(i)}
            onKeyDown={onKey(i)}
            /* nothing animates on mount */
            initial={false}
            animate={{
              x: slide + px,
              y: py,
              /* ── wide before it goes tall ────────────────
                 Two springs at different stiffnesses rather
                 than one scale, so the transient is
                 anisotropic and the rest state is not: X
                 leads, Y follows a beat behind, and the chip
                 flattens out and squares up on its way to
                 size. This is the whole of the "jelly", and it
                 is not there at all when the spring is
                 critically damped. */
              scaleX: on && magnet ? grow : small,
              scaleY: on && magnet ? grow : small,
              /* shoved things tip, and only the sideways part
                 of the shove tips them — a chip driven straight
                 up has nothing to lean into. Nothing unless the
                 Tilt knob is turned up: see the note at the top. */
              rotate: ux * tip * fall,
            }}
            transition={
              settled
                ? NOW
                : {
                    x: { ...swing(k, 0.9), delay: wait },
                    y: { ...swing(k, 0.9), delay: wait },
                    scaleX: { ...swing(k * 1.24, 0.8), delay: wait },
                    scaleY: { ...swing(k * 0.86, 0.95), delay: wait },
                    rotate: { ...swing(k * 0.8, 1), delay: wait },
                  }
            }
          >
            {/* ── TWO ELEMENTS, TWO TRANSFORMS ──────────────
                The button carries Framer's transform — the
                field's shove, the swell and the tilt, on springs
                with a delay on them. The skin carries a CSS one:
                the lean toward the cursor, which on those springs
                would arrive late and keep arriving after you had
                gone. They cannot share an element; a rule here
                and a spring there would fight every frame. */}
            <span className="mag-skin">
              <span className="mag-text">{o.label}</span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
