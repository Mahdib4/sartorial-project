export type CollectionKey = "heritage" | "classic" | "accessories" | "footwear";

export type ColourFamily =
  | "Black"
  | "Navy"
  | "Blue"
  | "Grey"
  | "Brown"
  | "Green"
  | "Ivory"
  | "Gold"
  | "Pink"
  | "Red"
  | "White"
  | "Multi";

export type SizeScaleKey = "tailoring" | "shirts" | "trousers" | "footwear" | "one";

export type Product = {
  /** URL segment: /products/<slug> */
  slug: string;
  name: string;
  /** Category key, e.g. "heritage/sherwanis" */
  category: string;
  /** Media ids. The first is the card image, the second (if any) the hover image. */
  images: string[];
  videos?: string[];
  colour: string;
  colourFamily: ColourFamily;
  fabric?: string;
  /** The house reference, where the client has supplied one. */
  code?: string;
  /** e.g. "Wedding", "Festive", "Black tie", "Business", "Casual" */
  occasions: string[];
  /** One line, shown under the name on the product page. */
  summary: string;
  description: string;
  details: string[];
  note?: string;
  /** Optional. Without a price the piece is shown as "Price on request". */
  price?: number;
  /** A reduced price for this piece (set in the admin). */
  salePrice?: number;
  /** A short label on the card, e.g. "New" or "Limited". */
  badge?: string;
  /** Hidden pieces are kept but not shown anywhere on the site. */
  visible?: boolean;
  /** Featured pieces can be picked for the home page. */
  featured?: boolean;
};

export type EditShot = {
  /** Media id */
  image: string;
  caption: string;
};

export type Category = {
  /** "heritage/sherwanis" */
  key: string;
  slug: string;
  collection: CollectionKey;
  name: string;
  /** Short line used in menus and tiles. */
  blurb: string;
  /** Opening paragraph on the category page. */
  intro: string;
  /** Media ids shown when the category is hovered on the homepage and in the menu. */
  preview: string[];
  /** Optional film id shown at the top of the category page. */
  film?: string;
  sizes: SizeScaleKey;
  /**
   * For categories the client has not yet photographed as products: a short
   * edit of where the piece appears across the collection.
   */
  edit?: EditShot[];
  /** Hidden categories are kept but left out of menus and pages. */
  visible?: boolean;
};

export type Collection = {
  key: CollectionKey;
  name: string;
  department: "Clothing" | "Accessories" | "Footwear";
  href: string;
  /** Two or three words under the name. */
  tagline: string;
  intro: string;
  /** Media id for tiles and headers. */
  cover: string;
  /** Wide media id for the collection page header. */
  banner: string;
  film?: string;
  categories: string[];
};

export type MediaImage = {
  w: number;
  h: number;
  widths: number[];
  blur: string;
  bg: string;
  flat?: boolean;
  /** A studio photograph whose backdrop has been levelled to white: it can be shown whole in any frame. */
  cut?: boolean;
  name?: string;
  from?: string;
  /** CSS object-position for frames that crop this image. */
  focus?: string;
};

export type MediaVideo = {
  w: number;
  h: number;
  duration: number;
  poster: { widths: number[]; blur: string };
  audio?: boolean;
  name?: string;
};

/** A media record for a photograph uploaded through the admin (stored in Cloudflare R2). */
export type UploadedImage = MediaImage & { id: string };

export type LinkType = "none" | "product" | "category" | "collection" | "curated" | "url";

/** A promotional banner (home page slot) or a notice (announcement bar). */
export type Banner = {
  id: number;
  placement: "home" | "bar";
  title: string;
  eyebrow: string;
  body: string;
  cta: string;
  /** Media id. */
  image: string | null;
  linkType: LinkType;
  linkTarget: string;
  startsAt: string | null;
  endsAt: string | null;
  active: boolean;
  position: number;
};

export type Offer = {
  id: number;
  name: string;
  /** percent: value is a percentage; amount: value is taka off; note: no price change, just the badge. */
  kind: "percent" | "amount" | "note";
  value: number;
  scope: "all" | "collection" | "category" | "products";
  targets: string[];
  badge: string;
  startsAt: string | null;
  endsAt: string | null;
  active: boolean;
};

/** A curated collection or launch, with its own page at /collections/<slug>. */
export type Curated = {
  slug: string;
  title: string;
  eyebrow: string;
  intro: string;
  /** Media id. */
  cover: string | null;
  products: string[];
  isLaunch: boolean;
  visible: boolean;
  position: number;
};

export type HomeSectionKey =
  | "promo"
  | "statement"
  | "collections"
  | "explorer"
  | "heritageFeature"
  | "heritageFilm"
  | "classicBanners"
  | "classicFeature"
  | "motion"
  | "shopTheLook"
  | "launches"
  | "craft";

export type ContactSettings = { whatsapp: string; phone: string; email: string; address: string[]; hours: string };
export type SocialSettings = { instagram: string; facebook: string; youtube: string };
export type HomeSettings = {
  sections: Record<HomeSectionKey, boolean>;
  /** Product slugs for the "wedding wardrobe" (Heritage) and "suit, cut for one" (Classic) features. */
  heritagePicks: string[];
  classicPicks: string[];
};

export type SiteSettings = { contact: ContactSettings; social: SocialSettings; home: HomeSettings };
