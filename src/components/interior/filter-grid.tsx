"use client";

// Adapted from interior.dev (MIT) — https://github.com/ddoemonn/interior
//
// useFilterGrid is the upstream hook, untouched (it uses the "latest ref"
// pattern — a ref written during render — hence the scoped eslint-disable
// around it). The styled layer below it was re-skinned for Sartorial: no card
// chrome, filters are underlined text tabs, and the grid is a plain CSS grid
// whose columns / gaps come from `className` (upstream's fixed, reserved box
// is still there when `rowHeight` is passed).

import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

const CELL = { type: "spring", stiffness: 520, damping: 34, mass: 0.45 } as const;
const MOVE = { type: "spring", stiffness: 260, damping: 34, mass: 0.8 } as const;
const EASE = [0.23, 1, 0.32, 1] as const;
const LEAVE = { duration: 0.14, ease: [0.4, 0, 1, 1] } as const;
const INSTANT = { duration: 0 } as const;

export type FilterDefinition<T> = {
  id: string;
  label: string;
  match: (item: T) => boolean;
};

export type UseFilterGridOptions<T> = {
  items: readonly T[];
  filters: readonly FilterDefinition<T>[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
};

export type UseFilterGridResult<T> = {
  active: string;
  activeLabel: string;
  select: (id: string) => void;
  visible: T[];
  counts: Record<string, number>;
  total: number;
};

/* eslint-disable react-hooks/refs --
   upstream hook, kept verbatim (see the note at the top of this file) */
export function useFilterGrid<T>({
  items,
  filters,
  value,
  defaultValue,
  onValueChange,
}: UseFilterGridOptions<T>): UseFilterGridResult<T> {
  const fallback = filters[0]?.id ?? "";
  const [internal, setInternal] = useState(() => defaultValue ?? fallback);

  const requested = value ?? internal;
  const current = filters.find((f) => f.id === requested) ?? filters[0];
  const active = current?.id ?? fallback;

  const emit = useRef(onValueChange);
  emit.current = onValueChange;

  const counts = useMemo(() => {
    const next: Record<string, number> = {};
    for (const filter of filters) {
      let n = 0;
      for (const item of items) if (filter.match(item)) n += 1;
      next[filter.id] = n;
    }
    return next;
  }, [filters, items]);

  const visible = useMemo(() => {
    const filter = filters.find((f) => f.id === active);
    if (!filter) return [...items];
    return items.filter((item) => filter.match(item));
  }, [filters, items, active]);

  const select = useCallback(
    (id: string) => {
      if (value === undefined) setInternal(id);
      if (id !== active) emit.current?.(id);
    },
    [value, active],
  );

  return {
    active,
    activeLabel: current?.label ?? "",
    select,
    visible,
    counts,
    total: items.length,
  };
}
/* eslint-enable react-hooks/refs */

export type FilterGridClassNames = {
  /** the outer wrapper (filters + grid) */
  root?: string;
  /** the row of filter tabs */
  filters?: string;
  /** each filter tab button */
  chip?: string;
  /** each grid cell (<li>) */
  item?: string;
  /** the "nothing matches" block */
  empty?: string;
};

export type FilterGridProps<T> = {
  items: readonly T[];
  filters: readonly FilterDefinition<T>[];
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  /** Fixed column count, set inline. Omit it and put `grid-cols-*` classes in
      `className` instead (responsive columns). */
  columns?: number;
  /** Passing a row height (px) switches on upstream's reserved box: fixed-height
      rows, the height of the whole unfiltered set held open, internal scroll
      past `maxRows`. Omit it for a normal auto-height grid. */
  rowHeight?: number;
  /** Only with `rowHeight`. */
  maxRows?: number;
  /** Gap in px, set inline. Omit it and put `gap-*` classes in `className`. */
  gap?: number;
  /** false hides the built-in filter tabs — drive the grid with `value`. */
  showFilters?: boolean;
  /** false hides the per-filter counts in the tabs. */
  showCounts?: boolean;
  emptyLabel?: string;
  /** Appended last on the grid itself (the <ul>, already `display: grid`). */
  className?: string;
  classNames?: FilterGridClassNames;
};

const TAB =
  "col-start-1 row-start-1 inline-flex items-baseline gap-1.5 whitespace-nowrap text-[11px] uppercase leading-none tracking-[0.24em]";

export function FilterGrid<T>({
  items,
  filters,
  getKey,
  renderItem,
  label,
  value,
  defaultValue,
  onValueChange,
  columns,
  rowHeight,
  maxRows = 4,
  gap,
  showFilters = true,
  showCounts = true,
  emptyLabel = "Nothing matches this filter",
  className = "",
  classNames,
}: FilterGridProps<T>) {
  const uid = useId();
  const gridId = `${uid}-grid`;
  const reduced = useReducedMotion();

  const { active, activeLabel, select, visible, counts, total } = useFilterGrid({
    items,
    filters,
    value,
    defaultValue,
    onValueChange,
  });

  const gridRef = useRef<HTMLUListElement>(null);
  const chips = useRef<(HTMLButtonElement | null)[]>([]);
  const heldFocus = useRef(false);

  // `rowHeight` given → upstream geometry (defaults: 3 columns, 8px gap, 4 rows).
  const fixed = rowHeight !== undefined;
  const cols = Math.max(1, Math.floor(columns ?? 3));
  const space = gap ?? 8;
  const rows = Math.min(Math.max(1, Math.ceil(total / cols)), Math.max(1, maxRows));
  const box = fixed ? rows * rowHeight + (rows - 1) * space : 0;

  const index = Math.max(
    0,
    filters.findIndex((f) => f.id === active),
  );

  const choose = useCallback(
    (id: string) => {
      const grid = gridRef.current;
      heldFocus.current =
        !!grid && grid.contains(document.activeElement) && grid !== document.activeElement;
      select(id);
    },
    [select],
  );

  const settle = useCallback(() => {
    if (!heldFocus.current) return;
    heldFocus.current = false;
    const grid = gridRef.current;
    if (grid && !grid.contains(document.activeElement)) grid.focus();
  }, []);

  const go = useCallback(
    (i: number) => {
      const next = filters[(i + filters.length) % filters.length];
      if (!next) return;
      chips.current[(i + filters.length) % filters.length]?.focus();
      choose(next.id);
    },
    [filters, choose],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      go(i + 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      go(i - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      go(0);
    } else if (e.key === "End") {
      e.preventDefault();
      go(filters.length - 1);
    }
  };

  const swap = reduced ? INSTANT : CELL;
  const step = reduced ? INSTANT : { layout: MOVE, duration: 0.2, ease: EASE };
  const leave = reduced ? INSTANT : LEAVE;

  const capped = fixed && Math.ceil(total / cols) > Math.max(1, maxRows);

  return (
    <div className={cn("w-full", classNames?.root)}>
      {showFilters ? (
        <div
          role="radiogroup"
          aria-label={label}
          aria-controls={gridId}
          className={cn("mb-6 flex flex-wrap items-center gap-x-7 gap-y-1", classNames?.filters)}
        >
          {filters.map((filter, i) => {
            const on = i === index;
            return (
              <button
                key={filter.id}
                ref={(node) => {
                  chips.current[i] = node;
                }}
                type="button"
                role="radio"
                aria-checked={on}
                tabIndex={on ? 0 : -1}
                onClick={() => choose(filter.id)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className={cn(
                  "group relative inline-grid h-10 select-none place-items-center rounded-none",
                  classNames?.chip,
                )}
                style={{ touchAction: "manipulation" }}
              >
                {on ? (
                  <motion.span
                    aria-hidden
                    layoutId={reduced ? undefined : `${uid}-thumb`}
                    transition={CELL}
                    className="absolute inset-x-0 bottom-0 h-px bg-ink"
                  />
                ) : null}

                <span className="relative col-start-1 row-start-1 inline-grid">
                  <motion.span
                    aria-hidden
                    initial={false}
                    animate={{ opacity: on ? 0 : 1 }}
                    transition={swap}
                    className={cn(
                      TAB,
                      "text-mute transition-colors duration-150 group-hover:text-ink",
                    )}
                  >
                    {filter.label}
                    {showCounts ? (
                      <span className="text-[10px] tabular-nums tracking-normal">
                        {counts[filter.id]}
                      </span>
                    ) : null}
                  </motion.span>
                  <motion.span
                    aria-hidden
                    initial={false}
                    animate={{ opacity: on ? 1 : 0 }}
                    transition={swap}
                    className={cn(TAB, "text-ink")}
                  >
                    {filter.label}
                    {showCounts ? (
                      <span className="text-[10px] tabular-nums tracking-normal text-ink-3">
                        {counts[filter.id]}
                      </span>
                    ) : null}
                  </motion.span>
                  <span className="sr-only">
                    {filter.label}, {counts[filter.id]} of {total}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
      <div className="relative">
        <ul
          id={gridId}
          ref={gridRef}
          tabIndex={-1}
          className={cn(
            "relative grid outline-none!",
            fixed && "overflow-y-auto overscroll-contain",
            capped && "[scrollbar-gutter:stable]",
            className,
          )}
          style={
            fixed
              ? {
                  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                  gridAutoRows: `${rowHeight}px`,
                  gap: `${space}px`,
                  height: `${box}px`,
                }
              : {
                  gridTemplateColumns:
                    columns !== undefined ? `repeat(${cols}, minmax(0, 1fr))` : undefined,
                  gap: gap !== undefined ? `${gap}px` : undefined,
                }
          }
        >
          <AnimatePresence initial={false} mode="popLayout" onExitComplete={settle}>
            {visible.map((item) => (
              <motion.li
                key={getKey(item)}
                layout={reduced ? false : "position"}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98, transition: leave }}
                transition={step}
                className={cn("min-w-0", classNames?.item)}
              >
                {renderItem(item)}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <AnimatePresence initial={false}>
          {visible.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: leave }}
              transition={reduced ? INSTANT : { duration: 0.2, ease: EASE }}
              className={cn(
                "grid place-items-center",
                fixed ? "pointer-events-none absolute inset-0" : "py-20",
                classNames?.empty,
              )}
            >
              <span className="text-[13px] text-ink-3">{emptyLabel}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p aria-live="polite" className="sr-only">
        {activeLabel}: {visible.length} of {total} shown
      </p>
    </div>
  );
}
