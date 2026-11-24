"use client";

import Link from "next/link";
import { useEffect } from "react";
import { buttonStyles, Notice } from "@/components/admin/ui";

/**
 * When an admin page fails to load (often a passing hiccup with the connection
 * or the database). "Try again" asks the server for the page afresh (retry()),
 * rather than only redrawing what already failed.
 *
 * A database that is not connected at all is told apart on the server, in the
 * (panel) layout, never from the error's message: in production that message is
 * replaced with a generic one.
 */
export default function AdminError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="space-y-4">
      <Notice tone="warning">Something went wrong loading this page. Try again in a moment. If it keeps happening, check the internet connection, or reload the admin.</Notice>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => retry()} className={buttonStyles.primary}>
          Try again
        </button>
        <Link href="/admin" className={buttonStyles.secondary}>
          Go to the overview
        </Link>
      </div>
    </div>
  );
}
