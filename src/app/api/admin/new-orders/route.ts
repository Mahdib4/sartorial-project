import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { db } from "@/lib/db";

/**
 * How many enquiries are still marked New, for the badge in the admin menu
 * (components/admin/AdminShell.tsx asks again on every page change, when the
 * admin comes back to the tab, and after a status is changed). Signed-in only.
 */
export async function GET() {
  const noStore = { "Cache-Control": "no-store" };
  if (!(await isAdmin())) return NextResponse.json({ error: "Please sign in again." }, { status: 401, headers: noStore });
  const pool = db();
  if (!pool) return NextResponse.json({ error: "The database is not connected." }, { status: 503, headers: noStore });
  try {
    const { rows } = await pool.query("SELECT count(*)::int AS n FROM enquiries WHERE status = 'new'");
    return NextResponse.json({ count: Number(rows[0]?.n ?? 0) }, { headers: noStore });
  } catch {
    return NextResponse.json({ error: "The count could not be read." }, { status: 500, headers: noStore });
  }
}
