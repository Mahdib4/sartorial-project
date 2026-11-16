# Sartorial

The website for Sartorial, a bespoke tailoring house in Dhaka: Heritage (sherwanis, achkans, bandhgalas, Jodhpuri jackets) and Classic (suits, jackets, shirts, trousers), plus Accessories and Footwear.

Built with Next.js (App Router), React, TypeScript and Tailwind CSS. Every page is prerendered; there is no database.

## Run it

Requires Node 20 or newer.

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:3000. For a production run:

```bash
npm run build
```

```bash
npm start
```

Other scripts: `npm run lint`, `npm run typecheck`, `npm run media` (see [Photographs and films](#photographs-and-films)).

## Before going live

These were not part of the supplied content. Each is one edit in one file.

| What | Where | Effect while empty |
| --- | --- | --- |
| WhatsApp number, phone, email, address, hours | `src/config/site.ts` → `contact` | Enquiry forms only offer "Copy message", and show a setup note |
| Live domain | `src/config/site.ts` → `url` | Canonical links, sitemap and share images point at `example.com` |
| Instagram / Facebook / YouTube | `src/config/site.ts` → `social` | Footer shows no social links |
| Prices | `price` on any product in `src/data/products.ts` | The piece shows "Price on request" |
| Size scales | `src/config/site.ts` → `SIZE_SCALES` | Standard menswear scales are used; confirm they match the house |
| Newsletter | `NEWSLETTER_WEBHOOK_URL` (see `.env.example`) | The sign-up form says the list is not open yet |
| Logo | `src/components/ui/Wordmark.tsx` | The name is set in spaced Didone capitals |

## How ordering works

Pieces are made to order, so the site takes enquiries, not payments. A visitor adds pieces to the bag (with a size, or "Made to measure"), opens the bag, and sends the whole selection as one message through their own WhatsApp or email, addressed to the house. "Book a fitting" works the same way. Bag, wishlist and recently-viewed pieces are kept in the visitor's browser.

To take payments later, the bag (`src/store/shop.tsx`) and the bag page (`src/components/pages/BagView.tsx`) are the two places a checkout would connect.

## Where things are

```
src/
  config/site.ts            Brand, contact details, announcement bar, size scales
  data/
    categories.ts           The site structure: collections and their categories, with copy
    products.ts             The catalogue: one entry per product
    catalog.ts              Queries over the two files above
    navigation.ts           Menus, derived from the catalogue
    media.generated.json    Written by `npm run media`. Do not edit by hand
  app/                      Routes
    page.tsx                Home
    clothing/               /clothing, /clothing/heritage, /clothing/classic/suits …
    accessories/ footwear/  /accessories, /accessories/ties …
    products/[slug]/        Product pages
    bag/ wishlist/ search/ appointments/ bespoke/ client-services/
  components/
    home/                   Home page sections
    catalog/                Collection and category pages
    product/                Product card, listing (filters, sort), gallery, size picker
    layout/                 Header, mega menu, bag drawer, search, footer
    shop/                   Bag lines, enquiry form
    ui/                     Picture, LoopVideo, Button, Icon, Rail …
    interior/               Components adapted from interior.dev
    bencho/                 Blocks adapted from bencho.dev
  store/shop.tsx            Bag, wishlist, recently viewed, toasts
scripts/
  build-media.mjs           Turns the client's photos and films into web media
  media.config.mjs          Crops, film stills, trims and the hero edit
```

## Editing the catalogue

**Add a product.** Add an entry to `PRODUCTS` in `src/data/products.ts`:

```ts
{
  slug: "ivory-linen-kurta",               // the URL: /products/ivory-linen-kurta
  name: "Ivory Linen Kurta",
  category: "heritage/kurtas",             // a key from categories.ts
  images: ["heritage/kurtas/ivory-linen-kurta-01", "heritage/kurtas/ivory-linen-kurta-02"],
  colour: "Ivory",
  colourFamily: "Ivory",                   // drives the colour filter
  occasions: ["Festive"],                  // drives the occasion filter
  summary: "One line under the name.",
  description: "The paragraph in the Description fold.",
  details: ["Bullet", "Bullet"],
  price: 8500,                             // optional
}
```

The first image is the card image; the second appears on hover. Image ids come from the media build (below).

**Categories without products.** Kurtas, Heritage Trousers, Coats, and all of Accessories and Footwear had no product photography in the supplied content. Their pages show an *edit*: where the piece appears across the rest of the collection, each photograph linked to the garment it was taken with. As soon as a category has products in `products.ts`, its page becomes a normal product grid automatically.

**Change the structure or copy.** Collections, categories, their introductions and their hover-preview photographs are all in `src/data/categories.ts`. Menus, the home page category explorer, the footer and the sitemap follow it.

## Photographs and films

The original files are not in this repository; the web-ready versions in `public/media/` are. To rebuild them (after adding or replacing originals), point the media build at the content folder, the one containing `Clothing/`, `Accessories/` and `Footwear/`:

```bash
npm run media -- "G:\Sartorial\WEB"
```

It needs [ffmpeg](https://ffmpeg.org) on the PATH for films; add `--no-video` to process photographs only. The build is incremental and writes `src/data/media.generated.json`.

- **Ids** are the file's path, lower-cased and hyphenated, without `Clothing/`: `Clothing/Heritage/Sherwanis/Apricot Raw Silk Zardosi Sherwani - 01.jpeg` becomes `heritage/sherwanis/apricot-raw-silk-zardosi-sherwani-01`.
- **Photographs** become WebP at 480, 800, 1280 and 1920 px, with a blurred preview and a backdrop colour. Files ending in ` Copy` are skipped.
- **Films** become silent, looping 720p MP4s with posters. Trims that remove baked-in title cards, and the letterbox crop, are in `scripts/media.config.mjs`.
- **Detail crops** (`edit/…`) and **film stills** (`still/…`) are defined in `scripts/media.config.mjs`. They illustrate categories and pieces that have been filmed but not photographed.
- **The hero** is cut from the atelier film; its shots are listed under `HERO_SEGMENTS`.

## Interface libraries

Three open-source (MIT) libraries are used throughout. Their licences are kept alongside the code.

| Library | Used for |
| --- | --- |
| [interior.dev](https://github.com/ddoemonn/interior) (`src/components/interior/`) | Announcement bar, hide-on-scroll header, drawers (bag, menu, filters), accordions, tabs, sort dropdown, filter grid, search-within, segmented controls, carousels, lightbox, modal, tooltips, text reveal, marquee, loading button, form fields, show-more, load-more, scroll-spy |
| [Bencho](https://github.com/cabralorenzo/bencho) (`src/components/bencho/`) | Collections image accordion, wishlist heart, size picker, bag quantity counter, toasts, shop-the-look tilt card, cloth-room card stack, newsletter field |
| [react-useanimations](https://github.com/useAnimations/react-useanimations) (`src/components/ui/Icon.tsx`) | Animated icons: menu, search, bag, wishlist, play/pause, social |

The Interior and Bencho components were copied in and re-skinned to the site's look (square corners, hairlines, the Sartorial palette); their behaviour is unchanged.

## Deploying

Any host that runs Next.js works (Vercel, Netlify, or `npm run build && npm start` on a Node server). Set `NEWSLETTER_WEBHOOK_URL` there if the newsletter is in use. `public/media/` is about 180 MB; hosts with a per-file limit are fine, as the largest file is the 23 MB atelier film.
