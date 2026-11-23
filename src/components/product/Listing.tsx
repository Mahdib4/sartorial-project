"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Accordion } from "@/components/interior/accordion";
import { Drawer } from "@/components/interior/drawer";
import { Dropdown } from "@/components/interior/dropdown";
import { ExpandingSearch } from "@/components/interior/expanding-search";
import { FilterGrid, type FilterDefinition } from "@/components/interior/filter-grid";
import { SegmentedControl } from "@/components/interior/segmented-control";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { PHONE, useMediaQuery } from "@/components/ui/use-media-query";
import type { CardData } from "@/data/catalog";
import { cn } from "@/lib/cn";
import { pluralise } from "@/lib/format";

const OCCASION_ORDER = ["Wedding", "Festive", "Black tie", "Business", "Casual"];

const SWATCH: Record<string, string> = {
  Black: "#1c1b17",
  Navy: "#1f2a44",
  Blue: "#86a9d8",
  Grey: "#8b8b87",
  Brown: "#6e4b33",
  Green: "#3f5f46",
  Ivory: "#efe8d8",
  Gold: "#c8a45d",
  Pink: "#e7b6ae",
  Red: "#9b2c2c",
  White: "#ffffff",
  Multi: "conic-gradient(#86a9d8, #e7b6ae, #c8a45d, #3f5f46, #86a9d8)",
};

type Sort = "featured" | "az" | "za" | "price-asc" | "price-desc";

type ListingProps = {
  products: CardData[];
  /** What the row of chips above the grid filters by. */
  chips: "category" | "occasion";
  /** Category names in display order (when chips === "category"). */
  categoryOrder?: string[];
  /** Names the listing, e.g. "Sherwanis". */
  label: string;
};

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-");

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function GridIcon({ columns }: { columns: 2 | 3 }) {
  const cells = columns === 2 ? [0, 9] : [0, 6, 12];
  const size = columns === 2 ? 7 : 4;
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current">
      {cells.flatMap((x) => cells.map((y) => <rect key={`${x}-${y}`} x={x} y={y} width={size} height={size} />))}
    </svg>
  );
}

/**
 * A product listing: a row of chips with live counts, a search-within field,
 * sort, a filter drawer for colour and occasion, and a density toggle. The grid
 * re-flows with motion as the selection changes, and the selection is mirrored
 * in the URL so a filtered view can be shared.
 */
export function Listing({ products, chips, categoryOrder, label }: ListingProps) {
  const [chip, setChip] = useState("all");
  const [colours, setColours] = useState<string[]>([]);
  const [occasions, setOccasions] = useState<string[]>([]);
  const [sort, setSort] = useState<Sort>("featured");
  const [query, setQuery] = useState("");
  const [density, setDensity] = useState<"compact" | "roomy">("compact");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const phone = useMediaQuery(PHONE);
  const hydrated = useRef(false);

  const hasPrices = products.some((p) => p.price !== null);

  // ── Facets present in this listing ──────────────────────────
  const chipValues = useMemo(() => {
    if (chips === "category") {
      const present = new Set(products.map((p) => p.categoryName));
      return (categoryOrder ?? [...present]).filter((name) => present.has(name));
    }
    const present = new Set(products.flatMap((p) => p.occasions));
    return OCCASION_ORDER.filter((o) => present.has(o));
  }, [products, chips, categoryOrder]);

  const colourValues = useMemo(() => Object.keys(SWATCH).filter((c) => products.some((p) => p.colourFamily === c)), [products]);
  const occasionValues = useMemo(() => OCCASION_ORDER.filter((o) => products.some((p) => p.occasions.includes(o))), [products]);
  const showOccasionFacet = chips === "category" && occasionValues.length > 1;

  // ── Read the selection from the URL once, then keep the URL in step ──
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const find = (list: string[], raw: string | null) => (raw ? list.find((v) => slugify(v) === slugify(raw)) : undefined);
    const occasion = find(OCCASION_ORDER, params.get("occasion"));
    const category = find(chipValues, params.get("category"));
    const colour = find(colourValues, params.get("colour"));
    /* eslint-disable react-hooks/set-state-in-effect -- the address bar is only readable after mount */
    if (chips === "occasion" && occasion && chipValues.includes(occasion)) setChip(occasion);
    if (chips === "category" && category) setChip(category);
    if (chips === "category" && occasion) setOccasions([occasion]);
    if (colour) setColours([colour]);
    /* eslint-enable react-hooks/set-state-in-effect */
    hydrated.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    const params = new URLSearchParams();
    if (chip !== "all") params.set(chips, chip);
    if (chips === "category" && occasions.length) params.set("occasion", occasions[0]);
    if (colours.length) params.set("colour", colours[0]);
    const search = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${search ? `?${search}` : ""}`);
  }, [chip, chips, colours, occasions]);

  // ── Apply everything except the chip (the grid applies that itself) ──
  const items = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    const filtered = products.filter((p) => {
      if (colours.length && !colours.includes(p.colourFamily)) return false;
      if (occasions.length && !occasions.some((o) => p.occasions.includes(o))) return false;
      if (words.length) {
        const haystack = `${p.name} ${p.colour} ${p.categoryName}`.toLowerCase();
        if (!words.every((w) => haystack.includes(w))) return false;
      }
      return true;
    });
    const sorted = [...filtered];
    if (sort === "az") sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "za") sorted.sort((a, b) => b.name.localeCompare(a.name));
    else if (sort === "price-asc") sorted.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    else if (sort === "price-desc") sorted.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    else sorted.sort((a, b) => a.order - b.order);
    return sorted;
  }, [products, colours, occasions, query, sort]);

  const filters = useMemo<FilterDefinition<CardData>[]>(
    () => [
      { id: "all", label: "All", match: () => true },
      ...chipValues.map((value) => ({
        id: value,
        label: value,
        match: (p: CardData) => (chips === "category" ? p.categoryName === value : p.occasions.includes(value)),
      })),
    ],
    [chipValues, chips],
  );

  const shown = items.filter((p) => filters.find((f) => f.id === chip)?.match(p) ?? true).length;
  const secondaryCount = colours.length + occasions.length;
  const clearAll = () => {
    setColours([]);
    setOccasions([]);
    setQuery("");
    setChip("all");
  };

  const count = (predicate: (p: CardData) => boolean) => products.filter(predicate).length;

  const checkRow = (value: string, checked: boolean, onChange: () => void, total: number, swatch?: string) => (
    <li key={value}>
      <label className="group/check flex min-h-11 cursor-pointer items-center gap-3 py-2.5 text-[14px] text-ink">
        <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
        <span aria-hidden className="grid h-4 w-4 shrink-0 place-items-center border border-ink-3 transition-colors duration-200 peer-checked:border-ink peer-checked:bg-ink peer-focus-visible:outline peer-focus-visible:outline-[1.5px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink">
          <svg viewBox="0 0 12 12" className={cn("h-2.5 w-2.5 text-white transition-opacity", checked ? "opacity-100" : "opacity-0")} fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M2 6.2 4.8 9 10 3.2" />
          </svg>
        </span>
        {swatch ? <span aria-hidden className="h-3.5 w-3.5 shrink-0 rounded-full border border-ink/15" style={{ background: swatch }} /> : null}
        <span className="flex-1">{value}</span>
        <span className="text-[11px] text-mute tabular-nums">{total}</span>
      </label>
    </li>
  );

  const filterFooter = (
    <div className="flex items-center gap-4">
      <Button className="min-w-0 flex-1" arrow={false} onClick={() => setFiltersOpen(false)}>
        Show {pluralise(shown, "piece")}
      </Button>
      <button type="button" onClick={clearAll} className="link-under shrink-0 text-[13px] text-ink-3 disabled:opacity-40" disabled={secondaryCount === 0 && !query && chip === "all"}>
        Clear all
      </button>
    </div>
  );

  const filterPanel = (
    <Accordion
      type="multiple"
      defaultOpen={["colour", "occasion"]}
      maxPanelHeight={720}
      headingLevel={3}
      classNames={{ trigger: "px-[var(--gutter)] md:px-6", content: "px-[var(--gutter)] md:px-6" }}
      items={[
        {
          id: "colour",
          title: "Colour",
          meta: colours.length ? String(colours.length) : undefined,
          content: <ul className="pb-3">{colourValues.map((c) => checkRow(c, colours.includes(c), () => setColours((l) => toggle(l, c)), count((p) => p.colourFamily === c), SWATCH[c]))}</ul>,
        },
        ...(showOccasionFacet
          ? [
              {
                id: "occasion",
                title: "Occasion",
                meta: occasions.length ? String(occasions.length) : undefined,
                content: <ul className="pb-3">{occasionValues.map((o) => checkRow(o, occasions.includes(o), () => setOccasions((l) => toggle(l, o)), count((p) => p.occasions.includes(o))))}</ul>,
              },
            ]
          : []),
      ]}
    />
  );

  return (
    <div>
      {/* Toolbar. On phones and tablets it rides beneath the header as you scroll the grid: filter and sort, always in reach. */}
      <div className="top-header z-20 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-gutter max-lg:sticky max-lg:border-b max-lg:border-line-soft max-lg:bg-white/95 max-lg:py-2 max-lg:backdrop-blur-sm">
        {/* On phones the chips beneath carry the counts, so the total is spoken rather than shown there. */}
        <p className={cn("label text-ink-3", chipValues.length > 1 && "max-md:sr-only")} aria-live="polite">
          {pluralise(shown, "piece")}
        </p>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          {/* The field grows to the width of this box, from its right edge. (Wider screens; the header search covers phones.) */}
          <div className="hidden w-56 sm:block">
            <ExpandingSearch label={`Search within ${label}`} placeholder={`Search ${label.toLowerCase()}`} value={query} onChange={setQuery} resultCount={shown} align="right" />
          </div>
          <Dropdown
            label="Sort"
            align="end"
            className="max-md:order-2 max-md:flex-1"
            classNames={{ trigger: "max-md:w-full max-md:justify-between" }}
            value={sort}
            onChange={(v) => setSort(v as Sort)}
            items={[
              { value: "featured", label: "Featured" },
              { value: "az", label: "Name, A to Z" },
              { value: "za", label: "Name, Z to A" },
              ...(hasPrices
                ? [
                    { value: "price-asc", label: "Price, low to high" },
                    { value: "price-desc", label: "Price, high to low" },
                  ]
                : []),
            ]}
          />
          <button type="button" onClick={() => setFiltersOpen(true)} aria-haspopup="dialog" className="label flex h-11 items-center gap-3 border border-line bg-white px-4 text-ink transition-colors duration-200 hover:border-ink max-md:order-1 max-md:flex-1 max-md:justify-between">
            <span className="flex items-center gap-3">
              Filter
              {secondaryCount > 0 ? <span className="grid h-4 min-w-4 place-items-center bg-ink px-1 text-[10px] leading-none tracking-normal text-white tabular-nums">{secondaryCount}</span> : null}
            </span>
            <svg aria-hidden viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M1 4.5h14M1 11.5h14" />
              <circle cx="5" cy="4.5" r="1.8" fill="white" />
              <circle cx="11" cy="11.5" r="1.8" fill="white" />
            </svg>
          </button>
          <SegmentedControl
            label="Grid density"
            size="sm"
            className="ml-auto max-md:order-3 sm:ml-0"
            classNames={{ segment: "max-md:h-[42px] max-md:min-w-11" }}
            value={density}
            onValueChange={(v) => setDensity(v as "compact" | "roomy")}
            options={[
              { value: "roomy", label: "Larger photographs", content: <GridIcon columns={2} /> },
              { value: "compact", label: "More pieces per row", content: <GridIcon columns={3} /> },
            ]}
          />
        </div>
      </div>

      {/* Active secondary filters */}
      {secondaryCount > 0 || query ? (
        <ul className="mt-4 flex flex-wrap items-center gap-2 px-gutter" aria-label="Active filters">
          {[...colours.map((c) => ({ key: `c-${c}`, text: c, remove: () => setColours((l) => l.filter((v) => v !== c)) })), ...occasions.map((o) => ({ key: `o-${o}`, text: o, remove: () => setOccasions((l) => l.filter((v) => v !== o)) })), ...(query ? [{ key: "q", text: `“${query}”`, remove: () => setQuery("") }] : [])].map((f) => (
            <li key={f.key}>
              <button type="button" onClick={f.remove} className="flex h-10 items-center gap-2 bg-paper px-3 text-[12.5px] text-ink transition-colors hover:bg-bone md:h-8" aria-label={`Remove filter ${f.text}`}>
                {f.text}
                <svg aria-hidden viewBox="0 0 10 10" className="h-2 w-2" stroke="currentColor" strokeWidth="1.2">
                  <path d="M1 1l8 8M9 1 1 9" />
                </svg>
              </button>
            </li>
          ))}
          <li>
            <button type="button" onClick={clearAll} className="ml-2 text-[12.5px] text-ink-3 max-md:py-3">
              <span className="link-under inline-block">Clear all</span>
            </button>
          </li>
        </ul>
      ) : null}

      {/* Chips + grid */}
      <div className="mt-6">
        <FilterGrid
          items={items}
          filters={filters}
          value={chip}
          onValueChange={setChip}
          getKey={(p) => p.slug}
          label={`Filter ${label} by ${chips}`}
          emptyLabel="No pieces match this selection."
          showFilters={chipValues.length > 1}
          classNames={{
            // One line on phones, scrolled sideways, rather than wrapping into a stack of labels.
            filters: "px-gutter mb-8 border-b border-line-soft no-scrollbar max-md:mb-6 max-md:flex-nowrap max-md:gap-x-6 max-md:overflow-x-auto",
            chip: "shrink-0 whitespace-nowrap",
            empty: "py-28",
          }}
          className={cn("gap-x-1 gap-y-8 px-1 md:gap-y-9", density === "compact" ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3")}
          renderItem={(product) => (
            <ProductCard
              product={product}
              showCategory={chips === "category"}
              sizes={density === "compact" ? "(min-width: 1024px) 25vw, 50vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
            />
          )}
        />
      </div>

      {/* Filters: a sheet from the bottom edge on phones, a drawer from the side on larger screens. */}
      {phone ? (
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen} title="Filter" closeLabel="Close filters" footer={filterFooter}>
          {filterPanel}
        </Sheet>
      ) : (
        <Drawer open={filtersOpen} onOpenChange={setFiltersOpen} title="Filter" closeLabel="Close filters" width={420} classNames={{ body: "px-0 py-0" }} footer={filterFooter}>
          {filterPanel}
        </Drawer>
      )}
    </div>
  );
}
