import { CATEGORIES, COLLECTIONS, COLLECTION_ORDER } from "./categories";
import { CATEGORY_EDITORIAL, CATEGORY_FILMS, PRODUCTS } from "./products";
import type { Category, Collection, CollectionKey, Product } from "./types";
import { SIZE_SCALES, type SizeScale } from "@/config/site";
import { film, shot, sourceOf, thumb, type Film, type Shot } from "@/lib/media";

const CATEGORY_BY_KEY = new Map(CATEGORIES.map((c) => [c.key, c]));
const PRODUCT_BY_SLUG = new Map(PRODUCTS.map((p) => [p.slug, p]));

// ── Lookups ────────────────────────────────────────────────────

export function getCollection(key: string): Collection | undefined {
  return COLLECTIONS[key as CollectionKey];
}

export function allCollections(): Collection[] {
  return COLLECTION_ORDER.map((k) => COLLECTIONS[k]);
}

export function getCategory(key: string): Category | undefined {
  return CATEGORY_BY_KEY.get(key);
}

export function categoriesOf(collection: CollectionKey): Category[] {
  return COLLECTIONS[collection].categories.map((k) => CATEGORY_BY_KEY.get(k)!);
}

export function categoryHref(category: Category): string {
  return `${COLLECTIONS[category.collection].href}/${category.slug}`;
}

export function getProduct(slug: string): Product | undefined {
  return PRODUCT_BY_SLUG.get(slug);
}

export function allProducts(): Product[] {
  return PRODUCTS;
}

export function productsIn(categoryKey: string): Product[] {
  return PRODUCTS.filter((p) => p.category === categoryKey);
}

export function productsInCollection(collection: CollectionKey): Product[] {
  const keys = new Set(COLLECTIONS[collection].categories);
  return PRODUCTS.filter((p) => keys.has(p.category));
}

/** How the house identifies a piece in an enquiry: its own code where it has one, otherwise its slug. */
export function productReference(product: Pick<Product, "slug" | "code">): string {
  return product.code ?? product.slug;
}

export function productHref(product: Pick<Product, "slug">): string {
  return `/products/${product.slug}`;
}

export function sizeScaleFor(product: Product): SizeScale {
  return SIZE_SCALES[CATEGORY_BY_KEY.get(product.category)?.sizes ?? "one"];
}

export function editorialFor(categoryKey: string): string[] {
  return CATEGORY_EDITORIAL[categoryKey] ?? [];
}

export function filmsFor(categoryKey: string): string[] {
  return CATEGORY_FILMS[categoryKey] ?? [];
}

/** The product whose gallery contains this photo (following crops back to their source). */
export function productForImage(imageId: string): Product | undefined {
  const source = sourceOf(imageId) ?? imageId;
  return PRODUCTS.find((p) => p.images.includes(source) || p.images.includes(imageId));
}

/** Pieces to show beneath a product: same category first, then the rest of its collection. */
export function relatedTo(product: Product, limit = 8): Product[] {
  const category = CATEGORY_BY_KEY.get(product.category)!;
  const same = PRODUCTS.filter((p) => p.category === product.category && p.slug !== product.slug);
  const sameFamily = same.filter((p) => p.colourFamily === product.colourFamily);
  const rest = same.filter((p) => p.colourFamily !== product.colourFamily);
  const wider = productsInCollection(category.collection).filter(
    (p) => p.category !== product.category && p.occasions.some((o) => product.occasions.includes(o)),
  );
  return [...sameFamily, ...rest, ...wider].slice(0, limit);
}

// ── View models: plain data handed to client components ───────

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
  image: Shot;
  hover: Shot | null;
  /** A short silent clip played on hover, where the piece has been filmed. */
  clip: Pick<Film, "src" | "portrait"> | null;
  imageCount: number;
  /** Position in the catalogue, used for the default ("Featured") order. */
  order: number;
};

export function toCard(product: Product): CardData {
  const category = CATEGORY_BY_KEY.get(product.category)!;
  const clipId = product.videos?.find((v) => film(v).portrait) ?? null;
  const clip = clipId ? film(clipId) : null;
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
    price: product.price ?? null,
    image: shot(product.images[0]),
    hover: product.images[1] ? shot(product.images[1]) : null,
    clip: clip ? { src: clip.src, portrait: clip.portrait } : null,
    imageCount: product.images.length,
    order: PRODUCTS.indexOf(product),
  };
}

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
  keywords: string;
  image: ReturnType<typeof thumb>;
};

export function searchIndex(): IndexEntry[] {
  return PRODUCTS.map((p) => {
    const category = CATEGORY_BY_KEY.get(p.category)!;
    const collection = COLLECTIONS[category.collection];
    return {
      slug: p.slug,
      href: productHref(p),
      name: p.name,
      colour: p.colour,
      categoryName: category.name,
      collectionName: collection.name,
      reference: productReference(p),
      price: p.price ?? null,
      keywords: [p.name, p.colour, p.colourFamily, p.fabric ?? "", category.name, collection.name, p.code ?? "", ...p.occasions]
        .join(" ")
        .toLowerCase(),
      image: thumb(p.images[0]),
    };
  });
}

export { CATEGORIES, COLLECTIONS, COLLECTION_ORDER, PRODUCTS };
