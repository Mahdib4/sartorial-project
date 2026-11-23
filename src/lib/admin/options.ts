import { cache } from "react";
import type { LinkOptions, Option, ProductOption } from "@/components/admin/Pickers";
import { COLLECTION_ORDER, COLLECTIONS } from "@/data/categories";
import type { LinkType } from "@/data/types";
import { listCategories, listCurated, listProducts, thumbsFor } from "./data";

/**
 * The lists the admin's pickers choose from (ProductPicker, MultiPicker,
 * LinkPicker), built from the live database with hidden items included and
 * marked. Server-only; read once per request.
 *
 *   const { products, links, departments, categories } = await pickerOptions();
 */

export type PickerOptions = {
  /** Every product, for ProductPicker. `category` reads "Heritage · Sherwanis". */
  products: ProductOption[];
  /** Destinations for LinkPicker (banners and notices). */
  links: LinkOptions;
  /** The four departments, for MultiPicker. */
  departments: Option[];
  /** Every category, grouped by department, for MultiPicker. */
  categories: Option[];
  /**
   * Link destinations visitors cannot reach right now (hidden product, category
   * or collection), as "<linkType>:<target>". A banner pointing at one shows
   * without a link until the item is shown again.
   */
  hiddenLinks: string[];
};

export const pickerOptions = cache(async (): Promise<PickerOptions> => {
  const [products, categories, curated] = await Promise.all([listProducts(), listCategories(), listCurated()]);
  const catByKey = new Map(categories.map((c) => [c.key, c]));
  const dept = (key: string) => COLLECTIONS[key as keyof typeof COLLECTIONS]?.name ?? key;
  const thumbs = new Map((await thumbsFor([...new Set(products.map((p) => p.images[0]).filter(Boolean))])).map((t) => [t.id, t.src]));
  const hiddenLinks: string[] = [];

  const productOptions: ProductOption[] = products.map((p) => {
    const c = catByKey.get(p.category);
    const visible = p.visible !== false && c?.visible !== false && p.images.length > 0;
    if (!visible) hiddenLinks.push(`product:${p.slug}`);
    return {
      slug: p.slug,
      name: p.name,
      category: c ? `${dept(c.collection)} · ${c.name}` : p.category,
      thumb: thumbs.get(p.images[0]) ?? null,
      visible,
    };
  });

  const categoryOptions: Option[] = categories.map((c) => {
    if (c.visible === false) hiddenLinks.push(`category:${c.key}`);
    return { value: c.key, label: c.visible === false ? `${c.name} (hidden)` : c.name, group: dept(c.collection) };
  });

  const departments: Option[] = COLLECTION_ORDER.map((k) => ({ value: k, label: COLLECTIONS[k].name }));

  const curatedOptions: Option[] = curated.map((c) => {
    if (!c.visible) hiddenLinks.push(`curated:${c.slug}`);
    return { value: c.slug, label: `${c.title}${c.isLaunch ? " · launch" : ""}${c.visible ? "" : " (hidden)"}` };
  });

  return {
    products: productOptions,
    links: {
      products: productOptions.map((p) => ({ value: p.slug, label: p.visible ? p.name : `${p.name} (hidden)`, group: p.category })),
      categories: categoryOptions,
      collections: departments,
      curated: curatedOptions,
    },
    departments,
    categories: categoryOptions,
    hiddenLinks,
  };
});

/**
 * Where a banner leads, in plain words, e.g. "Category: Sherwanis (Heritage)".
 * `problem` is set when visitors will not get the link (the item was removed or is hidden).
 */
export function describeLink(options: PickerOptions, type: LinkType, target: string): { text: string; problem: string | null } {
  const find = (list: Option[]) => list.find((o) => o.value === target);
  const hidden = options.hiddenLinks.includes(`${type}:${target}`);
  const strip = (label: string) => label.replace(/ \(hidden\)$/, "");
  switch (type) {
    case "product": {
      const o = find(options.links.products);
      if (!o) return { text: "A product", problem: "That product no longer exists, so the banner shows without a link." };
      return { text: `Product: ${strip(o.label)}`, problem: hidden ? "That product is hidden, so the banner shows without a link." : null };
    }
    case "category": {
      const o = find(options.links.categories);
      if (!o) return { text: "A category", problem: "That category no longer exists, so the banner shows without a link." };
      return { text: `Category: ${strip(o.label)}${o.group ? ` (${o.group})` : ""}`, problem: hidden ? "That category is hidden, so the banner shows without a link." : null };
    }
    case "collection": {
      const o = find(options.links.collections);
      return o ? { text: `Department: ${o.label}`, problem: null } : { text: "A department", problem: "That department does not exist, so the banner shows without a link." };
    }
    case "curated": {
      const o = find(options.links.curated);
      if (!o) return { text: "A collection", problem: "That collection no longer exists, so the banner shows without a link." };
      return { text: `Collection: ${strip(o.label)}`, problem: hidden ? "That collection is hidden, so the banner shows without a link." : null };
    }
    case "url":
      return /^(\/(?!\/)|https?:\/\/)/.test(target) ? { text: target, problem: null } : { text: target || "A web address", problem: "That address is not valid, so the banner shows without a link." };
    default:
      return { text: "Leads nowhere (just the words)", problem: null };
  }
}
