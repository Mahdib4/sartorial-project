"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

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

/** The admin's frame: a plain list of sections on the left (a menu button on phones). */
export function AdminShell({ children, newOrders, signOut }: { children: ReactNode; newOrders: number; signOut: () => Promise<void> }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  const current = NAV.find((n) => isActive(n.href))?.label ?? "Admin";

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
          {item.href === "/admin/orders" && newOrders > 0 ? <span className={cn("min-w-6 rounded-full px-1.5 text-center text-[11px] leading-5", isActive(item.href) ? "bg-white text-ink" : "bg-accent text-white")}>{newOrders}</span> : null}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-paper text-ink lg:flex-row">
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
            <form action={signOut}>
              <button type="submit" className="py-1 text-ink-2 hover:text-ink">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Phone and tablet bar */}
      <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex items-center gap-2 text-[14px]">
            <span aria-hidden className="text-[18px] leading-none">{open ? "×" : "☰"}</span>
            {current}
            {newOrders > 0 && !open ? <span className="rounded-full bg-accent px-1.5 text-[11px] leading-5 text-white">{newOrders}</span> : null}
          </button>
          <span className="text-[13px] tracking-[0.28em]">SARTORIAL</span>
        </div>
        {open ? (
          <div className="border-t border-line bg-paper pb-3">
            {nav}
            <div className="mt-2 flex gap-4 border-t border-line px-4 pt-3 text-[13px]">
              <a href="/" target="_blank" rel="noreferrer" className="text-ink-2">
                View the website ↗
              </a>
              <form action={signOut}>
                <button type="submit" className="text-ink-2">
                  Sign out
                </button>
              </form>
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
