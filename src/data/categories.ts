import type { Category, Collection, CollectionKey } from "./types";

/**
 * The site structure, exactly as the client specified it:
 *
 *   Clothing → Heritage → Jodhpuri Jackets, Bandhgala Suits, Sherwanis, Achkans, Stoles, Kurtas, Trousers
 *            → Classic  → Suits, Blazers, Sports Jackets, Casual Jackets, Trousers, Shirts, Coats
 *   Accessories → Ties, Cufflinks, Pocket Squares, Belts
 *   Footwear    → Loafers, Lace-ups, Boots
 *
 * Categories with an `edit` have no product photography yet. Their pages show
 * where the piece appears across the rest of the collection, and switch to a
 * normal product grid automatically as soon as products are added to them in
 * products.ts.
 */

const H = "heritage";
const C = "classic";

export const COLLECTIONS: Record<CollectionKey, Collection> = {
  heritage: {
    key: "heritage",
    name: "Heritage",
    department: "Clothing",
    href: "/clothing/heritage",
    tagline: "The wedding wardrobe",
    intro:
      "Sherwanis, achkans, bandhgalas and Jodhpuri jackets, cut to the body and finished with embroidery worked by hand. The dress of the subcontinent, made the way it was always meant to be: for one person, for one occasion.",
    cover: `${H}/sherwanis/emerald-dupioni-silk-sherwani-with-zardosi-03`,
    banner: `${H}/stoles/ivory-gold-embroidered-border-heritage-stole-ensemble-08`,
    film: `${H}/sherwanis/sartorial-heritage-zardosi-sherwanis-collection-showcase`,
    categories: [
      `${H}/jodhpuri-jackets`,
      `${H}/bandhgala-suits`,
      `${H}/sherwanis`,
      `${H}/achkans`,
      `${H}/stoles`,
      `${H}/kurtas`,
      `${H}/trousers`,
    ],
  },
  classic: {
    key: "classic",
    name: "Classic",
    department: "Clothing",
    href: "/clothing/classic",
    tagline: "Tailoring for every day",
    intro:
      "Suits, jackets, shirts and trousers in the Western tradition. Patterns are drawn for one person and the work is done by hand, from the first basting stitch to the last buttonhole.",
    cover: `${C}/suits/deep-navy-three-piece-peak-lapel-suit-01`,
    banner: `${C}/suits/bespoke-tailored-suits-trio-01`,
    film: `${C}/suits/vitale-barberis-canonico-bespoke-suit-tailoring-film`,
    categories: [
      `${C}/suits`,
      `${C}/blazers`,
      `${C}/sports-jackets`,
      `${C}/casual-jackets`,
      `${C}/trousers`,
      `${C}/shirts`,
      `${C}/coats`,
    ],
  },
  accessories: {
    key: "accessories",
    name: "Accessories",
    department: "Accessories",
    href: "/accessories",
    tagline: "The finishing details",
    intro:
      "A tie, a square of silk, a pair of links at the cuff. The smallest pieces in the wardrobe are the ones people notice first.",
    cover: "edit/tie-paisley",
    banner: `${C}/shirts/bespoke-dress-shirts-trio-flat-lay-01`,
    categories: ["accessories/ties", "accessories/cufflinks", "accessories/pocket-squares", "accessories/belts"],
  },
  footwear: {
    key: "footwear",
    name: "Footwear",
    department: "Footwear",
    href: "/footwear",
    tagline: "From the ground up",
    intro:
      "A suit is finished at the shoe. Loafers for the easy days, lace-ups for the formal ones, and something heavier for flannel and tweed.",
    cover: "edit/footwear-monk-straps",
    banner: `${C}/trousers/tailored-side-tab-trousers-stack-01`,
    categories: ["footwear/loafers", "footwear/lace-ups", "footwear/boots"],
  },
};

export const COLLECTION_ORDER: CollectionKey[] = ["heritage", "classic", "accessories", "footwear"];

export const CATEGORIES: Category[] = [
  // ── Heritage ─────────────────────────────────────────────
  {
    key: `${H}/jodhpuri-jackets`,
    slug: "jodhpuri-jackets",
    collection: "heritage",
    name: "Jodhpuri Jackets",
    blurb: "Jodhpuri and Nehru jackets in brocade, jacquard and silk-wool.",
    intro:
      "Closed at the collar and cut close to the body, the Jodhpuri jacket is worn over a kurta in place of a sherwani. Sleeved or sleeveless, in brocade, jacquard or plain silk-wool.",
    preview: [
      `${H}/jodhpuri-jackets/blush-peach-floral-brocade-nehru-jacket-03`,
      `${H}/jodhpuri-jackets/ivory-floral-jacquard-jodhpuri-jacket-03`,
      `${H}/jodhpuri-jackets/sage-green-brocade-nehru-jacket-01`,
      `${H}/jodhpuri-jackets/taupe-silk-wool-nehru-jacket-02`,
    ],
    film: `${H}/jodhpuri-jackets/ivory-brocade-jodhpuri-jackets-duo-showcase-01`,
    sizes: "tailoring",
  },
  {
    key: `${H}/bandhgala-suits`,
    slug: "bandhgala-suits",
    collection: "heritage",
    name: "Bandhgala Suits",
    blurb: "The closed-collar suit, in black and midnight navy.",
    intro:
      "The bandhgala is the formal suit of the subcontinent: a closed collar, a clean front and matching trousers. It stands in wherever a dinner jacket would be worn, and needs no tie.",
    preview: [
      `${H}/bandhgala-suits/midnight-navy-bandhgala-suit-03`,
      `${H}/bandhgala-suits/black-brass-button-bandhgala-suit-03`,
      `${H}/bandhgala-suits/midnight-navy-bandhgala-suit-04`,
      `${H}/bandhgala-suits/black-brass-button-bandhgala-suit-01`,
    ],
    sizes: "tailoring",
  },
  {
    key: `${H}/sherwanis`,
    slug: "sherwanis",
    collection: "heritage",
    name: "Sherwanis",
    blurb: "Raw silk and dupioni, embroidered by hand in zardosi.",
    intro:
      "The sherwani is the centre of the wedding wardrobe. Ours are cut in raw and dupioni silks and embroidered by hand in zardosi, the raised metal-thread work of the Mughal courts.",
    preview: [
      `${H}/sherwanis/emerald-dupioni-silk-sherwani-with-zardosi-03`,
      `${H}/sherwanis/apricot-raw-silk-zardosi-sherwani-02`,
      `${H}/sherwanis/midnight-black-embellished-sherwani-01`,
      `${H}/sherwanis/blush-pink-raw-silk-zardosi-sherwani-02`,
    ],
    film: `${H}/sherwanis/sartorial-heritage-zardosi-sherwanis-collection-showcase`,
    sizes: "tailoring",
  },
  {
    key: `${H}/achkans`,
    slug: "achkans",
    collection: "heritage",
    name: "Achkans",
    blurb: "Long, lean and buttoned to the collar, in silk, velvet and brocade.",
    intro:
      "Leaner than a sherwani and cut closer through the chest, the achkan is the most tailored of the long coats. In silk, velvet, brocade and jacquard, many with the collar embroidered by hand.",
    preview: [
      `${H}/achkans/black-velvet-embroidered-collar-achkan-02`,
      `${H}/achkans/powder-blue-silk-embroidered-collar-achkan-03`,
      `${H}/achkans/mocha-brown-silk-embroidered-collar-achkan-02`,
      `${H}/achkans/champagne-gold-embroidered-achkan-01`,
    ],
    film: `${H}/achkans/mocha-brown-and-powder-blue-silk-achkans-duo-showcase-01`,
    sizes: "tailoring",
  },
  {
    key: `${H}/stoles`,
    slug: "stoles",
    collection: "heritage",
    name: "Stoles",
    blurb: "Hand-embroidered stoles, worn over the shoulder.",
    intro:
      "The stole finishes a sherwani. Worn over one shoulder or carried across the forearm, with a border embroidered by hand to answer the coat beneath it.",
    preview: [
      `${H}/stoles/ivory-gold-embroidered-border-heritage-stole-ensemble-02`,
      `${H}/stoles/ivory-gold-embroidered-border-heritage-stole-ensemble-04`,
      `${H}/stoles/ivory-gold-embroidered-border-heritage-stole-ensemble-01`,
      `${H}/stoles/ivory-gold-embroidered-border-heritage-stole-ensemble-08`,
    ],
    film: `${H}/stoles/ivory-gold-embroidered-border-heritage-stole-showcase-01`,
    sizes: "one",
  },
  {
    key: `${H}/kurtas`,
    slug: "kurtas",
    collection: "heritage",
    name: "Kurtas",
    blurb: "Silk kurtas, cut to be worn beneath a jacket.",
    intro:
      "Every Nehru and Jodhpuri jacket we make is worn over a kurta, and the kurta is cut with it: the length, the sleeve and the colour of the silk are all decided against the jacket.",
    preview: ["edit/kurta-under-ivory", "edit/kurta-under-sage", "edit/kurta-under-taupe", "edit/kurta-under-brocade"],
    sizes: "tailoring",
    edit: [
      { image: "edit/kurta-under-ivory", caption: "Champagne silk kurta, beneath the open-front Jodhpuri jacket" },
      { image: "edit/kurta-under-sage", caption: "Silk kurta with the sage brocade Nehru jacket" },
      { image: "edit/kurta-under-taupe", caption: "Ivory kurta with the taupe silk-wool Nehru jacket" },
      { image: "edit/kurta-under-brocade", caption: "Kurta sleeve against blush peach brocade" },
    ],
  },
  {
    key: `${H}/trousers`,
    slug: "trousers",
    collection: "heritage",
    name: "Trousers",
    blurb: "Slim trousers cut to finish a sherwani or achkan.",
    intro:
      "Heritage trousers are cut slim and straight so that the coat above them can do the talking. In ivory, in champagne, or in the same silk as the sherwani.",
    preview: ["edit/trouser-ivory-achkan", "edit/trouser-apricot", "edit/trouser-emerald", "edit/trouser-blue-achkan"],
    sizes: "trousers",
    edit: [
      { image: "edit/trouser-ivory-achkan", caption: "Ivory trousers beneath the mocha silk achkan" },
      { image: "edit/trouser-apricot", caption: "Stone trousers with the apricot raw silk sherwani" },
      { image: "edit/trouser-emerald", caption: "Matching dupioni trousers, in emerald" },
      { image: "edit/trouser-blue-achkan", caption: "Ivory trousers with the powder blue achkan" },
      { image: "edit/trouser-champagne", caption: "Champagne trousers with the gold brocade Jodhpuri jacket" },
    ],
  },

  // ── Classic ──────────────────────────────────────────────
  {
    key: `${C}/suits`,
    slug: "suits",
    collection: "classic",
    name: "Suits",
    blurb: "Two-piece, three-piece and evening dress.",
    intro:
      "From a first charcoal suit to black tie. Single- and double-breasted, in two and three pieces, each one cut from a pattern drawn for its wearer.",
    preview: [
      `${C}/suits/deep-navy-three-piece-peak-lapel-suit-01`,
      `${C}/suits/charcoal-three-piece-bespoke-suit-03`,
      `${C}/suits/light-grey-double-breasted-peak-lapel-suit-01`,
      `${C}/suits/midnight-navy-double-breasted-tuxedo-02`,
    ],
    sizes: "tailoring",
  },
  {
    key: `${C}/blazers`,
    slug: "blazers",
    collection: "classic",
    name: "Blazers",
    blurb: "The navy blazer, and its warmer cousins.",
    intro:
      "The jacket that works hardest. In navy worsted for the office and travel, and in open-weave hopsack for the heat.",
    preview: [
      `${C}/blazers/classic-navy-worsted-blazer-01`,
      `${C}/blazers/tobacco-brown-hopsack-blazer-01`,
      `${C}/blazers/classic-navy-blazer-and-grey-trousers-ensemble-01`,
    ],
    sizes: "tailoring",
  },
  {
    key: `${C}/sports-jackets`,
    slug: "sports-jackets",
    collection: "classic",
    name: "Sports Jackets",
    blurb: "Tweed, texture and check.",
    intro:
      "Jackets with some life in the cloth: tweeds, textured wools and fine checks, cut softer than a suit and made to be worn with odd trousers.",
    preview: [
      `${C}/sports-jackets/grey-brown-tweed-norfolk-sports-jacket-02`,
      `${C}/sports-jackets/light-grey-micro-check-sports-jacket-01`,
      `${C}/sports-jackets/charcoal-textured-wool-sports-jacket-01`,
      `${C}/sports-jackets/grey-brown-tweed-norfolk-sports-jacket-01`,
    ],
    sizes: "tailoring",
  },
  {
    key: `${C}/casual-jackets`,
    slug: "casual-jackets",
    collection: "classic",
    name: "Casual Jackets",
    blurb: "Field jackets, safari jackets and overshirts.",
    intro:
      "Tailoring for the days without a tie. Field jackets, safari jackets and overshirts in cotton twill, cut with the same care as a suit.",
    preview: [
      `${C}/casual-jackets/olive-cotton-twill-safari-jacket-01`,
      `${C}/casual-jackets/dark-olive-cotton-twill-casual-field-jacket-01`,
      `${C}/casual-jackets/terracotta-casual-overshirt-jacket-01`,
    ],
    sizes: "tailoring",
  },
  {
    key: `${C}/trousers`,
    slug: "trousers",
    collection: "classic",
    name: "Trousers",
    blurb: "Side-tab twills and single-pleat dress trousers.",
    intro:
      "Cotton twills for the week and wool dress trousers for everything else. Side adjusters in place of belt loops, a single pleat, and hand stitching where it shows.",
    preview: [
      `${C}/trousers/tailored-single-pleat-trouser-dark-brown-01`,
      `${C}/trousers/tailored-side-tab-trousers-stack-01`,
      `${C}/trousers/tailored-wool-drawstring-trouser-mid-grey-01`,
      `${C}/trousers/tailored-twill-trouser-khaki-02`,
    ],
    sizes: "trousers",
  },
  {
    key: `${C}/shirts`,
    slug: "shirts",
    collection: "classic",
    name: "Shirts",
    blurb: "Four collars, in poplin, Oxford and stripe.",
    intro:
      "A shirt is defined by its collar. Semi spread, cutaway, button-down and the dramatic button-down with its full collar roll; in whites, blues, stripes and checks.",
    preview: [
      `${C}/shirts/the-classic-crisp-dress-shirt-white-02`,
      `${C}/shirts/bespoke-dress-shirts-collection-flat-lay-01`,
      `${C}/shirts/twin-pocket-safari-shirt-pale-pink-03`,
      `${C}/shirts/bespoke-blue-chambray-and-poplin-shirts-stack-01`,
    ],
    sizes: "shirts",
  },
  {
    key: `${C}/coats`,
    slug: "coats",
    collection: "classic",
    name: "Coats",
    blurb: "Overcoats cut to order, in the cloths of the house.",
    intro:
      "A coat is the largest piece a tailor makes and the one that lasts longest. Coats are cut to order, in the same flannels, tweeds and twills as the tailoring they are worn over.",
    preview: [
      `${C}/suits/mid-grey-flannel-two-piece-suit-04`,
      `${C}/sports-jackets/grey-brown-tweed-norfolk-sports-jacket-01`,
      `${C}/casual-jackets/dark-olive-cotton-twill-casual-field-jacket-01`,
    ],
    sizes: "tailoring",
    edit: [
      { image: `${C}/suits/mid-grey-flannel-two-piece-suit-04`, caption: "Mid-grey flannel, chosen from the bolt" },
      { image: `${C}/sports-jackets/grey-brown-tweed-norfolk-sports-jacket-01`, caption: "Grey-brown tweed" },
      { image: `${C}/casual-jackets/dark-olive-cotton-twill-casual-field-jacket-01`, caption: "Dark olive cotton twill, in the cloth room" },
      { image: `${C}/suits/mid-grey-flannel-two-piece-suit-03`, caption: "The cloth room" },
    ],
  },

  // ── Accessories ──────────────────────────────────────────
  {
    key: "accessories/ties",
    slug: "ties",
    collection: "accessories",
    name: "Ties",
    blurb: "Printed silks, repp stripes and knits.",
    intro:
      "Printed silks, repp stripes and knitted ties, chosen against the shirt and the cloth of the jacket. Seen here as they are worn across the collection.",
    preview: [
      "edit/tie-paisley",
      `${C}/shirts/bespoke-dress-shirts-trio-flat-lay-01`,
      "edit/tie-navy-dot",
      "edit/tie-rust-print",
    ],
    sizes: "one",
    edit: [
      { image: "edit/tie-paisley", caption: "Paisley silk with the navy worsted blazer" },
      { image: `${C}/shirts/bespoke-button-down-shirt-white-flat-lay-01`, caption: "Printed silk on a white button-down" },
      { image: "edit/tie-navy-dot", caption: "Navy pin-dot with charcoal worsted" },
      { image: "edit/tie-rust-print", caption: "Rust printed silk against deep navy" },
      { image: `${C}/shirts/bespoke-oxford-shirt-sky-blue-flat-lay-01`, caption: "Green repp stripe on sky blue Oxford" },
      { image: "edit/tie-gold-print", caption: "Gold printed silk with the charcoal single-breasted" },
      { image: "edit/tie-grey-tweed", caption: "Paisley with a light grey micro-check" },
      { image: "edit/tie-green", caption: "Bottle green with mid-grey" },
    ],
  },
  {
    key: "accessories/cufflinks",
    slug: "cufflinks",
    collection: "accessories",
    name: "Cufflinks",
    blurb: "The last half-inch of the sleeve.",
    intro:
      "A jacket sleeve is cut to show half an inch of shirt cuff. What closes that cuff, a pair of links or a button, is decided with the shirt.",
    preview: ["edit/cuff-charcoal", "edit/cuff-navy-suit", "edit/cuff-safari", "edit/cuff-barrel"],
    sizes: "one",
    edit: [
      { image: "edit/cuff-charcoal", caption: "A half-inch of cuff beneath charcoal worsted" },
      { image: "edit/cuff-navy-suit", caption: "The cuff of the deep navy three-piece" },
      { image: "edit/cuff-safari", caption: "Turn-back cuffs on the safari shirt" },
      { image: "edit/cuff-barrel", caption: "The double-button barrel cuff" },
      { image: "edit/cuff-tuxedo", caption: "Evening cuffs with the midnight navy dinner suit" },
      { image: "edit/cuff-velvet", caption: "White cuff against tobacco velvet" },
    ],
  },
  {
    key: "accessories/pocket-squares",
    slug: "pocket-squares",
    collection: "accessories",
    name: "Pocket Squares",
    blurb: "White linen and printed silk.",
    intro:
      "White linen, folded flat, goes with everything. Printed silk is for the days you want to be noticed. Seen here across the Classic and Heritage collections.",
    preview: ["edit/pocket-square-purple", "edit/pocket-square-bandhgala", "edit/pocket-square-velvet", "edit/pocket-square-white"],
    sizes: "one",
    edit: [
      { image: "edit/pocket-square-purple", caption: "Printed silk in tobacco hopsack" },
      { image: "edit/pocket-square-white", caption: "White linen in a navy worsted blazer" },
      { image: "edit/pocket-square-bandhgala", caption: "Navy silk in the midnight bandhgala" },
      { image: "edit/pocket-square-velvet", caption: "White silk against black velvet" },
      { image: "edit/pocket-square-grey-suit", caption: "A flat fold in light grey" },
      { image: "edit/pocket-square-brocade", caption: "Wine silk in champagne brocade" },
      { image: "edit/pocket-square-nehru", caption: "White silk in the taupe Nehru jacket" },
    ],
  },
  {
    key: "accessories/belts",
    slug: "belts",
    collection: "accessories",
    name: "Belts",
    blurb: "Leather belts for the trousers that take them.",
    intro:
      "Most of our trousers are cut with side adjusters and need no belt. For those that do, the rule is simple: match the leather to the shoe.",
    preview: ["edit/belt-black-trouser", "edit/belt-pleat", "edit/belt-white-trouser", "edit/belt-drawstring"],
    sizes: "one",
    edit: [
      { image: "edit/belt-black-trouser", caption: "A slim belt at the waist of black dress trousers" },
      { image: "edit/belt-pleat", caption: "The high waist of the single-pleat trouser" },
      { image: "edit/belt-white-trouser", caption: "Cream trousers with the safari shirt" },
      { image: "edit/belt-drawstring", caption: "The drawstring alternative" },
    ],
  },

  // ── Footwear ─────────────────────────────────────────────
  {
    key: "footwear/loafers",
    slug: "loafers",
    collection: "footwear",
    name: "Loafers",
    blurb: "Tassel, penny and suede.",
    intro:
      "The easiest shoe to wear with tailoring. Tassel loafers under a turn-up, penny loafers with a suit, suede with cream trousers, and embroidered slippers with heritage dress.",
    preview: ["edit/footwear-tassel-loafers", "edit/footwear-black-loafers", "edit/footwear-suede-loafers", "edit/footwear-heritage-loafers"],
    sizes: "footwear",
    edit: [
      { image: "edit/footwear-tassel-loafers", caption: "Tassel loafers under a single-pleat trouser" },
      { image: "edit/footwear-black-loafers", caption: "Black loafers with the classic grey suit" },
      { image: "edit/footwear-suede-loafers", caption: "Brown suede with cream trousers" },
      { image: "edit/footwear-heritage-loafers", caption: "Embroidered slippers with the ivory Jodhpuri jacket" },
      { image: "edit/footwear-black-loafers-seated", caption: "Black loafers, seated" },
    ],
  },
  {
    key: "footwear/lace-ups",
    slug: "lace-ups",
    collection: "footwear",
    name: "Lace-ups",
    blurb: "Oxfords, derbies and monk straps.",
    intro:
      "Black Oxfords for business and evening, tan and brown for everything else. Shown here with the suits they were chosen for.",
    preview: ["edit/footwear-brown-laceups", "edit/footwear-black-oxfords", "edit/footwear-brown-laceups-seated", "edit/footwear-monk-straps"],
    sizes: "footwear",
    edit: [
      { image: "edit/footwear-brown-laceups", caption: "Tan lace-ups with light grey" },
      { image: "edit/footwear-black-oxfords", caption: "Black Oxfords with black dress trousers" },
      { image: "edit/footwear-brown-laceups-seated", caption: "Tan lace-ups, seated" },
      { image: "edit/footwear-monk-straps", caption: "Double monk straps" },
      { image: "edit/footwear-tan-monks", caption: "Tan monk straps with the powder blue achkan" },
      { image: "edit/footwear-black-heritage", caption: "Black lace-ups with ivory trousers" },
    ],
  },
  {
    key: "footwear/boots",
    slug: "boots",
    collection: "footwear",
    name: "Boots",
    blurb: "Suede and grain leather, for flannel and tweed.",
    intro:
      "The heavier cloths ask for a heavier shoe. Brown suede and grain leather, worn with flannel, tweed and textured wool.",
    preview: ["edit/footwear-suede-derbies", "edit/footwear-brogues", "edit/footwear-suede-derbies-2"],
    sizes: "footwear",
    edit: [
      { image: "edit/footwear-suede-derbies", caption: "Brown suede with mid-grey flannel" },
      { image: "edit/footwear-brogues", caption: "Brown leather with textured charcoal wool" },
      { image: "edit/footwear-suede-derbies-2", caption: "Suede, standing" },
      { image: "edit/footwear-monk-straps-2", caption: "Dark leather beside a stack of side-tab trousers" },
    ],
  },
];
