"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useHideOnScroll } from "@/components/interior/hide-on-scroll";
import { Tooltip, TooltipGroup } from "@/components/interior/tooltip-group";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { MegaMenu } from "@/components/layout/MegaMenu";
import { IconButton } from "@/components/ui/Icon";
import { Wordmark } from "@/components/ui/Wordmark";
import type { NavMenu } from "@/data/navigation";
import { cn } from "@/lib/cn";
import { useShop } from "@/store/shop";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Pages that open on a full-bleed film or photograph: the header floats over it, transparent, until you scroll. */
const OVERLAY_ROUTES = new Set(["/", "/clothing", "/clothing/heritage", "/clothing/classic", "/accessories", "/footwear", "/bespoke"]);

export function isOverlayRoute(pathname: string): boolean {
  return OVERLAY_ROUTES.has(pathname.replace(/\/$/, "") || "/");
}

function Count({ value, label }: { value: number; label: string }) {
  if (value <= 0) return null;
  return (
    <span className="absolute top-1.5 right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[9.5px] leading-none font-medium text-white tabular-nums" aria-label={`${value} ${label}`}>
      {value}
    </span>
  );
}

export function SiteHeader({ menus }: { menus: NavMenu[] }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const { overlay, open, close, count, wishlist, ready } = useShop();
  const [menu, setMenu] = useState<number | null>(null);
  const timer = useRef<number | null>(null);
  const triggers = useRef<Array<HTMLAnchorElement | null>>([]);
  const quietFocus = useRef(false);

  const { hidden, atTop } = useHideOnScroll({ pinned: menu !== null || overlay !== null, topGuard: 28, hideAfter: 60, revealAfter: 12 });
  const transparent = isOverlayRoute(pathname) && atTop && menu === null && overlay !== "search";

  // Tell sticky page elements (see the `top-header` utility) how much room the header is taking.
  useEffect(() => {
    document.documentElement.style.setProperty("--header-shown", hidden ? "0px" : "calc(var(--header-h) + var(--banner-h))");
  }, [hidden]);

  const clear = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
  };
  const openSoon = (index: number) => {
    clear();
    timer.current = window.setTimeout(() => setMenu(index), menu === null ? 90 : 0);
  };
  const closeSoon = () => {
    clear();
    timer.current = window.setTimeout(() => setMenu(null), 160);
  };
  const closeNow = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
    setMenu(null);
  }, []);

  // Arriving on a new page closes the menu (the shop store does the same for its overlays).
  const [seenPath, setSeenPath] = useState(pathname);
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setMenu(null);
  }

  // Escape closes the menu and hands focus back to the link that opened it.
  useEffect(() => {
    if (menu === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const trigger = triggers.current[menu];
      if (trigger && document.activeElement?.closest(`#menu-${menu}`)) {
        quietFocus.current = true;
        trigger.focus();
        quietFocus.current = false;
      }
      closeNow();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu, closeNow]);

  /** Arrow-down on a menu's link steps into the menu itself. */
  const enterMenu = (index: number) => {
    clear();
    setMenu(index);
    window.setTimeout(() => document.querySelector<HTMLElement>(`#menu-${index} a`)?.focus(), 90);
  };

  const linkClass = "link-draw text-[14px] tracking-[0.01em]";

  return (
    <>
      <AnimatePresence>
        {menu !== null ? (
          <motion.div
            key="scrim"
            aria-hidden
            className="fixed inset-0 z-30 bg-ink/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={closeNow}
          />
        ) : null}
      </AnimatePresence>

      <header
        className={cn("fixed inset-x-0 top-0 z-40 transition-transform duration-500 ease-out-expo", hidden && "-translate-y-full")}
        onMouseLeave={closeSoon}
        onMouseEnter={() => menu !== null && clear()}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) closeNow();
        }}
      >
        <AnnouncementBar overlay={transparent} />

        <div className={cn("relative transition-[background-color,color,border-color] duration-500", transparent ? "on-dark border-b border-transparent bg-transparent text-white" : "border-b border-line-soft bg-white text-ink")}>
          <div className="grid h-[var(--header-h)] grid-cols-[1fr_auto_1fr] items-center px-gutter">
            {/* Left: navigation (desktop) or menu button (touch) */}
            <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
              {menus.map((item, i) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={linkClass}
                  data-active={menu === i}
                  aria-haspopup="true"
                  aria-expanded={menu === i}
                  aria-controls={`menu-${i}`}
                  ref={(node) => {
                    triggers.current[i] = node;
                  }}
                  onMouseEnter={() => openSoon(i)}
                  onFocus={() => {
                    if (!quietFocus.current) setMenu(i);
                  }}
                  onKeyDown={(e) => {
                    if (e.key !== "ArrowDown") return;
                    e.preventDefault();
                    enterMenu(i);
                  }}
                  onClick={closeNow}
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/bespoke" className={cn(linkClass, !transparent && "text-accent")} onMouseEnter={closeSoon} onFocus={closeNow}>
                Bespoke
              </Link>
            </nav>
            <div className="-ml-2.5 lg:hidden">
              <IconButton name="menu" size={24} active={overlay === "menu"} expanded={overlay === "menu"} label={overlay === "menu" ? "Close menu" : "Open menu"} onClick={() => (overlay === "menu" ? close() : open("menu"))} />
            </div>

            {/* Centre: wordmark */}
            <Link href="/" aria-label="Sartorial, home" className="justify-self-center" onMouseEnter={closeSoon}>
              <Wordmark className="text-[17px] xs:text-[19px] md:text-[23px]" />
            </Link>

            {/* Right: actions */}
            <div className="-mr-2.5 flex items-center justify-self-end" onMouseEnter={closeSoon}>
              <Link href="/appointments" className={cn(linkClass, "mr-5 hidden xl:inline")}>
                Book a fitting
              </Link>
              <TooltipGroup className="flex items-center">
                <Tooltip label={overlay === "search" ? "Close" : "Search"} side="bottom">
                  <span className="inline-flex">
                    <IconButton name="searchToX" active={overlay === "search"} expanded={overlay === "search"} label={overlay === "search" ? "Close search" : "Search"} onClick={() => (overlay === "search" ? close() : open("search"))} />
                  </span>
                </Tooltip>
                <Tooltip label="Wishlist" side="bottom">
                  <span className="hidden sm:inline-flex">
                    <IconButton name="heart" interaction="hover" label="Wishlist" href="/wishlist">
                      {ready ? <Count value={wishlist.length} label="saved pieces" /> : null}
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip label="Bag" side="bottom" align="end">
                  <span className="inline-flex">
                    <IconButton name="shoppingBag" interaction="hover" label="Open bag" expanded={overlay === "bag"} onClick={() => open("bag")}>
                      {ready ? <Count value={count} label="pieces in bag" /> : null}
                    </IconButton>
                  </span>
                </Tooltip>
              </TooltipGroup>
            </div>
          </div>

          {/* Mega menu */}
          <AnimatePresence>
            {menu !== null ? (
              <motion.div
                key="mega"
                className="absolute inset-x-0 top-full hidden overflow-hidden bg-white text-ink shadow-[0_30px_60px_-30px_rgba(28,27,23,0.35)] lg:block"
                initial={reduce ? { opacity: 0 } : { opacity: 0, clipPath: "inset(0% 0% 100% 0%)" }}
                animate={{ opacity: 1, clipPath: "inset(0% 0% 0% 0%)" }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, clipPath: "inset(0% 0% 100% 0%)" }}
                transition={{ duration: 0.55, ease: EASE }}
              >
                <MegaMenu key={menu} id={`menu-${menu}`} menu={menus[menu]} onNavigate={closeNow} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </header>
    </>
  );
}
