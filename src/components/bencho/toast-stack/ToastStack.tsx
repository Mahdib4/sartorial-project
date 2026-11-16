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
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import "./ToastStack.css";

/* ══ Toast stack ══════════════════════════════════════════
   Adapted from Bencho (blocks/toast-stack, MIT — see
   ../LICENSE.md). Up to three toasts: the newest in front,
   the ones before it tucked behind with a sliver of each
   showing above it, a step smaller each and a barely-there
   grey. Point at the stack and it fans out into a list; move
   away and it gathers back up.

   ── ONE SPRING, THREE PLACES ────────────────────────────
   A toast's place is worked out from how far back it is and
   whether the stack is open, and Framer springs it there.
   Opening, closing, a toast leaving and the next arriving are
   all the same move — every toast heading for its new place on
   the same spring, a touch under critical so it settles with a
   hint of give.

   ── HOVER IS THE WHOLE LIST, NOT THE TOASTS ─────────────
   Hovering the toasts themselves would let the list slide out
   from under the pointer and close again — there is air
   between them once they are apart. So a pad the size of
   whatever is on show sits behind them, and being over the pad
   is being over the list. Pointer over/out with a containment
   test rather than enter/leave, because the pad and the toasts
   are siblings and the handlers live on their parent.

   What changed from the Bencho demo: the toasts are the
   PARENT's (`toasts`, newest first, and `onDismiss`); nothing
   refills itself. Each can carry a thumbnail and a link. The
   stack hangs from its BOTTOM edge and opens upward, so the
   front toast never moves under the pointer — it is meant to be
   pinned to the foot of the screen by whoever places it. */

export type Shot = { src: string; alt: string; srcSet?: string; sizes?: string };

export type ToastItem = {
  id: string;
  title: string;
  body?: string;
  /** a 44 × 56 thumbnail at the left */
  image?: Shot;
  /** with `actionLabel`, a link at the right */
  href?: string;
  actionLabel?: string;
};

export type ToastStackProps = {
  /** newest first. At most three are drawn; the rest are ignored */
  toasts: ToastItem[];
  /** asked for when a toast's × is pressed, once it has slid away */
  onDismiss: (id: string) => void;
  /** told when a toast's link is followed, so the parent can clear it */
  onAction?: (id: string) => void;
  /** how much of each tucked toast shows, px (6..24) */
  peek?: number;
  /** the space between toasts once fanned out, px (4..20) */
  gap?: number;
  /** a toast's corner, px (0..32) */
  corner?: number;
  /** the accessible name of the region */
  label?: string;
  className?: string;
};

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

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/* a toast's height: the 56px thumbnail and 8px above and below it */
const H = 72;
const SHOWN = 3;
/* how long a dismissed toast takes to slide away */
const OUT = 220;
/* a touch under critical: it settles with a hint of give, no wobble */
const SPRING = { type: "spring", stiffness: 380, damping: 34, mass: 1 } as const;
const AWAY = { duration: OUT / 1000, ease: [0.4, 0, 1, 1] } as const;
const NOW = { duration: 0 } as const;

export function ToastStack({
  toasts,
  onDismiss,
  onAction,
  peek = 14,
  gap = 10,
  corner = 0,
  label = "Notifications",
  className,
}: ToastStackProps) {
  /* front first */
  const stack = toasts.slice(0, SHOWN);
  const m = stack.length;
  const still = useStill();

  /* the one sliding out under its own × */
  const [leaving, setLeaving] = useState<string | null>(null);
  const [hover, setHover] = useState(false);
  /* with nothing on show there is nothing to be over, and no
     pointer-out will ever say so */
  if (m === 0 && hover) setHover(false);
  const open = hover && m > 0;

  const root = useRef<HTMLDivElement | null>(null);
  const timer = useRef(0);
  const tell = useRef(onDismiss);
  useEffect(() => {
    tell.current = onDismiss;
  });
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const pk = clamp(peek, 6, 24);
  const gp = clamp(gap, 4, 20);
  /* what is on show, measured up from the foot of the block */
  const listH = m * H + Math.max(0, m - 1) * gp;
  const stackH = m ? H + (m - 1) * pk : 0;

  /* where the toast k places back sits, as a rise from the foot */
  const place = (k: number) => {
    if (open) {
      /* the list: front at the bottom, the rest above it */
      return { y: -k * (H + gp), scale: 1 };
    }
    /* the stack: front at the bottom, each one behind a peek higher
       and a step smaller, hanging from its top edge */
    const d = Math.min(k, SHOWN - 1);
    return { y: -d * pk, scale: 1 - d * 0.05 };
  };

  const dismiss = (id: string) => {
    if (leaving !== null) return;
    if (still) {
      tell.current(id);
      return;
    }
    /* it slides away first, and is only then handed back — so the
       ones behind it step forward into a place that is empty */
    setLeaving(id);
    timer.current = window.setTimeout(() => {
      setLeaving(null);
      tell.current(id);
    }, OUT);
  };

  return (
    <div
      ref={root}
      className={className ? `tst ${className}` : "tst"}
      role="status"
      aria-live="polite"
      aria-atomic="false"
      aria-relevant="additions text"
      aria-label={label}
      data-open={open || undefined}
      style={{ height: stackH, "--tst-r": `${clamp(corner, 0, 32)}px` } as CSSProperties}
      onPointerOver={() => {
        if (m > 0) setHover(true);
      }}
      onPointerOut={(e: PointerEvent<HTMLDivElement>) => {
        const to = e.relatedTarget as Node | null;
        if (!to || !root.current?.contains(to)) setHover(false);
      }}
      onFocus={() => setHover(true)}
      onBlur={(e: FocusEvent<HTMLDivElement>) => {
        if (!root.current?.contains(e.relatedTarget as Node | null)) setHover(false);
      }}
    >
      {/* what you have to be over for the list to stay apart: the
          stack's own footprint when shut, the whole list when open */}
      <span className="tst-hit" aria-hidden="true" style={{ height: open ? listH : stackH }} />

      <AnimatePresence initial={false}>
        {stack.map((t, k) => {
          const out = leaving === t.id;
          const p = place(k);
          const front = k === 0;
          const reach = open || front ? 0 : -1;
          return (
            <motion.div
              key={t.id}
              className="tst-toast"
              data-front={front || undefined}
              data-thumb={t.image ? "" : undefined}
              style={{ height: H, zIndex: SHOWN - k }}
              /* a new one rises in from below the front */
              initial={{ y: 24, scale: 1, opacity: 0, x: 0 }}
              animate={
                out
                  ? { y: p.y, scale: p.scale, opacity: 0, x: 60 }
                  : { y: p.y, scale: p.scale, opacity: 1, x: 0 }
              }
              /* gone from the list: one dismissed has already slid
                 away, one pushed out of the back simply fades */
              exit={{ opacity: 0, transition: still ? NOW : AWAY }}
              transition={still ? NOW : out ? AWAY : SPRING}
              aria-hidden={!open && !front ? true : undefined}
            >
              {t.image ? (
                <img
                  className="tst-thumb"
                  src={t.image.src}
                  srcSet={t.image.srcSet}
                  sizes={t.image.sizes ?? "44px"}
                  alt={t.image.alt}
                  width={44}
                  height={56}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
              ) : null}
              <span className="tst-text">
                <b>{t.title}</b>
                {t.body ? <span>{t.body}</span> : null}
              </span>
              {t.href && t.actionLabel ? (
                <Link
                  className="tst-act"
                  href={t.href}
                  tabIndex={reach}
                  onClick={() => onAction?.(t.id)}
                >
                  {t.actionLabel}
                </Link>
              ) : null}
              <button
                type="button"
                className="tst-x"
                aria-label={`Dismiss: ${t.title}`}
                tabIndex={reach}
                onClick={() => dismiss(t.id)}
              >
                <X size={16} strokeWidth={2} aria-hidden="true" focusable="false" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
