"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signIn } from "@/app/admin/actions/session";
import { buttonStyles, inputClass } from "@/components/admin/ui";

export function LoginForm() {
  const [state, action] = useActionState(signIn, null);
  return (
    <form action={action} className="space-y-4">
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
