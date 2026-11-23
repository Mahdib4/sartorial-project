import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/bag", "/wishlist", "/search", "/api/", "/admin"] }],
    sitemap: new URL("/sitemap.xml", SITE.url).toString(),
  };
}
