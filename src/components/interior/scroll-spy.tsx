"use client";

// Adapted from interior.dev (MIT) — https://github.com/ddoemonn/interior
//
// useScrollSpy is the upstream hook, untouched (it uses the "latest ref"
// pattern and reads `root.current` inside memoised callbacks, hence the scoped
// eslint-disable around it). The styled layer below it was re-skinned for
// Sartorial: a horizontal or vertical list of text links, the active one in
// ink with a sliding 1px ink marker.
//
// One deliberate deviation from upstream, in the styled layer only: keeping
// the active link in view scrolls the list itself instead of calling
// scrollIntoView(), which also scrolls the page whenever the nav is off-screen
// (including on first load).

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

const CELL = { type: "spring", stiffness: 520, damping: 34, mass: 0.45 } as const;
const SETTLE = 420;
const RELEASE = 900;

export type ScrollSpySection = {
  id: string;
  label: string;
};

export type UseScrollSpyOptions = {
  sections: ScrollSpySection[];
  offset?: number;
  root?: React.RefObject<HTMLElement | null>;
  onChange?: (id: string) => void;
};

/* eslint-disable react-hooks/refs, react-hooks/preserve-manual-memoization --
   upstream hook, kept verbatim (see the note at the top of this file) */
export function useScrollSpy({
  sections,
  offset = 96,
  root,
  onChange,
}: UseScrollSpyOptions) {
  const reduced = useReducedMotion();

  const [activeId, setActiveId] = useState(() => sections[0]?.id ?? "");
  const [announce, setAnnounce] = useState("");

  const list = useRef(sections);
  list.current = sections;
  const emit = useRef(onChange);
  emit.current = onChange;

  const frame = useRef(0);
  const lock = useRef<string | null>(null);
  const lockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const started = useRef(false);

  const key = sections.map((s) => s.id).join("|");

  const measure = useCallback(() => {
    const items = list.current;
    if (items.length === 0) return "";

    const container = root?.current ?? null;

    const viewport = container ? container.clientHeight : window.innerHeight;
    const top = container ? container.scrollTop : window.scrollY;
    const max = container
      ? container.scrollHeight - container.clientHeight
      : document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(1, Math.max(0, top / max)) : 1;

    const line =
      (container ? container.getBoundingClientRect().top : 0) +
      offset +
      ratio * Math.max(0, viewport - offset - 1);

    let current = "";
    let last = "";

    for (const item of items) {
      const node = document.getElementById(item.id);
      if (!node) continue;
      last = item.id;
      if (!current) current = item.id;
      if (node.getBoundingClientRect().top <= line + 1) current = item.id;
    }

    const atEnd = container
      ? container.scrollTop + container.clientHeight >= container.scrollHeight - 2
      : window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2;

    return atEnd && last ? last : current;
  }, [offset, root]);

  const release = useCallback(() => {
    lock.current = null;
    if (lockTimer.current) {
      clearTimeout(lockTimer.current);
      lockTimer.current = null;
    }
  }, []);

  const sync = useCallback(() => {
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const next = measure();
      if (!next) return;
      if (lock.current) {
        if (lock.current === next) release();
        return;
      }
      setActiveId((prev) => (prev === next ? prev : next));
    });
  }, [measure, release]);

  useEffect(() => {
    const container = root?.current ?? null;
    const scroller: EventTarget = container ?? window;
    const abandon = () => {
      if (lock.current) release();
    };

    scroller.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    window.addEventListener("wheel", abandon, { passive: true });
    window.addEventListener("touchstart", abandon, { passive: true });

    const observer = new ResizeObserver(sync);
    observer.observe(container ?? document.documentElement);
    for (const id of key ? key.split("|") : []) {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    }

    sync();

    return () => {
      scroller.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      window.removeEventListener("wheel", abandon);
      window.removeEventListener("touchstart", abandon);
      observer.disconnect();
      cancelAnimationFrame(frame.current);
      frame.current = 0;
      if (lockTimer.current) clearTimeout(lockTimer.current);
    };
  }, [sync, release, key, root]);

  useEffect(() => {
    if (!activeId) return;
    emit.current?.(activeId);

    if (!started.current) {
      started.current = true;
      return;
    }

    settleTimer.current = setTimeout(() => {
      const item = list.current.find((s) => s.id === activeId);
      setAnnounce(item ? item.label : "");
    }, SETTLE);

    return () => {
      if (settleTimer.current) clearTimeout(settleTimer.current);
    };
  }, [activeId]);

  const scrollTo = useCallback(
    (id: string) => {
      const node = document.getElementById(id);
      if (!node) return;

      lock.current = id;
      setActiveId(id);

      const container = root?.current ?? null;
      const behavior: ScrollBehavior = reduced ? "auto" : "smooth";
      const rect = node.getBoundingClientRect();

      const viewport = container ? container.clientHeight : window.innerHeight;
      const max = container
        ? Math.max(0, container.scrollHeight - container.clientHeight)
        : Math.max(
            0,
            document.documentElement.scrollHeight - window.innerHeight,
          );
      const H = container
        ? rect.top -
          container.getBoundingClientRect().top +
          container.scrollTop
        : rect.top + window.scrollY;
      const usable = Math.max(0, viewport - offset - 1);
      const top =
        max > 0
          ? Math.min(max, Math.max(0, (H - offset) / (1 + usable / max)))
          : 0;

      if (container) container.scrollTo({ top, behavior });
      else window.scrollTo({ top, behavior });

      if (!node.hasAttribute("tabindex")) node.setAttribute("tabindex", "-1");
      node.focus({ preventScroll: true });

      if (lockTimer.current) clearTimeout(lockTimer.current);
      lockTimer.current = setTimeout(() => {
        lock.current = null;
        lockTimer.current = null;
        sync();
      }, RELEASE);
    },
    [offset, reduced, root, sync],
  );

  const getLinkProps = useCallback(
    (id: string) => ({
      href: `#${id}`,
      "aria-current": id === activeId ? ("location" as const) : undefined,
      onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        scrollTo(id);
      },
    }),
    [activeId, scrollTo],
  );

  const activeIndex = sections.findIndex((s) => s.id === activeId);

  return { activeId, activeIndex, scrollTo, getLinkProps, announce };
}
/* eslint-enable react-hooks/refs, react-hooks/preserve-manual-memoization */

export type ScrollSpyOrientation = "horizontal" | "vertical";

export type ScrollSpyClassNames = {
  /** the <ol> (also the scroller when the links overflow) */
  list?: string;
  /** each <li> */
  item?: string;
  /** each <a> */
  link?: string;
  /** the sliding 1px ink marker */
  marker?: string;
};

export type ScrollSpyProps = {
  sections: ScrollSpySection[];
  offset?: number;
  root?: React.RefObject<HTMLElement | null>;
  onChange?: (id: string) => void;
  label?: string;
  /** "horizontal" = a row with the marker under the active link (default) ·
      "vertical" = a column with the marker on its left edge */
  orientation?: ScrollSpyOrientation;
  /** draw the hairline the marker slides along */
  rail?: boolean;
  className?: string;
  classNames?: ScrollSpyClassNames;
};

/* Type lives on the <li> so the marker can be inset in the same em units as
   the label's tracking. Links carry 3px of leading room (mirroring the trailing
   letter-spacing) so the focus outline, drawn inside the link box because the
   list is a scroll container and would clip it, never touches a glyph; the
   list is pulled back by the same 3px to keep the first label flush left. */
const LAYOUT: Record<
  ScrollSpyOrientation,
  { rail: string; list: string; item: string; link: string; marker: string }
> = {
  horizontal: {
    rail: "before:inset-x-0 before:bottom-0 before:h-px",
    list: "-ml-[3px] flex gap-x-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
    item: "flex-none",
    link: "h-10 justify-center whitespace-nowrap pl-[3px]",
    marker: "bottom-0 left-[3px] right-[0.24em] h-px",
  },
  vertical: {
    rail: "before:inset-y-0 before:left-0 before:w-px",
    list: "flex flex-col",
    item: "",
    link: "min-h-9 justify-start py-2 pl-4",
    marker: "inset-y-0 left-0 w-px",
  },
};

export function ScrollSpy({
  sections,
  offset = 96,
  root,
  onChange,
  label = "On this page",
  orientation = "horizontal",
  rail = true,
  className = "",
  classNames,
}: ScrollSpyProps) {
  const { activeId, getLinkProps, announce } = useScrollSpy({
    sections,
    offset,
    root,
    onChange,
  });
  const reduced = useReducedMotion();
  const thumbId = useId();
  const chips = useRef(new Map<string, HTMLElement>());
  const strip = useRef<HTMLOListElement>(null);

  useEffect(() => {
    // Deviation from upstream (see the note at the top of this file): the same
    // "nearest" alignment as scrollIntoView, but applied to the list only, so
    // the page itself is never scrolled by this effect.
    const chip = chips.current.get(activeId);
    const box = strip.current;
    if (!chip || !box) return;

    const view = box.getBoundingClientRect();
    const item = chip.getBoundingClientRect();

    let left = 0;
    if (item.left < view.left) left = item.left - view.left;
    else if (item.right > view.right) left = item.right - view.right;

    let top = 0;
    if (item.top < view.top) top = item.top - view.top;
    else if (item.bottom > view.bottom) top = item.bottom - view.bottom;

    if (left === 0 && top === 0) return;
    box.scrollBy({ left, top, behavior: reduced ? "auto" : "smooth" });
  }, [activeId, reduced]);

  const layout = LAYOUT[orientation];

  return (
    <nav aria-label={label} className={cn("w-full", className)}>
      <div
        className={cn(
          "relative",
          rail &&
            "before:pointer-events-none before:absolute before:bg-line before:content-['']",
          rail && layout.rail,
        )}
      >
        <ol ref={strip} className={cn(layout.list, classNames?.list)}>
          {sections.map((section) => {
            const active = section.id === activeId;
            return (
              <li
                key={section.id}
                ref={(el) => {
                  if (el) chips.current.set(section.id, el);
                  else chips.current.delete(section.id);
                }}
                className={cn(
                  "relative text-[11px] uppercase leading-[1.4] tracking-[0.24em]",
                  layout.item,
                  classNames?.item,
                )}
              >
                {active ? (
                  <motion.span
                    layoutId={reduced ? undefined : thumbId}
                    aria-hidden
                    transition={CELL}
                    className={cn("absolute bg-ink", layout.marker, classNames?.marker)}
                  />
                ) : null}

                <a
                  {...getLinkProps(section.id)}
                  className={cn(
                    "group relative flex w-full items-center outline-offset-[-1.5px]!",
                    layout.link,
                    classNames?.link,
                  )}
                >
                  <span
                    className={cn(
                      "transition-colors duration-150",
                      active ? "text-ink" : "text-mute group-hover:text-ink",
                    )}
                  >
                    {section.label}
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      </div>
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
    </nav>
  );
}
