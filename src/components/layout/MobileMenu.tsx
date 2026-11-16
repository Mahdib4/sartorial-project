"use client";

import Link from "next/link";
import { Accordion } from "@/components/interior/accordion";
import { Drawer } from "@/components/interior/drawer";
import type { NavGroup } from "@/data/navigation";
import { useShop } from "@/store/shop";

const SECONDARY = [
  { label: "The bespoke process", href: "/bespoke" },
  { label: "Book a fitting", href: "/appointments" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Client services", href: "/client-services" },
];

/** The navigation on touch screens: a side drawer with one fold per collection. */
export function MobileMenu({ groups }: { groups: NavGroup[] }) {
  const { overlay, open, close } = useShop();

  return (
    <Drawer open={overlay === "menu"} onOpenChange={(next) => (next ? open("menu") : close())} title="Menu" side="left" width={440} closeLabel="Close menu" classNames={{ body: "px-0 py-0" }}>
      <nav aria-label="Main">
        <Accordion
          type="single"
          collapsible
          defaultOpen={[groups[0].key]}
          maxPanelHeight={720}
          headingLevel={3}
          classNames={{ trigger: "px-6", content: "px-6" }}
          items={groups.map((group) => ({
            id: group.key,
            title: <span className="text-[22px] font-light tracking-[-0.02em]">{group.name}</span>,
            meta: group.department === group.name ? undefined : group.department,
            content: (
              <ul className="pb-3">
                <li>
                  <Link href={group.href} onClick={close} className="label block py-2.5 text-ink-3">
                    View all {group.name}
                  </Link>
                </li>
                {group.categories.map((category) => (
                  <li key={category.key}>
                    <Link href={category.href} onClick={close} className="flex items-baseline justify-between py-2.5 text-[16px] text-ink">
                      <span>{category.name}</span>
                      {category.count > 0 ? <span className="text-[11px] text-mute tabular-nums">{category.count}</span> : null}
                    </Link>
                  </li>
                ))}
              </ul>
            ),
          }))}
        />
        <ul className="px-6 py-6">
          {SECONDARY.map((item) => (
            <li key={item.href}>
              <Link href={item.href} onClick={close} className="block py-2.5 text-[15px] text-ink-2">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </Drawer>
  );
}
