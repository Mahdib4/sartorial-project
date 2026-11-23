import { SITE } from "@/config/site";
import type { Banner, HomeSectionKey, SiteSettings } from "./types";

/**
 * Defaults for what the admin manages. The site uses these as they are when no
 * database is connected, and copies them into the database on its first run.
 */

export const HOME_SECTIONS: Array<{ key: HomeSectionKey; label: string; hint: string }> = [
  { key: "promo", label: "Promotional banner", hint: "The space under the opening film. Shows the active home banner, if any." },
  { key: "statement", label: "The house (introduction)", hint: "The paragraph about Sartorial." },
  { key: "collections", label: "Collections", hint: "Heritage, Classic, Accessories and Footwear side by side." },
  { key: "explorer", label: "Shop by category", hint: "Every category, with photographs on hover." },
  { key: "launches", label: "New collections and launches", hint: "Your curated collections, newest first." },
  { key: "heritageFeature", label: "The wedding wardrobe", hint: "Heritage photograph with four pieces." },
  { key: "heritageFilm", label: "Zardosi film", hint: "The sherwani film band." },
  { key: "classicBanners", label: "Classic categories", hint: "The carousel of wide Classic banners." },
  { key: "classicFeature", label: "The suit, cut for one", hint: "Classic photograph with four pieces." },
  { key: "motion", label: "In motion", hint: "The rail of short films." },
  { key: "shopTheLook", label: "Shop the look", hint: "The evening photograph with pieces to tap." },
  { key: "craft", label: "The workroom", hint: "Atelier film and the three stages of a commission." },
];

export const DEFAULT_SETTINGS: SiteSettings = {
  contact: { ...SITE.contact, address: [...SITE.contact.address] },
  social: { ...SITE.social },
  home: {
    sections: Object.fromEntries(HOME_SECTIONS.map((s) => [s.key, true])) as SiteSettings["home"]["sections"],
    heritagePicks: ["emerald-dupioni-silk-sherwani-with-zardosi", "black-velvet-embroidered-collar-achkan", "ivory-floral-jacquard-jodhpuri-jacket", "midnight-navy-bandhgala-suit"],
    classicPicks: ["charcoal-three-piece-bespoke-suit", "charcoal-double-breasted-bespoke-suit", "classic-navy-worsted-blazer", "the-classic-crisp-dress-shirt-white"],
  },
};

/** The announcement-bar notices the site starts with. */
export const DEFAULT_NOTICES: Banner[] = SITE.announcement.map((a, i) => ({
  id: -(i + 1),
  placement: "bar",
  title: a.text,
  eyebrow: "",
  body: "",
  cta: a.cta,
  image: null,
  linkType: "url",
  linkTarget: a.href,
  startsAt: null,
  endsAt: null,
  active: true,
  position: i,
}));

/** Merge stored settings over the defaults, so a new setting always has a value. */
export function withDefaults(stored: Partial<Record<keyof SiteSettings, unknown>>): SiteSettings {
  const s = stored as Partial<SiteSettings>;
  return {
    contact: { ...DEFAULT_SETTINGS.contact, ...(s.contact ?? {}) },
    social: { ...DEFAULT_SETTINGS.social, ...(s.social ?? {}) },
    home: {
      ...DEFAULT_SETTINGS.home,
      ...(s.home ?? {}),
      sections: { ...DEFAULT_SETTINGS.home.sections, ...(s.home?.sections ?? {}) },
    },
  };
}
