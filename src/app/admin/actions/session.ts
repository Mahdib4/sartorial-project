"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { adminReturnPath, checkPassword, createSession, endSession } from "@/lib/admin/auth";
import { text, type FormState } from "@/lib/admin/form";
import { passwordAttempt, WRONG_PASSWORD_DELAY_MS } from "@/lib/rate-limit";

/** What to tell someone signing in when the password could not be checked at all. */
function unavailable(error: unknown): string {
  if (error instanceof Error && error.message === "NO_DATABASE") return "The database is not connected, so the admin cannot be used yet.";
  console.error("admin: sign-in could not be checked", error);
  return "The admin cannot reach its database just now, so your password could not be checked. Wait a moment and try again.";
}

export async function signIn(_prev: FormState, form: FormData): Promise<FormState> {
  // A few wrong passwords a minute, against password guessing.
  const attempt = passwordAttempt(await headers());
  if (!attempt) return { error: "Too many attempts. Wait a minute and try again." };

  try {
    if (!(await checkPassword(text(form, "password", 200)))) {
      await new Promise((resolve) => setTimeout(resolve, WRONG_PASSWORD_DELAY_MS));
      return { error: "That password is not right." };
    }
    attempt.undo(); // a right password does not count against the limit
    await createSession();
  } catch (error) {
    attempt.undo();
    return { error: unavailable(error) };
  }
  redirect(adminReturnPath(text(form, "next", 1000)) ?? "/admin");
}

export async function signOut(): Promise<void> {
  await endSession();
  redirect("/admin/login");
}
