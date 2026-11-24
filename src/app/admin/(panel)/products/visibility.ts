import type { Category, Product } from "@/data/types";

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
