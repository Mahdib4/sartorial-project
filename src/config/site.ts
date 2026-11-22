import type { SizeScaleKey } from "@/data/types";

/**
 * Everything brand- and business-specific lives here.
 *
 * ⚠ The values marked TODO are placeholders: the client's contact details,
 * social handles and prices were not part of the supplied content. Fill them
 * in before going live — nothing else needs to change.
 */
type SiteConfig = {
  name: string;
  city: string;
  description: string;
  url: string;
  contact: { whatsapp: string; phone: string; email: string; address: string[]; hours: string };
  social: { instagram: string; facebook: string; youtube: string };
  commerce: { currency: string; locale: string; noPriceLabel: string; maxQuantity: number };
  announcement: Array<{ text: string; href: string; cta: string }>;
};

export const SITE: SiteConfig = {
  name: "Sartorial",
  city: "Dhaka",
  /** Used for <title>, Open Graph and the footer. */
  description:
    "Sartorial is a bespoke tailoring house in Dhaka: heritage sherwanis, achkans and bandhgalas, and classic suits, jackets, shirts and trousers, cut and finished by hand.",
  /**
   * The live address, used for canonical URLs, the sitemap and share images.
   * Set NEXT_PUBLIC_SITE_URL when the site moves to its own domain (e.g. "https://www.sartorial.com.bd").
   */
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://sartorial-bd.vercel.app").replace(/\/$/, ""),

  contact: {
    /**
     * Where "Send message" delivers orders and fitting requests: WhatsApp, international
     * format, digits only. +880 1772121294 is the admin number supplied for testing;
     * set NEXT_PUBLIC_WHATSAPP_NUMBER (or change it here) for the house's own number.
     */
    whatsapp: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "8801772121294").replace(/\D/g, ""),
    /** TODO: e.g. "+880 1XXX XXXXXX" */
    phone: "",
    /** TODO: the address enquiries should be emailed to. Enables "Send by email". */
    email: "",
    /** TODO: atelier address lines. */
    address: [],
    /** TODO: e.g. "Saturday to Thursday, 11am – 8pm" */
    hours: "",
  },

  /** TODO: full profile URLs. Empty entries are hidden. */
  social: {
    instagram: "",
    facebook: "",
    youtube: "",
  },

  commerce: {
    /** ISO 4217 code used when a product has a `price`. */
    currency: "BDT",
    locale: "en-BD",
    /** Shown wherever a product has no price. */
    noPriceLabel: "Price on request",
    /** Largest quantity of one line in the bag. */
    maxQuantity: 6,
  },

  announcement: [
    { text: "Bespoke fittings by appointment in Dhaka", href: "/appointments", cta: "Book a fitting" },
    { text: "The wedding wardrobe: sherwanis, achkans and bandhgalas", href: "/clothing/heritage", cta: "Explore Heritage" },
  ],
};

export type SizeScale = { label: string; hint: string; sizes: string[]; allowBespoke: boolean };

/**
 * Size scales offered on product pages.
 * TODO: confirm with the client — these are standard menswear scales, not a supplied size chart.
 */
export const SIZE_SCALES: Record<SizeScaleKey, SizeScale> = {
  tailoring: { label: "Chest (in)", hint: "Jacket size is your chest measurement in inches.", sizes: ["36", "38", "40", "42", "44", "46"], allowBespoke: true },
  shirts: { label: "Collar (in)", hint: "Shirt size is your collar measurement in inches.", sizes: ["15", "15.5", "16", "16.5", "17", "17.5"], allowBespoke: true },
  trousers: { label: "Waist (in)", hint: "Trouser size is your waist measurement in inches.", sizes: ["30", "32", "34", "36", "38", "40"], allowBespoke: true },
  footwear: { label: "UK size", hint: "", sizes: ["6", "7", "8", "9", "10", "11"], allowBespoke: false },
  one: { label: "Size", hint: "", sizes: ["One size"], allowBespoke: false },
};

/** The label of the made-to-measure option in the size picker. */
export const BESPOKE_SIZE = "Made to measure";
