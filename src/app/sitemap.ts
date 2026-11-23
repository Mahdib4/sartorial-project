import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";
import { catalog, categoryHref, curatedHref, productHref } from "@/data/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cat = await catalog();
  const url = (path: string) => new URL(path, SITE.url).toString();
  return [
    { url: url("/"), priority: 1 },
    { url: url("/clothing"), priority: 0.9 },
    ...cat.allCollections().map((c) => ({ url: url(c.href), priority: 0.9 })),
    ...cat.allCategories().map((c) => ({ url: url(categoryHref(c)), priority: 0.8 })),
    ...cat.curated().map((c) => ({ url: url(curatedHref(c)), priority: 0.8 })),
    ...cat.allProducts().map((p) => ({ url: url(productHref(p)), priority: 0.7 })),
    { url: url("/bespoke"), priority: 0.7 },
    { url: url("/appointments"), priority: 0.6 },
    { url: url("/client-services"), priority: 0.4 },
  ];
}
