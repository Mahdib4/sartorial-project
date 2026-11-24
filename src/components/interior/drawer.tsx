"use client";

// Adapted from interior.dev (MIT) — https://github.com/ddoemonn/interior
// The hook (useDrawer) is upstream and unchanged; only the styled layer below
// it is re-skinned for Sartorial.
/* eslint-disable react-hooks/refs, react-hooks/set-state-in-effect -- upstream hook logic, kept as is */

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  animate,
  motion,
  useDragControls,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { cn } from "@/lib/cn";

const DISCLOSE = {
  type: "spring",
  stiffness: 150,
  damping: 27,
  mass: 1,
} as const;

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

type Inertable = HTMLElement & { inert?: boolean };

type DragInfo = {
  offset: { x: number; y: number };
  velocity: { x: number; y: number };
};

export type DrawerSide = "left" | "right";

export type UseDrawerOptions = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: DrawerSide;
  width?: number;
  dismissRatio?: number;
  modal?: boolean;
};

export function useDrawer({
  open: controlled,
  defaultOpen = false,
  onOpenChange,
  side = "right",
  width = 320,
  dismissRatio = 0.38,
  modal = true,
}: UseDrawerOptions = {}) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const [dragging, setDragging] = useState(false);

  const open = controlled ?? uncontrolled;
  const sign = side === "right" ? 1 : -1;
  const away = sign * (width + 24);

  const x = useMotionValue(open ? 0 : away);
  const veil = useTransform(x, (v) => 1 - Math.min(1, Math.abs(v) / width));

  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const anim = useRef<{ stop: () => void } | null>(null);
  const live = useRef(open);
  live.current = open;

  const changed = useRef(onOpenChange);
  changed.current = onOpenChange;

  const reduced = useReducedMotion();
  const controls = useDragControls();

  const setOpen = useCallback(
    (next: boolean) => {
      if (controlled === undefined) setUncontrolled(next);
      changed.current?.(next);
    },
    [controlled],
  );

  const close = useCallback(() => setOpen(false), [setOpen]);

  const glide = useCallback(
    (to: number) => {
      anim.current?.stop();
      anim.current = animate(x, to, reduced ? { duration: 0 } : DISCLOSE);
    },
    [x, reduced],
  );

  useEffect(() => {
    glide(open ? 0 : away);
    return () => anim.current?.stop();
  }, [open, away, glide]);

  useEffect(() => {
    const panel = panelRef.current as Inertable | null;
    if (!panel) return;
    panel.inert = !open;
    return () => {
      panel.inert = false;
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      const active = document.activeElement;
      returnTo.current = active instanceof HTMLElement ? active : null;
      const panel = panelRef.current;
      if (!panel) return;
      const first = panel.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? panel).focus({ preventScroll: true });
      return;
    }
    const target = returnTo.current;
    returnTo.current = null;
    if (target && target.isConnected) target.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    if (!modal || !open) return;
    const root = document.documentElement;
    const overflow = root.style.overflow;
    const padding = root.style.paddingRight;
    const gutter = window.innerWidth - root.clientWidth;

    root.style.overflow = "hidden";
    if (gutter > 0) root.style.paddingRight = `${gutter}px`;

    return () => {
      root.style.overflow = overflow;
      root.style.paddingRight = padding;
    };
  }, [modal, open]);

  useEffect(() => {
    const shell = rootRef.current;
    if (!modal || !open || !shell) return;
    const muted: Inertable[] = [];

    for (const node of Array.from(document.body.children)) {
      if (!(node instanceof HTMLElement) || node.contains(shell)) continue;
      const el = node as Inertable;
      if (el.inert) continue;
      el.inert = true;
      muted.push(el);
    }

    return () => {
      for (const el of muted) el.inert = false;
    };
  }, [modal, open]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const panel = panelRef.current;
      if (!panel) return;

      if (event.key === "Escape") {
        event.stopPropagation();
        close();
        return;
      }
      if (event.key !== "Tab") return;

      const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (nodes.length === 0) {
        event.preventDefault();
        panel.focus({ preventScroll: true });
        return;
      }

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [close],
  );

  const startDrag = useCallback(
    (event: React.PointerEvent) => {
      if (!live.current) return;
      controls.start(event);
    },
    [controls],
  );

  const onDragStart = useCallback(() => setDragging(true), []);

  const onDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: DragInfo) => {
      setDragging(false);
      const travel = sign * info.offset.x;
      const speed = sign * info.velocity.x;
      if (travel > width * dismissRatio || speed > 520) {
        close();
        return;
      }
      glide(0);
    },
    [sign, width, dismissRatio, glide, close],
  );

  const panelProps = {
    tabIndex: -1,
    role: "dialog" as const,
    "aria-modal": modal,
    onKeyDown,
    drag: "x" as const,
    dragControls: controls,
    dragListener: false,
    dragMomentum: false,
    dragConstraints: { left: 0, right: 0 },
    dragElastic:
      side === "right"
        ? { top: 0, bottom: 0, left: 0, right: 1 }
        : { top: 0, bottom: 0, left: 1, right: 0 },
    onDragStart,
    onDragEnd,
  };

  return {
    open,
    side,
    width,
    dragging,
    x,
    veil,
    setOpen,
    close,
    rootRef,
    panelRef,
    panelProps,
    gripProps: { onPointerDown: startDrag },
  };
}

export type UseDrawerResult = ReturnType<typeof useDrawer>;

const CLOSE_ICON = (
  <svg width="16" height="16" viewBox="0 0 256 256" fill="none" aria-hidden="true">
    <line
      x1="208"
      y1="48"
      x2="48"
      y2="208"
      stroke="currentColor"
      strokeWidth="16"
      strokeLinecap="square"
    />
    <line
      x1="208"
      y1="208"
      x2="48"
      y2="48"
      stroke="currentColor"
      strokeWidth="16"
      strokeLinecap="square"
    />
  </svg>
);

export type DrawerClassNames = {
  /** the full-bleed positioning layer (fixed or absolute, z-50) */
  root?: string;
  scrim?: string;
  /** the header row; it is also the drag handle */
  header?: string;
  title?: string;
  description?: string;
  close?: string;
  /** the scrolling content area */
  body?: string;
  footer?: string;
};

export type DrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  description?: string;
  footer?: React.ReactNode;
  side?: DrawerSide;
  width?: number;
  container?: "viewport" | "parent";
  closeLabel?: string;
  dismissOnScrimClick?: boolean;
  /** lands on the panel */
  className?: string;
  classNames?: DrawerClassNames;
};

export function Drawer({
  open,
  onOpenChange,
  title,
  children,
  description,
  footer,
  side = "right",
  width = 460,
  container = "viewport",
  closeLabel = "Close panel",
  dismissOnScrimClick = true,
  className = "",
  classNames,
}: DrawerProps) {
  const titleId = useId();
  const hintId = useId();

  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setHost(container === "viewport" ? document.body : null);
  }, [container]);

  // The portal only exists from the second render. A drawer that mounts already
  // open (the filter drawer when a phone is turned sideways with the filters
  // showing) would otherwise run the hook's focus, inert and scroll-lock
  // effects before its panel exists, and never again. Until the panel is in
  // the page the hook treats it as closed; then it opens as usual.
  const mounted = container !== "viewport" || host !== null;

  const drawer = useDrawer({
    open: open && mounted,
    onOpenChange,
    side,
    width,
    modal: container === "viewport",
  });

  const edge = side === "right" ? "right-0 border-l" : "left-0 border-r";

  const tree = (
    <div
      ref={drawer.rootRef}
      className={cn(
        container === "viewport" ? "fixed" : "absolute",
        "inset-0 z-50 overflow-hidden",
        open ? "" : "pointer-events-none",
        classNames?.root,
      )}
    >
      <motion.div
        aria-hidden
        style={{ opacity: drawer.veil }}
        onClick={dismissOnScrimClick ? drawer.close : undefined}
        className={cn("absolute inset-0 bg-ink/40", classNames?.scrim)}
      />
      <motion.div
        ref={drawer.panelRef}
        // The hook makes the closed panel inert from an effect, but with
        // container="viewport" the portal mounts one tick later, so upstream
        // leaves a never-opened drawer focusable: Tab walks into it and the
        // browser scrolls it into view. Declaring it here covers that gap and
        // always agrees with what the hook sets.
        inert={!open}
        aria-labelledby={titleId}
        aria-describedby={hintId}
        style={{ x: drawer.x, width, maxWidth: "100%", touchAction: "pan-y" }}
        className={cn(
          "absolute inset-y-0 flex flex-col border-line bg-white text-ink outline-none!",
          edge,
          drawer.dragging ? "select-none" : "",
          className,
        )}
        {...drawer.panelProps}
      >
        <header
          onPointerDown={drawer.gripProps.onPointerDown}
          className={cn(
            "flex min-h-16 shrink-0 select-none items-center gap-4 border-b border-line px-6 py-3",
            drawer.dragging ? "cursor-grabbing" : "cursor-grab",
            classNames?.header,
          )}
        >
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className={cn("truncate label", classNames?.title)}>
              {title}
            </h2>
            {description ? (
              <p
                className={cn(
                  "mt-1 truncate text-[13px] leading-snug text-ink-3",
                  classNames?.description,
                )}
              >
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={drawer.close}
            aria-label={closeLabel}
            className={cn(
              "-mr-3 grid size-10 shrink-0 place-items-center text-ink transition-opacity duration-200 hover:opacity-55 focus-visible:-outline-offset-4!",
              classNames?.close,
            )}
          >
            {CLOSE_ICON}
          </button>
        </header>
        <div
          className={cn(
            "ia-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6",
            classNames?.body,
          )}
        >
          {children}
        </div>

        {footer ? (
          <div
            className={cn(
              "shrink-0 border-t border-line px-6 py-5",
              classNames?.footer,
            )}
          >
            {footer}
          </div>
        ) : null}

        <span id={hintId} className="sr-only">
          Press Escape to close this panel, or drag its handle toward the edge.
        </span>
      </motion.div>
    </div>
  );

  if (container !== "viewport") return tree;
  return host ? createPortal(tree, host) : null;
}
