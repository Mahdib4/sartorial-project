import { allCollections, categoriesOf, categoryHref, productsIn, productsInCollection } from "./catalog";
import type { CollectionKey } from "./types";
import { shot, type Shot } from "@/lib/media";

/**
 * The navigation tree, derived from the catalogue so menus, the homepage
 * category explorer and the footer never drift from the real structure.
 * Everything here is plain data (safe to hand to client components).
 */

export type NavCategory = {
  key: string;
  name: string;
  href: string;
  blurb: string;
  /** Number of products; 0 for categories shown as an edit. */
  count: number;
  /** Photos shown when the category is hovered. */
  preview: Shot[];
};

export type NavGroup = {
  key: CollectionKey;
  name: string;
  href: string;
  tagline: string;
  department: string;
  count: number;
  cover: Shot;
  categories: NavCategory[];
};

export type NavMenu = {
  label: string;
  href: string;
  groups: NavGroup[];
  /** Occasion edits listed beside the categories. */
  highlights: Array<{ label: string; href: string }>;
};

export function navGroups(): NavGroup[] {
  return allCollections().map((collection) => ({
    key: collection.key,
    name: collection.name,
    href: collection.href,
    tagline: collection.tagline,
    department: collection.department,
    count: productsInCollection(collection.key).length,
    cover: shot(collection.cover),
    categories: categoriesOf(collection.key).map((category) => ({
      key: category.key,
      name: category.name,
      href: categoryHref(category),
      blurb: category.blurb,
      count: productsIn(category.key).length,
      preview: category.preview.map(shot),
    })),
  }));
}

export function navMenus(): NavMenu[] {
  const groups = navGroups();
  const pick = (...keys: CollectionKey[]) => groups.filter((g) => keys.includes(g.key));
  return [
    {
      label: "Clothing",
      href: "/clothing",
      groups: pick("heritage", "classic"),
      highlights: [
        { label: "The wedding wardrobe", href: "/clothing/heritage?occasion=Wedding" },
        { label: "Black tie", href: "/clothing/classic?occasion=Black+tie" },
        { label: "Business tailoring", href: "/clothing/classic?occasion=Business" },
        { label: "Off duty", href: "/clothing/classic?occasion=Casual" },
        { label: "The bespoke process", href: "/bespoke" },
      ],
    },
    {
      label: "Accessories",
      href: "/accessories",
      groups: pick("accessories"),
      highlights: [],
    },
    {
      label: "Footwear",
      href: "/footwear",
      groups: pick("footwear"),
      highlights: [],
    },
  ];
}
