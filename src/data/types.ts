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
