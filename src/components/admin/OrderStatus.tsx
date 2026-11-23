"use client";

import { useState, useTransition } from "react";
import { setEnquiryStatus } from "@/app/admin/actions/orders";
import type { FormState } from "@/lib/admin/form";
import { cn } from "@/lib/cn";
import { Select } from "./ui";

/**
 * Where an enquiry stands. Saves the moment a new status is chosen; there is no
 * separate Save button.
 */
export function OrderStatus({
  id,
  status,
  reference,
  options,
}: {
  id: number;
  status: string;
  reference: string;
  options: ReadonlyArray<{ value: string; label: string }>;
}) {
  const [value, setValue] = useState(status);
  const [seen, setSeen] = useState(status);
  const [result, setResult] = useState<FormState>(null);
  const [pending, startTransition] = useTransition();

  // Follow the saved status when the page is refreshed with a newer one.
  if (seen !== status) {
    setSeen(status);
    setValue(status);
  }

  function change(next: string) {
    const previous = value;
    setValue(next);
    setResult(null);
    startTransition(async () => {
      const form = new FormData();
      form.set("id", String(id));
      form.set("status", next);
      try {
        const outcome = await setEnquiryStatus(null, form);
        if (outcome?.error) setValue(previous);
        setResult(outcome);
      } catch {
        setValue(previous);
        setResult({ error: "Could not save. Check the internet connection and try again." });
      }
    });
  }

  const known = options.some((o) => o.value === value);
  return (
    <div className="flex flex-col gap-1 sm:items-end">
      <Select
        value={value}
        onChange={(e) => change(e.target.value)}
        disabled={pending}
        aria-label={`Status of ${reference}`}
        className="sm:w-48"
      >
        {known ? null : <option value={value}>{value}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
      <p aria-live="polite" className={cn("min-h-4 text-[12px] leading-4", result?.error ? "text-accent" : "text-ink-3")}>
        {pending ? "Saving…" : result?.error ? result.error : result?.saved ? "Saved" : ""}
      </p>
    </div>
  );
}
