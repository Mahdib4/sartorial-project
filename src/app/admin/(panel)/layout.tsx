import type { Metadata } from "next";
import { Suspense } from "react";
import { signOut } from "@/app/admin/actions/session";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

/** Admin pages always read fresh data from the database, so they wait for it rather than prerender a shell. */
export const instant = false;

/** Everything inside the admin needs a signed-in session, checked on every request. */
export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<div className="grid min-h-dvh place-items-center bg-paper text-[14px] text-ink-3">Loading…</div>}>
      <Gate>{children}</Gate>
    </Suspense>
  );
}

async function Gate({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  let newOrders = 0;
  try {
    newOrders = (await db()?.query("SELECT count(*)::int AS n FROM enquiries WHERE status = 'new'"))?.rows[0]?.n ?? 0;
  } catch {
    // the count is a nicety
  }
  return (
    <AdminShell newOrders={newOrders} signOut={signOut}>
      {children}
    </AdminShell>
  );
}
