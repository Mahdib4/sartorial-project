"use client";

// Adapted from interior.dev (MIT) — https://github.com/ddoemonn/interior
//
// useShowMore is the upstream hook, untouched (it uses the "latest ref"
// pattern — a ref written during render — hence the scoped eslint-disable
// around it). Only the styled layer below it was re-skinned for Sartorial:
// flat, inherits the surrounding type, and the toggle is a small underlined
// text button.

import { useCallback, useId, useRef, useState } from "react";
import {
  motion,
  useIsomorphicLayoutEffect,
  useReducedMotion,
} from "motion/react";
import { cn } from "@/lib/cn";

const DISCLOSE = {
  type: "spring",
  stiffness: 190,
  damping: 30,
  mass: 1,
} as const;

const SMALL = {
  type: "spring",
  stiffness: 700,
  damping: 46,
  mass: 0.5,
} as const;

const INSTANT = { duration: 0 } as const;

type Metrics = { line: number; full: number };

export type UseShowMoreOptions = {
  lines?: number;
  maxHeight?: number;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
};

export type UseShowMoreResult = {
  contentRef: React.RefObject<HTMLDivElement | null>;
  expanded: boolean;
  open: boolean;
  toggle: () => void;
  setExpanded: (next: boolean) => void;
  height: number | null;
  collapsedHeight: number | null;
  fullHeight: number | null;
  expandable: boolean;
  capped: boolean;
  scrollable: boolean;
};

/* eslint-disable react-hooks/refs --
   upstream hook, kept verbatim (see the note at the top of this file) */
export function useShowMore({
  lines = 3,
  maxHeight = 320,
  defaultExpanded = false,
  expanded: expandedProp,
  onExpandedChange,
}: UseShowMoreOptions = {}): UseShowMoreResult {
  const [uncontrolled, setUncontrolled] = useState(defaultExpanded);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const expanded = expandedProp ?? uncontrolled;

  const notify = useRef(onExpandedChange);
  notify.current = onExpandedChange;

  const setExpanded = useCallback(
    (next: boolean) => {
      if (expandedProp === undefined) setUncontrolled(next);
      notify.current?.(next);
    },
    [expandedProp],
  );

  const toggle = useCallback(
    () => setExpanded(!expanded),
    [setExpanded, expanded],
  );

  useIsomorphicLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const read = () => {
      const styles = getComputedStyle(el);
      const parsed = Number.parseFloat(styles.lineHeight);
      const line = Number.isFinite(parsed)
        ? parsed
        : Number.parseFloat(styles.fontSize) * 1.5;
      const full = el.scrollHeight;

      setMetrics((prev) =>
        prev && prev.line === line && prev.full === full
          ? prev
          : { line, full },
      );
    };

    read();

    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const clamped = metrics ? metrics.line * lines : 0;
  const expandable = metrics ? metrics.full - clamped > 1 : true;
  const capped = metrics ? metrics.full > maxHeight : false;
  const collapsedHeight = metrics ? Math.min(clamped, metrics.full) : null;
  const fullHeight = metrics ? Math.min(metrics.full, maxHeight) : null;
  const open = expanded && expandable;

  return {
    contentRef,
    expanded,
    open,
    toggle,
    setExpanded,
    height: open ? fullHeight : collapsedHeight,
    collapsedHeight,
    fullHeight,
    expandable,
    capped,
    scrollable: open && capped,
  };
}
/* eslint-enable react-hooks/refs */

export type ShowMoreClassNames = {
  /** the clipped / scrolling region that holds the content */
  region?: string;
  /** the fade over the last visible line */
  veil?: string;
  /** the reserved 32px row that holds the toggle */
  toggleRow?: string;
  toggle?: string;
};

export type ShowMoreProps = UseShowMoreOptions & {
  children: React.ReactNode;
  moreLabel?: string;
  lessLabel?: string;
  label?: string;
  /** Colour the clipped edge fades into — set it to the background the block
      sits on (any CSS colour, e.g. "var(--color-paper)"). */
  fadeColor?: string;
  className?: string;
  classNames?: ShowMoreClassNames;
};

export function ShowMore({
  children,
  moreLabel = "Show more",
  lessLabel = "Show less",
  label = "Details",
  lines = 3,
  maxHeight = 320,
  defaultExpanded,
  expanded,
  onExpandedChange,
  fadeColor = "#ffffff",
  className = "",
  classNames,
}: ShowMoreProps) {
  const reduced = useReducedMotion();
  const regionId = useId();
  const regionRef = useRef<HTMLDivElement>(null);

  const { contentRef, open, toggle, height, expandable, capped, scrollable } =
    useShowMore({
      lines,
      maxHeight,
      defaultExpanded,
      expanded,
      onExpandedChange,
    });

  const press = () => {
    if (open) regionRef.current?.scrollTo({ top: 0 });
    toggle();
  };

  const veiled = expandable && (!open || scrollable);

  return (
    <div className={className || undefined}>
      <div className="relative">
        <motion.div
          ref={regionRef}
          id={regionId}
          role={scrollable ? "region" : undefined}
          aria-label={scrollable ? label : undefined}
          tabIndex={scrollable ? 0 : undefined}
          initial={false}
          animate={height === null ? {} : { height }}
          transition={reduced ? INSTANT : DISCLOSE}
          style={{
            maxHeight: height === null ? `${lines}lh` : undefined,
            overflowY: scrollable ? "auto" : "hidden",

            scrollbarGutter: capped ? "stable" : undefined,
          }}
          className={cn("overflow-hidden overscroll-contain", classNames?.region)}
        >
          <div ref={contentRef}>{children}</div>
        </motion.div>
        <motion.div
          aria-hidden
          initial={false}
          animate={{ opacity: veiled ? 1 : 0 }}
          transition={reduced ? INSTANT : SMALL}
          style={{
            backgroundImage: `linear-gradient(to top, ${fadeColor}, transparent)`,
          }}
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 h-9",
            classNames?.veil,
          )}
        />
      </div>
      <div className={cn("mt-2 flex h-8 items-center", classNames?.toggleRow)}>
        <button
          type="button"
          onClick={press}
          aria-expanded={open}
          aria-controls={regionId}
          className={cn(
            "inline-flex h-8 select-none items-center rounded-none text-[13px] leading-none text-ink transition-colors duration-150 hover:text-ink-3",
            expandable ? "" : "pointer-events-none invisible",
            classNames?.toggle,
          )}
        >
          <span className="grid text-left">
            <motion.span
              aria-hidden={open}
              className="col-start-1 row-start-1 underline decoration-1 underline-offset-[5px]"
              initial={false}
              animate={{ opacity: open ? 0 : 1 }}
              transition={reduced ? INSTANT : SMALL}
            >
              {moreLabel}
            </motion.span>
            <motion.span
              aria-hidden={!open}
              className="col-start-1 row-start-1 underline decoration-1 underline-offset-[5px]"
              initial={false}
              animate={{ opacity: open ? 1 : 0 }}
              transition={reduced ? INSTANT : SMALL}
            >
              {lessLabel}
            </motion.span>
          </span>
        </button>
      </div>
    </div>
  );
}
