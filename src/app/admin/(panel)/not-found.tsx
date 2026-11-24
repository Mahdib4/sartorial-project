import { AdminNotFound } from "@/components/admin/AdminShell";

/**
 * Shown inside the admin (menu and all) when an admin page asks for something
 * that is not there: a product deleted in another tab, an old bookmark, a link
 * from the overview to an item since removed. It leads back to the right list.
 */
export default function AdminNotFoundPage() {
  return <AdminNotFound />;
}
