"use client";

import { ProductCard } from "@/components/product/ProductCard";
import { ButtonLink } from "@/components/ui/Button";
import type { CardData } from "@/data/catalog";
import { pluralise } from "@/lib/format";
import { useShop } from "@/store/shop";

/** Saved pieces, most recently saved first. Kept in this browser. */
export function WishlistView({ cards }: { cards: CardData[] }) {
  const { wishlist, ready } = useShop();
  if (!ready) return <div className="min-h-[50vh]" aria-busy="true" />;

  const saved = wishlist.flatMap((entry) => cards.find((c) => c.slug === entry.slug) ?? []);

  if (saved.length === 0) {
    return (
      <div className="px-gutter pb-24">
        <p className="max-w-md text-[16px] leading-relaxed text-ink-2">Nothing saved yet. Press the heart on any piece to keep it here while you decide.</p>
        <div className="mt-8 grid gap-3 sm:flex sm:flex-row">
          <ButtonLink href="/clothing/heritage">Explore Heritage</ButtonLink>
          <ButtonLink href="/clothing/classic" variant="outline">
            Explore Classic
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <p className="label mb-6 px-gutter text-ink-3" aria-live="polite">
        {pluralise(saved.length, "piece")} saved
      </p>
      <ul className="grid grid-cols-2 gap-x-1 gap-y-8 px-1 md:gap-y-9 lg:grid-cols-4">
        {saved.map((card) => (
          <li key={card.slug}>
            <ProductCard product={card} showCategory />
          </li>
        ))}
      </ul>
    </div>
  );
}
