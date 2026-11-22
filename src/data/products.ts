import type { Product } from "./types";

/**
 * The catalogue.
 *
 * Every product is one entry here. `images` and `videos` are media ids from
 * `media.generated.json` (see scripts/build-media.mjs); the first image is the
 * one shown on product cards. Add `price` (a number, in the currency set in
 * src/config/site.ts) to show a price and include the piece in bag totals;
 * without it the piece is shown as "Price on request".
 */
export const PRODUCTS: Product[] = [
  {
    "slug": "charcoal-three-piece-bespoke-suit",
    "name": "Charcoal Three-Piece Bespoke Suit",
    "category": "classic/suits",
    "images": [
      "classic/suits/charcoal-three-piece-bespoke-suit-03",
      "classic/suits/charcoal-three-piece-bespoke-suit-06",
      "classic/suits/charcoal-three-piece-bespoke-suit-01",
      "classic/suits/charcoal-three-piece-bespoke-suit-02",
      "classic/suits/charcoal-three-piece-bespoke-suit-04",
      "classic/suits/charcoal-three-piece-bespoke-suit-05"
    ],
    "colour": "Charcoal",
    "colourFamily": "Grey",
    "occasions": [
      "Business",
      "Wedding"
    ],
    "summary": "Jacket, waistcoat and trousers, cut as one in charcoal.",
    "description": "The three-piece is tailoring at its most complete: jacket, waistcoat and trousers cut together so the line runs unbroken from shoulder to shoe. In charcoal it is as correct at a board meeting as it is at a wedding, and it rewards being worn in parts.",
    "details": [
      "Three pieces: jacket, waistcoat and trousers",
      "Single-breasted jacket",
      "Cut and finished by hand",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "charcoal-double-breasted-bespoke-suit",
    "name": "Charcoal Double-Breasted Bespoke Suit",
    "category": "classic/suits",
    "images": [
      "classic/suits/charcoal-double-breasted-bespoke-suit-01"
    ],
    "colour": "Charcoal",
    "colourFamily": "Grey",
    "occasions": [
      "Business"
    ],
    "summary": "A double-breasted suit in charcoal, built around a strong shoulder.",
    "description": "Double-breasted tailoring asks more of the cutter than any other jacket; the fronts have to cross cleanly and close without strain. Ours is cut close through the waist with a full chest, in a charcoal that suits both day and evening.",
    "details": [
      "Double-breasted jacket with matching trousers",
      "Cut and finished by hand",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "classic-charcoal-double-breasted-worsted-suit",
    "name": "Classic Charcoal Double-Breasted Worsted Suit",
    "category": "classic/suits",
    "images": [
      "classic/suits/classic-charcoal-double-breasted-worsted-suit-01"
    ],
    "colour": "Charcoal",
    "colourFamily": "Grey",
    "fabric": "Worsted wool",
    "occasions": [
      "Business"
    ],
    "summary": "The house double-breasted in charcoal worsted.",
    "description": "A double-breasted suit in a clean charcoal worsted, with the lapel carried high and the buttoning set to lengthen the body. Worn here with a navy tie and a white pocket square, which is very nearly all it needs.",
    "details": [
      "Double-breasted jacket with peak lapels",
      "Worsted wool",
      "Cut and finished by hand",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "classic-charcoal-single-breasted-worsted-suit",
    "name": "Classic Charcoal Single-Breasted Worsted Suit",
    "category": "classic/suits",
    "images": [
      "classic/suits/classic-charcoal-single-breasted-worsted-suit-01"
    ],
    "colour": "Charcoal",
    "colourFamily": "Grey",
    "fabric": "Worsted wool",
    "occasions": [
      "Business"
    ],
    "summary": "A single-breasted suit in charcoal worsted. The place to begin.",
    "description": "If a man is to own one suit, this is the one. Single-breasted, in a charcoal worsted that takes every shirt and tie in the wardrobe, and cut to your own pattern so that it sits properly whether you are standing, seated or have your arms folded.",
    "details": [
      "Single-breasted jacket with matching trousers",
      "Worsted wool",
      "Cut and finished by hand",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "classic-grey-two-piece-suit",
    "name": "Classic Grey Two-Piece Suit",
    "category": "classic/suits",
    "images": [
      "classic/suits/classic-grey-two-piece-suit-01",
      "classic/suits/classic-grey-two-piece-suit-02",
      "classic/suits/classic-grey-two-piece-suit-03",
      "classic/suits/bespoke-tailored-suits-trio-01"
    ],
    "colour": "Mid grey",
    "colourFamily": "Grey",
    "occasions": [
      "Business"
    ],
    "summary": "A two-piece in mid grey, lighter in mood than charcoal.",
    "description": "Mid grey is the most forgiving colour in tailoring and the easiest to wear through the day. This two-piece is cut with a soft, natural shoulder and a trouser that breaks once over the shoe.",
    "details": [
      "Single-breasted jacket with matching trousers",
      "Cut and finished by hand",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "deep-navy-three-piece-peak-lapel-suit",
    "name": "Deep Navy Three-Piece Peak-Lapel Suit",
    "category": "classic/suits",
    "images": [
      "classic/suits/deep-navy-three-piece-peak-lapel-suit-01",
      "classic/suits/deep-navy-three-piece-peak-lapel-suit-02",
      "classic/suits/deep-navy-three-piece-peak-lapel-suit-03",
      "classic/suits/bespoke-tailored-suits-trio-01"
    ],
    "colour": "Deep navy",
    "colourFamily": "Navy",
    "occasions": [
      "Business",
      "Wedding"
    ],
    "summary": "A three-piece in deep navy, finished with a peak lapel.",
    "description": "A peak lapel on a single-breasted jacket lifts the eye to the shoulder and gives a three-piece its sense of occasion. Cut in a deep navy and worn with its waistcoat, this is a suit for the days that matter.",
    "details": [
      "Three pieces: jacket, waistcoat and trousers",
      "Peak lapel",
      "Cut and finished by hand",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "light-grey-double-breasted-peak-lapel-suit",
    "name": "Light Grey Double-Breasted Peak-Lapel Suit",
    "category": "classic/suits",
    "images": [
      "classic/suits/light-grey-double-breasted-peak-lapel-suit-01",
      "classic/suits/light-grey-double-breasted-peak-lapel-suit-02",
      "classic/suits/light-grey-double-breasted-peak-lapel-suit-03",
      "classic/suits/bespoke-tailored-suits-trio-01"
    ],
    "colour": "Light grey",
    "colourFamily": "Grey",
    "occasions": [
      "Business",
      "Wedding"
    ],
    "summary": "A double-breasted suit in light grey, with a broad peak lapel.",
    "description": "Light grey takes the formality out of a double-breasted jacket and leaves the shape. The peak lapel is cut broad and the fronts are set to be worn buttoned, with tan shoes and an open stance.",
    "details": [
      "Double-breasted jacket with peak lapels",
      "Matching trousers",
      "Cut and finished by hand",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "mid-grey-flannel-two-piece-suit",
    "name": "Mid-Grey Flannel Two-Piece Suit",
    "category": "classic/suits",
    "images": [
      "classic/suits/mid-grey-flannel-two-piece-suit-04",
      "classic/suits/mid-grey-flannel-two-piece-suit-01",
      "classic/suits/mid-grey-flannel-two-piece-suit-02",
      "classic/suits/mid-grey-flannel-two-piece-suit-03"
    ],
    "colour": "Mid grey",
    "colourFamily": "Grey",
    "fabric": "Wool flannel",
    "occasions": [
      "Business",
      "Casual"
    ],
    "summary": "A two-piece in mid-grey flannel, made to be worn soft.",
    "description": "Flannel has a depth that smooth worsted cannot match, and it is at its best worn informally: here with a navy roll-neck in place of a shirt and tie. The cloth softens further with every wearing.",
    "details": [
      "Single-breasted jacket with matching trousers",
      "Wool flannel",
      "Cut and finished by hand",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "classic-black-bespoke-tuxedo",
    "name": "Classic Black Bespoke Tuxedo",
    "category": "classic/suits",
    "images": [
      "classic/suits/classic-black-bespoke-tuxedo-01",
      "classic/suits/black-tie-evening-tuxedos-trio-01"
    ],
    "colour": "Black",
    "colourFamily": "Black",
    "occasions": [
      "Black tie",
      "Wedding"
    ],
    "summary": "The black dinner suit, made properly.",
    "description": "Black tie is a uniform, which is exactly why the cut matters. Our dinner suit is made to your pattern with silk-faced lapels, and is worn here as it should be: bow tie, covered waist and a plain white shirt.",
    "details": [
      "Dinner jacket with silk-faced lapels",
      "Matching trousers",
      "Cut and finished by hand",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "ivory-double-breasted-tuxedo",
    "name": "Ivory Double-Breasted Tuxedo",
    "category": "classic/suits",
    "images": [
      "classic/suits/ivory-double-breasted-tuxedo-01",
      "classic/suits/black-tie-evening-tuxedos-trio-01"
    ],
    "colour": "Ivory",
    "colourFamily": "Ivory",
    "occasions": [
      "Black tie",
      "Wedding"
    ],
    "summary": "An ivory double-breasted dinner jacket for warm evenings.",
    "description": "The ivory dinner jacket belongs to warm climates and long evenings. Ours is double-breasted and worn with black dress trousers and a black bow tie, the one correct way to wear it.",
    "details": [
      "Double-breasted dinner jacket in ivory",
      "Worn with black dress trousers",
      "Cut and finished by hand",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "midnight-navy-double-breasted-tuxedo",
    "name": "Midnight Navy Double-Breasted Tuxedo",
    "category": "classic/suits",
    "images": [
      "classic/suits/midnight-navy-double-breasted-tuxedo-02",
      "classic/suits/midnight-navy-double-breasted-tuxedo-01",
      "classic/suits/velvet-and-navy-double-breasted-tuxedos-duo-03",
      "classic/suits/velvet-and-navy-double-breasted-tuxedos-duo-02",
      "classic/suits/velvet-and-navy-double-breasted-tuxedos-duo-01"
    ],
    "colour": "Midnight navy",
    "colourFamily": "Navy",
    "occasions": [
      "Black tie",
      "Wedding"
    ],
    "summary": "A double-breasted dinner suit in midnight navy with black facings.",
    "description": "Under evening light, midnight navy reads darker than black. This dinner suit is double-breasted, with black silk-faced peak lapels against the navy cloth, a quiet contrast that only shows when you are close.",
    "details": [
      "Double-breasted dinner jacket with black silk-faced peak lapels",
      "Dress trousers",
      "Cut and finished by hand",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "tobacco-brown-velvet-dinner-suit",
    "name": "Tobacco Brown Velvet Dinner Suit",
    "category": "classic/suits",
    "images": [
      "classic/suits/tobacco-brown-velvet-dinner-suit-03",
      "classic/suits/tobacco-brown-velvet-dinner-suit-01",
      "classic/suits/tobacco-brown-velvet-dinner-suit-02",
      "classic/suits/velvet-and-navy-double-breasted-tuxedos-duo-03",
      "classic/suits/velvet-and-navy-double-breasted-tuxedos-duo-02",
      "classic/suits/velvet-and-navy-double-breasted-tuxedos-duo-01"
    ],
    "colour": "Tobacco brown",
    "colourFamily": "Brown",
    "fabric": "Velvet",
    "occasions": [
      "Black tie",
      "Wedding"
    ],
    "summary": "A dinner jacket in tobacco brown velvet over black dress trousers.",
    "description": "Velvet is the dinner jacket for a host. In tobacco brown it is warmer and less expected than black or bottle green, and it sits naturally over black dress trousers with a black bow tie.",
    "details": [
      "Single-breasted velvet dinner jacket",
      "Worn with black dress trousers",
      "Cut and finished by hand",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "classic-navy-tailored-blazer",
    "name": "Classic Navy Tailored Blazer",
    "category": "classic/blazers",
    "images": [
      "classic/blazers/classic-navy-tailored-blazer-01",
      "classic/blazers/classic-navy-blazer-and-grey-trousers-ensemble-01"
    ],
    "colour": "Navy",
    "colourFamily": "Navy",
    "occasions": [
      "Business",
      "Casual"
    ],
    "summary": "The navy blazer: the most useful jacket a man can own.",
    "description": "A navy blazer does more work than anything else in the wardrobe. Ours is single-breasted with patch pockets, and is shown here as an ensemble with grey trousers, a pale blue shirt and a striped tie.",
    "details": [
      "Single-breasted blazer with patch pockets",
      "Shown with grey trousers, shirt and tie",
      "Cut and finished by hand",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "classic-navy-worsted-blazer",
    "name": "Classic Navy Worsted Blazer",
    "category": "classic/blazers",
    "images": [
      "classic/blazers/classic-navy-worsted-blazer-01"
    ],
    "colour": "Navy",
    "colourFamily": "Navy",
    "fabric": "Worsted wool",
    "occasions": [
      "Business",
      "Casual"
    ],
    "summary": "A navy blazer in worsted, cut a little sharper.",
    "description": "Cut in a navy worsted with a clean, roped shoulder, this is the blazer that stands in for a suit. It carries a tie as easily as an open collar; here with a paisley silk and a white linen square.",
    "details": [
      "Single-breasted blazer",
      "Worsted wool",
      "Cut and finished by hand",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "tobacco-brown-hopsack-blazer",
    "name": "Tobacco Brown Hopsack Blazer",
    "category": "classic/blazers",
    "images": [
      "classic/blazers/tobacco-brown-hopsack-blazer-01"
    ],
    "colour": "Tobacco brown",
    "colourFamily": "Brown",
    "fabric": "Hopsack",
    "occasions": [
      "Casual"
    ],
    "summary": "An open-weave hopsack blazer in tobacco brown.",
    "description": "Hopsack is an open, basket-like weave that breathes well and resists creasing, which makes it the natural cloth for a warm-weather blazer. Tobacco brown is easy with cream, white and every shade of blue.",
    "details": [
      "Single-breasted blazer with patch pockets",
      "Hopsack weave",
      "Cut and finished by hand",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "charcoal-textured-wool-sports-jacket",
    "name": "Charcoal Textured Wool Sports Jacket",
    "category": "classic/sports-jackets",
    "images": [
      "classic/sports-jackets/charcoal-textured-wool-sports-jacket-01"
    ],
    "colour": "Charcoal",
    "colourFamily": "Grey",
    "fabric": "Textured wool",
    "occasions": [
      "Casual",
      "Business"
    ],
    "summary": "A sports jacket in a textured charcoal wool.",
    "description": "A sports jacket should have some life in the cloth. This one is cut in a textured charcoal wool that works over knitwear and odd trousers, and has enough structure to be worn with a tie.",
    "details": [
      "Single-breasted sports jacket",
      "Textured wool",
      "Cut and finished by hand",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "grey-brown-tweed-norfolk-sports-jacket",
    "name": "Grey-Brown Tweed Norfolk Sports Jacket",
    "category": "classic/sports-jackets",
    "images": [
      "classic/sports-jackets/grey-brown-tweed-norfolk-sports-jacket-02",
      "classic/sports-jackets/grey-brown-tweed-norfolk-sports-jacket-01"
    ],
    "colour": "Grey-brown",
    "colourFamily": "Brown",
    "fabric": "Tweed",
    "occasions": [
      "Casual"
    ],
    "summary": "A Norfolk-style jacket in grey-brown tweed.",
    "description": "The Norfolk is one of the oldest sporting jackets, recognisable by its flapped patch pockets. Ours is cut in a grey-brown tweed and worn with a knitted tie and khaki trousers.",
    "details": [
      "Norfolk-style jacket with flapped patch pockets",
      "Tweed",
      "Cut and finished by hand",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "light-grey-micro-check-sports-jacket",
    "name": "Light Grey Micro-Check Sports Jacket",
    "category": "classic/sports-jackets",
    "images": [
      "classic/sports-jackets/light-grey-micro-check-sports-jacket-01"
    ],
    "colour": "Light grey",
    "colourFamily": "Grey",
    "occasions": [
      "Casual"
    ],
    "summary": "A soft sports jacket in a light grey micro-check.",
    "description": "From a distance the cloth reads as a plain pale grey; up close it is a fine check. A soft, lightly built jacket for the warmer months, shown with a paisley tie.",
    "details": [
      "Single-breasted sports jacket with patch pockets",
      "Micro-check cloth",
      "Cut and finished by hand",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "dark-olive-cotton-twill-casual-field-jacket",
    "name": "Dark Olive Cotton Twill Casual Field Jacket",
    "category": "classic/casual-jackets",
    "images": [
      "classic/casual-jackets/dark-olive-cotton-twill-casual-field-jacket-01"
    ],
    "colour": "Dark olive",
    "colourFamily": "Green",
    "fabric": "Cotton twill",
    "occasions": [
      "Casual"
    ],
    "summary": "A short field jacket in dark olive cotton twill.",
    "description": "A tailor's take on the field jacket: cut short to the waist in a dense cotton twill, with flapped chest pockets and a shirt-style collar. Worn over a shirt in place of a blazer.",
    "details": [
      "Waist-length field jacket",
      "Flapped chest pockets",
      "Cotton twill",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "olive-cotton-twill-safari-jacket",
    "name": "Olive Cotton-Twill Safari Jacket",
    "category": "classic/casual-jackets",
    "images": [
      "classic/casual-jackets/olive-cotton-twill-safari-jacket-01",
      "classic/casual-jackets/olive-cotton-twill-safari-jacket-02",
      "classic/casual-jackets/olive-cotton-twill-safari-jacket-03",
      "classic/casual-jackets/olive-cotton-twill-safari-jacket-04",
      "classic/casual-jackets/olive-cotton-twill-safari-jacket-05"
    ],
    "colour": "Olive",
    "colourFamily": "Green",
    "fabric": "Cotton twill",
    "occasions": [
      "Casual"
    ],
    "summary": "The four-pocket safari jacket in olive cotton twill.",
    "description": "Four bellows pockets and a drawn-in waist: the safari jacket is tailoring made for heat. Ours is cut in olive cotton twill and is easy over a T-shirt or an open-necked shirt.",
    "details": [
      "Four flapped pockets",
      "Shaped waist",
      "Cotton twill",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "terracotta-casual-overshirt-jacket",
    "name": "Terracotta Casual Overshirt Jacket",
    "category": "classic/casual-jackets",
    "images": [
      "classic/casual-jackets/terracotta-casual-overshirt-jacket-01",
      "classic/casual-jackets/terracotta-casual-overshirt-jacket-02",
      "classic/casual-jackets/terracotta-casual-overshirt-jacket-03",
      "classic/casual-jackets/terracotta-casual-overshirt-jacket-04",
      "classic/casual-jackets/terracotta-casual-overshirt-jacket-05"
    ],
    "colour": "Terracotta",
    "colourFamily": "Brown",
    "occasions": [
      "Casual"
    ],
    "summary": "An unlined overshirt jacket in terracotta.",
    "description": "Somewhere between a shirt and a jacket, the overshirt is the easiest layer in the wardrobe. In terracotta, worn open over a white T-shirt with dark denim.",
    "details": [
      "Unstructured overshirt jacket",
      "Patch pockets",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "the-semi-spread-collar-shirt-white",
    "name": "The Semi Spread Collar Shirt White",
    "category": "classic/shirts",
    "images": [
      "classic/shirts/the-semi-spread-collar-shirt-white-02",
      "classic/shirts/the-semi-spread-collar-shirt-white-01"
    ],
    "colour": "White",
    "colourFamily": "White",
    "fabric": "Cotton/Poly",
    "code": "S0001720",
    "occasions": [
      "Business"
    ],
    "summary": "Semi spread collar, double-button barrel cuff, in white.",
    "description": "The Semi Spread Collar complements men of every build and face shape. The versatile Semi Spread Collar works great equally with a tie or open collar. The premium cotton interlining used in the collar and the band provides stiff construction that stands up better under a jacket for a cleaner look.",
    "details": [
      "Semi Spread Collar",
      "Double Button Barrel Cuff",
      "Versatile Design",
      "Cotton/Poly Fabric",
      "Wrinkle resistant"
    ]
  },
  {
    "slug": "the-cutaway-collar-shirt-blue",
    "name": "The Cutaway Collar Shirt Blue",
    "category": "classic/shirts",
    "images": [
      "classic/shirts/the-cutaway-collar-shirt-blue-02",
      "classic/shirts/the-cutaway-collar-shirt-blue-01"
    ],
    "colour": "Blue",
    "colourFamily": "Blue",
    "fabric": "Cotton/Poly",
    "code": "S0002720",
    "occasions": [
      "Business"
    ],
    "summary": "Rounded cutaway collar, double-button barrel cuff, in blue.",
    "description": "The Cutaway Collar accommodates small to medium tie knots. When worn with a tie, part of the collar band beneath the tie can be seen. Complements narrow face shapes. Looks great paired with a suit or jacket.",
    "details": [
      "Rounded Cutaway Collar",
      "Double Button Barrel Cuff",
      "Versatile Design",
      "Cotton/Poly Fabric",
      "Wrinkle resistant"
    ]
  },
  {
    "slug": "the-dramatic-button-down-collar-shirt-blue-white-bengal-stripe",
    "name": "The Dramatic Button Down Collar Shirt Blue/White Bengal Stripe",
    "category": "classic/shirts",
    "images": [
      "classic/shirts/the-dramatic-button-down-collar-shirt-blue-white-bengal-stripe-02",
      "classic/shirts/the-dramatic-button-down-collar-shirt-blue-white-bengal-stripe-01"
    ],
    "colour": "Blue/white stripe",
    "colourFamily": "Blue",
    "fabric": "100% Cotton",
    "code": "S0003720",
    "occasions": [
      "Business",
      "Casual"
    ],
    "summary": "A full collar roll in a blue and white Bengal stripe.",
    "description": "The Dramatic Button Down Collar features a beautiful collar roll. Made with our stiff cotton construction, which makes it stand up nicely when worn without a tie. This collar is loved by the sartorially savvy gentleman.",
    "details": [
      "Dramatic Button Down Collar Roll",
      "Double Button Barrel Cuff",
      "Blue/White Bengal Stripe",
      "100% Cotton Fabric",
      "Wrinkle resistant"
    ]
  },
  {
    "slug": "the-cutaway-collar-shirt-blue-white-gingham-check",
    "name": "The Cutaway Collar Shirt Blue/White Gingham Check",
    "category": "classic/shirts",
    "images": [
      "classic/shirts/the-cutaway-collar-shirt-blue-white-gingham-check-02",
      "classic/shirts/the-cutaway-collar-shirt-blue-white-gingham-check-01"
    ],
    "colour": "Blue/white gingham",
    "colourFamily": "Blue",
    "fabric": "Cotton/Poly",
    "code": "S0004720",
    "occasions": [
      "Casual"
    ],
    "summary": "Rounded cutaway collar in a blue and white gingham.",
    "description": "The Cutaway Collar accommodates small to medium tie knots. When worn with a tie, part of the collar band beneath the tie can be seen. Complements narrow face shapes. Looks great paired with a suit or jacket.",
    "details": [
      "Rounded Cutaway Collar",
      "Double Button Barrel Cuff",
      "Blue/White Gingham",
      "Cotton/Poly Fabric",
      "Wrinkle resistant"
    ]
  },
  {
    "slug": "the-button-down-collar-shirt-burgundy-white-dress-stripe",
    "name": "The Button Down Collar Shirt Burgundy/White Dress Stripe",
    "category": "classic/shirts",
    "images": [
      "classic/shirts/the-button-down-collar-shirt-burgundy-white-dress-stripe-02",
      "classic/shirts/the-button-down-collar-shirt-burgundy-white-dress-stripe-01"
    ],
    "colour": "Burgundy/white stripe",
    "colourFamily": "Red",
    "fabric": "100% Cotton",
    "code": "S0005720",
    "occasions": [
      "Casual"
    ],
    "summary": "The classic button-down in a burgundy and white dress stripe.",
    "description": "The Button Down Collar is our standard classic button down with a touch of modern. This Ivy League wardrobe staple looks best when worn with a sportscoat or by itself, due to its casual nature. Challenge sartorial rules by leaving the collar unbuttoned while wearing with a tie.",
    "details": [
      "Button Down Collar",
      "Double Button Barrel Cuff",
      "Burgundy/White Dress Stripe",
      "100% Cotton Fabric",
      "Wrinkle resistant"
    ]
  },
  {
    "slug": "the-dramatic-button-down-collar-shirt-mini-check",
    "name": "The Dramatic Button Down Collar Shirt Mini Check",
    "category": "classic/shirts",
    "images": [
      "classic/shirts/the-dramatic-button-down-collar-shirt-mini-check-02",
      "classic/shirts/the-dramatic-button-down-collar-shirt-mini-check-01"
    ],
    "colour": "Multi mini check",
    "colourFamily": "Multi",
    "fabric": "100% Cotton",
    "code": "S0006720",
    "occasions": [
      "Casual"
    ],
    "summary": "A full collar roll in a multi-coloured mini check.",
    "description": "The Dramatic Button Down Collar features a beautiful collar roll. Made with our stiff cotton construction, which makes it stand up nicely when worn without a tie. This collar is loved by the sartorially savvy gentleman.",
    "details": [
      "Dramatic Button Down Collar Roll",
      "Double Button Barrel Cuff",
      "Multi Colored Mini Check",
      "100% Cotton Fabric",
      "Wrinkle resistant"
    ]
  },
  {
    "slug": "the-classic-crisp-dress-shirt-white",
    "name": "The Classic Crisp Dress Shirt White",
    "category": "classic/shirts",
    "images": [
      "classic/shirts/the-classic-crisp-dress-shirt-white-02",
      "classic/shirts/the-classic-crisp-dress-shirt-white-01",
      "classic/shirts/the-classic-crisp-dress-shirt-white-03"
    ],
    "colour": "White",
    "colourFamily": "White",
    "occasions": [
      "Business",
      "Black tie"
    ],
    "summary": "A plain white dress shirt with a firm collar.",
    "description": "The white shirt is the foundation of every wardrobe, and the hardest to get right. Ours has a collar firm enough to stand open under a jacket and a body cut close without pulling. Shown with high-waisted black dress trousers.",
    "details": [
      "Spread collar",
      "Button cuff",
      "Made to measure or ready to wear"
    ]
  },
  {
    "slug": "twin-pocket-safari-shirt-pale-pink",
    "name": "Twin-Pocket Safari Shirt Pale Pink",
    "category": "classic/shirts",
    "images": [
      "classic/shirts/twin-pocket-safari-shirt-pale-pink-03",
      "classic/shirts/twin-pocket-safari-shirt-pale-pink-01",
      "classic/shirts/twin-pocket-safari-shirt-pale-pink-02",
      "classic/shirts/twin-pocket-safari-shirt-pale-pink-04",
      "classic/shirts/twin-pocket-safari-shirt-pale-pink-05"
    ],
    "colour": "Pale pink",
    "colourFamily": "Pink",
    "occasions": [
      "Casual"
    ],
    "summary": "A camp-collar safari shirt in pale pink with two flapped chest pockets.",
    "description": "A shirt that does the work of a jacket. Open camp collar, two flapped chest pockets and a long sleeve made to be turned back; in a pale pink that sits well against cream trousers.",
    "details": [
      "Open camp collar",
      "Two flapped chest pockets",
      "Turn-back cuffs",
      "Made to measure or ready to wear"
    ]
  },
  {
    "slug": "bespoke-button-down-shirt-white",
    "name": "Bespoke Button-Down Shirt White",
    "category": "classic/shirts",
    "images": [
      "classic/shirts/bespoke-button-down-shirt-white-flat-lay-01",
      "classic/shirts/bespoke-dress-shirts-trio-flat-lay-01",
      "classic/shirts/bespoke-dress-shirts-collection-flat-lay-01"
    ],
    "colour": "White",
    "colourFamily": "White",
    "occasions": [
      "Business",
      "Casual"
    ],
    "summary": "A bespoke white button-down, soft through the collar.",
    "description": "The button-down in plain white: soft enough to wear open at the weekend, clean enough to take a tie. Made to your measurements from our shirtings, and shown here with a printed silk tie.",
    "details": [
      "Button-down collar",
      "Made to measure from the house shirtings",
      "Collar, cuff and fit specified at your fitting"
    ]
  },
  {
    "slug": "bespoke-dress-shirt-pale-pink",
    "name": "Bespoke Dress Shirt Pale Pink",
    "category": "classic/shirts",
    "images": [
      "classic/shirts/bespoke-dress-shirt-pale-pink-flat-lay-01",
      "classic/shirts/bespoke-dress-shirts-collection-flat-lay-01",
      "classic/shirts/bespoke-pinstripe-and-poplin-shirts-stack-01"
    ],
    "colour": "Pale pink",
    "colourFamily": "Pink",
    "occasions": [
      "Business"
    ],
    "summary": "A bespoke dress shirt in pale pink.",
    "description": "Pale pink is the most useful colour in shirting after white and blue; it flatters navy and grey tailoring equally. Made to your measurements, and shown with a printed silk tie.",
    "details": [
      "Spread collar",
      "Made to measure from the house shirtings",
      "Collar, cuff and fit specified at your fitting"
    ]
  },
  {
    "slug": "bespoke-oxford-shirt-sky-blue",
    "name": "Bespoke Oxford Shirt Sky Blue",
    "category": "classic/shirts",
    "images": [
      "classic/shirts/bespoke-oxford-shirt-sky-blue-flat-lay-01",
      "classic/shirts/bespoke-blue-chambray-and-poplin-shirts-stack-01",
      "classic/shirts/bespoke-dress-shirts-trio-flat-lay-01"
    ],
    "colour": "Sky blue",
    "colourFamily": "Blue",
    "fabric": "Oxford cotton",
    "occasions": [
      "Business",
      "Casual"
    ],
    "summary": "A bespoke Oxford button-down in sky blue.",
    "description": "Oxford cloth has a texture that improves with washing and never needs to look pressed. In sky blue with a button-down collar, shown here with a striped repp tie and side-adjuster trousers.",
    "details": [
      "Button-down collar",
      "Oxford cloth",
      "Made to measure from the house shirtings",
      "Collar, cuff and fit specified at your fitting"
    ]
  },
  {
    "slug": "tailored-twill-trouser-khaki",
    "name": "Tailored Twill Trouser Khaki",
    "category": "classic/trousers",
    "images": [
      "classic/trousers/tailored-twill-trouser-khaki-02",
      "classic/trousers/tailored-twill-trouser-khaki-01",
      "classic/trousers/tailored-side-tab-trousers-stack-01"
    ],
    "colour": "Khaki",
    "colourFamily": "Brown",
    "fabric": "100% cotton twill",
    "code": "TT0001720",
    "occasions": [
      "Casual"
    ],
    "summary": "Flat-front cotton twill with side tabs, in khaki.",
    "description": "Our twill trousers are made with medium weight cotton twill fabric for year round use. They can be dressed up or down as you please. You will find endless handcrafted details all over. A go to smart casual pair for the sartorially savvy gentleman.",
    "details": [
      "100% cotton twill",
      "Flat Front",
      "Midrise",
      "Coin pocket",
      "4 pocket design",
      "Side Tab",
      "Hand stitched detailing"
    ]
  },
  {
    "slug": "tailored-twill-trouser-khaki-taupe",
    "name": "Tailored Twill Trouser Khaki Taupe",
    "category": "classic/trousers",
    "images": [
      "classic/trousers/tailored-twill-trouser-khaki-taupe-01",
      "classic/trousers/tailored-twill-trouser-khaki-taupe-02",
      "classic/trousers/tailored-side-tab-trousers-stack-02"
    ],
    "colour": "Khaki taupe",
    "colourFamily": "Brown",
    "fabric": "100% cotton twill",
    "code": "TT0002720",
    "occasions": [
      "Casual"
    ],
    "summary": "Flat-front cotton twill with side tabs, in khaki taupe.",
    "description": "Our twill trousers are made with medium weight cotton twill fabric for year round use. They can be dressed up or down as you please. You will find endless handcrafted details all over. A go to smart casual pair for the sartorially savvy gentleman.",
    "details": [
      "100% cotton twill",
      "Flat Front",
      "Midrise",
      "Coin pocket",
      "4 pocket design",
      "Side Tab",
      "Hand stitched detailing"
    ]
  },
  {
    "slug": "tailored-twill-trouser-dark-brown",
    "name": "Tailored Twill Trouser Dark Brown",
    "category": "classic/trousers",
    "images": [
      "classic/trousers/tailored-twill-trouser-dark-brown-01",
      "classic/trousers/tailored-twill-trouser-dark-brown-02",
      "classic/trousers/tailored-side-tab-trousers-stack-01"
    ],
    "colour": "Dark brown",
    "colourFamily": "Brown",
    "fabric": "100% cotton twill",
    "code": "TT0003720",
    "occasions": [
      "Casual"
    ],
    "summary": "Flat-front cotton twill with side tabs, in dark brown.",
    "description": "Our twill trousers are made with medium weight cotton twill fabric for year round use. They can be dressed up or down as you please. You will find endless handcrafted details all over. A go to smart casual pair for the sartorially savvy gentleman.",
    "details": [
      "100% cotton twill",
      "Flat Front",
      "Midrise",
      "Coin pocket",
      "4 pocket design",
      "Side Tab",
      "Hand stitched detailing"
    ]
  },
  {
    "slug": "tailored-wool-trouser-dark-grey",
    "name": "Tailored Wool Trouser Dark Grey",
    "category": "classic/trousers",
    "images": [
      "classic/trousers/tailored-wool-trouser-dark-grey-02",
      "classic/trousers/tailored-wool-trouser-dark-grey-01"
    ],
    "colour": "Dark grey",
    "colourFamily": "Grey",
    "fabric": "Wool mix",
    "code": "WT00001720",
    "occasions": [
      "Business"
    ],
    "summary": "Single-pleat dress trousers in a lightweight wool mix.",
    "description": "A building block in any man's sartorial arsenal. Dress Trousers that can be worn year round. Made with lightweight mixed wool fabric which is crease resistant and cool wearing. Features single pleat and extended waist band with buttoned end. Hand stitched detailing throughout that shows high quality craftsmanship.",
    "details": [
      "Wool Mix Fabric",
      "Single Pleat",
      "Front slant pockets and back welted buttoned pockets",
      "Side Tab",
      "Extended waistband with button fastening",
      "1.75 inch turn up",
      "Dry Clean only"
    ],
    "note": "Dress Trouser bottoms come unfinished to be altered to the desired inseam with fabric allowance of up to 2 inch turn up."
  },
  {
    "slug": "tailored-wool-flannel-trouser-charcoal-grey",
    "name": "Tailored Wool Flannel Trouser Charcoal Grey",
    "category": "classic/trousers",
    "images": [
      "classic/trousers/tailored-wool-flannel-trouser-charcoal-grey-01",
      "classic/trousers/tailored-wool-flannel-trouser-charcoal-grey-02"
    ],
    "colour": "Charcoal grey",
    "colourFamily": "Grey",
    "fabric": "Wool flannel",
    "code": "WT00002720",
    "occasions": [
      "Business"
    ],
    "summary": "Single-pleat dress trousers in midweight wool flannel.",
    "description": "A building block in any man's sartorial arsenal. Dress Trousers that can be worn almost all year round. Made with midweight flannel which is crease resistant. Features single pleat and extended waist band with buttoned end. Hand stitched detailing throughout that shows high quality craftsmanship.",
    "details": [
      "Wool Flannel Fabric",
      "Single Pleat",
      "Front slant pockets and back welted buttoned pockets",
      "Side Tab",
      "Extended waistband with button fastening",
      "1.75 inch turn up",
      "Dry Clean only"
    ],
    "note": "Dress Trouser bottoms come unfinished to be altered to the desired inseam with fabric allowance of up to 2 inch turn up."
  },
  {
    "slug": "tailored-wool-trouser-dark-navy",
    "name": "Tailored Wool Trouser Dark Navy",
    "category": "classic/trousers",
    "images": [
      "classic/trousers/tailored-wool-trouser-dark-navy-02",
      "classic/trousers/tailored-wool-trouser-dark-navy-01"
    ],
    "colour": "Dark navy",
    "colourFamily": "Navy",
    "fabric": "100% wool",
    "code": "WT00003720",
    "occasions": [
      "Business"
    ],
    "summary": "Single-pleat dress trousers in lightweight pure wool.",
    "description": "A building block in any man's sartorial arsenal. Dress Trousers that can be worn year round. Made with lightweight wool fabric which is crease resistant and cool wearing. Features single pleat and extended waist band with buttoned end. Hand stitched detailing throughout that shows high quality craftsmanship.",
    "details": [
      "100% Wool Fabric",
      "Single Pleat",
      "Front slant pockets and back welted buttoned pockets",
      "Side Tab",
      "Extended waistband with button fastening",
      "1.75 inch turn up",
      "Dry Clean only"
    ],
    "note": "Dress Trouser bottoms come unfinished to be altered to the desired inseam with fabric allowance of up to 2 inch turn up."
  },
  {
    "slug": "tailored-single-pleat-trouser-dark-brown",
    "name": "Tailored Single-Pleat Trouser Dark Brown",
    "category": "classic/trousers",
    "images": [
      "classic/trousers/tailored-single-pleat-trouser-dark-brown-01",
      "classic/trousers/tailored-single-pleat-trouser-dark-brown-02",
      "classic/trousers/tailored-single-pleat-trouser-dark-brown-03",
      "classic/trousers/tailored-single-pleat-trouser-dark-brown-04"
    ],
    "colour": "Dark brown",
    "colourFamily": "Brown",
    "occasions": [
      "Business",
      "Casual"
    ],
    "summary": "A high-rise, single-pleat trouser in dark brown.",
    "description": "Cut to sit at the natural waist, with a single forward pleat and a full leg that falls straight to a turn-up. Shown with tassel loafers and a pale blue shirt.",
    "details": [
      "High rise",
      "Single pleat",
      "Turn-ups",
      "Made to measure"
    ]
  },
  {
    "slug": "tailored-wool-drawstring-trouser-mid-grey",
    "name": "Tailored Wool Drawstring Trouser Mid Grey",
    "category": "classic/trousers",
    "images": [
      "classic/trousers/tailored-wool-drawstring-trouser-mid-grey-01",
      "classic/trousers/tailored-wool-drawstring-trouser-mid-grey-02",
      "classic/trousers/tailored-wool-drawstring-trouser-mid-grey-03",
      "classic/trousers/tailored-wool-drawstring-trouser-mid-grey-04"
    ],
    "colour": "Mid grey",
    "colourFamily": "Grey",
    "fabric": "Wool",
    "occasions": [
      "Casual"
    ],
    "summary": "A tailored wool trouser with a drawstring waist.",
    "description": "The ease of a drawstring with the line of a tailored trouser. Cut in a mid-grey wool with a pressed crease, and made to be worn off duty with a T-shirt and trainers.",
    "details": [
      "Drawstring waist",
      "Pressed crease",
      "Wool cloth",
      "Made to measure or ready to wear"
    ]
  },
  {
    "slug": "black-velvet-embroidered-collar-achkan",
    "name": "Black Velvet Embroidered-Collar Achkan",
    "category": "heritage/achkans",
    "images": [
      "heritage/achkans/black-velvet-embroidered-collar-achkan-01",
      "heritage/achkans/black-velvet-embroidered-collar-achkan-02",
      "heritage/achkans/black-velvet-embroidered-collar-achkan-03"
    ],
    "videos": [
      "heritage/achkans/black-velvet-embroidered-collar-achkan-showcase-01"
    ],
    "colour": "Black",
    "colourFamily": "Black",
    "fabric": "Velvet",
    "occasions": [
      "Wedding",
      "Festive"
    ],
    "summary": "A black velvet achkan with a hand-embroidered collar.",
    "description": "Velvet drinks the light, so the decoration is kept to one place: a band collar worked by hand in metallic thread. Cut long and close through the chest, and worn over ivory trousers with a white pocket square.",
    "details": [
      "Knee-length achkan with concealed front",
      "Hand-embroidered band collar",
      "Velvet",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "champagne-gold-embroidered-achkan",
    "name": "Champagne Gold Embroidered Achkan",
    "category": "heritage/achkans",
    "images": [
      "heritage/achkans/champagne-gold-embroidered-achkan-01",
      "heritage/achkans/champagne-gold-embroidered-achkan-03",
      "heritage/achkans/champagne-gold-embroidered-achkan-02",
      "heritage/achkans/champagne-gold-embroidered-achkan-04",
      "heritage/achkans/champagne-gold-embroidered-achkan-04-alt"
    ],
    "colour": "Champagne gold",
    "colourFamily": "Gold",
    "occasions": [
      "Wedding",
      "Festive"
    ],
    "summary": "An achkan in champagne gold, embroidered all over in a floral repeat.",
    "description": "The ground is a pale champagne gold; over it runs a fine floral embroidery in soft colour, covering the achkan from collar to hem. A piece for the groom or for the front row.",
    "details": [
      "Knee-length achkan with band collar",
      "All-over floral embroidery",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "mocha-brown-silk-embroidered-collar-achkan",
    "name": "Mocha Brown Silk Embroidered-Collar Achkan",
    "category": "heritage/achkans",
    "images": [
      "heritage/achkans/mocha-brown-silk-embroidered-collar-achkan-02",
      "heritage/achkans/mocha-brown-silk-embroidered-collar-achkan-01",
      "heritage/achkans/mocha-brown-silk-embroidered-collar-achkan-03",
      "heritage/achkans/mocha-brown-silk-embroidered-collar-achkan-04",
      "heritage/achkans/mocha-brown-silk-embroidered-collar-achkan-05"
    ],
    "videos": [
      "heritage/achkans/mocha-brown-silk-embroidered-collar-achkan-showcase-02",
      "heritage/achkans/mocha-brown-silk-embroidered-collar-achkan-showcase-01",
      "heritage/achkans/mocha-brown-and-powder-blue-silk-achkans-duo-showcase-01"
    ],
    "colour": "Mocha brown",
    "colourFamily": "Brown",
    "fabric": "Silk",
    "occasions": [
      "Wedding",
      "Festive"
    ],
    "summary": "A mocha silk achkan, buttoned to the collar, with an embroidered band.",
    "description": "Cut in a mocha brown silk with a full run of covered buttons and a collar embroidered by hand. The colour is quiet, which leaves the work to the cut: long, clean and close to the body.",
    "details": [
      "Knee-length achkan with full button front",
      "Hand-embroidered band collar",
      "Silk",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "powder-blue-silk-embroidered-collar-achkan",
    "name": "Powder Blue Silk Embroidered-Collar Achkan",
    "category": "heritage/achkans",
    "images": [
      "heritage/achkans/powder-blue-silk-embroidered-collar-achkan-03",
      "heritage/achkans/powder-blue-silk-embroidered-collar-achkan-01",
      "heritage/achkans/powder-blue-silk-embroidered-collar-achkan-02",
      "heritage/achkans/powder-blue-silk-embroidered-collar-achkan-04"
    ],
    "videos": [
      "heritage/achkans/powder-blue-silk-embroidered-collar-achkan-showcase-01",
      "heritage/achkans/mocha-brown-and-powder-blue-silk-achkans-duo-showcase-01"
    ],
    "colour": "Powder blue",
    "colourFamily": "Blue",
    "fabric": "Silk",
    "occasions": [
      "Wedding",
      "Festive"
    ],
    "summary": "A powder blue silk achkan with a floral embroidered collar.",
    "description": "Powder blue is a daytime colour, made for a mehndi or a garden reception. The silk carries a faint woven texture and the band collar is embroidered in soft florals; worn over ivory with tan shoes.",
    "details": [
      "Knee-length achkan with full button front",
      "Floral embroidered band collar",
      "Silk",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "ochre-gold-brocade-achkan",
    "name": "Ochre Gold Brocade Achkan",
    "category": "heritage/achkans",
    "images": [
      "still/ochre-gold-brocade-achkan-01",
      "still/ochre-gold-brocade-achkan-02",
      "still/ochre-gold-brocade-achkan-03",
      "still/ochre-gold-brocade-achkan-04",
      "still/ochre-gold-brocade-achkan-05"
    ],
    "videos": [
      "heritage/achkans/ochre-gold-brocade-achkan-detail-02",
      "heritage/achkans/ochre-gold-brocade-achkan-detail-01"
    ],
    "colour": "Ochre gold",
    "colourFamily": "Gold",
    "fabric": "Brocade",
    "occasions": [
      "Wedding",
      "Festive"
    ],
    "summary": "An ochre gold brocade achkan with an embroidered collar and jewelled buttons.",
    "description": "A tone-on-tone floral brocade in ochre gold, finished with a collar embroidered by hand and metal buttons at the front and cuff. Filmed in the atelier before its final fitting.",
    "details": [
      "Knee-length achkan with band collar",
      "Floral brocade",
      "Hand-embroidered collar and metal buttons",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "ivory-paisley-jacquard-achkan",
    "name": "Ivory Paisley Jacquard Achkan",
    "category": "heritage/achkans",
    "images": [
      "heritage/achkans/ivory-paisley-jacquard-achkan-01",
      "heritage/achkans/ivory-paisley-jacquard-achkan-02",
      "heritage/achkans/ivory-paisley-jacquard-achkan-03"
    ],
    "colour": "Ivory",
    "colourFamily": "Ivory",
    "fabric": "Jacquard",
    "occasions": [
      "Wedding",
      "Festive"
    ],
    "summary": "An ivory achkan in a tone-on-tone paisley jacquard, with an embroidered collar and covered buttons.",
    "description": "Paisley and fine floral sprays woven ivory on ivory, so the pattern only shows where the light falls on it. The band collar is embroidered in metallic thread, and a long run of fabric-covered buttons closes the front from collar to hem. Worn over ivory trousers.",
    "details": [
      "Knee-length achkan with band collar",
      "Ivory paisley jacquard",
      "Embroidered collar and fabric-covered buttons; chest pocket",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "ivory-gold-lattice-brocade-achkan",
    "name": "Ivory Gold Lattice Brocade Achkan",
    "category": "heritage/achkans",
    "images": [
      "heritage/achkans/ivory-gold-lattice-brocade-achkan-01",
      "heritage/achkans/ivory-gold-lattice-brocade-achkan-02",
      "heritage/achkans/ivory-gold-lattice-brocade-achkan-03"
    ],
    "colour": "Ivory and gold",
    "colourFamily": "Ivory",
    "fabric": "Brocade",
    "occasions": [
      "Wedding",
      "Festive"
    ],
    "summary": "An ivory brocade achkan woven with a soft gold diamond lattice.",
    "description": "A geometric brocade: concentric diamonds in soft gold across an ivory ground, matched down the front and around the sleeves. Self-covered buttons run from the band collar to the hem, with buttoned cuffs and a pocket at the chest.",
    "details": [
      "Knee-length achkan with band collar",
      "Ivory and gold lattice brocade",
      "Self-covered buttons; buttoned cuffs; chest pocket",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "mauve-brocade-offset-placket-achkan",
    "name": "Mauve Brocade Offset-Placket Achkan",
    "category": "heritage/achkans",
    "images": [
      "heritage/achkans/mauve-brocade-offset-placket-achkan-01",
      "heritage/achkans/mauve-brocade-offset-placket-achkan-02",
      "heritage/achkans/mauve-brocade-offset-placket-achkan-03"
    ],
    "colour": "Mauve",
    "colourFamily": "Pink",
    "fabric": "Brocade",
    "occasions": [
      "Wedding",
      "Festive"
    ],
    "summary": "A mauve brocade achkan that fastens off-centre, with an embroidered collar.",
    "description": "The fastening steps to one side and closes with a line of gilt buttons, so the front reads as one clean sweep of cloth. A dusky mauve brocade threaded with gold florals, a band collar edged in fine embroidery, buttoned cuffs and a dark silk pocket square.",
    "details": [
      "Knee-length achkan with an offset front fastening",
      "Mauve and gold brocade",
      "Embroidered band collar; gilt buttons at the front and cuffs",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "midnight-navy-tailored-achkan",
    "name": "Midnight Navy Tailored Achkan",
    "category": "heritage/achkans",
    "images": [
      "heritage/achkans/midnight-navy-tailored-achkan-01",
      "heritage/achkans/midnight-navy-tailored-achkan-02",
      "heritage/achkans/midnight-navy-tailored-achkan-03"
    ],
    "colour": "Midnight navy",
    "colourFamily": "Navy",
    "occasions": [
      "Wedding",
      "Festive"
    ],
    "summary": "A midnight navy achkan with metal buttons and a printed silk pocket square.",
    "description": "The plainest achkan in the house, and the easiest to wear: smooth midnight navy cloth, a clean band collar and a single column of dark metal buttons. A berry printed pocket square is the only colour. Worn over ivory trousers for a reception, or with navy for the evening.",
    "details": [
      "Knee-length achkan with band collar",
      "Midnight navy suiting",
      "Metal buttons; chest pocket with pocket square",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "maroon-velvet-embroidered-collar-achkan",
    "name": "Maroon Velvet Embroidered-Collar Achkan",
    "category": "heritage/achkans",
    "images": [
      "heritage/achkans/maroon-velvet-embroidered-collar-achkan-01",
      "heritage/achkans/maroon-velvet-embroidered-collar-achkan-02"
    ],
    "colour": "Maroon",
    "colourFamily": "Red",
    "fabric": "Velvet",
    "occasions": [
      "Wedding",
      "Festive"
    ],
    "summary": "A maroon velvet achkan with a gold-embroidered collar.",
    "description": "Deep maroon velvet, with the decoration kept to the collar: gold leaves embroidered on either side of the band. Gilt buttons, a pocket at the chest and a long, close cut. Worn over ivory trousers.",
    "details": [
      "Knee-length achkan with band collar",
      "Velvet",
      "Gold-embroidered collar; gilt buttons",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "black-brass-button-bandhgala-suit",
    "name": "Black Brass-Button Bandhgala Suit",
    "category": "heritage/bandhgala-suits",
    "images": [
      "heritage/bandhgala-suits/black-brass-button-bandhgala-suit-03",
      "heritage/bandhgala-suits/black-brass-button-bandhgala-suit-01",
      "heritage/bandhgala-suits/black-brass-button-bandhgala-suit-02",
      "heritage/bandhgala-suits/black-and-midnight-navy-bandhgala-suits-duo-01",
      "heritage/bandhgala-suits/black-brass-button-bandhgala-suit-04"
    ],
    "colour": "Black",
    "colourFamily": "Black",
    "occasions": [
      "Wedding",
      "Festive",
      "Black tie"
    ],
    "summary": "A black bandhgala with brass buttons and flapped chest pockets.",
    "description": "The bandhgala is the closed-collar suit of the subcontinent: as formal as a dinner jacket, with no tie required. This one is black, with brass buttons and flapped pockets at the chest and hip, and matching trousers.",
    "details": [
      "Closed-collar jacket with brass buttons",
      "Flapped chest and hip pockets",
      "Matching trousers",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "midnight-navy-bandhgala-suit",
    "name": "Midnight Navy Bandhgala Suit",
    "category": "heritage/bandhgala-suits",
    "images": [
      "heritage/bandhgala-suits/midnight-navy-bandhgala-suit-03",
      "heritage/bandhgala-suits/midnight-navy-bandhgala-suit-01",
      "heritage/bandhgala-suits/midnight-navy-bandhgala-suit-02",
      "heritage/bandhgala-suits/midnight-navy-bandhgala-suit-04",
      "heritage/bandhgala-suits/black-and-midnight-navy-bandhgala-suits-duo-01"
    ],
    "colour": "Midnight navy",
    "colourFamily": "Navy",
    "occasions": [
      "Wedding",
      "Festive",
      "Black tie"
    ],
    "summary": "A midnight navy bandhgala with a welted chest pocket.",
    "description": "Cut in midnight navy with a clean, close collar and a single line of metal buttons. A patterned silk square in the chest pocket is the only decoration it needs.",
    "details": [
      "Closed-collar jacket with metal buttons",
      "Welted chest pocket",
      "Matching trousers",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "blush-peach-floral-brocade-nehru-jacket",
    "name": "Blush Peach Floral Brocade Nehru Jacket",
    "category": "heritage/jodhpuri-jackets",
    "images": [
      "heritage/jodhpuri-jackets/blush-peach-floral-brocade-nehru-jacket-03",
      "heritage/jodhpuri-jackets/blush-peach-floral-brocade-nehru-jacket-01",
      "heritage/jodhpuri-jackets/blush-peach-floral-brocade-nehru-jacket-02",
      "heritage/jodhpuri-jackets/blush-peach-floral-brocade-nehru-jacket-01-alt"
    ],
    "colour": "Blush peach",
    "colourFamily": "Pink",
    "fabric": "Brocade",
    "occasions": [
      "Wedding",
      "Festive"
    ],
    "summary": "A sleeveless Nehru jacket in blush peach floral brocade.",
    "description": "A floral brocade in blush peach and soft silver, cut as a sleeveless Nehru jacket and worn over a champagne silk kurta. Light enough for a daytime ceremony, rich enough for the evening.",
    "details": [
      "Sleeveless Nehru jacket with band collar",
      "Floral brocade",
      "Shown over a champagne kurta and trousers",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "blush-pink-textured-nehru-jacket",
    "name": "Blush Pink Textured Nehru Jacket",
    "category": "heritage/jodhpuri-jackets",
    "images": [
      "heritage/jodhpuri-jackets/blush-pink-textured-nehru-jacket-03",
      "heritage/jodhpuri-jackets/blush-pink-textured-nehru-jacket-01",
      "heritage/jodhpuri-jackets/blush-pink-textured-nehru-jacket-02"
    ],
    "colour": "Blush pink",
    "colourFamily": "Pink",
    "occasions": [
      "Wedding",
      "Festive"
    ],
    "summary": "A sleeveless Nehru jacket in a textured blush pink.",
    "description": "The colour is the statement here: a clear blush pink in a finely textured cloth, cut as a sleeveless Nehru jacket over a champagne kurta.",
    "details": [
      "Sleeveless Nehru jacket with band collar",
      "Textured weave",
      "Shown over a champagne kurta",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "champagne-gold-brocade-jodhpuri-jacket",
    "name": "Champagne Gold Brocade Jodhpuri Jacket",
    "category": "heritage/jodhpuri-jackets",
    "images": [
      "heritage/jodhpuri-jackets/champagne-gold-brocade-jodhpuri-jacket-02",
      "heritage/jodhpuri-jackets/champagne-gold-brocade-jodhpuri-jacket-01",
      "heritage/jodhpuri-jackets/champagne-gold-brocade-jodhpuri-jacket-03"
    ],
    "colour": "Champagne gold",
    "colourFamily": "Gold",
    "fabric": "Brocade",
    "occasions": [
      "Wedding",
      "Festive"
    ],
    "summary": "A sleeved Jodhpuri jacket in champagne gold brocade.",
    "description": "Tone-on-tone brocade in champagne gold, cut as a sleeved Jodhpuri jacket with a concealed front and a welted chest pocket. Worn over a matching kurta and trousers.",
    "details": [
      "Sleeved Jodhpuri jacket with band collar",
      "Concealed front",
      "Brocade",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "ivory-embossed-open-front-jodhpuri-jacket",
    "name": "Ivory Embossed Open-Front Jodhpuri Jacket",
    "category": "heritage/jodhpuri-jackets",
    "images": [
      "heritage/jodhpuri-jackets/ivory-embossed-open-front-jodhpuri-jacket-02",
      "heritage/jodhpuri-jackets/ivory-embossed-open-front-jodhpuri-jacket-01",
      "heritage/jodhpuri-jackets/ivory-embossed-open-front-jodhpuri-jacket-03",
      "heritage/jodhpuri-jackets/ivory-embossed-open-front-jodhpuri-jacket-04"
    ],
    "videos": [
      "heritage/jodhpuri-jackets/ivory-embossed-open-front-jodhpuri-jacket-showcase-01",
      "heritage/jodhpuri-jackets/ivory-brocade-jodhpuri-jackets-duo-showcase-01"
    ],
    "colour": "Ivory",
    "colourFamily": "Ivory",
    "occasions": [
      "Wedding",
      "Festive"
    ],
    "summary": "An open-front Jodhpuri jacket in embossed ivory.",
    "description": "Cut to be worn open over a long kurta, with the fronts falling straight from a band collar. The ivory cloth carries an embossed floral pattern that shows only as the light moves across it.",
    "details": [
      "Open-front Jodhpuri jacket with band collar",
      "Embossed floral cloth",
      "Shown over a champagne kurta and trousers",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "ivory-floral-jacquard-jodhpuri-jacket",
    "name": "Ivory Floral Jacquard Jodhpuri Jacket",
    "category": "heritage/jodhpuri-jackets",
    "images": [
      "heritage/jodhpuri-jackets/ivory-floral-jacquard-jodhpuri-jacket-03",
      "heritage/jodhpuri-jackets/ivory-floral-jacquard-jodhpuri-jacket-01",
      "heritage/jodhpuri-jackets/ivory-floral-jacquard-jodhpuri-jacket-02",
      "heritage/jodhpuri-jackets/ivory-floral-jacquard-jodhpuri-jacket-04"
    ],
    "videos": [
      "heritage/jodhpuri-jackets/ivory-floral-jacquard-jodhpuri-jacket-showcase-01",
      "heritage/jodhpuri-jackets/ivory-brocade-jodhpuri-jackets-duo-showcase-01"
    ],
    "colour": "Ivory",
    "colourFamily": "Ivory",
    "fabric": "Jacquard",
    "occasions": [
      "Wedding",
      "Festive"
    ],
    "summary": "A Jodhpuri jacket in ivory floral jacquard.",
    "description": "A woven floral jacquard in ivory and pale silver, cut as a sleeved Jodhpuri jacket and closed at the collar. Worn over a champagne kurta, it is the quiet alternative to a sherwani.",
    "details": [
      "Sleeved Jodhpuri jacket with band collar",
      "Floral jacquard",
      "Shown over a champagne kurta and trousers",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "sage-green-brocade-nehru-jacket",
    "name": "Sage Green Brocade Nehru Jacket",
    "category": "heritage/jodhpuri-jackets",
    "images": [
      "heritage/jodhpuri-jackets/sage-green-brocade-nehru-jacket-01",
      "heritage/jodhpuri-jackets/sage-green-brocade-nehru-jacket-02",
      "heritage/jodhpuri-jackets/sage-green-brocade-nehru-jacket-03",
      "heritage/jodhpuri-jackets/sage-green-brocade-nehru-jacket-04"
    ],
    "colour": "Sage green",
    "colourFamily": "Green",
    "fabric": "Brocade",
    "occasions": [
      "Wedding",
      "Festive"
    ],
    "summary": "A sleeveless Nehru jacket in sage green brocade.",
    "description": "A paisley brocade in sage green, gold and coral, cut as a sleeveless Nehru jacket with covered buttons. The pattern is large and the palette is soft, which is why it works.",
    "details": [
      "Sleeveless Nehru jacket with band collar",
      "Paisley brocade",
      "Shown over a champagne kurta",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "taupe-silk-wool-nehru-jacket",
    "name": "Taupe Silk-Wool Nehru Jacket",
    "category": "heritage/jodhpuri-jackets",
    "images": [
      "heritage/jodhpuri-jackets/taupe-silk-wool-nehru-jacket-02",
      "heritage/jodhpuri-jackets/taupe-silk-wool-nehru-jacket-01",
      "heritage/jodhpuri-jackets/taupe-silk-wool-nehru-jacket-03"
    ],
    "colour": "Taupe",
    "colourFamily": "Brown",
    "fabric": "Silk-wool",
    "occasions": [
      "Festive",
      "Wedding"
    ],
    "summary": "A sleeveless Nehru jacket in taupe silk-wool.",
    "description": "The plainest of the Nehru jackets and the most useful: a taupe silk-wool with an embroidered collar and a white square in the pocket. Dressed up with a silk kurta, or worn over a plain cotton one.",
    "details": [
      "Sleeveless Nehru jacket with embroidered band collar",
      "Silk-wool",
      "Flapped hip pockets",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "midnight-navy-geometric-weave-jodhpuri-jacket",
    "name": "Midnight Navy Geometric-Weave Jodhpuri Jacket",
    "category": "heritage/jodhpuri-jackets",
    "images": [
      "still/midnight-navy-geometric-weave-jodhpuri-jacket-01",
      "still/midnight-navy-geometric-weave-jodhpuri-jacket-02",
      "still/midnight-navy-geometric-weave-jodhpuri-jacket-03"
    ],
    "videos": [
      "heritage/jodhpuri-jackets/midnight-navy-geometric-weave-jodhpuri-jacket-showcase"
    ],
    "colour": "Midnight navy",
    "colourFamily": "Navy",
    "occasions": [
      "Wedding",
      "Festive"
    ],
    "summary": "A midnight navy Jodhpuri jacket in a geometric weave with metal buttons.",
    "description": "A diamond-patterned weave in midnight navy, closed with metal buttons and finished with a crimson square at the chest. Filmed on the stand in the atelier.",
    "details": [
      "Sleeved Jodhpuri jacket with band collar",
      "Geometric woven cloth",
      "Metal buttons",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "apricot-raw-silk-zardosi-sherwani",
    "name": "Apricot Raw Silk Zardosi Sherwani",
    "category": "heritage/sherwanis",
    "images": [
      "heritage/sherwanis/apricot-raw-silk-zardosi-sherwani-02",
      "heritage/sherwanis/apricot-raw-silk-zardosi-sherwani-01",
      "heritage/sherwanis/apricot-raw-silk-zardosi-sherwani-03",
      "heritage/sherwanis/apricot-raw-silk-zardosi-sherwani-04",
      "heritage/sherwanis/apricot-raw-silk-zardosi-sherwani-05",
      "heritage/sherwanis/apricot-raw-silk-zardosi-sherwani-06"
    ],
    "colour": "Apricot",
    "colourFamily": "Pink",
    "fabric": "Raw silk",
    "occasions": [
      "Wedding",
      "Festive"
    ],
    "summary": "An apricot raw silk sherwani, hand-embroidered in zardosi.",
    "description": "Raw silk in a warm apricot, scattered with floral motifs worked in zardosi, the metal-thread embroidery of the Mughal courts. The collar and cuffs are embroidered solid; the body is left open so the silk can show.",
    "details": [
      "Knee-length sherwani with band collar",
      "Zardosi hand embroidery",
      "Raw silk",
      "Worn with matching trousers",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "blush-pink-raw-silk-zardosi-sherwani",
    "name": "Blush Pink Raw Silk Zardosi Sherwani",
    "category": "heritage/sherwanis",
    "images": [
      "heritage/sherwanis/blush-pink-raw-silk-zardosi-sherwani-02",
      "heritage/sherwanis/blush-pink-raw-silk-zardosi-sherwani-01",
      "heritage/sherwanis/blush-pink-raw-silk-zardosi-sherwani-03",
      "heritage/sherwanis/blush-pink-raw-silk-zardosi-sherwani-04"
    ],
    "colour": "Blush pink",
    "colourFamily": "Pink",
    "fabric": "Raw silk",
    "occasions": [
      "Wedding",
      "Festive"
    ],
    "summary": "A blush pink raw silk sherwani with zardosi florals.",
    "description": "A clear blush pink raw silk, embroidered by hand with botanical motifs in silver-toned zardosi and edged at the collar and front. A sherwani for a groom who wants colour.",
    "details": [
      "Knee-length sherwani with band collar",
      "Zardosi hand embroidery",
      "Raw silk",
      "Worn with ivory trousers",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "emerald-dupioni-silk-sherwani-with-zardosi",
    "name": "Emerald Dupioni Silk Sherwani with Zardosi",
    "category": "heritage/sherwanis",
    "images": [
      "heritage/sherwanis/emerald-dupioni-silk-sherwani-with-zardosi-03",
      "heritage/sherwanis/emerald-dupioni-silk-sherwani-with-zardosi-01",
      "heritage/sherwanis/emerald-dupioni-silk-sherwani-with-zardosi-06",
      "heritage/sherwanis/emerald-dupioni-silk-sherwani-with-zardosi-05",
      "heritage/sherwanis/emerald-dupioni-silk-sherwani-with-zardosi-04",
      "heritage/sherwanis/emerald-dupioni-silk-sherwani-with-zardosi-07",
      "heritage/sherwanis/emerald-dupioni-silk-sherwani-with-zardosi-02"
    ],
    "colour": "Emerald",
    "colourFamily": "Green",
    "fabric": "Dupioni silk",
    "occasions": [
      "Wedding",
      "Festive"
    ],
    "summary": "An emerald dupioni silk sherwani with gold zardosi at the collar and cuffs.",
    "description": "Dupioni silk has a slubbed, uneven surface that catches the light, and in emerald it is unmistakable. The sherwani is scattered with small gold motifs and finished with deep zardosi cuffs and a worked collar.",
    "details": [
      "Knee-length sherwani with band collar",
      "Gold zardosi collar, cuffs and motifs",
      "Dupioni silk",
      "Worn with matching trousers",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "midnight-black-embellished-sherwani",
    "name": "Midnight Black Embellished Sherwani",
    "category": "heritage/sherwanis",
    "images": [
      "heritage/sherwanis/midnight-black-embellished-sherwani-01",
      "heritage/sherwanis/midnight-black-embellished-sherwani-03",
      "heritage/sherwanis/midnight-black-embellished-sherwani-08",
      "heritage/sherwanis/midnight-black-embellished-sherwani-02",
      "heritage/sherwanis/midnight-black-embellished-sherwani-06",
      "heritage/sherwanis/midnight-black-embellished-sherwani-05",
      "heritage/sherwanis/midnight-black-embellished-sherwani-07",
      "heritage/sherwanis/midnight-black-embellished-sherwani-04"
    ],
    "colour": "Black",
    "colourFamily": "Black",
    "occasions": [
      "Wedding",
      "Festive",
      "Black tie"
    ],
    "summary": "A black sherwani, embellished tone-on-tone from collar to hem.",
    "description": "Black on black: the whole sherwani is covered in a raised floral embellishment that is felt before it is seen. Worn with black trousers, it is the evening sherwani.",
    "details": [
      "Knee-length sherwani with band collar",
      "All-over tonal embellishment",
      "Worn with black trousers",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "champagne-gold-zardosi-sherwani-with-velvet-stole",
    "name": "Champagne Gold Zardosi Sherwani with Velvet Stole",
    "category": "heritage/sherwanis",
    "images": [
      "still/champagne-gold-zardosi-sherwani-01",
      "still/champagne-gold-zardosi-sherwani-02",
      "still/champagne-gold-zardosi-sherwani-03",
      "still/champagne-gold-zardosi-sherwani-04"
    ],
    "videos": [
      "heritage/sherwanis/champagne-gold-zardosi-sherwani-with-velvet-stole-showcase"
    ],
    "colour": "Champagne gold",
    "colourFamily": "Gold",
    "occasions": [
      "Wedding"
    ],
    "summary": "A champagne gold sherwani in zardosi, with a wine velvet stole.",
    "description": "The body is worked all over in gold zardosi on a champagne ground. It is finished with a stole in wine velvet, edged in pearls and embroidery, worn over one shoulder.",
    "details": [
      "Sherwani with band collar",
      "All-over zardosi hand embroidery",
      "Velvet stole with pearl and embroidered border",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "crimson-red-embellished-sherwani",
    "name": "Crimson Red Embellished Sherwani",
    "category": "heritage/sherwanis",
    "images": [
      "still/crimson-red-embellished-sherwani-01",
      "still/crimson-red-embellished-sherwani-02",
      "still/crimson-red-embellished-sherwani-03",
      "still/crimson-red-embellished-sherwani-04"
    ],
    "videos": [
      "heritage/sherwanis/crimson-red-embellished-sherwani-showcase"
    ],
    "colour": "Crimson",
    "colourFamily": "Red",
    "occasions": [
      "Wedding"
    ],
    "summary": "A crimson sherwani, densely embellished in tonal red.",
    "description": "Crimson, the wedding colour of the subcontinent, embellished from collar to hem in tonal beadwork and thread so that the surface reads as texture rather than pattern.",
    "details": [
      "Sherwani with band collar",
      "All-over tonal embellishment",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "midnight-navy-gold-zardosi-floral-sherwani",
    "name": "Midnight Navy Gold-Zardosi Floral Sherwani",
    "category": "heritage/sherwanis",
    "images": [
      "still/midnight-navy-gold-zardosi-sherwani-01",
      "still/midnight-navy-gold-zardosi-sherwani-02",
      "still/midnight-navy-gold-zardosi-sherwani-03",
      "still/midnight-navy-gold-zardosi-sherwani-04"
    ],
    "videos": [
      "heritage/sherwanis/midnight-navy-gold-zardosi-floral-sherwani-showcase"
    ],
    "colour": "Midnight navy",
    "colourFamily": "Navy",
    "occasions": [
      "Wedding"
    ],
    "summary": "A midnight navy sherwani covered in gold zardosi florals.",
    "description": "Gold on midnight navy: leaves, vines and flowers in raised zardosi, worked by hand across the whole body. The embroidery is heavy; the effect, against the dark ground, is restrained.",
    "details": [
      "Sherwani with band collar",
      "All-over gold zardosi hand embroidery",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  },
  {
    "slug": "ivory-gold-embroidered-border-heritage-stole",
    "name": "Ivory Gold Embroidered-Border Heritage Stole",
    "category": "heritage/stoles",
    "images": [
      "heritage/stoles/ivory-gold-embroidered-border-heritage-stole-ensemble-02",
      "heritage/stoles/ivory-gold-embroidered-border-heritage-stole-ensemble-04",
      "heritage/stoles/ivory-gold-embroidered-border-heritage-stole-ensemble-01",
      "heritage/stoles/ivory-gold-embroidered-border-heritage-stole-ensemble-07",
      "heritage/stoles/ivory-gold-embroidered-border-heritage-stole-ensemble-03",
      "heritage/stoles/ivory-gold-embroidered-border-heritage-stole-ensemble-05",
      "heritage/stoles/ivory-gold-embroidered-border-heritage-stole-ensemble-06",
      "heritage/stoles/ivory-gold-embroidered-border-heritage-stole-ensemble-08",
      "heritage/stoles/ivory-gold-embroidered-border-heritage-stole-ensemble-09"
    ],
    "videos": [
      "heritage/stoles/ivory-gold-embroidered-border-heritage-stole-showcase-01"
    ],
    "colour": "Ivory gold",
    "colourFamily": "Ivory",
    "occasions": [
      "Wedding"
    ],
    "summary": "An ivory stole with a hand-embroidered gold border.",
    "description": "The stole completes a sherwani. Ours is cut in ivory with a deep border embroidered in gold, and is worn over one shoulder or carried across the forearm. Shown as an ensemble with an ivory brocade sherwani and a matching safa.",
    "details": [
      "Ivory stole with embroidered gold border",
      "Shown with an ivory brocade sherwani and safa",
      "Made to measure; cloth, lining and details are confirmed at your fitting"
    ]
  }
];

/** Group and stack shots per category: used for category headers and hover previews. */
export const CATEGORY_EDITORIAL: Record<string, string[]> = {
  "classic/suits": [
    "classic/suits/bespoke-tailored-suits-trio-01",
    "classic/suits/black-tie-evening-tuxedos-trio-01",
    "classic/suits/velvet-and-navy-double-breasted-tuxedos-duo-01"
  ],
  "classic/shirts": [
    "classic/shirts/bespoke-dress-shirts-collection-flat-lay-01",
    "classic/shirts/bespoke-blue-chambray-and-poplin-shirts-stack-01",
    "classic/shirts/bespoke-pinstripe-and-poplin-shirts-stack-01",
    "classic/shirts/bespoke-dress-shirts-trio-flat-lay-01"
  ],
  "classic/trousers": [
    "classic/trousers/tailored-side-tab-trousers-stack-01",
    "classic/trousers/tailored-side-tab-trousers-stack-02"
  ],
  "heritage/bandhgala-suits": [
    "heritage/bandhgala-suits/black-and-midnight-navy-bandhgala-suits-duo-01"
  ]
};

/** Films per category (collection showcases and atelier footage). */
export const CATEGORY_FILMS: Record<string, string[]> = {
  "classic/suits": [
    "classic/suits/vitale-barberis-canonico-bespoke-suit-tailoring-film",
    "classic/suits/bespoke-navy-suit-hand-basting-craftsmanship-01",
    "classic/suits/bespoke-navy-suit-lapel-canvas-craftsmanship-02"
  ],
  "heritage/achkans": [
    "heritage/achkans/mocha-brown-and-powder-blue-silk-achkans-duo-showcase-01"
  ],
  "heritage/jodhpuri-jackets": [
    "heritage/jodhpuri-jackets/ivory-brocade-jodhpuri-jackets-duo-showcase-01"
  ],
  "heritage/sherwanis": [
    "heritage/sherwanis/sartorial-heritage-zardosi-sherwanis-collection-showcase"
  ]
};
