"use client";

// Adapted from interior.dev (MIT) — https://github.com/ddoemonn/interior
// The hook (useDropdown) is upstream and unchanged; only the styled layer
// below it is re-skinned for Sartorial.
/* eslint-disable react-hooks/refs -- upstream latest-ref pattern, kept as is */

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

const EASE = [0.23, 1, 0.32, 1] as const;

const EXIT = [0.4, 0, 1, 1] as const;
const CELL = { type: "spring", stiffness: 520, damping: 34, mass: 0.45 } as const;

const NUDGE = { type: "spring", stiffness: 700, damping: 46, mass: 0.5 } as const;
const NONE = { duration: 0 } as const;

const SLIDE = { type: "spring", stiffness: 700, damping: 46, mass: 0.5 } as const;

/* Row height in px. The sliding highlight moves by this much per row, so it
   must match the `h-10` on the rows and on the highlight below. */
const ROW_H = 40;

const OPEN = { type: "spring", stiffness: 620, damping: 38, mass: 0.6 } as const;

export type DropdownItem = {
  value: string;
  label: string;
  hint?: string;
  disabled?: boolean;
};

export type UseDropdownOptions = {
  items: DropdownItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  typeaheadDelay?: number;
};

export function useDropdown({
  items,
  value,
  defaultValue,
  onChange,
  disabled = false,
  typeaheadDelay = 600,
}: UseDropdownOptions) {
  const uid = useId();
  const listId = `${uid}-list`;
  const itemId = useCallback((i: number) => `${uid}-opt-${i}`, [uid]);

  const [uncontrolled, setUncontrolled] = useState<string | null>(
    defaultValue ?? null,
  );
  const selectedValue = value !== undefined ? value : uncontrolled;
  const selectedIndex = items.findIndex((it) => it.value === selectedValue);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const viaKey = useRef(false);
  const buffer = useRef("");
  const bufferTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const emit = useRef(onChange);
  emit.current = onChange;

  const step = useCallback(
    (from: number, dir: 1 | -1) => {
      const n = items.length;
      if (n === 0) return -1;
      let i = from;
      for (let k = 0; k < n; k++) {
        i = (i + dir + n) % n;
        if (!items[i].disabled) return i;
      }
      return from;
    },
    [items],
  );

  const edge = useCallback(
    (dir: 1 | -1) => step(dir === 1 ? -1 : items.length, dir),
    [step, items.length],
  );

  const openMenu = useCallback(
    (index?: number) => {
      if (disabled || items.length === 0) return;
      const usable = selectedIndex >= 0 && !items[selectedIndex].disabled;
      viaKey.current = true;
      setActiveIndex(index ?? (usable ? selectedIndex : edge(1)));
      setOpen(true);
    },
    [disabled, items, selectedIndex, edge],
  );

  const close = useCallback((restoreFocus = true) => {
    buffer.current = "";
    setOpen(false);
    setActiveIndex(-1);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  const select = useCallback(
    (index: number) => {
      const item = items[index];
      if (!item || item.disabled) return;
      if (value === undefined) setUncontrolled(item.value);
      emit.current?.(item.value);
      close();
    },
    [items, value, close],
  );

  const typeahead = useCallback(
    (char: string) => {
      if (bufferTimer.current) clearTimeout(bufferTimer.current);
      buffer.current += char.toLowerCase();
      bufferTimer.current = setTimeout(() => {
        buffer.current = "";
      }, typeaheadDelay);

      const q = buffer.current;
      const n = items.length;
      const from = activeIndex < 0 ? 0 : activeIndex;
      const start = q.length > 1 ? from : from + 1;
      for (let k = 0; k < n; k++) {
        const i = (start + k) % n;
        const it = items[i];
        if (!it.disabled && it.label.toLowerCase().startsWith(q)) {
          viaKey.current = true;
          setActiveIndex(i);
          return;
        }
      }
    },
    [items, activeIndex, typeaheadDelay],
  );

  useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close(false);
    };
    const onWindowBlur = () => close(false);
    document.addEventListener("pointerdown", onDown, true);
    window.addEventListener("blur", onWindowBlur);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("blur", onWindowBlur);
    };
  }, [open, close]);

  useEffect(() => {
    if (!open || activeIndex < 0 || !viaKey.current) return;
    viaKey.current = false;
    itemRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  useEffect(
    () => () => {
      if (bufferTimer.current) clearTimeout(bufferTimer.current);
    },
    [],
  );

  const triggerProps = {
    ref: triggerRef,
    type: "button" as const,
    disabled,
    "aria-haspopup": "listbox" as const,
    "aria-expanded": open,
    "aria-controls": open ? listId : undefined,
    onClick: () => (open ? close() : openMenu()),
    onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openMenu();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        openMenu(edge(-1));
      }
    },
  };

  const listProps = {
    ref: listRef,
    id: listId,
    role: "listbox" as const,
    tabIndex: -1,
    "aria-activedescendant": activeIndex >= 0 ? itemId(activeIndex) : undefined,
    onKeyDown: (e: React.KeyboardEvent<HTMLUListElement>) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const dir = e.key === "ArrowDown" ? 1 : -1;
        viaKey.current = true;
        setActiveIndex((i) => step(i, dir));
      } else if (e.key === "Home" || e.key === "End") {
        e.preventDefault();
        viaKey.current = true;
        setActiveIndex(edge(e.key === "Home" ? 1 : -1));
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        select(activeIndex);
      } else if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "Tab") {
        e.preventDefault();
        close();
      } else if (
        e.key.length === 1 &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        e.preventDefault();
        typeahead(e.key);
      }
    },
  };

  const getItemProps = useCallback(
    (index: number) => ({
      id: itemId(index),
      role: "option" as const,
      "aria-selected": index === selectedIndex,
      "aria-disabled": items[index]?.disabled ? (true as const) : undefined,
      ref: (el: HTMLLIElement | null) => {
        itemRefs.current[index] = el;
      },
      onPointerMove: () => {
        if (items[index]?.disabled) return;
        viaKey.current = false;
        setActiveIndex(index);
      },
      onClick: () => select(index),
    }),
    [itemId, items, selectedIndex, select],
  );

  return {
    open,
    openMenu,
    close,
    select,
    activeIndex,
    selectedIndex,
    selectedItem: selectedIndex >= 0 ? items[selectedIndex] : null,
    itemId,
    rootRef,
    triggerProps,
    listProps,
    getItemProps,
  };
}

export type DropdownClassNames = {
  trigger?: string;
  /** the floating panel (absolute, z-50) */
  menu?: string;
  /** the scrolling listbox inside the panel */
  list?: string;
  /** every option row — keep it `h-10`, the highlight depends on it */
  item?: string;
  /** the sliding hover / keyboard highlight */
  highlight?: string;
};

export type DropdownProps = {
  items: DropdownItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  emptyLabel?: string;
  /** which edge of the trigger the menu hangs from (visual only) */
  align?: "start" | "end";
  className?: string;
  classNames?: DropdownClassNames;
};

export function Dropdown({
  items,
  value,
  defaultValue,
  onChange,
  label = "Options",
  placeholder = "Select an option",
  disabled = false,
  emptyLabel = "Nothing to choose",
  align = "start",
  className = "",
  classNames,
}: DropdownProps) {
  const reduced = useReducedMotion();
  const {
    open,
    activeIndex,
    selectedIndex,
    selectedItem,
    rootRef,
    triggerProps,
    listProps,
    getItemProps,
  } = useDropdown({ items, value, defaultValue, onChange, disabled });

  const cell = reduced ? NONE : CELL;

  return (
    <div ref={rootRef} className={cn("relative inline-block text-left", className)}>
      <button
        {...triggerProps}
        className={cn(
          "flex h-11 select-none items-center gap-3 whitespace-nowrap border bg-white px-4 label text-ink transition-colors duration-200 disabled:opacity-40",
          open ? "border-ink" : "border-line hover:border-ink",
          classNames?.trigger,
        )}
      >
        <span className="sr-only">
          {label}: {selectedItem ? selectedItem.label : placeholder}
        </span>
        <span aria-hidden>{label}</span>
        <motion.svg
          aria-hidden
          viewBox="0 0 12 12"
          className="size-2.5 shrink-0 text-ink"
          initial={false}
          animate={{ rotate: open ? 180 : 0 }}
          transition={reduced ? NONE : NUDGE}
        >
          <path
            d="M2 4.25 6 8.25 10 4.25"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
        </motion.svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{
              opacity: 0,
              scale: 0.97,
              y: -6,
              transition: reduced ? NONE : { duration: 0.12, ease: EXIT },
            }}
            transition={
              reduced
                ? NONE
                : { ...OPEN, opacity: { duration: 0.12, ease: EASE } }
            }
            style={{ transformOrigin: align === "end" ? "top right" : "top left" }}
            className={cn(
              "absolute top-[calc(100%+4px)] z-50 min-w-[224px] whitespace-nowrap border border-line bg-white shadow-[0_18px_40px_-24px_rgba(28,27,23,0.35)]",
              align === "end" ? "right-0" : "left-0",
              classNames?.menu,
            )}
          >
            <ul
              {...listProps}
              aria-label={label}
              className={cn(
                "ia-scroll relative max-h-[240px] overflow-y-auto outline-none!",
                classNames?.list,
              )}
            >
              <motion.span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute inset-x-0 top-0 h-10 bg-paper",
                  classNames?.highlight,
                )}
                initial={false}
                animate={{
                  y: activeIndex < 0 ? 0 : activeIndex * ROW_H,
                  opacity: activeIndex < 0 ? 0 : 1,
                }}
                transition={
                  reduced
                    ? NONE
                    : { ...SLIDE, opacity: { duration: 0.1, ease: EASE } }
                }
              />
              {items.map((item, i) => {
                const active = i === activeIndex && !item.disabled;
                const picked = i === selectedIndex;
                return (
                  <li
                    key={item.value}
                    {...getItemProps(i)}
                    className={cn(
                      "relative flex h-10 select-none items-center px-4 text-[13px]",
                      item.disabled
                        ? "cursor-default text-mute/70"
                        : active
                          ? "cursor-pointer text-ink"
                          : "cursor-pointer text-ink-2",
                      classNames?.item,
                    )}
                  >
                    <span className="relative flex min-w-0 flex-1 items-center gap-4">
                      <span className="truncate">{item.label}</span>
                      {item.hint ? (
                        <span className="ml-auto shrink-0 text-[11px] tabular-nums text-mute">
                          {item.hint}
                        </span>
                      ) : null}
                    </span>
                    <motion.span
                      aria-hidden
                      initial={false}
                      animate={{ opacity: picked ? 1 : 0, scale: picked ? 1 : 0.7 }}
                      transition={cell}
                      className="relative ml-4 flex size-[14px] shrink-0 items-center justify-center text-ink"
                    >
                      <svg viewBox="0 0 14 14" className="size-[14px]">
                        <path
                          d="M2.5 7.4 5.6 10.5 11.5 4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1"
                          strokeLinecap="square"
                          strokeLinejoin="miter"
                        />
                      </svg>
                    </motion.span>
                  </li>
                );
              })}

              {items.length === 0 && (
                <li
                  role="presentation"
                  className="flex h-10 items-center px-4 text-[13px] text-mute"
                >
                  {emptyLabel}
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
