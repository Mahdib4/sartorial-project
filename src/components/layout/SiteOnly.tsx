"use client";

import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";

/**
 * Storefront chrome (opening animation, header, footer, drawers): left out of
 * the admin panel. Its own Suspense boundary lets routes whose address is only
 * known at request time (admin pages) prerender; storefront pages, whose
 * addresses are known, render it straight into the static page.
 */
export function SiteOnly({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <Gate>{children}</Gate>
    </Suspense>
  );
}

function Gate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return pathname?.startsWith("/admin") ? null : <>{children}</>;
}
