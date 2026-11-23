import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default function LoginPage() {
  const dbConnected = Boolean(process.env.DATABASE_URL);
  const passwordSet = Boolean(process.env.ADMIN_PASSWORD);
  return (
    <main className="grid min-h-dvh flex-1 place-items-center bg-paper px-4 py-16 text-ink">
      <div className="w-full max-w-sm">
        <p className="text-center text-[20px] tracking-[0.34em]">SARTORIAL</p>
        <p className="mt-1 text-center text-[11px] tracking-[0.2em] text-ink-3 uppercase">Admin</p>
        <div className="mt-10 border border-line bg-white p-6">
          {!dbConnected ? (
            <p className="mb-4 border-l-2 border-accent bg-accent-soft px-3 py-2 text-[13px] leading-relaxed">
              The database is not connected yet, so the admin cannot be used. Add DATABASE_URL to the server&apos;s environment (see the README).
            </p>
          ) : null}
          {dbConnected && !passwordSet ? (
            <p className="mb-4 border-l-2 border-ink bg-paper px-3 py-2 text-[13px] leading-relaxed text-ink-2">
              If you have not set a password in Settings yet, set ADMIN_PASSWORD in the server&apos;s environment first.
            </p>
          ) : null}
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-[13px]">
          <Link href="/" className="text-ink-3 hover:text-ink">
            ← Back to the website
          </Link>
        </p>
      </div>
    </main>
  );
}
