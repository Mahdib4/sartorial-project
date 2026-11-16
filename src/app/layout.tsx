import type { Metadata, Viewport } from "next";
import "@fontsource-variable/jost";
import "./globals.css";
import "@/components/interior/interior-a.css";
import "@/components/interior/interior-b.css";
import { BagDrawer } from "@/components/layout/BagDrawer";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Preloader } from "@/components/layout/Preloader";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Toaster } from "@/components/layout/Toaster";
import { SITE } from "@/config/site";
import { searchIndex } from "@/data/catalog";
import { navGroups, navMenus } from "@/data/navigation";
import { INTRO_SCRIPT } from "@/lib/intro-script";
import { ShopProvider } from "@/store/shop";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Bespoke tailoring, ${SITE.city}`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} — Bespoke tailoring, ${SITE.city}`,
    description: SITE.description,
    images: [{ url: "/media/img/classic/suits/bespoke-tailored-suits-trio-01-1280.webp", width: 1280, height: 891 }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#1c1b17",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const groups = navGroups();
  return (
    // The opening animation's script marks <html> before the first paint (see lib/intro-script.ts).
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <Preloader />
        <noscript>
          <style>{`[data-reveal],[data-text-reveal] span{opacity:1!important;transform:none!important;clip-path:none!important;filter:none!important}.pl{display:none!important}`}</style>
        </noscript>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[80] focus:bg-ink focus:px-4 focus:py-3 focus:text-[13px] focus:text-white">
          Skip to content
        </a>
        <ShopProvider index={searchIndex()}>
          <SiteHeader menus={navMenus()} />
          <div id="main" className="flex flex-1 flex-col">
            {children}
          </div>
          <SiteFooter groups={groups} />
          <MobileMenu groups={groups} />
          <BagDrawer />
          <SearchOverlay groups={groups} />
          <Toaster />
        </ShopProvider>
      </body>
    </html>
  );
}
