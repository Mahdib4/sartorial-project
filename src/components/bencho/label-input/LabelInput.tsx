"use client";

import { type CSSProperties, useEffect, useId, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import "./LabelInput.css";

/* ══ Label input ══════════════════════════════════════════
   Adapted from Bencho (blocks/label-input, MIT — see
   ../LICENSE.md). A field whose label is its placeholder until
   you are in it. On focus the label lifts into the top edge
   with a small hop running along its letters, the outline
   darkens in place, and the top line parts under the label
   from its middle outward.

   ── ONE THING MOVES ─────────────────────────────────────
   The outline is always whole; focus only changes its ink and
   opens the gap. The label is the event, and the line makes
   room for it. The gap is two short paths across the notch,
   each from the middle to one side, retracted from the middle
   outward by a negative dash offset.

   What changed from the Bencho demo: it is a generic,
   CONTROLLED field — label, name, type, value and onChange are
   props, and there is an error line under it. It is as wide as
   its container rather than 280px: the outline is drawn in
   pieces that hang off the left and the right edge, so nothing
   has to be measured for it. And it has a tone for dark
   ground. The demo's "showcase" mode (a preview that keeps the
   keyboard and the password managers away) is gone — this is a
   real field. */

export type LabelInputProps = {
  label: string;
  name: string;
  type?: "text" | "email" | "tel" | "password";
  /** the text — the parent owns this */
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  /** defaults to "email" / "tel" for those types; unset otherwise */
  autoComplete?: string;
  /** shown under the field; also marks it invalid for assistive tech */
  error?: string;
  /** the field's corner, px — at half the height (26) it is a pill */
  corner?: number;
  /** "dark" is for dark ground: white ink, a translucent white outline */
  tone?: "light" | "dark";
  className?: string;
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const H = 52;
/* the lifted label's size, against its resting one */
const S = 0.78;
/* the stroke sits half a stroke inside the box so none of it
   is clipped by the svg's own edge */
const IN = 0.75;
/* what a letter of the label is taken to measure before it has
   been measured: about half an em of 16px */
const GUESS = 7.2;

export function LabelInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  autoComplete,
  error,
  corner = 0,
  tone = "light",
  className,
}: LabelInputProps) {
  const r = corner < 1 ? 0 : clamp(corner, 0, H / 2);
  const secret = type === "password";
  const uid = useId().replace(/:/g, "");
  const id = `lbi-${uid}`;
  const errId = `${id}-err`;

  const [focus, setFocus] = useState(false);
  const [show, setShow] = useState(false);
  const [flip, setFlip] = useState(0);

  /* ── the notch is the label's own width, so it is measured ──
     By an observer rather than once: the label's face may still
     be loading when this mounts, and a label the parent changes
     is a different width. Until the first reading it is guessed. */
  const lab = useRef<HTMLLabelElement | null>(null);
  const [seen, setSeen] = useState<{ of: string; w: number } | null>(null);
  const mark = required ? `${label} *` : label;
  const lw = seen && seen.of === mark ? seen.w : Math.round(mark.length * GUESS);
  useEffect(() => {
    const el = lab.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      const w = el.offsetWidth;
      if (w > 0) setSeen((was) => (was && was.of === mark && was.w === w ? was : { of: mark, w }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [mark]);

  const up = focus || value.length > 0;
  const bad = !!error;

  /* ── where the label sits, and the gap it leaves ─────────
     Never inside the corner's curve: the notch has to open on
     the straight part of the top edge, so a rounder field
     starts its label further in. */
  const lx = Math.max(14, r + 4);
  const x0 = Math.max(r * 0.6, lx - 5);
  const x1 = lx + lw * S + 5;
  const a = r - IN;
  const B = H - IN;
  /* the gap, as two halves from its middle to each side */
  const nm = (x0 + x1) / 2;
  const gapL = `M${nm},${IN} L${x0},${IN}`;
  const gapR = `M${nm},${IN} L${x1},${IN}`;

  /* ── the outline, in pieces that need no width ───────────
     The demo drew two paths round a box it knew was 280 wide.
     This one is as wide as it is given, so the same line is cut
     where the width would have had to be known:

       · the LEFT end — from the notch, round the left side, to
         the bottom edge — is measured from the left as before;
       · the RIGHT end is the mirror of it, drawn in an svg
         placed at 100%, so its coordinates count back from the
         right edge;
       · and the two straight runs between them are lines that
         end at "100%" inside an svg shifted left by the corner,
         which is where the right end begins.

     `c` is how far along the straight edges the two ends reach
     before the runs take over: the corner itself, or a couple
     of pixels of a square one. */
  const c = Math.max(r, 2);
  const left =
    r > 0
      ? `M${x0},${IN} L${r},${IN} A${a},${a} 0 0 0 ${IN},${r} L${IN},${H - r} A${a},${a} 0 0 0 ${r},${B} L${c},${B}`
      : `M${x0},${IN} L${IN},${IN} L${IN},${B} L${c},${B}`;
  const right =
    r > 0
      ? `M${-c},${IN} L${-r},${IN} A${a},${a} 0 0 1 ${-IN},${r} L${-IN},${H - r} A${a},${a} 0 0 1 ${-r},${B} L${-c},${B}`
      : `M${-c},${IN} L${-IN},${IN} L${-IN},${B} L${-c},${B}`;

  const reveal = () => {
    setShow((s) => !s);
    setFlip((f) => f + 1);
  };

  /* typed exactly: no capitals, no corrections, no red squiggles */
  const exact = type !== "text";
  const fill = autoComplete ?? (type === "email" ? "email" : type === "tel" ? "tel" : undefined);

  return (
    <div
      className={className ? `lbi ${className}` : "lbi"}
      data-up={up}
      data-focus={focus}
      data-filled={value.length > 0}
      data-tone={tone}
      data-invalid={bad || undefined}
      style={{ "--lbi-x": `${lx}px`, "--lbi-h": `${H}px` } as CSSProperties}
    >
      <div className="lbi-box" style={{ borderRadius: r }}>
        <svg className="lbi-ring" aria-hidden="true" focusable="false">
          <path d={left} />
          <svg x="100%" width="1" height="100%" overflow="visible">
            <path d={right} />
          </svg>
          <svg x={-c} width="100%" height="100%" overflow="visible">
            {/* top: from the notch to where the right end begins */}
            <line x1={x1 + c} y1={IN} x2="100%" y2={IN} />
            {/* bottom: from where the left end stops to the same */}
            <line x1={c * 2} y1={B} x2="100%" y2={B} />
          </svg>
          <path className="lbi-gap" d={gapL} pathLength={1} />
          <path className="lbi-gap" d={gapR} pathLength={1} />
        </svg>

        {/* The letters are drawn one by one for the hop, and a
            name read out of them would come out spelled — so they
            are hidden from assistive tech and the field carries
            its name itself (aria-label below). The label is still
            the label: pressing it puts you in the field. */}
        <label className="lbi-label" htmlFor={id} ref={lab}>
          <span className="lbi-letters" aria-hidden="true">
            {[...label].map((ch, i) => (
              <span key={i} style={{ "--i": i } as CSSProperties}>
                {ch === " " ? " " : ch}
              </span>
            ))}
            {required ? <span className="lbi-req">{" *"}</span> : null}
          </span>
        </label>

        <input
          id={id}
          className="lbi-field"
          /* only once it has been flipped: a field that blurred in
             on every page load would be the block performing */
          data-flip={flip === 0 ? undefined : flip % 2}
          type={secret ? (show ? "text" : "password") : type}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          required={required}
          aria-label={label}
          aria-required={required || undefined}
          aria-invalid={bad || undefined}
          aria-describedby={bad ? errId : undefined}
          autoComplete={fill}
          autoCorrect={exact ? "off" : undefined}
          autoCapitalize={exact ? "off" : undefined}
          spellCheck={exact ? false : undefined}
          style={{ paddingRight: secret ? 48 : lx }}
        />

        {secret && (
          <button
            className="lbi-eye"
            type="button"
            data-show={show}
            /* keep focus in the field: the eye is a toggle on
               what you are typing, not somewhere to go */
            onPointerDown={(e) => e.preventDefault()}
            onClick={reveal}
            aria-label={show ? "Hide password" : "Show password"}
          >
            <Eye size={16} strokeWidth={2} aria-hidden="true" focusable="false" />
            <EyeOff size={16} strokeWidth={2} aria-hidden="true" focusable="false" />
          </button>
        )}
      </div>

      {/* always here, so that what appears in it is announced */}
      <div className="lbi-note" aria-live="polite">
        {bad ? (
          <p className="lbi-error" id={errId}>
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
