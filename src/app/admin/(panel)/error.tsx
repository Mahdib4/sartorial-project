"use client";

import { buttonStyles, Notice } from "@/components/admin/ui";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const noDb = error.message.includes("NO_DATABASE");
  return (
    <div className="space-y-4">
      <Notice tone="warning">
        {noDb
          ? "The database is not connected. Add DATABASE_URL to the server's environment variables (see the README), then reload."
          : "Something went wrong loading this page. Try again; if it keeps happening, reload the admin."}
      </Notice>
      <button type="button" onClick={reset} className={buttonStyles.secondary}>
        Try again
      </button>
    </div>
  );
}
