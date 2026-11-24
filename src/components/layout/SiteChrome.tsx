import { BagDrawer } from "@/components/layout/BagDrawer";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Preloader } from "@/components/layout/Preloader";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Toaster } from "@/components/layout/Toaster";
import { catalog } from "@/data/catalog";
import { navGroups, navHighlights, navMenus } from "@/data/navigation";
import { ShopProvider } from "@/store/shop";
import type { ReactNode } from "react";

/**
 * The storefront around every page: opening animation, header and notices,
 * footer, menu, bag and search drawers, toasts. Used by the (site) layout and by
 * the 404 page for unknown addresses. The admin panel has its own layout.
 */
export async function SiteChrome({ children }: { children: ReactNode }) {
  const cat = await catalog();
  const groups = navGroups(cat);
  const notices = cat.banners("bar").map((b) => ({ id: b.id, text: b.title, href: b.href, cta: b.href ? b.cta : "" }));
  return (
    <>
      <Preloader />
      <noscript>
        <style>{`[data-reveal],[data-text-reveal] span{opacity:1!important;transform:none!important;clip-path:none!important;filter:none!important}.pl{display:none!important}`}</style>
      </noscript>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[80] focus:bg-ink focus:px-4 focus:py-3 focus:text-[13px] focus:text-white">
        Skip to content
      </a>
      <ShopProvider index={cat.searchIndex()} contact={cat.settings.contact}>
        <SiteHeader menus={navMenus(cat)} notices={notices} />
        <div id="main" className="flex flex-1 flex-col">
          {children}
        </div>
        <SiteFooter groups={groups} contact={cat.settings.contact} social={cat.settings.social} />
        <MobileMenu groups={groups} highlights={navHighlights(cat)} />
        <BagDrawer />
        <SearchOverlay groups={groups} />
        <Toaster />
      </ShopProvider>
    </>
  );
}
