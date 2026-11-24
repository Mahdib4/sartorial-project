"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { ENQUIRY_STATUSES } from "@/lib/admin/data";
import { dbMessage, int, text, type FormState } from "@/lib/admin/form";
import { db } from "@/lib/db";

const STATUSES: readonly string[] = ENQUIRY_STATUSES.map((s) => s.value);

/**
 * Change where an enquiry stands (new → contacted → confirmed → completed, or
 * cancelled). Enquiries are private to the house, so the website is not touched.
 *
 * The page is not refreshed from here: on a list showing one status, the card
 * must stay where it is (with Undo) until the list is next opened. The status
 * box refreshes the full list itself, and tells the menu's new-orders count.
 */
export async function setEnquiryStatus(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const pool = db();
  if (!pool) return { error: "The database is not connected." };

  const id = int(form, "id");
  const status = text(form, "status", 20);
  if (!id || id < 1) return { error: "This enquiry could not be found." };
  if (!STATUSES.includes(status)) return { error: "Choose a status from the list." };

  try {
    const { rowCount } = await pool.query("UPDATE enquiries SET status = $2, updated_at = now() WHERE id = $1", [id, status]);
    if (!rowCount) return { error: "This enquiry no longer exists." };
  } catch (error) {
    return { error: dbMessage(error) };
  }
  return { saved: "Saved" };
}

/** Remove an enquiry for good (for example a test or a duplicate). */
export async function deleteEnquiry(form: FormData): Promise<void> {
  await requireAdmin();
  const id = int(form, "id");
  if (id && id > 0) await db()?.query("DELETE FROM enquiries WHERE id = $1", [id]);

  // Return to the same tab and search.
  const back = new URLSearchParams({ deleted: "1" });
  const status = text(form, "status", 20);
  const q = text(form, "q", 100);
  if (STATUSES.includes(status)) back.set("status", status);
  if (q) back.set("q", q);
  redirect(`/admin/orders?${back.toString()}`);
}
