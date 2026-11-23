"use client";

import { AnimatePresence, motion, useDragControls, useReducedMotion, type PanInfo } from "motion/react";
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  /** Pinned beneath the scrolling body (the primary action). */
  footer?: ReactNode;
  closeLabel?: string;
  className?: string;
  bodyClassName?: string;
};

/**
 * A panel that rises from the bottom edge: the phone's own idiom for filters
 * and choices. The handle and title row can be dragged down to dismiss it; the
 * body scrolls on its own; focus is held inside while it is open and handed
 * back afterwards; the page beneath neither scrolls nor takes focus.
 */
export function Sheet({ open, onOpenChange, title, children, footer, closeLabel = "Close", className, bodyClassName }: SheetProps) {
  const reduce = useReducedMotion();
  const controls = useDragControls();
  const titleId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const [host, setHost] = useState<HTMLElement | null>(null);

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the portal target only exists in the browser
    setHost(document.body);
  }, []);

  // Focus in on open, back to the opener on close.
  useEffect(() => {
    if (open) {
      returnTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const id = window.setTimeout(() => panelRef.current?.focus({ preventScroll: true }), 30);
      return () => window.clearTimeout(id);
    }
    const target = returnTo.current;
    returnTo.current = null;
    if (target?.isConnected) target.focus({ preventScroll: true });
  }, [open]);

  // Hold the page still and out of reach while the sheet is up.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";
    const muted: HTMLElement[] = [];
    for (const node of Array.from(document.body.children)) {
      if (!(node instanceof HTMLElement) || node.contains(rootRef.current) || node.inert) continue;
      node.inert = true;
      muted.push(node);
    }
    return () => {
      root.style.overflow = overflow;
      for (const node of muted) node.inert = false;
    };
  }, [open]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      close();
      return;
    }
    if (event.key !== "Tab") return;
    const panel = panelRef.current;
    if (!panel) return;
    const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null);
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 110 || info.velocity.y > 600) close();
  };

  if (!host) return null;

  return createPortal(
    <div ref={rootRef} className={cn("fixed inset-0 z-50", !open && "pointer-events-none")}>
      <AnimatePresence>
        {open ? (
          <motion.div
            key="scrim"
            aria-hidden
            className="absolute inset-0 bg-ink/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.15 : 0.35 }}
            onClick={close}
          />
        ) : null}
        {open ? (
          <motion.div
            key="panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            onKeyDown={onKeyDown}
            className={cn("absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col bg-white text-ink shadow-[0_-24px_48px_-24px_rgba(28,27,23,0.35)] outline-none!", className)}
            initial={reduce ? { opacity: 0 } : { y: "100%" }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            exit={reduce ? { opacity: 0 } : { y: "100%" }}
            transition={reduce ? { duration: 0.15 } : { duration: 0.5, ease: EASE }}
            drag={reduce ? false : "y"}
            dragControls={controls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.9 }}
            onDragEnd={onDragEnd}
          >
            {/* The grip: handle and title row. Dragging it down dismisses the sheet. */}
            <div className="shrink-0 cursor-grab touch-none select-none" onPointerDown={(e) => controls.start(e)}>
              <span aria-hidden className="mx-auto mt-2.5 block h-1 w-10 bg-line" />
              <div className="flex h-14 items-center justify-between gap-4 border-b border-line pr-2 pl-[var(--gutter)]">
                <h2 id={titleId} className="label">
                  {title}
                </h2>
                <button type="button" onClick={close} aria-label={closeLabel} className="grid h-11 w-11 place-items-center text-ink transition-opacity hover:opacity-60">
                  <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path d="M2 2l12 12M14 2 2 14" />
                  </svg>
                </button>
              </div>
            </div>
            <div className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain", bodyClassName)}>{children}</div>
            {footer ? <div className="shrink-0 border-t border-line bg-white px-[var(--gutter)] pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">{footer}</div> : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>,
    host,
  );
}
