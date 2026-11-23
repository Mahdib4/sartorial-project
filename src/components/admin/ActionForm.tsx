"use client";

import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/lib/admin/form";
import { cn } from "@/lib/cn";
import { buttonStyles, Notice } from "./ui";

/** A form posting to a server action, showing its error (if any) above the buttons. */
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
  return (
    <form action={formAction} className={cn("space-y-6", className)}>
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
export function ConfirmButton({ message, children, className, variant = "danger" }: { message: string; children: ReactNode; className?: string; variant?: keyof typeof buttonStyles }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(buttonStyles[variant], className)}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {pending ? "Working…" : children}
    </button>
  );
}
