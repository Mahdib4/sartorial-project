import { SITE } from "@/config/site";

const formatter = new Intl.NumberFormat(SITE.commerce.locale, {
  style: "currency",
  currency: SITE.commerce.currency,
  maximumFractionDigits: 0,
});

/** "৳ 12,500" for a priced piece, "Price on request" otherwise. */
export function formatPrice(price: number | null | undefined): string {
  return typeof price === "number" ? formatter.format(price) : SITE.commerce.noPriceLabel;
}

export function pluralise(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}
