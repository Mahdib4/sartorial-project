"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type RailProps = {
  /** Names the rail for screen readers, e.g. "You may also like". */
  label: string;
  children: ReactNode;
  /** Tailwind width classes for each item. */
  itemClassName?: string;
  className?: string;
  /** Rendered beside the arrows (usually the section title). */
  header?: ReactNode;
};

/**
 * A horizontal rail of cards: native scroll-snap (so touch, trackpad and
 * keyboard all work as the platform intends) with a pair of arrows that step
 * a page at a time and disable themselves at either end.
 */
export function Rail({ label, children, itemClassName = "w-[62vw] sm:w-[40vw] md:w-[30vw] lg:w-[23.5vw]", className, header }: RailProps) {
  const scroller = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 });
  }, []);

  useEffect(() => {
    measure();
    const el = scroller.current;
    if (!el) return;
    el.addEventListener("scroll", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, [measure]);

  const step = (direction: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: "smooth" });
  };

  const arrow = "grid h-10 w-10 place-items-center border border-line text-ink transition-colors duration-300 hover:border-ink disabled:opacity-30 disabled:hover:border-line";
  const items = Array.isArray(children) ? children : [children];

  return (
    <div className={className}>
      <div className="flex items-end justify-between gap-6 px-gutter">
        <div className="min-w-0">{header}</div>
        <div className="hidden shrink-0 gap-2 sm:flex">
          <button type="button" className={arrow} onClick={() => step(-1)} disabled={edges.start} aria-label={`Scroll ${label} back`}>
            <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.1">
              <path d="M15 8H2M6.5 3.5 2 8l4.5 4.5" />
            </svg>
          </button>
          <button type="button" className={arrow} onClick={() => step(1)} disabled={edges.end} aria-label={`Scroll ${label} forward`}>
            <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.1">
              <path d="M1 8h13M9.5 3.5 14 8l-4.5 4.5" />
            </svg>
          </button>
        </div>
      </div>
      <ul ref={scroller} aria-label={label} className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-1 overflow-x-auto scroll-px-[var(--gutter)] px-gutter">
        {items.map((child, i) => (
          <li key={i} className={cn("shrink-0 snap-start", itemClassName)}>
            {child}
          </li>
        ))}
      </ul>
    </div>
  );
}
