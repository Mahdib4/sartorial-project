"use client";

import Link from "next/link";
import { Accordion } from "@/components/interior/accordion";
import { Drawer } from "@/components/interior/drawer";
import { ButtonLink } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";
import type { NavGroup, NavHighlight } from "@/data/navigation";
import { pluralise } from "@/lib/format";
import { useShop } from "@/store/shop";

const SECONDARY = [
  { label: "The bespoke process", href: "/bespoke" },
  { label: "Client services", href: "/client-services" },
  { label: "Size guide", href: "/client-services#size-guide" },
];

function Chevron() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="h-3 w-3 shrink-0 text-ink-3" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M5.5 2.5 11 8l-5.5 5.5" />
    </svg>
  );
}

/**
 * The navigation on touch screens: a side drawer that opens on search, then the
 * curated collections and launches made in the admin (the "Highlights" of the
 * desktop menu), one fold per collection (each with its photograph, its
 * categories and their counts), the house pages, and the fitting, wishlist and
 * bag at the foot.
 */
export function MobileMenu({ groups: all, highlights = [] }: { groups: NavGroup[]; highlights?: NavHighlight[] }) {
  // A department whose categories are all hidden has nothing to open, so it is left out.
  const groups = all.filter((g) => g.categories.length > 0);
  const { overlay, open, close, count, wishlist, ready } = useShop();
  const saved = ready ? wishlist.length : 0;
  const pieces = ready ? count : 0;

  return (
    <Drawer
      open={overlay === "menu"}
      onOpenChange={(next) => (next ? open("menu") : close())}
      title="Menu"
      side="left"
      width={440}
      closeLabel="Close menu"
      classNames={{ body: "px-0 py-0", header: "px-[var(--gutter)] md:px-6", footer: "px-[var(--gutter)] pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-6" }}
      footer={
        <div className="grid grid-cols-2 gap-2">
          <ButtonLink href="/appointments" onClick={close} className="col-span-2 w-full">
            Book a fitting
          </ButtonLink>
          <Link href="/wishlist" onClick={close} className="flex h-11 items-center justify-center gap-2 border border-line text-[13px] tracking-[0.04em] text-ink transition-colors duration-300 hover:border-ink">
            Wishlist
            {saved > 0 ? <span className="text-[11px] text-ink-3 tabular-nums">({saved})</span> : null}
          </Link>
          <button type="button" onClick={() => open("bag")} className="flex h-11 items-center justify-center gap-2 border border-line text-[13px] tracking-[0.04em] text-ink transition-colors duration-300 hover:border-ink">
            Your bag
            {pieces > 0 ? <span className="text-[11px] text-ink-3 tabular-nums">({pieces})</span> : null}
          </button>
        </div>
      }
    >
      {/* Search first: on a phone it is the quickest way to a piece. */}
      <div className="px-[var(--gutter)] pt-4 pb-2 md:px-6">
        <button
          type="button"
          onClick={() => open("search")}
          className="flex h-12 w-full items-center gap-3 border border-line bg-paper px-4 text-left text-[14px] text-ink-3 transition-colors duration-300 hover:border-ink"
        >
          <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4 shrink-0 text-ink" fill="none" stroke="currentColor" strokeWidth="1.2">
            <circle cx="7" cy="7" r="5" />
            <path d="m11 11 4 4" />
          </svg>
          <span className="truncate">Search sherwanis, suits, shirts…</span>
        </button>
      </div>

      <nav aria-label="Main">
        {highlights.length ? (
          <div className="px-[var(--gutter)] pt-3 pb-4 md:px-6">
            <p className="label-sm pb-1 text-mute">Highlights</p>
            <ul className="border-b border-line-soft pb-2">
              {highlights.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} onClick={close} className="flex min-h-12 items-center justify-between gap-4 py-1.5">
                    <span className="min-w-0">
                      <span className="label-sm block text-accent">{item.eyebrow}</span>
                      <span className="mt-0.5 block truncate text-[17px] leading-snug font-light tracking-[-0.01em] text-ink">{item.label}</span>
                    </span>
                    <Chevron />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <Accordion
          type="single"
          collapsible
          defaultOpen={groups.length ? [groups[0].key] : []}
          maxPanelHeight={720}
          headingLevel={3}
          className="border-t-0"
          classNames={{ trigger: "px-[var(--gutter)] py-3.5 md:px-6", content: "pb-3! pl-[var(--gutter)] pr-[var(--gutter)]! md:pl-6 md:pr-6!" }}
          items={groups.map((group) => ({
            id: group.key,
            title: (
              <span className="flex items-center gap-4">
                <span className="relative h-14 w-11 shrink-0 overflow-hidden bg-paper">
                  <Picture shot={group.cover} alt="" sizes="44px" ratio="fill" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[21px] leading-tight font-light tracking-[-0.02em]">{group.name}</span>
                  <span className="label-sm mt-1 block text-mute">{group.count > 0 ? pluralise(group.count, "piece") : group.tagline}</span>
                </span>
              </span>
            ),
            content: (
              <ul className="ml-15 border-l border-line-soft pl-4">
                <li>
                  <Link href={group.href} onClick={close} className="label flex min-h-11 items-center justify-between gap-4 text-ink">
                    View all {group.name}
                    <Chevron />
                  </Link>
                </li>
                {group.categories.map((category) => (
                  <li key={category.key}>
                    <Link href={category.href} onClick={close} className="flex min-h-11 items-center justify-between gap-4 text-[16px] text-ink">
                      <span>{category.name}</span>
                      {category.count > 0 ? <span className="text-[11px] text-mute tabular-nums">{category.count}</span> : null}
                    </Link>
                  </li>
                ))}
              </ul>
            ),
          }))}
        />
        <ul className="px-[var(--gutter)] py-4 md:px-6">
          {SECONDARY.map((item) => (
            <li key={item.href}>
              <Link href={item.href} onClick={close} className="flex min-h-11 items-center justify-between text-[15px] text-ink-2">
                {item.label}
                <Chevron />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </Drawer>
  );
}
