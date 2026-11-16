"use client";

import { ProductCard } from "@/components/product/ProductCard";
import { Rail } from "@/components/ui/Rail";
import type { CardData } from "@/data/catalog";

/** A titled, scrollable row of product cards. */
export function ProductRail({ title, eyebrow, products, label }: { title: string; eyebrow?: string; products: CardData[]; label?: string }) {
  if (products.length === 0) return null;
  return (
    <Rail
      label={label ?? title}
      header={
        <div>
          {eyebrow ? <p className="label mb-4 text-ink-3">{eyebrow}</p> : null}
          <h2 className="headline-sm">{title}</h2>
        </div>
      }
    >
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} showCategory sizes="(min-width: 1024px) 24vw, (min-width: 640px) 40vw, 62vw" />
      ))}
    </Rail>
  );
}
