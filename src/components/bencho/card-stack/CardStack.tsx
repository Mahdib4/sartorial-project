"use client";

/* Plain <img> on purpose: the caller hands over src / srcSet / sizes and
   the crop is the block's own (object-fit: cover). */
/* eslint-disable @next/next/no-img-element */

import {
  type CSSProperties,
  type FocusEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import "./CardStack.css";

/* ══ Card stack ════════════════════════════════════════════
   Adapted from Bencho (blocks/card-stack, MIT — see
   ../LICENSE.md). A short pile of photographs that fans out
   when you go near it and packs itself away when you leave.
   Hover (or focus) a card to draw it up, press one to flip it
   into the middle, press anywhere else or Escape to put it
   back on top.

   ── IT IS ONE ROTATION PER CARD, AND NOTHING ELSE ─────────
   There is one number per card: the angle it is turned to.
   The pivot is a point well BELOW the pile, outside the block,
   and `transform-origin` puts it there — so the sideways
   travel, the arc that drops the outer cards lower than the
   middle one, and the tilt are all the same rotation. The fan
   cannot come apart, because there is nothing to come apart.

   ── AND THE SCATTER IS SEEDED, NOT RANDOM ─────────────────
   From a table written down here rather than from
   Math.random: several copies on one page must not each sit at
   a different angle, and a number nobody chose cannot be
   tuned.

   What changed from the Bencho demo: the photographs are a
   prop (`images`, which also sets how many cards there are);
   the cards are real buttons, so a keyboard can open the fan
   and take a card out; and every length is a multiple of one
   CSS unit (--stk-u) so the block scales with its container
   instead of being a fixed 472 × 328. */

export type Shot = { src: string; alt: string; srcSet?: string; sizes?: string };

export type CardStackProps = {
  /** 3–6 photographs, the first on top of the pile. Fewer than three are
      repeated to make a pile; anything past the sixth is ignored */
  images: Shot[];
  /** how wide the fan opens, 0..100 */
  spread?: number;
  /** the spring, 0..100 */
  bounce?: number;
  /** how much the pile and the fan disagree with themselves, 0..100 */
  scatter?: number;
  /** the card's corner, px; the card in view keeps the same roundness, scaled */
  corner?: number;
  className?: string;
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const rad = (deg: number) => (deg * Math.PI) / 180;

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

/* ── the card, and everything is measured off it ───────────
   A 3:4 rectangle, which is the proportion of nearly every
   card anybody has held. Change these two and the stage, the
   pivot's reach and the block's own box all follow. */
const CARD_W = 156;
const CARD_H = 208;

/* ── how far below the pile the hand is ────────────────────
   The whole geometry of the fan is this one distance. Short,
   and the cards swing wide for very little rotation — they
   read as sliding sideways. Long, and they rotate on the spot
   without ever separating. */
const PIVOT = 260;

/* the widest the fan ever opens, corner to corner in degrees.
   Spread is a window on this, never the whole of it. */
const ARC = 40;

/* ── the loosest the pile ever sits ────────────────────────
   Scatter at 100: five degrees off square and seven units off
   centre — a deck put down in a hurry, not a deck dropped. */
const SHUT_ROT = 5;
const SHUT_OFF = 7;

/* ── and the same disagreement in the OPEN fan ─────────────
   A SHARE OF THE STEP, not a number of degrees, so the cards
   cannot cross at any spread. */
const RAGGED = 0.22;

/* how much of the fan the SHUT pile already shows: the resting
   pile is the same fan held nearly closed, so opening is that
   fan carrying on rather than a squared pile changing into one */
const REST = 0.4;

/* how far each card behind the front one peeks out of the top
   of the pile, and how much smaller it is drawn */
const DEEP = 5;
const SINK = 0.016;

/* how far the card under the pointer slides out of the fan,
   along its own axis — the way a card is drawn from a hand */
const LIFT = 20;

/* the beat between one card and the next */
const BEAT = 55;

/* the most cards the fan is ever asked to hold. Six springs
   are built whatever the count says, because a hook cannot be
   drawn conditionally. */
const MAX = 6;

/* ── the disagreement, written down ────────────────────────
   Five columns per card, all in -1..1, all multiplied by
   Scatter before they reach anything: how far off square it
   sits in the pile, how far off centre in each axis, how late
   it is out of the pile, and how much livelier or heavier its
   own spring is than the knob says. */
const SEED = [
  { rot: -0.62, dx: 0.41, dy: -0.28, beat: 0.34, tune: -0.22 },
  { rot: 0.83, dx: -0.55, dy: 0.36, beat: -0.47, tune: 0.31 },
  { rot: -0.24, dx: 0.68, dy: 0.52, beat: 0.71, tune: -0.44 },
  { rot: 0.47, dx: -0.31, dy: -0.63, beat: -0.18, tune: 0.58 },
  { rot: -0.91, dx: -0.72, dy: 0.19, beat: 0.52, tune: -0.36 },
  { rot: 0.36, dx: 0.24, dy: -0.47, beat: -0.66, tune: 0.27 },
];

/* ── the room the block keeps, and it is ARITHMETIC ────────
   The box has to contain the widest thing this block can ever
   draw. `MOST` is that: half the widest arc, plus the
   raggedness that sits on top of it. Everything below falls
   out of it and out of the card's own size. */
const MOST = (ARC / 2) * (1 + RAGGED);
const SWING = PIVOT * Math.sin(rad(MOST));
const DROP = PIVOT * (1 - Math.cos(rad(MOST)));
const EXT_X = (CARD_W * Math.cos(rad(MOST)) + CARD_H * Math.sin(rad(MOST))) / 2;
const EXT_Y = (CARD_W * Math.sin(rad(MOST)) + CARD_H * Math.cos(rad(MOST))) / 2;
const JIT =
  SHUT_OFF + (CARD_W * Math.sin(rad(SHUT_ROT)) + CARD_H * (1 - Math.cos(rad(SHUT_ROT)))) / 2;
const PILE = (MAX - 1) * DEEP;

/* 472 × 328 with the numbers above */
const STAGE_W = Math.ceil((SWING + EXT_X + JIT) * 2);
const ABOVE = Math.max(CARD_H / 2 + PILE, EXT_Y - DROP) + LIFT + JIT;
const BELOW = Math.max(CARD_H / 2, EXT_Y + DROP) + JIT;
const STAGE_H = Math.ceil(ABOVE + BELOW);

/* ── a card taken out to look at ───────────────────────────
   It is ONE element flying, not the card restyled. The card
   stays where it is, hidden, so the fan's springs and the lift
   never meet the flight; the flyer starts on the card's own
   centre, angle and size and ends square in the middle. A face
   on each side, both the photograph, so the turn reads as a
   card being flipped over rather than a picture spinning.
   Sized to the stage, never past it. */
const VIEW_H = STAGE_H - 24;
const VIEW_W = Math.round((VIEW_H * CARD_W) / CARD_H);
const VIEW_IN = 920;
const VIEW_OUT = 660;
/* the most the card in view leans under the pointer, at its edge */
const TILT = 6;
/* the pose at rest in the middle: turned over once, full size */
const VIEW_AT = "perspective(2000px) translate(0px, 0px) rotate(0deg) rotateY(180deg) scale(1)";

/* the fan's own air, round the footprint that keeps it open */
const PAD = 14;

/* ── every length is a multiple of ONE unit ────────────────
   The numbers above are the block at its drawn size, where the
   unit is a pixel. --stk-u is the container's width divided by
   the stage's (see CardStack.css), so the same arithmetic draws
   the block at whatever width it is given. */
const unit = (n: number) => `calc(var(--stk-u) * ${n.toFixed(3)})`;

export function CardStack({
  images,
  spread = 85,
  bounce = 5,
  scatter = 0,
  corner = 0,
  className,
}: CardStackProps) {
  const shots = images.slice(0, MAX);
  const n = clamp(shots.length, 3, MAX);
  const sc = clamp(scatter, 0, 100) / 100;
  const still = useStill();

  /* `on` is the pointer (or the focus). `lit` is what each spring
     is aiming at, which is the same thing a moment later — and
     the moment is the cascade. */
  const [hover, setHover] = useState(false);
  const [focused, setFocused] = useState(false);
  const [lit, setLit] = useState<boolean[]>(() => Array<boolean>(MAX).fill(false));
  /* which card the pointer is actually over, by slot. Null
     rather than -1 so "none" cannot be confused with a card. */
  const [near, setNear] = useState<number | null>(null);

  /* the card being looked at — by its id, not its slot, since it
     comes back to a different slot — and the pose it left from */
  const [view, setView] = useState<{ id: number; from: string } | null>(null);
  /* the fan stays out while a card is in view, wherever the
     pointer goes; it folds once the card is home and nobody is
     over the deck */
  const on = hover || focused || !!view;
  /* the order of the deck, top first, as card ids (a photograph
     each, images[id % length]). A card looked at goes back on TOP,
     so this changes; slot i shows deck[n - 1 - i] */
  const [deck, setDeck] = useState<number[]>(() => Array.from({ length: MAX }, (_, k) => k));
  /* while the others shift down a slot to make room on top, their
     transforms glide rather than jump (see .stk[data-shuffle]) */
  const [shuffle, setShuffle] = useState(false);

  const root = useRef<HTMLDivElement | null>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const faces = useRef<(HTMLSpanElement | null)[]>([]);
  const flyer = useRef<HTMLSpanElement | null>(null);
  const tilt = useRef<HTMLSpanElement | null>(null);
  const closing = useRef(false);
  /* a card taken out from the keyboard gets the focus, and gives
     it back to the top of the deck when it goes home */
  const keyed = useRef(false);
  const refocus = useRef(false);

  useEffect(() => {
    const timers: number[] = [];
    const gap = still ? 0 : BEAT;
    for (let i = 0; i < MAX; i += 1) {
      /* ── out in front, home last ──────────────────────────
         Opening runs from the top of the pile down, so the
         card you can actually see is the one that leads; and
         closing runs the other way, so that same card is the
         last thing to land. Which is what a pile IS: the top
         card is on top because it arrived last. */
      const place = on ? n - 1 - i : i;
      const wait = Math.max(0, gap * (place + SEED[i].beat * sc * 0.6));
      timers.push(
        window.setTimeout(() => {
          setLit((prev) => {
            if (prev[i] === on) return prev;
            const next = [...prev];
            next[i] = on;
            return next;
          });
        }, wait),
      );
    }
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [on, n, sc, still]);

  /* Six, always, whatever the count says: a hook cannot be drawn
     conditionally, and a spring nobody reads costs a number
     that never moves. Each one is a little livelier or heavier
     than the knob asks for — see SEED — which is what stops
     six cards arriving on the same frame. */
  const tune = (i: number) => clamp(bounce * (1 + SEED[i].tune * sc * 0.45), 0, 100);
  const s0 = useSpring(lit[0] ? 100 : 0, tune(0), still);
  const s1 = useSpring(lit[1] ? 100 : 0, tune(1), still);
  const s2 = useSpring(lit[2] ? 100 : 0, tune(2), still);
  const s3 = useSpring(lit[3] ? 100 : 0, tune(3), still);
  const s4 = useSpring(lit[4] ? 100 : 0, tune(4), still);
  const s5 = useSpring(lit[5] ? 100 : 0, tune(5), still);
  const at = [s0, s1, s2, s3, s4, s5];

  /* ── the fan is a WIDTH, not a gap between cards ───────────
     Spread sets the whole arc and the cards divide it, so more
     cards pack into the same fan instead of growing the block.
     And the floor is 10 degrees rather than 0: a deck squaring
     itself up and just showing its edges. */
  const arc = 10 + (clamp(spread, 0, 100) / 100) * (ARC - 10);
  const step = arc / (n - 1);

  /* ── where every card is, worked out once ──────────────────
     One rotation each, somewhere between where it sits shut and
     where it sits open, on its own spring. The handlers below
     read it too: the flight starts from exactly where the card
     is drawn. */
  const slots = Array.from({ length: n }, (_, i) => {
    const t = at[i] / 100;
    /* 0 at the back of the pile, n-1 on top */
    const back = n - 1 - i;
    const c = i - (n - 1) / 2;
    const openRot = c * step + SEED[i].rot * sc * RAGGED * step;
    const shutRot = c * step * REST + SEED[i].rot * sc * SHUT_ROT * 0.6;
    const shutX = SEED[i].dx * sc * SHUT_OFF;
    const shutY = -back * DEEP + SEED[i].dy * sc * SHUT_OFF;
    return {
      id: deck[back],
      rot: mix(shutRot, openRot, t),
      /* the recession is gone by the time the fan is open,
         because six cards side by side are six of the same card */
      recede: 1 - back * SINK * (1 - t),
      x: mix(shutX, 0, t),
      y: mix(shutY, 0, t),
    };
  });

  /* ── the open fan's own footprint, and a little air ────────
     What you have to stay inside for the fan to stay open: the
     end cards' outer corners, the lifted card's top, the arc's
     drop below, plus PAD all round. Cards overlap, so there is
     no gap inside it to fall through. */
  const half = rad((arc / 2) * (1 + RAGGED * sc));
  const fanX = PIVOT * Math.sin(half) + (CARD_W * Math.cos(half) + CARD_H * Math.sin(half)) / 2;
  const fanTop = ABOVE - CARD_H / 2 - LIFT;
  const fanBottom =
    ABOVE +
    (CARD_W * Math.sin(half) + CARD_H * Math.cos(half)) / 2 +
    PIVOT * (1 - Math.cos(half));
  const pad = on
    ? {
        left: STAGE_W / 2 - fanX - PAD,
        top: fanTop - PAD,
        width: (fanX + PAD) * 2,
        height: fanBottom - fanTop + PAD * 2,
      }
    : {
        left: (STAGE_W - CARD_W) / 2 - 10,
        top: ABOVE - CARD_H / 2 - PILE - 10,
        width: CARD_W + 20,
        height: CARD_H + PILE + 20,
      };

  const shotOf = (id: number): Shot | undefined => shots[id % Math.max(1, shots.length)];

  /* where slot i is now, as a transform on the flyer: its centre
     read off the screen (a rotated box keeps its centre), in real
     pixels from the middle of the stage */
  const poseOf = (i: number) => {
    const r = root.current?.getBoundingClientRect();
    const f = faces.current[i]?.getBoundingClientRect();
    const p = slots[i];
    if (!r || !f || !p || !r.width) return VIEW_AT;
    const dx = f.left + f.width / 2 - (r.left + r.width / 2);
    const dy = f.top + f.height / 2 - (r.top + r.height / 2);
    const s = (CARD_W / VIEW_W) * p.recede;
    return `perspective(2000px) translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) rotate(${p.rot.toFixed(3)}deg) rotateY(0deg) scale(${s.toFixed(4)})`;
  };

  const open = (i: number, fromKeys: boolean) => {
    if (view || !slots[i]) return;
    closing.current = false;
    keyed.current = fromKeys;
    setView({ id: slots[i].id, from: poseOf(i) });
  };

  /* home is the TOP of the deck: the front slot's pose is read
     before the deck reorders (that slot is at rest — the fan is
     held open and nothing is lifted), then the card goes on top
     and the ones it passed slide down a slot while it flies in */
  const close = () => {
    const el = flyer.current;
    if (!view || closing.current) return;
    closing.current = true;
    /* level again on the way home */
    if (tilt.current) tilt.current.style.transform = "";
    const home = poseOf(n - 1);
    const moved = deck[0] !== view.id;
    setDeck([view.id, ...deck.filter((d) => d !== view.id)]);
    if (moved) setShuffle(true);
    const done = () => {
      refocus.current = keyed.current;
      setView(null);
      setShuffle(false);
    };
    if (!el || still) {
      done();
      return;
    }
    const back = el.animate([{ transform: VIEW_AT }, { transform: home }], {
      duration: VIEW_OUT,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      fill: "forwards",
    });
    back.onfinish = done;
  };

  /* the listeners below outlive a render; they call whichever
     `close` is current */
  const closeNow = useRef(close);
  useEffect(() => {
    closeNow.current = close;
  });

  /* the flight in, the moment the flyer exists */
  useLayoutEffect(() => {
    const el = flyer.current;
    if (!view || !el) return;
    el.animate([{ transform: view.from }, { transform: VIEW_AT }], {
      duration: still ? 1 : VIEW_IN,
      easing: still ? "linear" : "cubic-bezier(0.25, 0.8, 0.25, 1)",
      fill: "both",
    });
    if (keyed.current) el.focus({ preventScroll: true });
  }, [view, still]);

  /* a press anywhere but the card in view puts it back, and so
     does Escape. Trusted presses only: a scripted pointer aimed
     somewhere else on the page must not shut this one */
  const viewing = !!view;
  useEffect(() => {
    if (!viewing) return;
    const down = (e: PointerEvent) => {
      if (!e.isTrusted) return;
      if (flyer.current?.contains(e.target as Node)) return;
      closeNow.current();
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeNow.current();
    };
    document.addEventListener("pointerdown", down, true);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", down, true);
      document.removeEventListener("keydown", key);
    };
  }, [viewing]);

  /* home again: the card is the top of the deck now, and that is
     where a keyboard's focus goes back to */
  useEffect(() => {
    if (viewing || !refocus.current) return;
    refocus.current = false;
    cards.current[n - 1]?.focus({ preventScroll: true });
  }, [viewing, n]);

  if (shots.length === 0) return null;

  const r = clamp(corner, 0, CARD_W / 2);
  const inView = view ? shotOf(view.id) : undefined;

  return (
    <div className={className ? `stk-fit ${className}` : "stk-fit"}>
      <div
        ref={root}
        className="stk"
        data-viewing={view ? "" : undefined}
        data-shuffle={shuffle ? "" : undefined}
        style={
          {
            "--stk-w": STAGE_W,
            width: unit(STAGE_W),
            height: unit(STAGE_H),
            "--stk-lift": unit(LIFT),
            "--stk-r": unit(r),
            "--stk-vr": unit((r * VIEW_W) / CARD_W),
            /* the lift rides a CSS transition rather than a spring
               of its own: a separate element and a separate
               property — `translate`, not `transform` — so the two
               cannot meet. A soft ease with no overshoot, so the
               card is drawn from the fan rather than jumping out. */
            "--stk-ease": still ? "linear" : "cubic-bezier(0.4, 0, 0.2, 1)",
          } as CSSProperties
        }
        /* ── `over`/`out`, not `enter`/`leave` ────────────────
           Most of this box is air the fan has not reached yet,
           and air must not open anything — so the wrapper takes
           no pointer events at all and the two things inside it
           that are real, the hit pad and the cards, take them
           back. Which means the handlers have to be on an event
           that BUBBLES from those children; the containment test
           is what turns `out` back into `leave`. */
        onPointerOver={() => {
          if (!hover) setHover(true);
        }}
        onPointerOut={(e: ReactPointerEvent<HTMLDivElement>) => {
          const to = e.relatedTarget as Node | null;
          if (to && e.currentTarget.contains(to)) return;
          setHover(false);
          setNear(null);
        }}
        onPointerCancel={() => {
          setHover(false);
          setNear(null);
        }}
        /* a keyboard on the deck holds the fan open the way a pointer does */
        onFocus={() => setFocused(true)}
        onBlur={(e: FocusEvent<HTMLDivElement>) => {
          const to = e.relatedTarget as Node | null;
          if (to && e.currentTarget.contains(to)) return;
          setFocused(false);
          if (!hover) setNear(null);
        }}
      >
        {/* ── what you have to be touching ─────────────────────
            Shut, it is the pile and a little air round it, so the
            block opens when you reach the cards rather than when
            you enter the tile. Open, it is the fan's footprint, so
            crossing the fan never falls through a gap between two
            cards and folds the thing away under your cursor.

            Behind the cards, so being over it is the definition of
            not being over one — which is what says NO card is being
            drawn. */}
        <span
          className="stk-hit"
          aria-hidden="true"
          onPointerOver={() => setNear(null)}
          style={{
            left: unit(pad.left),
            top: unit(pad.top),
            width: unit(pad.width),
            height: unit(pad.height),
          }}
        />

        {slots.map((slot, i) => {
          const shot = shotOf(slot.id);
          const lifted = on && near === i && !view;
          return (
            <button
              key={slot.id}
              ref={(el) => {
                cards.current[i] = el;
              }}
              type="button"
              className="stk-card"
              style={{
                left: unit((STAGE_W - CARD_W) / 2),
                top: unit(ABOVE - CARD_H / 2),
                width: unit(CARD_W),
                height: unit(CARD_H),
                /* the hand, well below the card's middle. Every
                   card turns about the same point, which is what
                   makes this a fan rather than six cards that
                   happen to be rotated. */
                transformOrigin: `50% ${unit(CARD_H / 2 + PIVOT)}`,
                /* rotate about that point, then nudge — so the
                   scatter is a real offset in the block's own
                   axes and not a second, tinier rotation */
                transform: `translate(${unit(slot.x)}, ${unit(slot.y)}) rotate(${slot.rot.toFixed(3)}deg)`,
                /* out of the deck while it is in view; it is still
                   measured, so the flight home finds its place */
                visibility: view?.id === slot.id ? "hidden" : undefined,
                /* ── AND THE LIFTED CARD DOES NOT COME FORWARD ─
                   In a fan every card overlaps the one to its
                   right, so bringing one forward would draw it
                   over the cards beside it. The lift is enough on
                   its own: the card slides out along its own axis
                   and clears the top edges of its neighbours by
                   exactly the distance it travelled. */
                zIndex: i,
              }}
              onPointerEnter={() => {
                if (near !== i) setNear(i);
              }}
              onFocus={() => {
                if (near !== i) setNear(i);
              }}
              /* on the press, not the click: a first press often
                 lands while the fan is still opening, the card
                 turns out from under the pointer before the
                 release, and a click needs both on the same
                 element */
              onPointerDown={(e) => {
                if (e.button === 0) open(i, false);
              }}
              /* a click that arrives with the card still in the deck had
                 no press behind it: a keyboard, or assistive tech */
              onClick={(e) => open(i, e.detail === 0)}
            >
              <span
                ref={(el) => {
                  faces.current[i] = el;
                }}
                className="stk-face"
                data-lift={lifted || undefined}
                /* the recession is on the FACE rather than on the
                   card: every transform in one declaration shares
                   one origin, and this card's origin is far below
                   it. `scale` is its own property, so it can sit
                   beside a transitioned `translate` without either
                   touching the other. */
                style={{ scale: slot.recede.toFixed(4) }}
              >
                {shot ? (
                  <img
                    className="stk-img"
                    src={shot.src}
                    srcSet={shot.srcSet}
                    sizes={shot.sizes}
                    alt={shot.alt}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                ) : null}
              </span>
            </button>
          );
        })}

        {view && inView && (
          <span
            ref={flyer}
            className="stk-view"
            role="img"
            tabIndex={-1}
            aria-label={`${inView.alt ? `${inView.alt}. ` : ""}Card in view; click outside or press Escape to put it back`}
            style={{
              left: unit((STAGE_W - VIEW_W) / 2),
              top: unit((STAGE_H - VIEW_H) / 2),
              width: unit(VIEW_W),
              height: unit(VIEW_H),
              transform: view.from,
            }}
            /* ── a slight tilt under the pointer ──────────────────
               The point you are over sinks away and the far side
               comes up (TILT degrees at the very edge). It is on an
               inner layer: the flyer's own transform belongs to the
               flight. Inside a card turned over (rotateY 180) the X
               axis runs backwards, so rotateX takes +ny. */
            onPointerMove={(e) => {
              const t = tilt.current;
              if (!t || closing.current || still) return;
              const b = e.currentTarget.getBoundingClientRect();
              const nx = clamp(((e.clientX - b.left) / b.width) * 2 - 1, -1, 1);
              const ny = clamp(((e.clientY - b.top) / b.height) * 2 - 1, -1, 1);
              t.style.transform = `rotateX(${(ny * TILT).toFixed(2)}deg) rotateY(${(nx * TILT).toFixed(2)}deg)`;
            }}
            onPointerLeave={() => {
              if (tilt.current) tilt.current.style.transform = "";
            }}
          >
            <span ref={tilt} className="stk-view-tilt">
              {/* a face each side, both the photograph; the flyer
                  itself carries the name, so these say nothing. Lazy
                  like every other picture here, and it costs nothing:
                  the deck has already loaded this file, and a picture
                  the page already holds is shown at once. */}
              <span className="stk-view-face">
                <img
                  className="stk-img"
                  src={inView.src}
                  srcSet={inView.srcSet}
                  sizes={inView.sizes}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
              </span>
              <span className="stk-view-face" data-back="">
                <img
                  className="stk-img"
                  src={inView.src}
                  srcSet={inView.srcSet}
                  sizes={inView.sizes}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
              </span>
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
