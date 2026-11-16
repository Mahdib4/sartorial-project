"use client";

import Link from "next/link";
import { Picture } from "@/components/ui/Picture";
import { Rail } from "@/components/ui/Rail";
import { formatPrice } from "@/lib/format";
import { useShop } from "@/store/shop";

/** Pieces this visitor has opened before, most recent first. Kept in the browser only. */
export function RecentlyViewed({ exclude }: { exclude?: string }) {
  const { viewed, ready } = useShop();
  const items = viewed.filter((p) => p.slug !== exclude).slice(0, 8);
  if (!ready || items.length === 0) return null;

  return (
    <section className="border-t border-line-soft py-14 md:py-20" aria-label="Recently viewed">
      <Rail label="Recently viewed" itemClassName="w-[42vw] sm:w-[28vw] md:w-[20vw] lg:w-[15.6vw]" header={<h2 className="headline-sm">Recently viewed</h2>}>
        {items.map((p) => (
          <Link key={p.slug} href={p.href} className="group/recent block">
            <Picture shot={p.image} alt="" sizes="(min-width: 1024px) 16vw, 42vw" ratio="4 / 5" fit="product" />
            <p className="mt-3 px-1 text-[13px] leading-snug">
              <span className="link-draw">{p.name}</span>
            </p>
            <p className="mt-0.5 px-1 text-[12px] text-ink-3">{formatPrice(p.price)}</p>
          </Link>
        ))}
      </Rail>
    </section>
  );
}
