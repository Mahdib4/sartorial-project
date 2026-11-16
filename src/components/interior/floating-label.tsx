"use client";

// Adapted from interior.dev (MIT) — https://github.com/ddoemonn/interior
//
// useFloatingLabel is the upstream hook, untouched (it resets state from
// effects on purpose, hence the scoped eslint-disable around it). Only the
// styled layer below it was re-skinned for Sartorial: a square 48px hairline
// field whose label floats inside the box, with an optional dark tone.

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

const INSTANT = { duration: 0 } as const;

const LIFT = { type: "spring", stiffness: 760, damping: 46, mass: 0.5 } as const;

/* Label travel inside the 48px box: at rest it is centred on the field,
   raised it is an 11px caption tucked under the top hairline. */
const RAISE = -9;
const SHRINK = 0.786;

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export type UseFloatingLabelOptions = {
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
};

export type UseFloatingLabelReturn = {
  ref: React.RefObject<HTMLInputElement | null>;
  raised: boolean;
  focused: boolean;
  filled: boolean;
  length: number;
  instant: boolean;
  fieldProps: {
    onFocus: () => void;
    onBlur: () => void;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  };
};

type Fill = { length: number; instant: boolean };

/* eslint-disable react-hooks/set-state-in-effect --
   upstream hook, kept verbatim (see the note at the top of this file) */
export function useFloatingLabel({
  value,
  defaultValue,
  disabled = false,
}: UseFloatingLabelOptions = {}): UseFloatingLabelReturn {
  const ref = useRef<HTMLInputElement | null>(null);
  const mounted = useRef(false);

  const [focused, setFocused] = useState(false);
  const [fill, setFill] = useState<Fill>({
    length: (value ?? defaultValue ?? "").length,
    instant: true,
  });

  const settle = useCallback((next: number, instant: boolean) => {
    setFill((prev) =>
      prev.length === next && prev.instant === instant ? prev : { length: next, instant },
    );
  }, []);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    const next = value !== undefined ? value.length : el ? el.value.length : 0;
    settle(next, !mounted.current);
    mounted.current = true;
  }, [value, settle]);

  useEffect(() => {
    setFill((prev) => (prev.instant ? { ...prev, instant: false } : prev));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || value !== undefined) return;
    const read = () => settle(el.value.length, false);
    el.addEventListener("input", read);
    el.addEventListener("change", read);
    return () => {
      el.removeEventListener("input", read);
      el.removeEventListener("change", read);
    };
  }, [value, settle]);

  useEffect(() => {
    if (disabled) setFocused(false);
  }, [disabled]);

  const onFocus = useCallback(() => setFocused(true), []);
  const onBlur = useCallback(() => setFocused(false), []);
  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) =>
      settle(event.currentTarget.value.length, false),
    [settle],
  );

  return {
    ref,
    raised: focused || fill.length > 0,
    focused,
    filled: fill.length > 0,
    length: fill.length,
    instant: fill.instant && !focused,
    fieldProps: { onFocus, onBlur, onChange },
  };
}
/* eslint-enable react-hooks/set-state-in-effect */

export type FloatingLabelTone = "light" | "dark";

export type FloatingLabelClassNames = {
  /** the 48px bordered box */
  field?: string;
  input?: string;
  label?: string;
  /** the reserved 16px row under the field (hint + counter) */
  hintRow?: string;
  hint?: string;
  counter?: string;
};

const TONE: Record<
  FloatingLabelTone,
  {
    rest: string;
    focus: string;
    invalid: string;
    input: string;
    label: string;
    labelFocus: string;
    labelInvalid: string;
    hint: string;
    hintInvalid: string;
    faint: string;
  }
> = {
  light: {
    rest: "border-line bg-white hover:border-mute",
    focus: "border-ink bg-white",
    invalid: "border-accent bg-white",
    input: "text-ink caret-ink",
    label: "text-ink-3",
    labelFocus: "text-ink",
    labelInvalid: "text-accent",
    hint: "text-ink-3",
    hintInvalid: "text-accent",
    faint: "text-mute",
  },
  dark: {
    rest: "border-white/30 bg-transparent hover:border-white/55",
    focus: "border-white bg-transparent",
    invalid: "border-[#e2a199] bg-transparent",
    input: "text-white caret-white",
    label: "text-white/60",
    labelFocus: "text-white",
    labelInvalid: "text-[#e2a199]",
    hint: "text-white/60",
    hintInvalid: "text-[#e2a199]",
    faint: "text-white/45",
  },
};

export type FloatingLabelInputProps = {
  label: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  hint?: string;
  invalid?: boolean;
  id?: string;
  name?: string;
  type?: "text" | "email" | "password" | "search" | "tel" | "url";
  autoComplete?: string;
  inputMode?: React.ComponentProps<"input">["inputMode"];
  maxLength?: number;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
  /** "dark" = on the ink footer: white text, white/30 hairline */
  tone?: FloatingLabelTone;
  className?: string;
  classNames?: FloatingLabelClassNames;
};

export function FloatingLabelInput({
  label,
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  hint,
  invalid = false,
  id,
  name,
  type = "text",
  autoComplete,
  inputMode,
  maxLength,
  required = false,
  disabled = false,
  readOnly = false,
  inputRef,
  tone = "light",
  className = "",
  classNames,
}: FloatingLabelInputProps) {
  const auto = useId();
  const fieldId = id ?? `${auto}-field`;
  const hintId = `${auto}-hint`;

  const reduced = useReducedMotion();
  const { ref, raised, focused, length, instant, fieldProps } = useFloatingLabel({
    value,
    defaultValue,
    disabled,
  });

  const move = reduced || instant ? INSTANT : LIFT;

  // Upstream ref merge, kept as is: the node is written to the hook's ref
  // object and forwarded to the caller's `inputRef`. Both are plain refs, which
  // the compiler lint cannot tell from immutable values.
  const attach = useCallback(
    // eslint-disable-next-line react-hooks/immutability
    (node: HTMLInputElement | null) => {
      ref.current = node;
      if (typeof inputRef === "function") inputRef(node);
      // eslint-disable-next-line react-hooks/immutability
      else if (inputRef) inputRef.current = node;
    },
    [ref, inputRef],
  );

  const t = TONE[tone];

  return (
    <div className={cn("w-full", className)}>
      <div className="relative">
        <div
          className={cn(
            "relative h-12 border transition-colors duration-150",
            invalid ? t.invalid : focused ? t.focus : t.rest,
            disabled && "opacity-50",
            classNames?.field,
          )}
        >
          <input
            ref={attach}
            id={fieldId}
            name={name}
            type={type}
            value={value}
            defaultValue={defaultValue}
            autoComplete={autoComplete}
            inputMode={inputMode}
            maxLength={maxLength}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            aria-required={required || undefined}
            aria-invalid={invalid || undefined}
            aria-describedby={hint ? hintId : undefined}
            data-tone={tone}
            onFocus={() => {
              fieldProps.onFocus();
              onFocus?.();
            }}
            onBlur={() => {
              fieldProps.onBlur();
              onBlur?.();
            }}
            onChange={(event) => {
              fieldProps.onChange(event);
              onChange?.(event.currentTarget.value, event);
            }}
            className={cn(
              // 16px below md so iOS does not zoom the page on focus
              "ib-field absolute inset-0 h-full w-full appearance-none rounded-none bg-transparent px-3.5 pb-[2px] pt-[18px] text-[16px] leading-[20px] outline-none! disabled:cursor-not-allowed md:text-[14px]",
              t.input,
              classNames?.input,
            )}
          />
        </div>

        <motion.label
          htmlFor={fieldId}
          initial={false}
          animate={{
            y: raised ? RAISE : 0,
            scale: raised ? SHRINK : 1,
          }}
          transition={move}
          style={{ originX: 0, originY: 0, willChange: "transform" }}
          className={cn(
            "absolute left-[15px] top-[15px] block max-w-[calc(100%-30px)] cursor-text select-none truncate text-[14px] leading-[18px] transition-colors duration-150",
            invalid ? t.labelInvalid : focused ? t.labelFocus : t.label,
            classNames?.label,
          )}
        >
          {label}
          {required ? (
            <span aria-hidden className={cn("ml-0.5", t.faint)}>
              *
            </span>
          ) : null}
        </motion.label>
      </div>

      <div className={cn("mt-1.5 flex h-[16px] items-start gap-3", classNames?.hintRow)}>
        <p
          aria-hidden
          className={cn(
            "min-w-0 flex-1 truncate text-[12px] leading-[16px]",
            invalid ? t.hintInvalid : t.hint,
            classNames?.hint,
          )}
        >
          {hint}
        </p>

        {maxLength !== undefined ? (
          <span
            aria-hidden
            className={cn(
              "grid shrink-0 justify-items-end text-[11px] leading-[16px] tabular-nums",
              t.faint,
              classNames?.counter,
            )}
          >
            <span className="invisible col-start-1 row-start-1">
              {maxLength} / {maxLength}
            </span>
            <span className="col-start-1 row-start-1">
              {length} / {maxLength}
            </span>
          </span>
        ) : null}

        {hint ? (
          <span id={hintId} className="sr-only">
            {hint}
          </span>
        ) : null}
      </div>
    </div>
  );
}
