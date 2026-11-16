"use client";

// Adapted from interior.dev (MIT) — https://github.com/ddoemonn/interior
//
// useLogoMarquee is the upstream hook, untouched (it uses the "latest ref"
// pattern — refs written during render — hence the scoped eslint-disable
// around it). Only the styled layer below it was re-skinned for Sartorial:
// no card, no edge gradients; items inherit colour and type from the parent.
//
// One deliberate deviation from upstream, in the styled layer only: the static
// reduced-motion layout is switched on after hydration rather than during it,
// so the first client render matches the server HTML (see useHydrated below).

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useIsomorphicLayoutEffect, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

const RAMP = 0.19;
const SETTLE = 0.16;
const MAX_COPIES = 14;

export type MarqueeDirection = "left" | "right";

export type UseLogoMarqueeOptions = {
  speed?: number;
  direction?: MarqueeDirection;
  gap?: number;
  paused?: boolean;
};

function fold(x: number, loop: number) {
  const m = x % loop;
  return m > 0 ? m - loop : m;
}

function clamp(x: number, min: number, max: number) {
  return x < min ? min : x > max ? max : x;
}

/* eslint-disable react-hooks/refs, react-hooks/set-state-in-effect --
   upstream hook, kept verbatim (see the note at the top of this file) */
export function useLogoMarquee({
  speed = 44,
  direction = "left",
  gap = 40,
  paused = false,
}: UseLogoMarqueeOptions = {}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLUListElement>(null);

  const [copies, setCopies] = useState(4);
  const [held, setHeld] = useState(false);
  const [near, setNear] = useState(false);

  const reduced = useReducedMotion() === true;
  const stopped = held || paused;

  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  const movingRef = useRef(false);
  movingRef.current = !stopped && !reduced;

  const offset = useRef(0);
  const nudge = useRef(0);
  const rate = useRef(0);
  const span = useRef(0);

  const paint = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const x = reducedRef.current ? 0 : offset.current - span.current;
    track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
  }, []);

  useIsomorphicLayoutEffect(() => {
    const viewport = viewportRef.current;
    const group = groupRef.current;
    if (!viewport || !group) return;

    const measure = () => {
      const width = group.getBoundingClientRect().width;
      const loop = width > 0 ? width + gap : 0;
      const room = viewport.getBoundingClientRect().width;
      span.current = loop;
      offset.current = loop > 0 ? clamp(offset.current, -loop, loop) : 0;
      paint();

      const next =
        reduced || loop <= 0
          ? 4
          : clamp(Math.ceil(room / loop) + 3, 4, MAX_COPIES);
      setCopies((prev) => (prev === next ? prev : next));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(group);
    return () => observer.disconnect();
  }, [gap, paint, reduced]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (entry) setNear(entry.isIntersecting);
      },
      { rootMargin: "96px" },
    );
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || !near) return;

    let frame = 0;
    let last = 0;
    const sign = direction === "right" ? 1 : -1;

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);

      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;

      const loop = span.current;
      if (loop <= 0) return;

      rate.current +=
        ((movingRef.current ? 1 : 0) - rate.current) * (1 - Math.exp(-dt / RAMP));

      const pull = nudge.current * (1 - Math.exp(-dt / SETTLE));
      nudge.current -= pull;

      let x = offset.current + sign * speed * rate.current * dt + pull;
      if (rate.current > 0.002 && Math.abs(nudge.current) < 0.25) {
        nudge.current = 0;
        x = fold(x, loop);
      } else {
        x = clamp(x, -loop, loop);
      }

      offset.current = x;
      paint();
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduced, near, speed, direction, paint]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const pin = () => {
      if (reducedRef.current) return;
      if (viewport.scrollLeft !== 0) viewport.scrollLeft = 0;
      if (viewport.scrollTop !== 0) viewport.scrollTop = 0;
    };

    viewport.addEventListener("scroll", pin, { passive: true });
    return () => viewport.removeEventListener("scroll", pin);
  }, []);

  useEffect(() => {
    const release = () => setHeld(false);
    window.addEventListener("blur", release);
    return () => window.removeEventListener("blur", release);
  }, []);

  const reveal = useCallback((node: HTMLElement) => {
    const viewport = viewportRef.current;
    const loop = span.current;
    if (!viewport || reducedRef.current || loop <= 0) return;
    if (node === viewport) return;

    const view = viewport.getBoundingClientRect();
    const box = node.getBoundingClientRect();
    const pad = 12;

    let delta = 0;
    if (box.left < view.left + pad) delta = view.left + pad - box.left;
    else if (box.right > view.right - pad) delta = view.right - pad - box.right;
    if (delta === 0) return;

    const target = clamp(offset.current + nudge.current + delta, -loop, loop);
    nudge.current = target - offset.current;
  }, []);

  const bind = {
    onPointerEnter: (e: React.PointerEvent) => {
      if (e.pointerType !== "touch") setHeld(true);
    },
    onPointerDown: () => setHeld(true),
    onPointerUp: (e: React.PointerEvent) => {
      if (e.pointerType === "touch") setHeld(false);
    },
    onPointerCancel: () => setHeld(false),
    onPointerLeave: () => setHeld(false),
    onFocus: (e: React.FocusEvent) => {
      setHeld(true);
      reveal(e.target as HTMLElement);
    },
    onBlur: () => setHeld(false),
  };

  return {
    viewportRef,
    trackRef,
    groupRef,
    copies,
    paused: stopped,
    reduced,
    bind,
  };
}
/* eslint-enable react-hooks/refs, react-hooks/set-state-in-effect */

export type LogoMarqueeItem = {
  /** stable key */
  id: string;
  /** accessible name; also what is drawn when there is no `mark` */
  label: string;
  /** renders the item as a link */
  href?: string;
  /** anything drawable — a logo, an icon + text, styled text. Drawn instead of
      `label`, which then becomes the screen-reader text. */
  mark?: React.ReactNode;
};

export type LogoMarqueeClassNames = {
  viewport?: string;
  track?: string;
  /** each <li> */
  item?: string;
  /** the span / link / button inside each <li> */
  face?: string;
  separator?: string;
};

export type LogoMarqueeProps = {
  items: LogoMarqueeItem[];
  label?: string;
  speed?: number;
  direction?: MarqueeDirection;
  gap?: number;
  paused?: boolean;
  onSelect?: (item: LogoMarqueeItem) => void;
  /** drawn after every item (aria-hidden), one `gap` away from it — e.g. "·" */
  separator?: React.ReactNode;
  /** width in px of a soft fade at both edges (a mask, so it works on any
      background). 0 = hard edge. */
  fade?: number;
  className?: string;
  classNames?: LogoMarqueeClassNames;
};

const FACE = "inline-flex shrink-0 items-center gap-2 whitespace-nowrap";

/* Links / buttons: the strip clips its overflow, so the focus outline is drawn
   inside the hit box (which is 8px wider than the text on both sides without
   taking any extra room in the row). */
const HIT =
  "-mx-2 px-2 outline-offset-[-1.5px]! transition-opacity duration-200 hover:opacity-60";

function face(item: LogoMarqueeItem) {
  if (!item.mark) return item.label;
  return (
    <>
      <span aria-hidden className="inline-flex items-center gap-2">
        {item.mark}
      </span>
      <span className="sr-only">{item.label}</span>
    </>
  );
}

const subscribeNever = () => () => {};

/* false on the server and while hydrating, true from then on (and from the
   first render when the component mounts on the client). */
function useHydrated() {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
}

export function LogoMarquee({
  items,
  label = "Logos",
  speed = 44,
  direction = "left",
  gap = 40,
  paused = false,
  onSelect,
  separator,
  fade = 0,
  className = "",
  classNames,
}: LogoMarqueeProps) {
  const { viewportRef, trackRef, groupRef, copies, reduced, bind } =
    useLogoMarquee({ speed, direction, gap, paused });

  // Deviation from upstream: the server cannot know about prefers-reduced-motion
  // and always renders the moving layout (several groups). Upstream switched to
  // the single static row during the first client render, which made React
  // throw away the server HTML ("hydration failed") for every reduced-motion
  // visitor. Waiting until hydration is over keeps the markup identical; the
  // strip itself never moves in the meantime, the hook sees to that.
  const hydrated = useHydrated();
  const flat = reduced && hydrated;

  const groups = flat ? 1 : copies;
  const live = flat ? 0 : 1;

  const mask =
    fade > 0
      ? `linear-gradient(to right, transparent, #000 ${fade}px, #000 calc(100% - ${fade}px), transparent)`
      : undefined;

  const faceClass = cn(FACE, classNames?.face);
  const hitClass = cn(FACE, HIT, classNames?.face);

  return (
    <section
      aria-label={label}
      style={mask ? { maskImage: mask, WebkitMaskImage: mask } : undefined}
      className={cn("relative isolate w-full min-w-0 max-w-full overflow-hidden", className)}
      {...bind}
    >
      <div
        ref={viewportRef}
        tabIndex={flat ? 0 : undefined}
        style={{ overflowX: flat ? "auto" : "hidden" }}
        className={cn("overflow-y-hidden", classNames?.viewport)}
      >
        <div
          ref={trackRef}
          style={{ gap, willChange: "transform" }}
          className={cn("flex w-max items-center", classNames?.track)}
        >
          {Array.from({ length: groups }, (_, copy) => (
            <ul
              key={copy}
              ref={copy === live ? groupRef : undefined}
              aria-hidden={copy === live ? undefined : true}
              style={{ gap }}
              className="flex w-max items-center"
            >
              {items.map((item) => (
                <li
                  key={item.id}
                  style={separator != null ? { gap } : undefined}
                  className={cn("flex shrink-0 items-center", classNames?.item)}
                >
                  {copy !== live ? (
                    <span className={faceClass}>{item.mark ?? item.label}</span>
                  ) : item.href ? (
                    <a href={item.href} className={hitClass}>
                      {face(item)}
                    </a>
                  ) : onSelect ? (
                    <button
                      type="button"
                      onClick={() => onSelect(item)}
                      className={hitClass}
                    >
                      {face(item)}
                    </button>
                  ) : (
                    <span className={faceClass}>{face(item)}</span>
                  )}
                  {separator != null ? (
                    <span aria-hidden className={cn("shrink-0", classNames?.separator)}>
                      {separator}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
