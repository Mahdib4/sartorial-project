"use client";

import Link from "next/link";
import { Drawer } from "@/components/interior/drawer";
import { BagLines } from "@/components/shop/BagLines";
import { ButtonLink } from "@/components/ui/Button";
import { formatPrice, pluralise } from "@/lib/format";
import { useShop } from "@/store/shop";

const START = [
  { label: "Heritage", href: "/clothing/heritage" },
  { label: "Classic", href: "/clothing/classic" },
  { label: "Accessories", href: "/accessories" },
  { label: "Footwear", href: "/footwear" },
];

/** The bag, as a panel from the right edge. Opens whenever a piece is added. */
export function BagDrawer() {
  const { overlay, open, close, bag, count, subtotal } = useShop();

  return (
    <Drawer
      open={overlay === "bag"}
      onOpenChange={(next) => (next ? open("bag") : close())}
      title={count > 0 ? `Your bag (${count})` : "Your bag"}
      closeLabel="Close bag"
      width={480}
      footer={
        bag.length > 0 ? (
          <div>
            <div className="flex items-baseline justify-between text-[14px]">
              <span className="label text-ink-3">{subtotal === null ? pluralise(count, "piece") : "Subtotal"}</span>
              <span>{subtotal === null ? "Price on request" : formatPrice(subtotal)}</span>
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-ink-3">Pieces are made to order. Send us your selection and we will come back to you to arrange a fitting.</p>
            <ButtonLink href="/bag" onClick={close} className="mt-5 w-full">
              Review and send enquiry
            </ButtonLink>
          </div>
        ) : undefined
      }
    >
      {bag.length === 0 ? (
        <div className="py-6">
          <p className="headline-sm">Your bag is empty.</p>
          <p className="mt-3 max-w-xs text-[14px] leading-relaxed text-ink-3">Add the pieces you are considering and send them to us as one enquiry.</p>
          <ul className="mt-8 border-t border-line">
            {START.map((item) => (
              <li key={item.href} className="border-b border-line">
                <Link href={item.href} onClick={close} className="group/row flex items-center justify-between py-4 text-[15px]">
                  <span className="link-draw">{item.label}</span>
                  <svg aria-hidden viewBox="0 0 16 16" className="h-3 w-3 transition-transform duration-500 ease-out-expo group-hover/row:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path d="M5.5 2.5 11 8l-5.5 5.5" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <BagLines onNavigate={close} />
      )}
    </Drawer>
  );
}
