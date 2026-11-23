import { cache } from "react";
import { SIZE_SCALES, type SizeScale } from "@/config/site";
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
  /** What the piece costs now, or null for "price on request". */
  price: number | null;
  /** The price before a reduction, when there is one. */
  compareAt: number | null;
  /** The live offer that applies, if any. */
  offer: { name: string; badge: string; percent: number | null } | null;
  /** A short label for the card: the offer's badge, or the product's own. */
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
  /** Position in the catalogue, used for the default ("Featured") order. */
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
  productsIn(categoryKey: string): Product[] {
    return this.prods.filter((p) => p.category === categoryKey);
  }
  productsInCollection(collection: CollectionKey): Product[] {
    const keys = new Set(this.collections[collection].categories);
    return this.prods.filter((p) => keys.has(p.category));
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

  pricing(product: Product): Pricing {
    const base = typeof product.price === "number" ? product.price : null;
    let price = base;
    let chosen: Offer | null = null;
    if (base !== null && typeof product.salePrice === "number" && product.salePrice < base) price = product.salePrice;
    const applicable = this.offerFor(product);
    for (const o of applicable) {
      if (base === null || o.kind === "note") continue;
      const reduced = o.kind === "percent" ? Math.round(base * (1 - Math.min(o.value, 95) / 100)) : Math.max(0, base - o.value);
      if (price === null || reduced < price) {
        price = reduced;
        chosen = o;
      }
    }
    const display = chosen ?? applicable[0] ?? null;
    return {
      price,
      compareAt: base !== null && price !== null && price < base ? base : null,
      offer: display ? { name: display.name, badge: display.badge || defaultBadge(display), percent: display.kind === "percent" ? display.value : null } : null,
      badge: display ? display.badge || defaultBadge(display) : (product.badge ?? null),
    };
  }

  // View models
  toCard = (product: Product): CardData => {
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
      order: this.prods.indexOf(product),
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
        return /^(\/(?!\/)|https?:\/\/)/.test(target) ? target : null;
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
  productsOf(c: Curated): Product[] {
    return c.products.map((s) => this.prodBySlug.get(s)).filter((p): p is Product => Boolean(p));
  }
}

function defaultBadge(o: Offer): string {
  if (o.kind === "percent") return `−${o.value}%`;
  if (o.kind === "amount") return "Offer";
  return o.name;
}

function safe<T>(fn: () => T): T | null {
  try {
    return fn();
  } catch {
    return null;
  }
}
