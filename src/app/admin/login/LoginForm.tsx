"use client";

import { startTransition, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signIn } from "@/app/admin/actions/session";
import { buttonStyles, inputClass } from "@/components/admin/ui";

/** `children`: hidden fields from the page (the admin page to return to). */
export function LoginForm({ children }: { children?: React.ReactNode }) {
  const [state, action] = useActionState(signIn, null);
  return (
    <form
      action={action}
      onSubmit={(e) => {
        // The page's hidden "next" field streams in a moment after the form; a
        // quick sign-in reads the page to return to from the address instead
        // (the server checks it either way).
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const next = new URLSearchParams(window.location.search).get("next");
        if (!data.get("next") && next) data.set("next", next);
        startTransition(() => action(data));
      }}
      className="space-y-4"
    >
      {children}
      <div>
        <label htmlFor="password" className="mb-1.5 block text-[13px] font-medium">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required autoFocus className={inputClass} />
      </div>
      {state?.error ? <p className="text-[13px] text-accent" role="alert">{state.error}</p> : null}
      <Submit />
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${buttonStyles.primary} w-full`}>
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}
