"use client";

// Adapted from interior.dev (MIT) — https://github.com/ddoemonn/interior
//
// useAsyncAction and the three glyphs are upstream, untouched. Only the styled
// layer below them was re-skinned for Sartorial: the site's primary button —
// 48px, square, flat ink fill — with `outline` and `light` variants.

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

const CELL = { type: "spring", stiffness: 520, damping: 34, mass: 0.45 } as const;
const CROSSFADE = { type: "spring", stiffness: 260, damping: 34, mass: 0.8 } as const;
const INSTANT = { duration: 0 } as const;

export type AsyncActionStatus = "idle" | "pending" | "success" | "error";

export type UseAsyncActionOptions = {
  action: () => unknown;
  resetAfter?: number;
  onError?: (error: unknown) => void;
};

export function useAsyncAction({
  action,
  resetAfter = 1400,
  onError,
}: UseAsyncActionOptions) {
  const [status, setStatus] = useState<AsyncActionStatus>("idle");

  const phase = useRef<AsyncActionStatus>("idle");
  const runId = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alive = useRef(true);

  const act = useRef(action);
  const fail = useRef(onError);

  useEffect(() => {
    act.current = action;
    fail.current = onError;
  });

  const clear = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    runId.current += 1;
    clear();
    phase.current = "idle";
    setStatus("idle");
  }, [clear]);

  const run = useCallback(() => {
    if (phase.current === "pending") return;

    clear();
    const id = ++runId.current;
    phase.current = "pending";
    setStatus("pending");

    const settle = (next: "success" | "error") => {
      if (!alive.current || id !== runId.current) return;
      clear();
      phase.current = next;
      setStatus(next);
      timer.current = setTimeout(() => {
        if (!alive.current || id !== runId.current) return;
        phase.current = "idle";
        setStatus("idle");
      }, resetAfter);
    };

    Promise.resolve()
      .then(() => act.current())
      .then(
        () => settle("success"),
        (error: unknown) => {
          fail.current?.(error);
          settle("error");
        },
      );
  }, [clear, resetAfter]);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      clear();
    };
  }, [clear]);

  return {
    status,
    run,
    reset,
    pending: status === "pending",
  };
}

function Spinner({ still }: { still: boolean }) {
  return (
    <motion.svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
      animate={still ? undefined : { rotate: 360 }}
      transition={
        still ? undefined : { duration: 0.85, repeat: Infinity, ease: "linear" }
      }
    >
      <circle
        cx="6"
        cy="6"
        r="4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.22"
      />
      <path
        d="M10.5 6A4.5 4.5 0 0 0 6 1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

function CheckMark() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M2.6 6.3 4.9 8.6 9.4 3.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AlertMark() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M6 2.9v3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M6 9.05h.01" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

export type LoadingButtonVariant = "solid" | "outline" | "light";

export type LoadingButtonClassNames = {
  /** each of the four stacked label faces (idle / pending / success / error) */
  face?: string;
};

/* Surfaces are picked in JS per state rather than layered with CSS variants,
   so a hover class can never fight an error class. Every face inherits the
   button's colour. */
const SURFACE: Record<
  LoadingButtonVariant,
  { rest: string; hover: string; error: string }
> = {
  solid: {
    rest: "border-ink bg-ink text-white",
    hover: "hover:border-ink-2 hover:bg-ink-2",
    error: "border-accent bg-accent text-white",
  },
  outline: {
    rest: "border-ink bg-transparent text-ink",
    hover: "hover:bg-ink hover:text-white",
    error: "border-accent bg-transparent text-accent",
  },
  light: {
    rest: "border-white bg-white text-ink",
    hover: "hover:border-ink hover:bg-ink hover:text-white",
    error: "border-white bg-white text-accent",
  },
};

export type LoadingButtonProps = {
  onAction: () => unknown;
  children: string;
  pendingLabel?: string;
  successLabel?: string;
  errorLabel?: string;
  resetAfter?: number;
  disabled?: boolean;
  onError?: (error: unknown) => void;
  /** "solid" = ink fill (default) · "outline" = 1px ink border, transparent ·
      "light" = white fill, for use over photographs */
  variant?: LoadingButtonVariant;
  className?: string;
  classNames?: LoadingButtonClassNames;
};

export function LoadingButton({
  onAction,
  children,
  pendingLabel = children,
  successLabel = "Done",
  errorLabel = "Try again",
  resetAfter = 1400,
  disabled = false,
  onError,
  variant = "solid",
  className = "",
  classNames,
}: LoadingButtonProps) {
  const reduced = useReducedMotion();

  const { status, run, pending } = useAsyncAction({
    action: onAction,
    resetAfter,
    onError,
  });

  const fade = reduced ? INSTANT : CROSSFADE;

  const label =
    status === "pending"
      ? pendingLabel
      : status === "success"
        ? successLabel
        : status === "error"
          ? errorLabel
          : children;

  const faces = [
    {
      key: "idle",
      text: children,
      icon: null,
    },
    {
      key: "pending",
      text: pendingLabel,
      icon: <Spinner still={reduced === true || status !== "pending"} />,
    },
    {
      key: "success",
      text: successLabel,
      icon: <CheckMark />,
    },
    {
      key: "error",
      text: errorLabel,
      icon: <AlertMark />,
    },
  ];

  const surface = SURFACE[variant];
  const failed = status === "error";

  return (
    <>
      <motion.button
        type="button"
        // motion adds tabindex="0" whenever whileTap is set, and whileTap depends
        // on prefers-reduced-motion, which the server cannot know. Stating it
        // keeps server and client markup identical; a <button> is a tab stop anyway.
        tabIndex={0}
        disabled={disabled}
        data-status={status}
        data-variant={variant}
        aria-label={label}
        aria-busy={pending || undefined}
        aria-disabled={pending || undefined}
        whileTap={disabled || pending || reduced ? undefined : { y: 1 }}
        transition={CELL}
        onClick={(event) => {
          if (pending) {
            event.preventDefault();
            return;
          }
          run();
        }}
        className={cn(
          "relative inline-flex h-12 select-none items-center justify-center rounded-none border px-8 text-[13px] leading-none tracking-[0.04em] transition-colors duration-200 disabled:opacity-40",
          failed ? surface.error : surface.rest,
          !failed && !pending && !disabled && surface.hover,
          pending && "cursor-progress!",
          className,
        )}
        style={{ touchAction: "manipulation" }}
      >
        <span aria-hidden className="relative grid place-items-center">
          {faces.map((face) => (
            <motion.span
              key={face.key}
              initial={false}
              animate={
                face.key === status
                  ? { opacity: 1, y: 0, filter: "blur(0px)" }
                  : { opacity: 0, y: 3, filter: "blur(3px)" }
              }
              transition={fade}
              className={cn(
                "col-start-1 row-start-1 flex items-center justify-center gap-2 whitespace-nowrap",
                classNames?.face,
              )}
            >
              {face.icon}
              {face.text}
            </motion.span>
          ))}
        </span>
      </motion.button>

      <span role="status" aria-live="polite" className="sr-only">
        {status === "success" ? successLabel : status === "error" ? errorLabel : ""}
      </span>
    </>
  );
}
