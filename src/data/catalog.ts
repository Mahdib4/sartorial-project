import { cache } from "react";
import { SIZE_SCALES, type SizeScale } from "@/config/site";
import { formatPrice } from "@/lib/format";
import { film, registerUploads, shot, sourceOf, thumb, type Film, type Shot } from "@/lib/media";
import { COLLECTION_ORDER, COLLECTIONS as BASE_COLLECTIONS } from "./categories";
import { CATEGORY_EDITORIAL, CATEGORY_FILMS } from "./products";
import { loadCatalogData, type CatalogData } from "./store";
import type { Banner, Category, Collection, CollectionKey, Curated, Offer, Product, SiteSettings } from "./types";

/**
 * The catalogue as the website sees it: queries over the data loaded by
 * store.ts, with hidden products and categories left out. Every server page
 * and layout starts with `const cat = await catalog()`.
 */
export const catalog = cache(async (): Promise<Catalog> => new Catalog(await loadCatalogData()));

// ── Plain helpers (no data needed) ─────────────────────────────

/** The four departments; their category lists come from the live catalogue (Catalog#collections). */
export const COLLECTIONS = BASE_COLLECTIONS;

export function categoryHref(category: Pick<Category, "collection" | "slug">): string {
  return `${BASE_COLLECTIONS[category.collection].href}/${category.slug}`;
}

/** How the house identifies a piece in an enquiry: its own code where it has one, otherwise its slug. */
export function productReference(product: Pick<Product, "slug" | "code">): string {
  return product.code ?? product.slug;
}

export function productHref(product: Pick<Product, "slug">): string {
  return `/products/${product.slug}`;
}

export function curatedHref(c: Pick<Curated, "slug">): string {
  return `/collections/${c.slug}`;
}

// ── View models: plain data handed to client components ───────

export type Pricing = {
  /** What the piece costs now (always more than 0), or null for "price on request". */
  price: number | null;
  /** The price before a reduction, when there is one. */
  compareAt: number | null;
  /**
   * The live offer to name beside the price: the one that set it; a label-only
   * offer when no offer changed it (the piece's own sale price may have won);
   * or, for a piece priced on request, the first offer that covers it.
   */
  offer: { name: string; badge: string; percent: number | null } | null;
  /** A short label for the card: that offer's badge, or the product's own. */
  badge: string | null;
};

export type CardData = {
  slug: string;
  href: string;
  name: string;
  colour: string;
  colourFamily: string;
  occasions: string[];
  categoryKey: string;
  categoryName: string;
  collection: CollectionKey;
  price: number | null;
  compareAt: number | null;
  badge: string | null;
  image: Shot;
  hover: Shot | null;
  /** A short silent clip played on hover, where the piece has been filmed. */
  clip: Pick<Film, "src" | "portrait"> | null;
  imageCount: number;
  /**
   * Position in the list the card was made from (the order the page chose:
   * featured pieces first in a category, the admin's order in a collection),
   * used for the default ("Featured") order. See Catalog#toCard.
   */
  order: number;
};

/** The slim record used by search, the bag and the wishlist. */
export type IndexEntry = {
  slug: string;
  href: string;
  name: string;
  colour: string;
  categoryName: string;
  collectionName: string;
  /** See productReference(). */
  reference: string;
  price: number | null;
  compareAt: number | null;
  /** The name of the offer shown with the price (see Pricing#offer), quoted in enquiries. */
  offer: string | null;
  keywords: string;
  image: ReturnType<typeof thumb>;
};

/** A banner or notice, resolved to a link. */
export type LiveBanner = Banner & { href: string | null; shot: Shot | null };

export class Catalog {
  readonly source: CatalogData["source"];
  readonly settings: SiteSettings;
  private readonly cats: Category[];
  private readonly prods: Product[];
  private readonly catByKey: Map<string, Category>;
  private readonly prodBySlug: Map<string, Product>;
  private readonly offers: Offer[];
  private readonly bannerList: Banner[];
  private readonly curatedList: Curated[];
  readonly collections: Record<CollectionKey, Collection>;

  constructor(data: CatalogData) {
    registerUploads(data.uploads);
    this.source = data.source;
    this.settings = data.settings;
    // Only what visitors may see; pieces whose photographs are missing are left out rather than breaking a page.
    this.cats = data.categories.filter((c) => c.visible !== false && BASE_COLLECTIONS[c.collection]);
    this.catByKey = new Map(this.cats.map((c) => [c.key, c]));
    this.prods = data.products.filter((p) => p.visible !== false && this.catByKey.has(p.category) && p.images.length > 0 && safe(() => shot(p.images[0])));
    this.prodBySlug = new Map(this.prods.map((p) => [p.slug, p]));
    this.offers = data.offers;
    this.bannerList = data.banners;
    this.curatedList = data.curated.filter((c) => c.visible);
    this.collections = Object.fromEntries(
      COLLECTION_ORDER.map((k) => [k, { ...BASE_COLLECTIONS[k], categories: this.cats.filter((c) => c.collection === k).map((c) => c.key) }]),
    ) as Record<CollectionKey, Collection>;
  }

  // Lookups
  getCollection(key: string): Collection | undefined {
    return this.collections[key as CollectionKey];
  }
  allCollections(): Collection[] {
    return COLLECTION_ORDER.map((k) => this.collections[k]);
  }
  getCategory(key: string): Category | undefined {
    return this.catByKey.get(key);
  }
  allCategories(): Category[] {
    return this.cats;
  }
  categoriesOf(collection: CollectionKey): Category[] {
    return this.collections[collection].categories.map((k) => this.catByKey.get(k)!);
  }
  getProduct(slug: string): Product | undefined {
    return this.prodBySlug.get(slug);
  }
  allProducts(): Product[] {
    return this.prods;
  }
  /** A category's pieces in their listing order: featured pieces first, then the admin's order. */
  productsIn(categoryKey: string): Product[] {
    return featuredFirst(this.prods.filter((p) => p.category === categoryKey));
  }
  /** A department's pieces in their listing order: featured pieces first, then category by category. */
  productsInCollection(collection: CollectionKey): Product[] {
    const keys = new Set(this.collections[collection].categories);
    return featuredFirst(this.prods.filter((p) => keys.has(p.category)));
  }
  sizeScaleFor(product: Product): SizeScale {
    return SIZE_SCALES[this.catByKey.get(product.category)?.sizes ?? "one"];
  }
  editorialFor(categoryKey: string): string[] {
    return CATEGORY_EDITORIAL[categoryKey] ?? [];
  }
  filmsFor(categoryKey: string): string[] {
    return CATEGORY_FILMS[categoryKey] ?? [];
  }
  /** The product whose gallery contains this photo (following crops back to their source). */
  productForImage(imageId: string): Product | undefined {
    const source = sourceOf(imageId) ?? imageId;
    return this.prods.find((p) => p.images.includes(source) || p.images.includes(imageId));
  }
  /** Pieces to show beneath a product: same category first, then the rest of its collection. */
  relatedTo(product: Product, limit = 8): Product[] {
    const category = this.catByKey.get(product.category);
    if (!category) return [];
    const same = this.prods.filter((p) => p.category === product.category && p.slug !== product.slug);
    const sameFamily = same.filter((p) => p.colourFamily === product.colourFamily);
    const rest = same.filter((p) => p.colourFamily !== product.colourFamily);
    const wider = this.productsInCollection(category.collection).filter(
      (p) => p.category !== product.category && p.occasions.some((o) => product.occasions.includes(o)),
    );
    return [...sameFamily, ...rest, ...wider].slice(0, limit);
  }

  // Prices and offers
  offerFor(product: Product): Offer[] {
    const category = this.catByKey.get(product.category);
    return this.offers.filter(
      (o) =>
        o.scope === "all" ||
        (o.scope === "products" && o.targets.includes(product.slug)) ||
        (o.scope === "category" && o.targets.includes(product.category)) ||
        (o.scope === "collection" && category !== undefined && o.targets.includes(category.collection)),
    );
  }

  /**
   * What a piece costs and how to label it. The customer always gets the best
   * price: the piece's own sale price or the best live offer, whichever is
   * lower. A price is never 0 or less: an offer that would take a piece that
   * far is simply not applied to it. The badge and offer line describe what
   * was actually applied.
   */
  pricing(product: Product): Pricing {
    const base = typeof product.price === "number" && product.price > 0 ? product.price : null;
    const sale = base !== null && typeof product.salePrice === "number" && product.salePrice > 0 && product.salePrice < base ? product.salePrice : null;
    let price = sale ?? base;
    let chosen: Offer | null = null;
    const applicable = this.offerFor(product);
    if (base !== null) {
      for (const o of applicable) {
        const reduced = reducedPrice(base, o);
        if (reduced !== null && reduced < price!) {
          price = reduced;
          chosen = o;
        }
      }
    }
    const display = chosen ?? (base === null ? applicable[0] : applicable.find((o) => o.kind === "note")) ?? null;
    const badge = display ? display.badge || defaultBadge(display) : null;
    return {
      price,
      compareAt: base !== null && price !== null && price < base ? base : null,
      offer: display ? { name: display.name, badge: badge!, percent: display.kind === "percent" ? display.value : null } : null,
      badge: badge ?? product.badge ?? null,
    };
  }

  // View models
  /**
   * A product card. Used as `list.map(cat.toCard)`, the card's `order` is its
   * place in that list, so a listing's default order is the order the page
   * asked for (featured first in a category, the admin's order in a
   * collection). Called on its own, it is the piece's place in the catalogue.
   */
  toCard = (product: Product, index?: number): CardData => {
    const category = this.catByKey.get(product.category)!;
    const clipId = product.videos?.find((v) => safe(() => film(v).portrait)) ?? null;
    const clip = clipId ? film(clipId) : null;
    const pricing = this.pricing(product);
    return {
      slug: product.slug,
      href: productHref(product),
      name: product.name,
      colour: product.colour,
      colourFamily: product.colourFamily,
      occasions: [...product.occasions],
      categoryKey: category.key,
      categoryName: category.name,
      collection: category.collection,
      price: pricing.price,
      compareAt: pricing.compareAt,
      badge: pricing.badge,
      image: shot(product.images[0]),
      hover: product.images[1] && safe(() => shot(product.images[1])) ? shot(product.images[1]) : null,
      clip: clip ? { src: clip.src, portrait: clip.portrait } : null,
      imageCount: product.images.length,
      order: typeof index === "number" ? index : this.prods.indexOf(product),
    };
  };

  searchIndex(): IndexEntry[] {
    return this.prods.map((p) => {
      const category = this.catByKey.get(p.category)!;
      const collection = this.collections[category.collection];
      const pricing = this.pricing(p);
      return {
        slug: p.slug,
        href: productHref(p),
        name: p.name,
        colour: p.colour,
        categoryName: category.name,
        collectionName: collection.name,
        reference: productReference(p),
        price: pricing.price,
        compareAt: pricing.compareAt,
        offer: pricing.offer?.name ?? null,
        keywords: [p.name, p.colour, p.colourFamily, p.fabric ?? "", category.name, collection.name, p.code ?? "", ...p.occasions].join(" ").toLowerCase(),
        image: thumb(p.images[0]),
      };
    });
  }

  // Banners, notices and curated collections
  banners(placement: Banner["placement"]): LiveBanner[] {
    return this.bannerList
      .filter((b) => b.placement === placement)
      .map((b) => ({ ...b, href: this.linkFor(b.linkType, b.linkTarget), shot: b.image && safe(() => shot(b.image!)) ? shot(b.image) : null }));
  }

  /** Where a banner leads: a product, category, department, curated collection or any address. */
  linkFor(type: Banner["linkType"], target: string): string | null {
    switch (type) {
      case "product": {
        const p = this.prodBySlug.get(target);
        return p ? productHref(p) : null;
      }
      case "category": {
        const c = this.catByKey.get(target);
        return c ? categoryHref(c) : null;
      }
      case "collection":
        return this.collections[target as CollectionKey]?.href ?? null;
      case "curated":
        return this.curatedList.some((c) => c.slug === target) ? `/collections/${target}` : null;
      case "url":
        return safeAddress(target);
      default:
        return null;
    }
  }

  curated(): Curated[] {
    return this.curatedList;
  }
  getCurated(slug: string): Curated | undefined {
    return this.curatedList.find((c) => c.slug === slug);
  }
  /** A curated collection's pieces in the order the admin chose (hidden or removed pieces left out, each piece once). */
  productsOf(c: Curated): Product[] {
    const seen = new Set<string>();
    return c.products.flatMap((s) => {
      const p = this.prodBySlug.get(s);
      if (!p || seen.has(s)) return [];
      seen.add(s);
      return [p];
    });
  }
}

/** What an offer brings a piece's regular price down to, or null when it does not change it (or would take it to 0 or below). */
function reducedPrice(base: number, o: Offer): number | null {
  if (!(o.value > 0)) return null;
  const reduced = o.kind === "percent" ? Math.round(base * (1 - Math.min(o.value, 95) / 100)) : o.kind === "amount" ? base - o.value : null;
  return reduced !== null && reduced > 0 && reduced < base ? reduced : null;
}

/** The card label of an offer left without one: how much it takes off ("20% off", "BDT 2,000 off"). */
function defaultBadge(o: Offer): string {
  if (o.kind === "percent") return `${o.value}% off`;
  if (o.kind === "amount") return `${formatPrice(o.value)} off`;
  return "Offer";
}

/** Featured pieces first; otherwise the order is kept. */
function featuredFirst(list: Product[]): Product[] {
  return [...list.filter((p) => p.featured === true), ...list.filter((p) => p.featured !== true)];
}

/**
 * A banner's own web address, only when it is safely a page on this website
 * ("/bespoke") or an ordinary http(s) address. Anything a browser could read as
 * another site ("//evil.com", "/\evil.com"), any other scheme ("javascript:")
 * and anything with spaces or control characters gives no link at all.
 */
function safeAddress(target: string): string | null {
  const t = target.trim();
  if (!t || /[\\\s\u0000-\u001f\u007f]/.test(t)) return null;
  if (t.startsWith("/")) return t.startsWith("//") ? null : t;
  if (!/^https?:\/\/[^/]/i.test(t)) return null;
  try {
    const url = new URL(t);
    return url.protocol === "https:" || url.protocol === "http:" ? t : null;
  } catch {
    return null;
  }
}

function safe<T>(fn: () => T): T | null {
  try {
    return fn();
  } catch {
    return null;
  }
}
