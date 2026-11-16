import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";
import { allCollections, allProducts, CATEGORIES, categoryHref, productHref } from "@/data/catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => new URL(path, SITE.url).toString();
  return [
    { url: url("/"), priority: 1 },
    { url: url("/clothing"), priority: 0.9 },
    ...allCollections().map((c) => ({ url: url(c.href), priority: 0.9 })),
    ...CATEGORIES.map((c) => ({ url: url(categoryHref(c)), priority: 0.8 })),
    ...allProducts().map((p) => ({ url: url(productHref(p)), priority: 0.7 })),
    { url: url("/bespoke"), priority: 0.7 },
    { url: url("/appointments"), priority: 0.6 },
    { url: url("/client-services"), priority: 0.4 },
  ];
}
