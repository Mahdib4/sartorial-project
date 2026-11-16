"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Picture } from "@/components/ui/Picture";
import type { NavGroup } from "@/data/navigation";
import { formatPrice, pluralise } from "@/lib/format";
import { searchProducts } from "@/lib/search";
import { useShop } from "@/store/shop";

const EASE = [0.16, 1, 0.3, 1] as const;
const SUGGESTIONS = ["Sherwani", "Three-piece suit", "Tuxedo", "Nehru jacket", "White shirt", "Flannel"];

/**
 * Search, as a sheet that drops from beneath the header. Results appear as you
 * type: matching categories first, then pieces. Enter opens the full results page.
 */
export function SearchOverlay({ groups }: { groups: NavGroup[] }) {
  const { overlay, close, index } = useShop();
  const reduce = useReducedMotion();
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const isOpen = overlay === "search";

  useEffect(() => {
    if (!isOpen) return;
    const id = window.setTimeout(() => input.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close]);

  const trimmed = query.trim();
  const results = useMemo(() => (trimmed.length >= 2 ? searchProducts(index, trimmed) : []), [index, trimmed]);
  const categories = useMemo(() => {
    if (trimmed.length < 2) return [];
    const q = trimmed.toLowerCase().replace(/s$/, "");
    return groups.flatMap((g) => g.categories.filter((c) => c.name.toLowerCase().includes(q)).map((c) => ({ ...c, groupName: g.name })));
  }, [groups, trimmed]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div key="scrim" aria-hidden className="fixed inset-0 z-30 bg-ink/35" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} onClick={close} />
          <motion.div
            key="sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Search the collection"
            className="fixed inset-x-0 z-30 overflow-y-auto bg-white text-ink"
            style={{ top: "calc(var(--banner-h) + var(--header-h))", maxHeight: "calc(100dvh - var(--banner-h) - var(--header-h))" }}
            initial={reduce ? { opacity: 0 } : { clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ opacity: 1, clipPath: "inset(0% 0% 0% 0%)" }}
            exit={reduce ? { opacity: 0 } : { clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <div className="px-gutter pt-8 pb-10 md:pt-12 md:pb-14">
              <form
                role="search"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!trimmed) return;
                  close();
                  router.push(`/search?q=${encodeURIComponent(trimmed)}`);
                }}
              >
                <label htmlFor="site-search" className="label text-ink-3">
                  Search the collection
                </label>
                <div className="mt-3 flex items-end gap-4 border-b border-ink pb-3">
                  <input
                    ref={input}
                    id="site-search"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Sherwani, navy suit, white shirt…"
                    autoComplete="off"
                    enterKeyHint="search"
                    className="headline-sm min-w-0 flex-1 bg-transparent text-ink outline-none! placeholder:text-mute/70 md:text-[clamp(1.75rem,3vw,2.75rem)] [&::-webkit-search-cancel-button]:hidden"
                  />
                  <button type="submit" className="label shrink-0 pb-1.5 text-ink transition-opacity hover:opacity-60 disabled:opacity-30" disabled={!trimmed}>
                    Search
                  </button>
                </div>
              </form>

              <div aria-live="polite" className="mt-8">
                {trimmed.length < 2 ? (
                  <div>
                    <p className="label text-ink-3">Often searched</p>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {SUGGESTIONS.map((s) => (
                        <li key={s}>
                          <button type="button" onClick={() => setQuery(s)} className="border border-line px-4 py-2 text-[13px] text-ink-2 transition-colors duration-300 hover:border-ink hover:text-ink">
                            {s}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : results.length === 0 && categories.length === 0 ? (
                  <p className="text-[15px] text-ink-2">
                    Nothing matches “{trimmed}”. Try a garment, a colour or a cloth, or{" "}
                    <Link href="/appointments" onClick={close} className="link-under text-ink">
                      ask us directly
                    </Link>
                    .
                  </p>
                ) : (
                  <div className="grid gap-x-12 gap-y-10 lg:grid-cols-12">
                    {categories.length > 0 ? (
                      <div className="lg:col-span-3">
                        <p className="label text-ink-3">Categories</p>
                        <ul className="mt-3">
                          {categories.slice(0, 6).map((c) => (
                            <li key={c.key}>
                              <Link href={c.href} onClick={close} className="flex items-baseline justify-between gap-4 border-b border-line-soft py-3 text-[15px]">
                                <span className="link-draw">{c.name}</span>
                                <span className="label-sm text-mute">{c.groupName}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    <div className={categories.length > 0 ? "lg:col-span-9" : "lg:col-span-12"}>
                      <div className="flex items-baseline justify-between">
                        <p className="label text-ink-3">{pluralise(results.length, "piece")}</p>
                        {results.length > 0 ? (
                          <Link href={`/search?q=${encodeURIComponent(trimmed)}`} onClick={close} className="link-under text-[13px]">
                            View all results
                          </Link>
                        ) : null}
                      </div>
                      <ul className="mt-4 grid grid-cols-2 gap-x-1 gap-y-6 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
                        {results.slice(0, 6).map((p) => (
                          <li key={p.slug}>
                            <Link href={p.href} onClick={close} className="group/hit block">
                              <Picture shot={p.image} alt="" sizes="(min-width: 1280px) 14vw, (min-width: 768px) 24vw, 48vw" ratio="4 / 5" fit="product" />
                              <p className="mt-2.5 text-[13px] leading-snug">{p.name}</p>
                              <p className="mt-0.5 text-[12px] text-ink-3">{formatPrice(p.price)}</p>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
