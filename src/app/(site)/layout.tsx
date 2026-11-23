import type { ReactNode } from "react";
import { SiteChrome } from "@/components/layout/SiteChrome";

/** Every storefront page (the admin panel, under /admin, is outside this group). */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
