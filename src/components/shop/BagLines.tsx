"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { Counter } from "@/components/bencho/rolling-counter/Counter";
import { PriceTag } from "@/components/product/PriceTag";
import { Picture } from "@/components/ui/Picture";
import { SITE } from "@/config/site";
import { cn } from "@/lib/cn";
import { useShop } from "@/store/shop";

/** The lines of the bag: used in the drawer and on the bag page. */
export function BagLines({ onNavigate, roomy = false }: { onNavigate?: () => void; roomy?: boolean }) {
  const { bag, setQty, remove } = useShop();
  const reduce = useReducedMotion();

  return (
    <ul className="border-t border-line">
      <AnimatePresence initial={false}>
        {bag.map((line) => (
          <motion.li
            key={`${line.slug}::${line.size}`}
            layout={reduce ? false : "position"}
            initial={reduce ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-b border-line"
          >
            <div className={cn("flex gap-4", roomy ? "py-6 md:gap-6" : "py-5")}>
              <Link href={line.product.href} onClick={onNavigate} className={cn("shrink-0", roomy ? "w-24 md:w-32" : "w-20")} tabIndex={-1} aria-hidden>
                <Picture shot={line.product.image} alt="" sizes="128px" ratio="4 / 5" fit="product" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="label-sm text-mute">{line.product.categoryName}</p>
                    <Link href={line.product.href} onClick={onNavigate} className={cn("mt-1 block leading-snug text-ink", roomy ? "text-[16px]" : "text-[14px]")}>
                      {line.product.name}
                    </Link>
                    <p className="mt-1 text-[12.5px] text-ink-3">
                      {line.product.colour} · {line.size}
                    </p>
                  </div>
                  {/* As on the cards: the reduced price, with the original struck through. */}
                  <PriceTag
                    price={line.product.price === null ? null : line.product.price * line.qty}
                    compareAt={line.product.compareAt ? line.product.compareAt * line.qty : null}
                    stacked
                    className="shrink-0 text-[13px] whitespace-nowrap text-ink-2"
                  />
                </div>
                <div className="mt-auto flex items-center justify-between pt-4">
                  <Counter value={line.qty} onChange={(next) => setQty(line.slug, line.size, next)} min={1} max={SITE.commerce.maxQuantity} size="sm" label={`Quantity of ${line.product.name}`} />
                  <button type="button" onClick={() => remove(line.slug, line.size)} className="-my-3 py-3 pl-3 text-[12.5px] text-ink-3 transition-colors hover:text-ink" aria-label={`Remove ${line.product.name}, ${line.size}`}>
                    <span className="link-under inline-block">Remove</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
