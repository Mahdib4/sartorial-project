"use client";

// Adapted from interior.dev (MIT) — https://github.com/ddoemonn/interior
// The hook (useCollapsibleBanner) is upstream and unchanged; only the styled
// layer below it is re-skinned for Sartorial.
/* eslint-disable react-hooks/refs -- upstream latest-ref pattern, kept as is */

import { useCallback, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

const EASE = [0.23, 1, 0.32, 1] as const;
const DISCLOSE = { type: "spring", stiffness: 190, damping: 30, mass: 1 } as const;
const NUDGE = { type: "spring", stiffness: 700, damping: 46, mass: 0.5 } as const;
const INSTANT = { duration: 0 } as const;

export type BannerState = "open" | "folded" | "dismissed";

export type UseCollapsibleBannerOptions = {
  state?: BannerState;
  defaultState?: BannerState;
  onStateChange?: (state: BannerState) => void;
  onDismiss?: () => void;
};

export type UseCollapsibleBannerResult = {
  state: BannerState;
  open: boolean;
  folded: boolean;
  dismissed: boolean;
  fold: () => void;
  expand: () => void;
  toggle: () => void;
  dismiss: () => void;
  restore: () => void;
};

export function useCollapsibleBanner({
  state: controlled,
  defaultState = "open",
  onStateChange,
  onDismiss,
}: UseCollapsibleBannerOptions = {}): UseCollapsibleBannerResult {
  const [uncontrolled, setUncontrolled] = useState<BannerState>(defaultState);
  const state = controlled ?? uncontrolled;

  const changed = useRef(onStateChange);
  changed.current = onStateChange;
  const closed = useRef(onDismiss);
  closed.current = onDismiss;

  const commit = useCallback((next: BannerState) => {
    setUncontrolled(next);
    changed.current?.(next);
  }, []);

  const fold = useCallback(() => commit("folded"), [commit]);
  const expand = useCallback(() => commit("open"), [commit]);
  const restore = useCallback(() => commit("open"), [commit]);

  const toggle = useCallback(
    () => commit(state === "open" ? "folded" : "open"),
    [commit, state],
  );

  const dismiss = useCallback(() => {
    commit("dismissed");
    closed.current?.();
  }, [commit]);

  return {
    state,
    open: state === "open",
    folded: state === "folded",
    dismissed: state === "dismissed",
    fold,
    expand,
    toggle,
    dismiss,
    restore,
  };
}

const CARET_DOWN = (
  <svg width="10" height="10" viewBox="0 0 256 256" fill="none" aria-hidden="true">
    <polyline
      points="208 96 128 176 48 96"
      stroke="currentColor"
      strokeWidth="20"
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
  </svg>
);

const CLOSE = (
  <svg width="12" height="12" viewBox="0 0 256 256" fill="none" aria-hidden="true">
    <line
      x1="208"
      y1="48"
      x2="48"
      y2="208"
      stroke="currentColor"
      strokeWidth="20"
      strokeLinecap="square"
    />
    <line
      x1="208"
      y1="208"
      x2="48"
      y2="48"
      stroke="currentColor"
      strokeWidth="20"
      strokeLinecap="square"
    />
  </svg>
);

export type CollapsibleBannerClassNames = {
  /** the row holding icon, title and dismiss (36px while the title fits on one line) */
  bar?: string;
  /** the title text */
  title?: string;
  /** the dismiss button */
  dismiss?: string;
  /** the padded block inside the disclosure (description / children / action) */
  body?: string;
};

export type CollapsibleBannerProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;

  dismissible?: boolean;
  state?: BannerState;
  defaultState?: BannerState;
  onStateChange?: (state: BannerState) => void;
  onDismiss?: () => void;
  dismissLabel?: string;
  dismissedMessage?: string;
  className?: string;
  classNames?: CollapsibleBannerClassNames;
};

export function CollapsibleBanner({
  title,
  description,
  children,
  action,
  icon,
  dismissible = true,
  state: controlled,
  defaultState = "open",
  onStateChange,
  onDismiss,
  dismissLabel = "Dismiss notice",
  dismissedMessage = "Notice dismissed.",
  className = "",
  classNames,
}: CollapsibleBannerProps) {
  const reduced = useReducedMotion();
  const uid = useId();
  const bodyId = `${uid}-body`;
  const titleId = `${uid}-title`;

  const { state, open, dismissed, toggle, fold, dismiss } = useCollapsibleBanner({
    state: controlled,
    defaultState,
    onStateChange,
    onDismiss,
  });

  const hasBody = Boolean(description || children || action);

  const disclose = reduced
    ? INSTANT
    : {
        height: DISCLOSE,
        opacity: { duration: 0.14, ease: EASE, delay: open ? 0.05 : 0 },
        y: DISCLOSE,
      };

  // One line is 36px. A title too long for the screen wraps instead of being
  // cut off; pass classNames.title="truncate" to pin the bar to one line.
  const titleClass = cn("min-w-0 text-balance label", classNames?.title);

  return (
    <>
      <motion.div
        // Upstream leaves a dismissed banner's buttons in the tab order even
        // though it has collapsed to nothing; take them out with it.
        inert={dismissed}
        initial={false}
        animate={{ height: dismissed ? 0 : "auto", opacity: dismissed ? 0 : 1 }}
        transition={
          reduced
            ? INSTANT
            : { height: DISCLOSE, opacity: { duration: 0.14, ease: EASE } }
        }
        style={{ overflow: "hidden" }}
      >
        <div
          role="region"
          aria-labelledby={titleId}
          className={cn("bg-paper text-ink", className)}
        >
          <div
            className={cn(
              "relative flex min-h-9 items-center justify-center gap-2.5 px-12 text-center",
              classNames?.bar,
            )}
          >
            {icon ? (
              <span
                aria-hidden="true"
                className="grid size-4 shrink-0 place-items-center text-ink-3"
              >
                {icon}
              </span>
            ) : null}

            {hasBody ? (
              <button
                type="button"
                onClick={toggle}
                onKeyDown={(e) => {
                  if (e.key !== "Escape" || !open) return;
                  e.stopPropagation();
                  fold();
                }}
                aria-expanded={open}
                aria-controls={bodyId}
                className="group flex min-h-9 min-w-0 items-center gap-2 px-3 py-2.5 text-center focus-visible:-outline-offset-2!"
              >
                <span id={titleId} className={titleClass}>
                  {title}
                </span>
                <motion.span
                  aria-hidden="true"
                  className="flex shrink-0 text-ink-3 transition-colors duration-200 group-hover:text-ink"
                  initial={false}
                  animate={{ rotate: open ? 180 : 0 }}
                  transition={reduced ? INSTANT : NUDGE}
                >
                  {CARET_DOWN}
                </motion.span>
              </button>
            ) : (
              <span id={titleId} className={cn("py-2.5", titleClass)}>
                {title}
              </span>
            )}

            {dismissible ? (
              <button
                type="button"
                onClick={dismiss}
                aria-label={dismissLabel}
                className={cn(
                  "absolute inset-y-0 right-0 grid w-10 place-items-center text-ink-3 transition-colors duration-200 hover:text-ink focus-visible:-outline-offset-2!",
                  classNames?.dismiss,
                )}
              >
                {CLOSE}
              </button>
            ) : null}
          </div>

          {hasBody ? (
            <motion.div
              id={bodyId}
              inert={!open}
              initial={false}
              animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
              transition={disclose}
              style={{ overflow: "hidden" }}
            >
              <motion.div
                initial={false}
                animate={{ y: open ? 0 : -6 }}
                transition={reduced ? INSTANT : DISCLOSE}
                className={cn(
                  "mx-auto max-w-[640px] px-12 pb-4 pt-1 text-center",
                  classNames?.body,
                )}
              >
                {description ? (
                  <p className="text-[13px] leading-relaxed text-ink-3">
                    {description}
                  </p>
                ) : null}

                {children}

                {action ? <div className="mt-3">{action}</div> : null}
              </motion.div>
            </motion.div>
          ) : null}
        </div>
      </motion.div>
      <span role="status" aria-live="polite" className="sr-only">
        {state === "dismissed" ? dismissedMessage : ""}
      </span>
    </>
  );
}
