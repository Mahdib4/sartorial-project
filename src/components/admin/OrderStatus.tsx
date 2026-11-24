"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setEnquiryStatus } from "@/app/admin/actions/orders";
import type { FormState } from "@/lib/admin/form";
import { cn } from "@/lib/cn";
import { ORDERS_CHANGED_EVENT } from "./AdminShell";
import { Select } from "./ui";

/**
 * Where an enquiry stands. Saves the moment a new status is chosen; there is no
 * separate Save button.
 *
 * On a list showing one status (e.g. New), an enquiry given another status stays
 * where it is, marked "Saved — moved to Contacted", with Undo, until the list is
 * next opened: it does not vanish from under the admin's finger. On the full
 * list the page is refreshed, so the card's colouring follows.
 */
export function OrderStatus({
  id,
  status,
  reference,
  options,
  filter = "",
}: {
  id: number;
  status: string;
  reference: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  /** The status the list is showing, or "" for all of them. */
  filter?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [seen, setSeen] = useState(status);
  const [result, setResult] = useState<FormState>(null);
  /** The status before the last change, for Undo. */
  const [undoTo, setUndoTo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Follow the saved status when the page is refreshed with a newer one.
  if (seen !== status) {
    setSeen(status);
    setValue(status);
  }

  const label = (v: string) => options.find((o) => o.value === v)?.label ?? v;

  function change(next: string, isUndo = false) {
    const previous = value;
    if (next === previous) return;
    setValue(next);
    setResult(null);
    startTransition(async () => {
      const form = new FormData();
      form.set("id", String(id));
      form.set("status", next);
      try {
        const outcome = await setEnquiryStatus(null, form);
        if (outcome?.error) {
          setValue(previous);
        } else {
          setUndoTo(isUndo ? null : previous);
          window.dispatchEvent(new Event(ORDERS_CHANGED_EVENT));
          // On the full list the card stays anyway, so bring the page up to date.
          if (!filter) router.refresh();
        }
        setResult(outcome);
      } catch {
        setValue(previous);
        setResult({ error: "Could not save. Check the internet connection and try again." });
      }
    });
  }

  const known = options.some((o) => o.value === value);
  const moved = Boolean(filter) && value !== filter && !pending && !result?.error;
  return (
    <div className="flex flex-col gap-1 sm:items-end" data-moved={moved ? "" : undefined}>
      <Select value={value} onChange={(e) => change(e.target.value)} disabled={pending} aria-label={`Status of ${reference}`} className="sm:w-48">
        {known ? null : <option value={value}>{value}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
      <p aria-live="polite" className={cn("flex min-h-4 flex-wrap items-center gap-x-2 text-[12px] leading-4 sm:justify-end", result?.error ? "text-accent" : "text-ink-3")}>
        {pending ? (
          "Saving…"
        ) : result?.error ? (
          result.error
        ) : result?.saved ? (
          <>
            <span className={moved ? "text-ink" : undefined}>{moved ? `Saved — moved to ${label(value)}` : "Saved"}</span>
            {undoTo !== null ? (
              <button type="button" onClick={() => change(undoTo, true)} className="text-ink underline underline-offset-2 hover:text-accent" aria-label={`Undo: set ${reference} back to ${label(undoTo)}`}>
                Undo
              </button>
            ) : null}
          </>
        ) : null}
      </p>
    </div>
  );
}
