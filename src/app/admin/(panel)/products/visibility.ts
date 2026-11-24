import type { Category, Offer, Product } from "@/data/types";
import { formatPrice } from "@/lib/format";

/**
 * Why a product is not on the website, in the admin's words, or null when
 * visitors can see it. The same rules as the storefront's catalogue: the piece
 * must be shown, its category must be shown, and it needs a photograph.
 * `short` continues a sentence ("Not on the website: it is hidden.").
 */
export function whyOffWebsite(
  product: Pick<Product, "visible" | "images">,
  category: Pick<Category, "name" | "visible"> | undefined,
): { pill: string; short: string; long: string } | null {
  if (product.visible === false) {
    return {
      pill: "Hidden",
      short: "it is hidden",
      long: "This piece is hidden, so it is not on the website. Switch on “Show on the website” below and save to show it.",
    };
  }
  if (!category) {
    return {
      pill: "Hidden (no category)",
      short: "its category no longer exists",
      long: "This piece's category no longer exists, so it is not on the website. Choose a category below and save.",
    };
  }
  if (category.visible === false) {
    return {
      pill: "Hidden (category hidden)",
      short: `its category, “${category.name}”, is hidden`,
      long: `This piece is not on the website because its category, “${category.name}”, is hidden. Show the category again and the piece comes back by itself.`,
    };
  }
  if (!product.images.length) {
    return {
      pill: "Hidden (no photograph)",
      short: "it has no photograph",
      long: "This piece has no photograph, so it is not on the website. Add one below and save.",
    };
  }
  return null;
}

/**
 * Live "amount off" offers that cover a piece but are not applied to it,
 * because they would take its price to nothing (the website never shows a
 * piece at ৳0 or less). The admin is told, so the offer is not assumed to apply.
 */
export function offersLeftOut(
  product: Pick<Product, "slug" | "category" | "price">,
  category: Pick<Category, "collection"> | undefined,
  offers: Offer[],
  now = Date.now(),
): Offer[] {
  const price = product.price;
  if (typeof price !== "number" || price <= 0) return [];
  return offers.filter(
    (o) =>
      o.kind === "amount" &&
      o.value >= price &&
      o.active &&
      (!o.startsAt || Date.parse(o.startsAt) <= now) &&
      (!o.endsAt || Date.parse(o.endsAt) > now) &&
      (o.scope === "all" ||
        (o.scope === "products" && o.targets.includes(product.slug)) ||
        (o.scope === "category" && o.targets.includes(product.category)) ||
        (o.scope === "collection" && category !== undefined && o.targets.includes(category.collection))),
  );
}

/** What to do about an offer left out (follows leftOutMessage). */
export const LEFT_OUT_ADVICE = "Lower the offer's amount, or raise the price, if it should apply.";

/** "The offer “Eid offer” (৳4,000 off) is not applied to this piece: it would take its price (৳3,500) to nothing." */
export function leftOutMessage(offer: Pick<Offer, "name" | "value">, price: number): string {
  return `The offer “${offer.name}” (${formatPrice(offer.value)} off) is not applied to this piece: it would take its price (${formatPrice(price)}) to nothing.`;
}
