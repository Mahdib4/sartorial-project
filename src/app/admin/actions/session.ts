"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkPassword, createSession, endSession } from "@/lib/admin/auth";
import { text, type FormState } from "@/lib/admin/form";

const attempts = new Map<string, { count: number; resetAt: number }>();

export async function signIn(_prev: FormState, form: FormData): Promise<FormState> {
  // A few tries a minute per address, against password guessing.
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const now = Date.now();
  const a = attempts.get(ip);
  if (a && a.resetAt > now && a.count >= 8) return { error: "Too many attempts. Wait a minute and try again." };
  attempts.set(ip, a && a.resetAt > now ? { count: a.count + 1, resetAt: a.resetAt } : { count: 1, resetAt: now + 60_000 });

  if (!(await checkPassword(text(form, "password", 200)))) return { error: "That password is not right." };
  await createSession();
  const next = text(form, "next", 200);
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function signOut(): Promise<void> {
  await endSession();
  redirect("/admin/login");
}
