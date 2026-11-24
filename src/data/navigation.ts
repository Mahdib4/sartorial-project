import { categoryHref, curatedHref, type Catalog } from "./catalog";
import type { CollectionKey } from "./types";
import { pluralise } from "@/lib/format";
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
  /** Number of products; 0 for categories shown as an edit or still to be photographed. */
  count: number;
  /** The short line under the name: "12 pieces", "The edit" or, with nothing to show yet, "By appointment". */
  summary: string;
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

/** A curated collection or launch, as a link in the menus. */
export type NavHighlight = { label: string; href: string; eyebrow: string };

export function navGroups(cat: Catalog): NavGroup[] {
  return cat.allCollections().map((collection) => ({
    key: collection.key,
    name: collection.name,
    href: collection.href,
    tagline: collection.tagline,
    department: collection.department,
    count: cat.productsInCollection(collection.key).length,
    cover: shot(collection.cover),
    categories: cat.categoriesOf(collection.key).map((category) => {
      const count = cat.productsIn(category.key).length;
      const edit = (category.edit ?? []).some((e) => hasPhoto(e.image));
      return {
        key: category.key,
        name: category.name,
        href: categoryHref(category),
        blurb: category.blurb,
        count,
        summary: count > 0 ? pluralise(count, "piece") : edit ? "The edit" : "By appointment",
        preview: category.preview.filter(hasPhoto).map(shot),
      };
    }),
  }));
}

/** Only the departments with at least one category to show: an empty one is left out of menus and the home page. */
export function shownGroups(groups: NavGroup[]): NavGroup[] {
  return groups.filter((g) => g.categories.length > 0);
}

/** Whether a photograph is in the media library (a missing one is left out rather than breaking a page). */
export function hasPhoto(id: string): boolean {
  try {
    shot(id);
    return true;
  } catch {
    return false;
  }
}

/** The first three curated collections and launches made in the admin, in the order set there. */
export function navHighlights(cat: Catalog): NavHighlight[] {
  return cat
    .curated()
    .slice(0, 3)
    .map((c) => ({ label: c.title, href: curatedHref(c), eyebrow: c.eyebrow || (c.isLaunch ? "New launch" : "Collection") }));
}

export function navMenus(cat: Catalog): NavMenu[] {
  const groups = shownGroups(navGroups(cat));
  // Curated collections and launches made in the admin sit at the top of the Clothing menu's list.
  const curated = navHighlights(cat).map(({ label, href }) => ({ label, href }));
  const pick = (...keys: CollectionKey[]) => groups.filter((g) => keys.includes(g.key));
  const menus: NavMenu[] = [
    {
      label: "Clothing",
      href: "/clothing",
      groups: pick("heritage", "classic"),
      highlights: [
        ...curated,
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
  // A menu with no categories to show (the admin has hidden them all) is left out of the header.
  return menus.filter((m) => m.groups.length > 0);
}
