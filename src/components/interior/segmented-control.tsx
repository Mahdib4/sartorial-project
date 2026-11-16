"use client";

// Adapted from interior.dev (MIT) — https://github.com/ddoemonn/interior
//
// Upstream ships this one without a separate hook: selection, the roving
// tabindex, keyboard handling and the thumb spring all live in the component
// and are kept as they were. What changed for Sartorial is the styled layer:
// square, hairline frame, a flush ink thumb with white text, 40px (or 36px)
// tall, tracked uppercase labels — plus an optional `content` per option so a
// segment can draw an icon instead of its label, and an empty state: a `value`
// matching no option shows nothing selected.

import { useCallback, useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { cn } from "@/lib/cn";

const CELL = { type: "spring", stiffness: 520, damping: 34, mass: 0.45 } as const;

/* Both label layers (resting and inverted) share this, so they register
   exactly. The text-indent mirrors the trailing letter-spacing, which keeps a
   one-letter label optically centred; icons are flex items and ignore it. */
const SEG =
  "flex items-center justify-center whitespace-nowrap text-center indent-[0.24em] text-[11px] uppercase leading-none tracking-[0.24em]";

const SIZE = {
  sm: "h-9 min-w-9 px-3",
  md: "h-10 min-w-10 px-4",
} as const;

export type SegmentedOption = {
  value: string;
  /** accessible name of the segment, and what is drawn unless `content` is set */
  label: string;
  /** what is drawn in the segment instead of `label` — an icon, an icon and
      text… It is rendered twice (resting and inverted), so it must be purely
      presentational and inherit `currentColor`. */
  content?: React.ReactNode;
  disabled?: boolean;
};

export type SegmentedControlSize = keyof typeof SIZE;

export type SegmentedControlClassNames = {
  /** each segment cell — applied to both label layers */
  segment?: string;
  /** the sliding ink thumb */
  thumb?: string;
};

export type SegmentedControlProps = {
  options: SegmentedOption[];
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** "md" = 40px tall (default) · "sm" = 36px */
  size?: SegmentedControlSize;
  className?: string;
  classNames?: SegmentedControlClassNames;
};

export function SegmentedControl({
  options,
  label,
  value,
  defaultValue,
  onValueChange,
  size = "md",
  className = "",
  classNames,
}: SegmentedControlProps) {
  const count = Math.max(1, options.length);
  const template = `repeat(${count}, minmax(0, 1fr))`;

  const [internal, setInternal] = useState(
    () => defaultValue ?? options[0]?.value ?? "",
  );
  const [hovered, setHovered] = useState(-1);

  const controlled = value !== undefined;
  const current = controlled ? value : internal;
  const found = options.findIndex((o) => o.value === current);
  const index = found < 0 ? 0 : found;

  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const emit = useRef(onValueChange);
  // eslint-disable-next-line react-hooks/refs -- upstream "latest ref" pattern, kept verbatim
  emit.current = onValueChange;

  const reduced = useReducedMotion();
  const pos = useMotionValue(index);
  const thumbX = useTransform(pos, (v) => `${v * 100}%`);
  const maskX = useTransform(pos, (v) => `${v * -100}%`);

  useEffect(() => {
    if (reduced) {
      pos.set(index);
      return;
    }
    const controls = animate(pos, index, CELL);
    return () => controls.stop();
  }, [index, reduced, pos]);

  const select = useCallback(
    (next: string) => {
      if (!controlled) setInternal(next);
      if (next !== current) emit.current?.(next);
    },
    [controlled, current],
  );

  const seek = useCallback(
    (from: number, dir: number) => {
      let i = from;
      for (let k = 0; k < count; k++) {
        i = (i + dir + count) % count;
        if (!options[i]?.disabled) return i;
      }
      return from;
    },
    [count, options],
  );

  const go = useCallback(
    (i: number) => {
      const option = options[i];
      if (!option || option.disabled) return;
      buttons.current[i]?.focus();
      select(option.value);
    },
    [options, select],
  );

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      go(seek(i, 1));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      go(seek(i, -1));
    } else if (e.key === "Home") {
      e.preventDefault();
      go(seek(count - 1, 1));
    } else if (e.key === "End") {
      e.preventDefault();
      go(seek(0, -1));
    }
  };

  const seg = cn(SEG, SIZE[size], classNames?.segment);

  // Sartorial addition (presentation + aria only; the logic above is upstream's):
  // a controlled `value` that matches no option — "" before a size is chosen —
  // shows no thumb and no checked radio. Upstream drew the first segment as
  // selected in that case. The first radio stays the tab stop, as it should in
  // a radiogroup with nothing checked.
  const none = found < 0;

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "relative inline-block select-none border border-line bg-white align-middle",
        className,
      )}
    >
      <div
        className="relative grid"
        style={{ gridTemplateColumns: template, touchAction: "manipulation" }}
      >
        {options.map((option, i) => (
          <span
            key={option.value}
            aria-hidden
            className={cn(
              seg,
              "pointer-events-none transition-colors duration-150",
              option.disabled
                ? "text-mute/60 line-through"
                : hovered === i && (none || i !== index)
                  ? "text-ink"
                  : "text-ink-3",
            )}
          >
            {option.content ?? option.label}
          </span>
        ))}

        <motion.div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 overflow-hidden bg-ink transition-opacity duration-150",
            classNames?.thumb,
          )}
          style={{ width: `${100 / count}%`, x: thumbX, opacity: none ? 0 : 1 }}
          initial={false}
        >
          <motion.div
            className="absolute inset-0"
            style={{ x: maskX }}
            initial={false}
          >
            <div
              className="absolute inset-y-0 left-0 grid"
              style={{ width: `${count * 100}%`, gridTemplateColumns: template }}
            >
              {options.map((option) => (
                <span key={option.value} className={cn(seg, "text-white")}>
                  {option.content ?? option.label}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>
        <div
          className="absolute inset-0 grid"
          style={{ gridTemplateColumns: template }}
          onPointerLeave={() => setHovered(-1)}
        >
          {options.map((option, i) => (
            <button
              key={option.value}
              ref={(node) => {
                buttons.current[i] = node;
              }}
              type="button"
              role="radio"
              aria-checked={!none && i === index}
              aria-disabled={option.disabled || undefined}
              tabIndex={i === index ? 0 : -1}
              onClick={() => !option.disabled && select(option.value)}
              onKeyDown={(e) => onKeyDown(e, i)}
              onPointerEnter={() => !option.disabled && setHovered(i)}
              className="rounded-none aria-disabled:cursor-not-allowed!"
            >
              <span className="sr-only">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
