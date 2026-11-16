"use client";

// Adapted from interior.dev (MIT) — https://github.com/ddoemonn/interior
//
// useInlineValidation is the upstream hook, untouched. Only the styled layer
// below it was re-skinned for Sartorial: the same square 48px hairline field
// as floating-label.tsx (label floats inside the box, here with plain CSS),
// an `ok` tick when valid and an oxblood message when invalid.

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

const CROSSFADE = { type: "spring", stiffness: 260, damping: 34, mass: 0.8 } as const;
const INSTANT = { duration: 0 } as const;

const LINE = 16;

export type ValidationStatus = "idle" | "pending" | "valid" | "invalid";

export type Validator = (value: string) => string | null;

export type UseInlineValidationOptions = {
  value: string;
  validate: Validator;
  debounce?: number;
};

export type UseInlineValidationReturn = {
  status: ValidationStatus;
  error: string | null;
  message: string;
  touched: boolean;
  commit: () => void;
  reset: () => void;
  fieldProps: {
    onBlur: () => void;
    "aria-invalid": boolean;
  };
};

type Settled = {
  status: ValidationStatus;
  error: string | null;
  message: string;
};

const CLEAN: Settled = { status: "idle", error: null, message: "" };

export function useInlineValidation({
  value,
  validate,
  debounce = 400,
}: UseInlineValidationOptions): UseInlineValidationReturn {
  const [touched, setTouched] = useState(false);
  const [settled, setSettled] = useState<Settled>(CLEAN);

  const check = useRef(validate);
  const latest = useRef(value);

  useEffect(() => {
    check.current = validate;
    latest.current = value;
  });

  useEffect(() => {
    if (!touched) return;

    const next = check.current(value);
    const resolved: ValidationStatus = value.length > 0 ? "valid" : "idle";

    if (next === null) {
      setSettled((prev) =>
        prev.status === resolved && prev.error === null
          ? prev
          : { status: resolved, error: null, message: prev.message },
      );
      return;
    }

    setSettled((prev) =>
      prev.status === "invalid"
        ? prev
        : { status: "pending", error: null, message: prev.message },
    );

    const t = setTimeout(() => {
      setSettled((prev) =>
        prev.error === next ? prev : { status: "invalid", error: next, message: next },
      );
    }, debounce);

    return () => clearTimeout(t);
  }, [value, touched, debounce]);

  const commit = useCallback(() => {
    setTouched(true);
    const v = latest.current;
    const next = check.current(v);
    setSettled((prev) =>
      next === null
        ? { status: v.length > 0 ? "valid" : "idle", error: null, message: prev.message }
        : { status: "invalid", error: next, message: next },
    );
  }, []);

  const reset = useCallback(() => {
    setTouched(false);
    setSettled(CLEAN);
  }, []);

  return {
    status: settled.status,
    error: settled.error,
    message: settled.message,
    touched,
    commit,
    reset,
    fieldProps: { onBlur: commit, "aria-invalid": settled.status === "invalid" },
  };
}

export type InlineValidationTone = "light" | "dark";

export type InlineValidationClassNames = {
  input?: string;
  label?: string;
  /** the tick / alert glyph slot at the right edge of the field */
  status?: string;
  /** the reserved message row under the field */
  messageRow?: string;
  hint?: string;
  error?: string;
};

const TONE: Record<
  InlineValidationTone,
  {
    rest: string;
    invalid: string;
    input: string;
    label: string;
    labelInvalid: string;
    valid: string;
    hint: string;
    error: string;
  }
> = {
  light: {
    rest: "border-line bg-white hover:border-mute focus:border-ink",
    invalid: "border-accent bg-white",
    input: "text-ink caret-ink focus:placeholder:text-mute",
    label: "text-ink-3 peer-focus:text-ink",
    labelInvalid: "text-accent",
    valid: "text-ok",
    hint: "text-ink-3",
    error: "text-accent",
  },
  dark: {
    rest: "border-white/30 bg-transparent hover:border-white/55 focus:border-white",
    invalid: "border-[#e2a199] bg-transparent",
    input: "text-white caret-white focus:placeholder:text-white/45",
    label: "text-white/60 peer-focus:text-white",
    labelInvalid: "text-[#e2a199]",
    valid: "text-white",
    hint: "text-white/60",
    error: "text-[#e2a199]",
  },
};

export type InlineValidationProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  validate: Validator;
  hint?: string;
  id?: string;
  name?: string;
  type?: "text" | "email" | "password" | "tel" | "url" | "search";
  placeholder?: string;
  autoComplete?: string;
  inputMode?: React.ComponentProps<"input">["inputMode"];
  debounce?: number;
  reserveLines?: number;
  disabled?: boolean;
  required?: boolean;
  /** "dark" = on the ink footer: white text, white/30 hairline */
  tone?: InlineValidationTone;
  className?: string;
  classNames?: InlineValidationClassNames;
};

export function InlineValidation({
  label,
  value,
  onChange,
  validate,
  hint,
  id,
  name,
  type = "text",
  placeholder,
  autoComplete,
  inputMode,
  debounce = 400,
  reserveLines = 1,
  disabled = false,
  required = false,
  tone = "light",
  className = "",
  classNames,
}: InlineValidationProps) {
  const reduced = useReducedMotion();
  const fade = reduced ? INSTANT : CROSSFADE;

  const auto = useId();
  const fieldId = id ?? `${auto}-field`;
  const hintId = `${auto}-hint`;
  const errorId = `${auto}-error`;

  const { status, error, message, fieldProps } = useInlineValidation({
    value,
    validate,
    debounce,
  });

  const invalid = status === "invalid";
  const valid = status === "valid";

  const described = [hint ? hintId : null, invalid ? errorId : null]
    .filter(Boolean)
    .join(" ");

  const clamp = {
    display: "-webkit-box" as const,
    WebkitBoxOrient: "vertical" as const,
    WebkitLineClamp: reserveLines,
    overflow: "hidden" as const,
  };

  const t = TONE[tone];

  return (
    <div className={cn("w-full", className)}>
      <div className="relative">
        {/* The input comes first so the label can read its state (`peer`):
            the label rests on the field while it is empty and unfocused, and
            is a caption under the top hairline otherwise. A one-space
            placeholder keeps :placeholder-shown meaningful when the caller
            passes none; a real placeholder only shows while focused. */}
        <input
          id={fieldId}
          name={name}
          type={type}
          value={value}
          placeholder={placeholder ?? " "}
          autoComplete={autoComplete}
          inputMode={inputMode}
          disabled={disabled}
          required={required}
          aria-required={required || undefined}
          aria-describedby={described || undefined}
          data-tone={tone}
          onChange={(e) => onChange(e.target.value)}
          {...fieldProps}
          className={cn(
            // 16px below md so iOS does not zoom the page on focus
            "ib-field peer block h-12 w-full appearance-none rounded-none border pb-[2px] pl-3.5 pr-10 pt-[18px] text-[16px] leading-[20px] outline-none! transition-colors duration-150 placeholder:text-transparent disabled:cursor-not-allowed disabled:opacity-50 md:text-[14px]",
            t.input,
            invalid ? t.invalid : t.rest,
            classNames?.input,
          )}
        />

        <label
          htmlFor={fieldId}
          className={cn(
            "pointer-events-none absolute left-[15px] top-[15px] block max-w-[calc(100%-55px)] origin-top-left -translate-y-[9px] scale-[0.786] select-none truncate text-[14px] leading-[18px] transition-[translate,scale,color] duration-200 ease-out peer-[:placeholder-shown:not(:focus)]:translate-y-0 peer-[:placeholder-shown:not(:focus)]:scale-100 peer-disabled:opacity-50",
            invalid ? t.labelInvalid : t.label,
            classNames?.label,
          )}
        >
          {label}
        </label>

        <span
          className={cn(
            "pointer-events-none absolute right-3.5 top-1/2 grid size-3.5 -translate-y-1/2 place-items-center",
            classNames?.status,
          )}
          aria-hidden
        >
          <motion.svg
            viewBox="0 0 12 12"
            width="14"
            height="14"
            fill="none"
            className={cn("col-start-1 row-start-1", t.valid)}
            initial={false}
            animate={{ opacity: valid ? 1 : 0, scale: valid ? 1 : 0.7 }}
            transition={fade}
          >
            <path
              d="M2 6.3 4.7 9 10 3.2"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
          </motion.svg>
          <motion.svg
            viewBox="0 0 12 12"
            width="14"
            height="14"
            fill="none"
            className={cn("col-start-1 row-start-1", t.error)}
            initial={false}
            animate={{ opacity: invalid ? 1 : 0, scale: invalid ? 1 : 0.7 }}
            transition={fade}
          >
            <path d="M6 2v4.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="square" />
            <rect x="5.3" y="8.5" width="1.4" height="1.4" fill="currentColor" />
          </motion.svg>
        </span>
      </div>

      <div
        className={cn("relative mt-1.5 grid", classNames?.messageRow)}
        style={{ height: reserveLines * LINE }}
      >
        {hint ? (
          <motion.p
            aria-hidden
            style={clamp}
            className={cn(
              "col-start-1 row-start-1 text-[12px] leading-[16px]",
              t.hint,
              classNames?.hint,
            )}
            initial={false}
            animate={{ opacity: invalid ? 0 : 1, y: invalid ? 3 : 0 }}
            transition={fade}
          >
            {hint}
          </motion.p>
        ) : null}

        <motion.p
          aria-hidden
          style={clamp}
          className={cn(
            "col-start-1 row-start-1 text-[12px] leading-[16px]",
            t.error,
            classNames?.error,
          )}
          initial={false}
          animate={{ opacity: invalid ? 1 : 0, y: invalid ? 0 : -3 }}
          transition={fade}
        >
          {error ?? message}
        </motion.p>

        {hint ? (
          <span id={hintId} className="sr-only">
            {hint}
          </span>
        ) : null}

        <span
          id={errorId}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {error ?? ""}
        </span>
      </div>
    </div>
  );
}
