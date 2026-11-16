"use client";

import { useState } from "react";
import { LabelInput } from "@/components/bencho/label-input/LabelInput";
import { LoadingButton } from "@/components/interior/loading-button";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type State = { kind: "idle" } | { kind: "done" } | { kind: "closed" } | { kind: "failed" };

/**
 * Newsletter sign-up. Posts to /api/newsletter, which forwards to the list
 * provider configured in NEWSLETTER_WEBHOOK_URL. Until that is set the form
 * says so plainly instead of pretending to have subscribed anyone.
 */
export function Newsletter() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [state, setState] = useState<State>({ kind: "idle" });

  const submit = async () => {
    const value = email.trim();
    if (!EMAIL.test(value)) {
      setError("Please enter a valid email address.");
      throw new Error("invalid");
    }
    setError(undefined);
    const response = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: value }),
    });
    if (response.status === 503) {
      setState({ kind: "closed" });
      throw new Error("closed");
    }
    if (!response.ok) {
      setState({ kind: "failed" });
      throw new Error("failed");
    }
    setState({ kind: "done" });
    setEmail("");
  };

  return (
    <form
      noValidate
      onSubmit={(e) => e.preventDefault()}
      className="max-w-md"
      aria-describedby="newsletter-status"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <LabelInput
          className="min-w-0 flex-1"
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(v) => {
            setEmail(v);
            if (error) setError(undefined);
            if (state.kind !== "idle") setState({ kind: "idle" });
          }}
          error={error}
        />
        <LoadingButton onAction={submit} pendingLabel="Sending" successLabel="Subscribed" errorLabel="Not sent" className="h-[52px]! shrink-0 sm:w-36">
          Subscribe
        </LoadingButton>
      </div>
      <p id="newsletter-status" role="status" className="mt-3 min-h-10 text-[12.5px] leading-relaxed text-ink-3">
        {state.kind === "done"
          ? "Thank you. You are on the list."
          : state.kind === "closed"
            ? "Our list is not open yet. Please check back soon."
            : state.kind === "failed"
              ? "Something went wrong on our side. Please try again in a moment."
              : "Occasional notes on new cloths, new pieces and fitting dates. Unsubscribe at any time."}
      </p>
    </form>
  );
}
