import type { Metadata } from "next";
import { Suspense } from "react";
import { signOut } from "@/app/admin/actions/session";
import { AdminShell } from "@/components/admin/AdminShell";
import { Notice, PageHead } from "@/components/admin/ui";
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
  const pool = db();

  // Without a database no admin page can load or save anything: say so plainly here,
  // rather than letting every page fail with a general error.
  if (!pool) {
    return (
      <AdminShell newOrders={0} signOut={signOut}>
        <PageHead title="The database is not connected" />
        <Notice tone="warning">
          The admin keeps products, orders and settings in the database, and the server cannot reach it, so nothing can be shown or saved yet. Your developer needs to add the database address (DATABASE_URL) to the server&apos;s settings, as the README explains. Then reload this page.
        </Notice>
      </AdminShell>
    );
  }

  // The starting count for the menu's "new orders" badge; the menu keeps it current from then on.
  let newOrders = 0;
  try {
    newOrders = (await pool.query("SELECT count(*)::int AS n FROM enquiries WHERE status = 'new'")).rows[0]?.n ?? 0;
  } catch {
    // the count is a nicety
  }
  return (
    <AdminShell newOrders={newOrders} signOut={signOut}>
      {children}
    </AdminShell>
  );
}
