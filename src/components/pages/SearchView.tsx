"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LoadMore } from "@/components/interior/load-more";
import { ProductCard } from "@/components/product/ProductCard";
import type { CardData } from "@/data/catalog";
import type { NavGroup } from "@/data/navigation";
import { pluralise } from "@/lib/format";
import { searchProducts } from "@/lib/search";
import { useShop } from "@/store/shop";

const PAGE = 12;

/** The full results page. The query lives in the address bar (?q=) so results can be linked to and shared. */
export function SearchView({ cards, groups }: { cards: CardData[]; groups: NavGroup[] }) {
  const { index } = useShop();
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);

  useEffect(() => {
    const read = () => {
      setQuery(new URLSearchParams(window.location.search).get("q") ?? "");
      setLimit(PAGE);
    };
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);

  const update = (value: string) => {
    setQuery(value);
    setLimit(PAGE);
    const params = new URLSearchParams(window.location.search);
    if (value.trim()) params.set("q", value);
    else params.delete("q");
    const search = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${search ? `?${search}` : ""}`);
  };

  const trimmed = query.trim();
  const results = useMemo(() => {
    if (trimmed.length < 2) return [];
    const bySlug = new Map(cards.map((c) => [c.slug, c]));
    return searchProducts(index, trimmed).flatMap((entry) => bySlug.get(entry.slug) ?? []);
  }, [cards, index, trimmed]);

  const categories = useMemo(() => {
    if (trimmed.length < 2) return [];
    const q = trimmed.toLowerCase().replace(/s$/, "");
    return groups.flatMap((g) => g.categories.filter((c) => c.name.toLowerCase().includes(q)));
  }, [groups, trimmed]);

  return (
    <div className="pb-24">
      <form role="search" onSubmit={(e) => e.preventDefault()} className="px-gutter">
        <label htmlFor="search-page-input" className="sr-only">
          Search the collection
        </label>
        <div className="flex items-end gap-4 border-b border-ink pb-3">
          <input
            id="search-page-input"
            type="search"
            value={query}
            onChange={(e) => update(e.target.value)}
            placeholder="Sherwani, navy suit, white shirt…"
            autoComplete="off"
            enterKeyHint="search"
            className="headline-sm min-w-0 flex-1 bg-transparent text-ink outline-none! placeholder:text-mute/70 max-md:-my-2 max-md:py-2 md:text-[clamp(1.75rem,3vw,2.75rem)] [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <button type="button" onClick={() => update("")} className="label -my-3 shrink-0 py-3 pb-[1.125rem] pl-3 text-ink-3 hover:text-ink">
              Clear
            </button>
          ) : null}
        </div>
      </form>

      <p className="label mt-8 px-gutter text-ink-3" aria-live="polite">
        {trimmed.length < 2 ? "Type at least two letters" : results.length === 0 ? `No pieces match “${trimmed}”` : `${pluralise(results.length, "piece")} for “${trimmed}”`}
      </p>

      {categories.length > 0 ? (
        <ul className="mt-5 flex flex-wrap gap-2 px-gutter" aria-label="Matching categories">
          {categories.map((c) => (
            <li key={c.key}>
              <Link href={c.href} className="flex h-10 items-center gap-2 border border-line px-4 text-[13px] text-ink-2 transition-colors duration-300 hover:border-ink hover:text-ink">
                {c.name}
                {c.count > 0 ? <span className="text-[10.5px] text-mute tabular-nums">{c.count}</span> : null}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      {results.length > 0 ? (
        <>
          <ul className="mt-8 grid grid-cols-2 gap-x-1 gap-y-8 px-1 md:gap-y-9 lg:grid-cols-4">
            {results.slice(0, limit).map((card) => (
              <li key={card.slug}>
                <ProductCard product={card} showCategory />
              </li>
            ))}
          </ul>
          <div className="mt-12 px-gutter">
            <LoadMore auto={false} hasMore={limit < results.length} onLoad={() => setLimit((n) => n + PAGE)} labels={{ idle: `Show more (${Math.max(0, results.length - limit)})`, end: "That is everything" }} />
          </div>
        </>
      ) : trimmed.length >= 2 ? (
        <p className="mt-6 max-w-md px-gutter text-[15px] leading-relaxed text-ink-2">
          Try a garment, a colour or a cloth. If you are looking for something we have not shown,{" "}
          <Link href="/appointments" className="link-under text-ink">
            ask us directly
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}
