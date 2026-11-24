"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { confirmLeave } from "./ActionForm";
import { buttonStyles, PageHead } from "./ui";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/orders", label: "Orders & enquiries" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/banners", label: "Banners & notices" },
  { href: "/admin/offers", label: "Offers & discounts" },
  { href: "/admin/collections", label: "Collections & launches" },
  { href: "/admin/homepage", label: "Home page" },
  { href: "/admin/settings", label: "Settings" },
];

/** Sent on `window` when an enquiry's status changes, so the new-orders count is asked for again. */
export const ORDERS_CHANGED_EVENT = "sartorial:orders-changed";

/**
 * Keeps the space for the sticky bars when the browser scrolls a field into view
 * (the phone keyboard's "next", a jump to a section): the menu bar at the top on
 * phones, and a form's save bar at the bottom.
 */
const SCROLL_ROOM = "html{scroll-padding-top:4.5rem;scroll-padding-bottom:7rem}@media (min-width:64rem){html{scroll-padding-top:1rem}}";

/**
 * How many enquiries are still New, kept current: the server's count when the
 * admin opens, then asked for again on every page change, when the admin comes
 * back to the tab, and whenever a status is changed (ORDERS_CHANGED_EVENT).
 */
function useNewOrders(initial: number, pathname: string): number {
  const [count, setCount] = useState(initial);
  const [seen, setSeen] = useState(initial);
  // A fresh count from the server (after a refresh) wins.
  if (seen !== initial) {
    setSeen(initial);
    setCount(initial);
  }

  useEffect(() => {
    let request: AbortController | null = null;
    const ask = async () => {
      request?.abort();
      const current = (request = new AbortController());
      try {
        const res = await fetch("/api/admin/new-orders", { cache: "no-store", signal: current.signal });
        const json = res.ok ? ((await res.json()) as { count?: unknown }) : null;
        if (!current.signal.aborted && typeof json?.count === "number") setCount(json.count);
      } catch {
        // Offline, or a newer request took over: keep the last count.
      }
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") void ask();
    };
    void ask();
    window.addEventListener(ORDERS_CHANGED_EVENT, ask);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      request?.abort();
      window.removeEventListener(ORDERS_CHANGED_EVENT, ask);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [pathname]);

  return count;
}

/** The admin's frame: a plain list of sections on the left (a menu button on phones). */
export function AdminShell({ children, newOrders: initialNewOrders, signOut }: { children: ReactNode; newOrders: number; signOut: () => Promise<void> }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const newOrders = useNewOrders(initialNewOrders, pathname);
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  const current = NAV.find((n) => isActive(n.href))?.label ?? "Admin";
  const newOrdersText = `${newOrders} new ${newOrders === 1 ? "order" : "orders"}`;

  const nav = (
    <nav aria-label="Admin" className="flex flex-col">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setOpen(false)}
          aria-current={isActive(item.href) ? "page" : undefined}
          className={cn("flex items-center justify-between px-4 py-2.5 text-[14px] transition-colors", isActive(item.href) ? "bg-ink text-white" : "text-ink-2 hover:bg-white hover:text-ink")}
        >
          {item.label}
          {item.href === "/admin/orders" && newOrders > 0 ? (
            <span className={cn("min-w-6 rounded-full px-1.5 text-center text-[11px] leading-5", isActive(item.href) ? "bg-white text-ink" : "bg-accent text-white")}>
              {newOrders}
              <span className="sr-only"> new</span>
            </span>
          ) : null}
        </Link>
      ))}
    </nav>
  );

  const signOutButton = (className: string) => (
    <form action={signOut}>
      <button
        type="submit"
        className={className}
        onClick={(e) => {
          if (!confirmLeave()) e.preventDefault();
        }}
      >
        Sign out
      </button>
    </form>
  );

  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-paper text-ink lg:flex-row">
      <style>{SCROLL_ROOM}</style>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-line lg:block">
        <div className="sticky top-0 flex h-dvh flex-col">
          <Link href="/admin" className="block px-4 pt-6 pb-5">
            <span className="block text-[17px] tracking-[0.32em]">SARTORIAL</span>
            <span className="mt-1 block text-[11px] tracking-[0.18em] text-ink-3 uppercase">Admin</span>
          </Link>
          <div className="flex-1 overflow-y-auto">{nav}</div>
          <div className="space-y-1 border-t border-line p-4 text-[13px]">
            <a href="/" target="_blank" rel="noreferrer" className="block py-1 text-ink-2 hover:text-ink">
              View the website ↗
            </a>
            {signOutButton("py-1 text-ink-2 hover:text-ink")}
          </div>
        </div>
      </aside>

      {/* Phone and tablet bar: the menu button (with the section you are in), and the new orders, each clearly labelled. */}
      <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur lg:hidden">
        <div className="flex h-14 items-center justify-between gap-3 px-4">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="admin-menu"
            className="flex min-w-0 items-center gap-2 text-[14px]"
          >
            <span aria-hidden className="w-4 shrink-0 text-center text-[18px] leading-none">
              {open ? "×" : "☰"}
            </span>
            <span className="shrink-0">Menu</span>
            <span aria-hidden className="h-3.5 w-px shrink-0 bg-line" />
            <span className="truncate text-ink-3">
              <span className="sr-only">, you are on </span>
              {current}
            </span>
          </button>
          {newOrders > 0 ? (
            <Link href="/admin/orders?status=new" className="inline-flex h-8 shrink-0 items-center bg-accent px-2.5 text-[12.5px] text-white">
              {newOrdersText}
            </Link>
          ) : (
            <span className="shrink-0 text-[13px] tracking-[0.28em]">SARTORIAL</span>
          )}
        </div>
        {open ? (
          <div id="admin-menu" className="border-t border-line bg-paper pb-3">
            {nav}
            <div className="mt-2 flex gap-4 border-t border-line px-4 pt-3 text-[13px]">
              <a href="/" target="_blank" rel="noreferrer" className="text-ink-2">
                View the website ↗
              </a>
              {signOutButton("text-ink-2")}
            </div>
          </div>
        ) : null}
      </header>

      <main className="min-w-0 flex-1 px-4 pt-6 pb-16 md:px-8 md:pt-10 lg:px-12">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}

/** What each section's pages show, for the "not found" message. */
const THINGS: Record<string, string> = {
  "/admin/products": "product",
  "/admin/categories": "category",
  "/admin/banners": "banner or notice",
  "/admin/offers": "offer",
  "/admin/collections": "collection",
};

/**
 * The admin's "not found" page (app/admin/(panel)/not-found.tsx), inside the
 * admin's frame: says what could not be found and leads back to its list.
 */
export function AdminNotFound() {
  const pathname = usePathname();
  const section = NAV.slice(1).find((n) => pathname === n.href || pathname.startsWith(`${n.href}/`));
  const thing = section ? THINGS[section.href] : undefined;
  return (
    <>
      <PageHead
        title={thing ? `This ${thing} could not be found` : "This page could not be found"}
        intro={thing ? `It may have been deleted, or the link may be out of date. Everything that still exists is in ${section!.label}.` : "The link may be out of date or mistyped."}
      />
      <div className="flex flex-wrap gap-2">
        {section ? (
          <Link href={section.href} className={buttonStyles.primary}>
            Back to {section.label}
          </Link>
        ) : null}
        <Link href="/admin" className={section ? buttonStyles.secondary : buttonStyles.primary}>
          Go to the overview
        </Link>
      </div>
    </>
  );
}
