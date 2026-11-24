"use client";

import { startTransition, useActionState, useEffect, useRef, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/lib/admin/form";
import { cn } from "@/lib/cn";
import { buttonStyles, Notice } from "./ui";

/** Asked before leaving a page whose form has changes that are not saved. */
export const LEAVE_MESSAGE = "You have changes that are not saved yet. Leave this page and lose them?";

/**
 * Forms on the page that may have unsaved changes (the Settings page has three).
 * One set of listeners serves them all, so leaving asks once, not once per form.
 */
const forms = new Set<() => boolean>();
/** Set for a moment after the person agreed to leave, so a full page load does not ask a second time. */
let leaving = false;

/** True when any form on the page has changes that are not saved. */
export function hasUnsavedChanges(): boolean {
  if (leaving) return false;
  for (const dirty of forms) if (dirty()) return true;
  return false;
}

/** Ask before leaving with unsaved changes; true when it is fine to go. */
export function confirmLeave(): boolean {
  if (!hasUnsavedChanges()) return true;
  if (!window.confirm(LEAVE_MESSAGE)) return false;
  leaving = true;
  window.setTimeout(() => (leaving = false), 2000);
  return true;
}

function onBeforeUnload(e: BeforeUnloadEvent) {
  if (!hasUnsavedChanges()) return;
  e.preventDefault();
  e.returnValue = "";
}

/**
 * Runs before Next's links (capture phase, on window): a click on a link that
 * leaves the page asks first, and is stopped if the person wants to stay.
 */
function onLinkClick(e: MouseEvent) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const link = e.target instanceof Element ? e.target.closest("a[href]") : null;
  if (!(link instanceof HTMLAnchorElement) || link.hasAttribute("download")) return;
  if (link.target && link.target !== "_self") return; // opens in a new tab: nothing is lost
  const url = new URL(link.href, window.location.href);
  if (url.protocol !== "http:" && url.protocol !== "https:") return; // tel:, mailto:, whatsapp
  if (url.origin === window.location.origin && url.pathname === window.location.pathname && url.search === window.location.search) return; // the same page
  if (!confirmLeave()) {
    e.preventDefault();
    e.stopPropagation();
  }
}

function watch(dirty: () => boolean): () => void {
  if (forms.size === 0) {
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("click", onLinkClick, true);
  }
  forms.add(dirty);
  return () => {
    forms.delete(dirty);
    if (forms.size === 0) {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("click", onLinkClick, true);
    }
  };
}

/** Everything the form would post, as text, to tell whether anything changed. Photo pickers and piece pickers post hidden fields, so they count too. */
function snapshot(form: HTMLFormElement): string {
  const parts: string[] = [];
  new FormData(form).forEach((value, key) => parts.push(`${key}=${typeof value === "string" ? value : `[file ${value.name} ${value.size}]`}`));
  return parts.join("\n");
}

/**
 * A form posting to a server action, showing its error (if any) above the buttons.
 * What was typed is kept when the action returns an error: React would otherwise
 * reset every field after the action, so the submit is dispatched by hand (React
 * still tracks it, so `useFormStatus` shows "Saving…").
 *
 * Leaving the page with changes that are not saved (a menu link, the browser's
 * reload or close) asks first. Saving counts as saved straight away; if the save
 * comes back with an error, the changes count as unsaved again.
 *
 * Every grid inside the form lets its columns shrink (min-width: 0), so a long
 * name or word can never make the page wider than a phone's screen.
 */
export function ActionForm({
  action,
  children,
  submitLabel = "Save",
  footer,
  className,
}: {
  action: (state: FormState, form: FormData) => Promise<FormState>;
  children: ReactNode;
  submitLabel?: string;
  footer?: ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, null);
  const formRef = useRef<HTMLFormElement>(null);
  /** What the form held when last loaded or saved. */
  const baseline = useRef<string | null>(null);
  /** The baseline before the save in progress, restored if the save fails. */
  const beforeSave = useRef<string | null>(null);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    baseline.current = snapshot(form);
    return watch(() => (formRef.current && baseline.current !== null ? snapshot(formRef.current) !== baseline.current : false));
  }, []);

  useEffect(() => {
    if (state?.error && beforeSave.current !== null) baseline.current = beforeSave.current;
    beforeSave.current = null;
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const data = new FormData(form, (e.nativeEvent as SubmitEvent).submitter);
        beforeSave.current = baseline.current;
        baseline.current = snapshot(form);
        startTransition(() => formAction(data));
      }}
      className={cn("space-y-6 [&_.grid>*]:min-w-0", className)}
    >
      {children}
      <div className="sticky bottom-0 z-10 -mx-4 flex flex-col gap-3 border-t border-line bg-paper/95 px-4 py-4 backdrop-blur sm:-mx-0 sm:flex-row sm:items-center sm:justify-between sm:px-0">
        <div className="min-w-0 flex-1">{state?.error ? <Notice tone="warning">{state.error}</Notice> : state?.saved ? <Notice tone="success">{state.saved}</Notice> : null}</div>
        <div className="flex flex-wrap items-center gap-2">
          {footer}
          <SubmitButton>{submitLabel}</SubmitButton>
        </div>
      </div>
    </form>
  );
}

export function SubmitButton({ children, className }: { children: ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={cn(buttonStyles.primary, "min-w-28", className)}>
      {pending ? "Saving…" : children}
    </button>
  );
}

/** A button that asks before submitting the (server action) form it sits in. */
export function ConfirmButton({ message, children, className, variant = "danger", label }: { message: string; children: ReactNode; className?: string; variant?: keyof typeof buttonStyles; label?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={label}
      className={cn(buttonStyles[variant], className)}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {pending ? "Working…" : children}
    </button>
  );
}
