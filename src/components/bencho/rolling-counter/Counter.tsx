"use client";

import {
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Minus, Plus } from "lucide-react";
import "./Counter.css";

/* ══ Rolling counter ══════════════════════════════════════
   Adapted from Bencho (blocks/rolling-counter, MIT — see
   ../LICENSE.md). A number between a minus and a plus. Every
   digit is a strip of 0–9 behind a window, and changing the
   number rolls the strips to their new digits like an
   odometer.

   ── EACH COLUMN COUNTS, IT DOES NOT SHOW ───────────────
   A column's target is not its digit but the number of whole
   tens, hundreds… in the value: 1284 is 1284 for the ones
   column, 128 for the tens, 12 for the hundreds. So 9 → 10 is
   the ones column moving FORWARD one more step (9 → 0) and the
   tens moving forward one — never a strip running back down
   through eight digits to reach zero. The strip is 0–9 and a
   second 0, and where it sits is the count taken round ten.

   ── ONE SPRING PER COLUMN, AND THEY GO IN TURN ─────────
   A change reaches the ones first and each column to the left
   a little later — Stagger — so a carry reads as a carry,
   rippling up the number, rather than the whole row jumping.

   ── THREE WAYS TO CHANGE IT ────────────────────────────
   Press a button for one step; hold it and it repeats, faster
   and in bigger steps the longer you hold. Or take the number
   itself and drag it up or down, a step every few pixels; let
   go while it is moving and it keeps rolling and runs down.

   What changed from the Bencho demo: it is CONTROLLED. The
   number belongs to the parent (`value` / `onChange`), is held
   between `min` and `max`, and the strips roll to whatever
   `value` becomes — so a change made anywhere else rolls here
   too. It comes in two sizes, and the keys go dead at the ends
   of the range. */

export type CounterProps = {
  /** the number — the parent owns this */
  value: number;
  onChange: (next: number) => void;
  /** the least it goes to (never below 0) */
  min?: number;
  /** the most it goes to */
  max?: number;
  /** the accessible name of the group and of the number in it */
  label?: string;
  /** how lively a digit lands, 0..100 */
  bounce?: number;
  /** ms between one column moving and the next, 0..120 */
  stagger?: number;
  /** how much a spinning digit smears, 0..100 */
  blur?: number;
  /** the slab's corner, px */
  corner?: number;
  /** "sm" is 32px tall, for a cart line; "md" is the block as drawn, 56px */
  size?: "sm" | "md";
  className?: string;
};

/* ── one spring, for everything that settles (Bencho lab/spring) ──
   0..100 into stiffness and decay, chosen by damping ratio:
     0   → zeta ~0.85, heavy, arrives without a ring
     50  → zeta ~0.41
     100 → zeta ~0.20, lively, two visible rebounds */
const springOf = (tune: number) => ({
  /* stiffness: how hard it is pulled toward the target */
  k: 0.08 + (tune / 100) * 0.16,
  /* decay, per frame: how much of the velocity survives */
  d: 0.62 + (tune / 100) * 0.2,
});

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

const PLACES = 5;
const CEIL = 10 ** PLACES - 1;
/* a step of drag, px */
const PX = 12;

/* ── the two sizes ─────────────────────────────────────────
   `cell` is the window a digit is seen through, and the keys
   are upright and the same height, so every edge of the box is
   the same `pad` from something. The box is cell + 2 × pad. */
const SIZES = {
  md: { cell: 46, pad: 5, key: 40, font: 30, gutter: 14, icon: 16 },
  sm: { cell: 24, pad: 4, key: 26, font: 15, gutter: 8, icon: 12 },
} as const;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
/* the count taken round ten: where a strip sits for a column's count */
const round10 = (n: number) => ((n % 10) + 10) % 10;

type Col = { pos: number; vel: number; target: number; due: number[]; next: number[] };

export function Counter({
  value,
  onChange,
  min = 1,
  max = 10,
  label = "Quantity",
  bounce = 45,
  stagger = 45,
  blur = 50,
  corner = 0,
  size = "md",
  className,
}: CounterProps) {
  const still = useStill();
  const dim = SIZES[size] ?? SIZES.md;

  const lo = clamp(Math.round(min), 0, CEIL);
  const hi = clamp(Math.round(max), lo, CEIL);
  /* what is on show: the parent's number, kept inside the range */
  const shownValue = clamp(Math.round(Number.isFinite(value) ? value : lo), lo, hi);

  /* the number as of the last press — the parent's, plus whatever
     this block has asked for since and not yet been handed back */
  const latest = useRef(shownValue);
  /* the number the strips were last sent to */
  const rolled = useRef(shownValue);
  /* where the strips stand before anything has moved: written into
     the markup, so the right digits are there before any script is */
  const [first] = useState(shownValue);

  const strips = useRef<(HTMLSpanElement | null)[]>([]);
  const cols = useRef<Col[] | null>(null);
  const raf = useRef(0);
  const knobs = useRef({ bounce, stagger, blur, cell: dim.cell as number });
  const range = useRef({ lo, hi });
  const emit = useRef(onChange);
  const minus = useRef<HTMLButtonElement | null>(null);
  const plus = useRef<HTMLButtonElement | null>(null);
  const num = useRef<HTMLDivElement | null>(null);

  /* ── paint ─────────────────────────────────────────────── */
  const paint = useCallback(() => {
    const list = cols.current;
    if (!list) return;
    list.forEach((c, p) => {
      const el = strips.current[p];
      if (!el) return;
      const smear = Math.min(3, Math.abs(c.vel) * 2.4) * (knobs.current.blur / 50);
      el.style.transform = `translateY(${-round10(c.pos) * knobs.current.cell}px)`;
      el.style.filter = smear > 0.15 ? `blur(${smear.toFixed(2)}px)` : "";
    });
  }, []);

  const run = useCallback(() => {
    if (raf.current) return;
    let prev = 0;
    function tick(t: number) {
      const list = cols.current;
      if (!list) {
        raf.current = 0;
        return;
      }
      const dt = prev ? clamp((t - prev) / 16.67, 0, 2.5) : 1;
      prev = t;
      const { k, d } = springOf(knobs.current.bounce);
      const now = performance.now();
      let busy = false;
      for (const c of list) {
        /* targets that have waited their turn */
        while (c.due.length && c.due[0] <= now) {
          c.due.shift();
          const to = c.next.shift();
          if (to !== undefined) c.target = to;
        }
        if (c.due.length) busy = true;
        /* a column far from home jumps most of the way in whole
           turns first — it looks the same, and a flick does not
           leave the ones column spinning for a second */
        const gap = c.target - c.pos;
        if (Math.abs(gap) > 24) c.pos += Math.round((gap - Math.sign(gap) * 24) / 10) * 10;
        c.vel += (c.target - c.pos) * k * dt;
        c.vel *= Math.pow(d, dt);
        c.pos += c.vel * dt;
        if (Math.abs(c.target - c.pos) < 0.004 && Math.abs(c.vel) < 0.004) {
          c.pos = c.target;
          c.vel = 0;
        } else busy = true;
      }
      paint();
      raf.current = busy ? requestAnimationFrame(tick) : 0;
    }
    raf.current = requestAnimationFrame(tick);
  }, [paint]);

  /* what the handlers and the loop read, kept current. First, so
     the effects below see this render's numbers. */
  useEffect(() => {
    knobs.current = { bounce, stagger, blur, cell: dim.cell };
    range.current = { lo, hi };
    emit.current = onChange;
    /* the parent has spoken: its number is the number */
    latest.current = shownValue;
  });

  /* ── the strips follow the value, wherever it changed ──── */
  useEffect(() => {
    if (!cols.current) {
      cols.current = Array.from({ length: PLACES }, (_, p) => {
        const n = Math.floor(rolled.current / 10 ** p);
        return { pos: n, vel: 0, target: n, due: [], next: [] };
      });
    }
    const list = cols.current;
    if (rolled.current === shownValue && !still) return;
    rolled.current = shownValue;
    const now = performance.now();
    list.forEach((c, p) => {
      const to = Math.floor(shownValue / 10 ** p);
      if (still) {
        c.pos = c.target = to;
        c.vel = 0;
        c.due = [];
        c.next = [];
        return;
      }
      c.due.push(now + p * knobs.current.stagger);
      c.next.push(to);
    });
    if (still) paint();
    else run();
  }, [shownValue, still, paint, run]);

  /* a strip is placed in pixels of the window, so a new size (or a
     new blur) is a new place for a strip that has not moved */
  useEffect(() => {
    paint();
  }, [paint, blur, size]);

  useEffect(
    () => () => {
      cancelAnimationFrame(raf.current);
      raf.current = 0;
    },
    [],
  );

  /* a key that goes dead under a keyboard would take the focus
     with it; the number is still there to be arrowed */
  useEffect(() => {
    const el = document.activeElement;
    if ((el === minus.current && shownValue <= lo) || (el === plus.current && shownValue >= hi)) {
      num.current?.focus({ preventScroll: true });
    }
  }, [shownValue, lo, hi]);

  /* ── the one way the number changes ──────────────────────
     It asks; it does not move anything itself. The strips roll
     when the parent hands the new number back as `value`.
     Says whether there was anywhere left to go. */
  const bump = useCallback((n: number) => {
    const v = clamp(latest.current + n, range.current.lo, range.current.hi);
    if (v === latest.current) return false;
    latest.current = v;
    emit.current(v);
    return true;
  }, []);

  const jump = (to: number) => bump(to - latest.current);

  /* ── holding a button ──────────────────────────────────── */
  const hold = useRef({ t: 0, since: 0 });
  const release = useCallback(() => {
    window.clearTimeout(hold.current.t);
    hold.current.t = 0;
  }, []);
  useEffect(() => release, [release]);

  const press = (dir: 1 | -1) => {
    release();
    if (!bump(dir)) return;
    hold.current.since = performance.now();
    const repeat = () => {
      const held = performance.now() - hold.current.since;
      /* ones, then tens after a second and a half; and it stops
         by itself at the end of the range, where the key goes
         dead and may never report the finger lifting */
      if (!bump(dir * (held > 1500 ? 10 : 1))) {
        hold.current.t = 0;
        return;
      }
      hold.current.t = window.setTimeout(repeat, held > 900 ? 55 : 90);
    };
    hold.current.t = window.setTimeout(repeat, 380);
  };

  /* ── taking the number itself ──────────────────────────── */
  const drag = useRef<{ y: number; acc: number; v: number; t: number } | null>(null);
  const fling = useRef(0);
  useEffect(() => () => cancelAnimationFrame(fling.current), []);

  /* whole steps out of an accumulated drag; what is left over,
     and whether the range had run out */
  const steps = (acc: number) => {
    const n = acc > 0 ? Math.floor(acc / PX) : Math.ceil(acc / PX);
    const stuck = n !== 0 && !bump(n);
    return { acc: acc - n * PX, stuck };
  };

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    cancelAnimationFrame(fling.current);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* a scripted pointer */
    }
    drag.current = { y: e.clientY, acc: 0, v: 0, t: performance.now() };
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const g = drag.current;
    if (!g) return;
    const now = performance.now();
    /* up is more */
    const dy = g.y - e.clientY;
    g.y = e.clientY;
    const dt = Math.max(1, now - g.t);
    g.t = now;
    g.v = g.v * 0.6 + (dy / dt) * 0.4;
    g.acc = steps(g.acc + dy).acc;
  };
  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    const g = drag.current;
    drag.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* never captured */
    }
    if (!g || still) return;
    /* a hand that stopped before letting go threw nothing */
    let v = performance.now() - g.t > 90 ? 0 : g.v * 16.67;
    if (Math.abs(v) < 2) return;
    let acc = g.acc;
    const coast = () => {
      const took = steps(acc + v);
      acc = took.acc;
      v *= 0.94;
      /* it runs down, or it runs into the end of the range */
      if (!took.stuck && Math.abs(v) > 0.4) fling.current = requestAnimationFrame(coast);
    };
    fling.current = requestAnimationFrame(coast);
  };

  const onNumKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowUp" || e.key === "ArrowRight") {
      e.preventDefault();
      bump(1);
    } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
      e.preventDefault();
      bump(-1);
    } else if (e.key === "PageUp") {
      e.preventDefault();
      bump(10);
    } else if (e.key === "PageDown") {
      e.preventDefault();
      bump(-10);
    } else if (e.key === "Home") {
      e.preventDefault();
      jump(range.current.lo);
    } else if (e.key === "End") {
      e.preventDefault();
      jump(range.current.hi);
    }
  };

  /* ── a key worked without a pointer ──────────────────────
     Enter, Space, a switch or a screen reader's "activate" all
     arrive as a click with no press behind it (`detail` 0). A
     real pointer's click is ignored: its press already counted. */
  const onKeyClick = (dir: 1 | -1) => (e: MouseEvent<HTMLButtonElement>) => {
    if (e.detail === 0) bump(dir);
  };

  const shown = Math.max(1, String(shownValue).length);
  const box = dim.cell + dim.pad * 2;
  const r = clamp(corner, 0, box / 2);
  const inner = Math.max(0, r - dim.pad);
  const atMin = shownValue <= lo;
  const atMax = shownValue >= hi;

  return (
    <div
      className={className ? `rct ${className}` : "rct"}
      role="group"
      aria-label={label}
      data-size={size}
      style={
        {
          "--rct-r": `${r}px`,
          "--rct-in": `${inner}px`,
          "--rct-cell": `${dim.cell}px`,
          "--rct-pad": `${dim.pad}px`,
          "--rct-key": `${dim.key}px`,
          "--rct-font": `${dim.font}px`,
          "--rct-gutter": `${dim.gutter}px`,
        } as CSSProperties
      }
    >
      <button
        ref={minus}
        type="button"
        className="rct-btn"
        aria-label="Decrease"
        disabled={atMin}
        onPointerDown={(e) => {
          if (e.button === 0) press(-1);
        }}
        onPointerUp={release}
        onPointerLeave={release}
        onPointerCancel={release}
        onClick={onKeyClick(-1)}
      >
        <Minus size={dim.icon} strokeWidth={2.2} aria-hidden="true" focusable="false" />
      </button>

      <div
        ref={num}
        className="rct-num"
        role="spinbutton"
        aria-valuenow={shownValue}
        aria-valuemin={lo}
        aria-valuemax={hi}
        aria-label={label}
        tabIndex={0}
        onKeyDown={onNumKey}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        {/* the window: rolling digits fade at its top and bottom edge */}
        <span className="rct-win" aria-hidden="true">
          {Array.from({ length: PLACES }, (_, i) => {
            const p = PLACES - 1 - i;
            return (
              <span key={p} className="rct-pair">
                <span className="rct-col" data-on={p < shown || undefined}>
                  <span
                    className="rct-strip"
                    ref={(el) => {
                      strips.current[p] = el;
                    }}
                    style={{
                      transform: `translateY(${-round10(Math.floor(first / 10 ** p)) * dim.cell}px)`,
                    }}
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, j) => (
                      <span key={j}>{d}</span>
                    ))}
                  </span>
                </span>
                {p === 3 && (
                  <span className="rct-sep" data-on={shown > 3 || undefined}>
                    ,
                  </span>
                )}
              </span>
            );
          })}
        </span>
      </div>

      <button
        ref={plus}
        type="button"
        className="rct-btn"
        aria-label="Increase"
        disabled={atMax}
        onPointerDown={(e) => {
          if (e.button === 0) press(1);
        }}
        onPointerUp={release}
        onPointerLeave={release}
        onPointerCancel={release}
        onClick={onKeyClick(1)}
      >
        <Plus size={dim.icon} strokeWidth={2.2} aria-hidden="true" focusable="false" />
      </button>
    </div>
  );
}
