# Sartorial

The website for Sartorial, a bespoke tailoring house in Dhaka: Heritage (sherwanis, achkans, bandhgalas, Jodhpuri jackets) and Classic (suits, jackets, shirts, trousers), plus Accessories and Footwear.

Built with Next.js (App Router), React, TypeScript and Tailwind CSS. The catalogue, banners, offers and settings live in Neon Postgres and are managed in the **admin panel** at `/admin`; photographs uploaded there are stored in Cloudflare R2. Pages are prerendered and refreshed the moment something changes in the admin. Without a database the site still runs, on the catalogue built into the code.

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

Set these environment variables on Vercel (Project → Settings → Environment Variables, **Production**), then redeploy. Locally they go in `.env.local`. `.env.example` lists them all.

| Variable | What it is | Without it |
| --- | --- | --- |
| `DATABASE_URL`, `DATABASE_URL_UNPOOLED` | Neon's pooled and direct connection strings (Neon console → your project → **Connect**) | The admin cannot be used; the site shows the built-in catalogue; orders still reach WhatsApp but are not logged |
| `ADMIN_PASSWORD` | The password for `/admin` (choose a long one). It can later be changed inside the admin | Nobody can sign in to the admin |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` | Cloudflare R2 API token for the `sartorial-media` bucket (Object Read & Write) | Photographs cannot be uploaded in the admin (choosing existing ones still works) |
| `R2_PUBLIC_URL` (optional) | The bucket's public address. Defaults to `https://pub-815592e32d694078bff17fcd968c91d8.r2.dev` | – |
| `ADMIN_SESSION_SECRET` (optional) | A long random string used to sign admin sessions | `DATABASE_URL` is used as the secret |
| `NEXT_PUBLIC_SITE_URL` (optional) | The live address once the site has its own domain | Canonical links use `https://sartorial-bd.vercel.app` |
| `NEXT_PUBLIC_MEDIA_URL` (optional) | Serve every photograph and film from R2 (see [Media on Cloudflare R2](#media-on-cloudflare-r2)) | They are served by Vercel, as now |

Everything else (WhatsApp number, phone, email, address, opening hours, social links, prices, banners, offers, home page sections) is set in the admin. Confirm the size scales in `src/config/site.ts` → `SIZE_SCALES` match the house.

## The admin panel

Open `/admin` (e.g. `https://sartorial-bd.vercel.app/admin`) and sign in with `ADMIN_PASSWORD`. Changes appear on the website as soon as they are saved.

- **Orders & enquiries**: every "Send message" from the bag or the fitting form, with the reference the customer's WhatsApp message carries, the pieces, sizes and contact details. Mark each as contacted, confirmed, completed or cancelled; reply on WhatsApp in one tap.
- **Products**: add, edit, hide or delete pieces; upload photographs (the first is the card photograph) or choose from the site's photographs; set the category, colour, occasions, price, a sale price and a card label such as "New".
- **Categories**: add, rename, reorder, hide or delete categories in Heritage, Classic, Accessories and Footwear; choose the photographs shown when a category is hovered.
- **Banners & notices**: the home page banner (the space under the opening film) and the announcement-bar notices, each leading to a product, category, department, collection or any page, with optional start and end dates.
- **Offers & discounts**: a percentage or taka off (or just a label) for everything, a department, chosen categories or chosen pieces, with dates. Pieces with a price show the reduced price; others show the label.
- **Collections & launches**: curated groups of pieces with their own page (`/collections/…`), shown on the home page and in the Clothing menu. "Announce it" creates a home page banner for it.
- **Home page**: switch each home page section on or off, and choose the pieces in "The wedding wardrobe" and "The suit, cut for one".
- **Settings**: the WhatsApp number orders go to, phone, email, address, opening hours, social links, and the admin password.

## The opening animation

The first page a visitor opens shows the Sartorial Dhaka logo assembling itself on ivory: SARTORIAL rises letter by letter, the tiger is drawn above it and inked in, DHAKA settles beneath, and the ivory dissolves into the page (about 5.7 seconds).

- It plays **once per visit** (per browser tab session). Reloading or navigating does not replay it. To see it again, open the site in a new tab or window, or add `?intro` to any address: `http://localhost:3000/?intro`.
- A click, tap, key press or scroll skips straight to the dissolve.
- Visitors who ask their system for reduced motion see the finished logo for a moment, then the dissolve.
- Timing, easing and the ivory colour are CSS variables at the top of `src/components/layout/preloader.css`. The script that decides when it plays is `src/lib/intro-script.ts`.

**The logo.** Every shape in the opening, the header and the footer is the logo's own: `scripts/trace-logo.py` traced the supplied logo (`assets/brand/sartorial-dhaka-logo.jpg`) into one vector path per letter plus the tiger, at their original positions, in `src/components/brand/logo.generated.json`. If the logo changes, replace the image and run (needs Python with `potracer`, `numpy` and `pillow`):

```bash
python scripts/trace-logo.py assets/brand/sartorial-dhaka-logo.jpg src/components/brand/logo.generated.json
```

## How ordering works

Pieces are made to order, so the site takes enquiries, not payments. A visitor adds pieces to the bag (with a size, or "Made to measure"), opens the bag, fills in their name and a phone number or email, and presses **Send message**. Their WhatsApp opens with the whole order written out, addressed to the house number; they press send in WhatsApp and it arrives. "Book a fitting" works the same way. Bag, wishlist and recently-viewed pieces are kept in the visitor's browser.

Each message carries:

- an **enquiry reference**, e.g. `SRT-261122-CR8G` (the date, then four characters);
- the customer's name, phone or email, and notes;
- for every piece: its name and category, its **product ref** (the house code where the piece has one, e.g. `S0001720`, otherwise the name in its web address, e.g. `ivory-paisley-jacquard-achkan`), the size, the quantity and a link to the piece.

The same press logs the enquiry in the database under the same reference (table `enquiries`), so every WhatsApp order can be looked up later. Logging never holds the visitor up: if the database is down or not set up, WhatsApp still opens. The message is composed in `src/lib/enquiry.ts`, the form is `src/components/shop/EnquiryForm.tsx`, and the logging endpoint is `src/app/api/enquiries/route.ts`.

To take payments later, the bag (`src/store/shop.tsx`) and the bag page (`src/components/pages/BagView.tsx`) are the two places a checkout would connect.

## The database (Neon)

The site keeps its catalogue (`categories`, `products`, uploaded photographs in `media`), `banners`, `offers`, curated `curated` collections, `settings`, plus `enquiries` (every order and fitting request sent through "Send message") and `newsletter_subscribers` in Neon Postgres. The schema is in `db/migrations/`; `npm run build` applies any new migration automatically when `DATABASE_URL` is set, and does nothing when it is not.

The Neon project is already linked in this repository (`neon.ts`; organisation `org-royal-forest-26787471`, project `spring-night-17384256`, branch `production`). To connect it:

```bash
neon login
```

```bash
neon link --org-id org-royal-forest-26787471 --project-id spring-night-17384256 --branch production
```

```bash
neon deploy
```

`neon deploy` pulls `DATABASE_URL` (and the direct `DATABASE_URL_UNPOOLED`) into `.env.local`. Then create the tables and check the connection:

```bash
npm run db:migrate
```

```bash
npm run db:check
```

For the live site, add the same `DATABASE_URL` and `DATABASE_URL_UNPOOLED` values on Vercel (Project → Settings → Environment Variables), **scoped to Production only**, and redeploy; the build creates the tables. Preview deployments skip migrations; to give previews a database, use a separate Neon branch (Neon's Vercel integration can create one per preview) and set `MIGRATE_ON_PREVIEW=1` for Preview.

To keep bots from flooding the order and newsletter endpoints, the site limits each visitor to a few requests a minute; for a limit across all of Vercel's servers, also add a rule in Vercel → Firewall → Rate limiting (path starts with `/api/`, method POST, 10 requests per minute per IP). Orders are read and managed in the admin (**Orders & enquiries**). They can also be read in the Neon console → your project → **Tables** → `enquiries`, or queried:

```sql
SELECT reference, created_at, customer_name, phone, items, notes FROM enquiries ORDER BY created_at DESC;
```

## Media on Cloudflare R2

The bucket is `sartorial-media`, public at `https://pub-815592e32d694078bff17fcd968c91d8.r2.dev`. Photographs uploaded in the admin always go there (as WebP at 480, 800, 1280 and 1920 px, under `media/img/uploads/`). The site's built-in photos and films have been copied there too, but are served from `public/media/` (Vercel) by default, which is faster than an `r2.dev` address. To serve them from R2 instead:

1. The R2 keys (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`) must be in `.env.local` (they are also what the admin uses for uploads). To make a new token: Cloudflare → R2 → **Manage API tokens**, *Object Read & Write* on the bucket.
2. Copy the media to the bucket (it only uploads new or changed files, so run it again after `npm run media`):

   ```bash
   npm run media:upload
   ```

3. Set `NEXT_PUBLIC_MEDIA_URL` to the bucket's public address (locally and on Vercel), e.g. `https://pub-815592e32d694078bff17fcd968c91d8.r2.dev`, and redeploy. Every photo, film and poster then loads from the bucket.

Cloudflare rate-limits `r2.dev` addresses and recommends them for testing only; for the live site, connect a custom domain to the bucket (e.g. `media.sartorial.com.bd`) and use that as `NEXT_PUBLIC_MEDIA_URL`.

## Where things are

```
src/
  config/site.ts            Brand, default contact details and notice, size scales
  data/
    categories.ts           The built-in site structure: collections and categories, with copy
    products.ts             The built-in catalogue: one entry per product
    seed.ts                 Default settings and home page sections
    store.ts                Loads the catalogue from the database (or the built-in one), cached
    catalog.ts              Queries over it: products, prices and offers, banners, collections
    navigation.ts           Menus, derived from the catalogue
    media.generated.json    Written by `npm run media`. Do not edit by hand
  app/                      Routes
    page.tsx                Home
    clothing/               /clothing, /clothing/heritage, /clothing/classic/suits …
    accessories/ footwear/  /accessories, /accessories/ties …
    products/[slug]/        Product pages
    collections/[slug]/     Collections and launches made in the admin
    admin/                  The admin panel (sign-in, then every section under (panel)/)
    api/admin/upload/       Photo uploads from the admin, to Cloudflare R2
    bag/ wishlist/ search/ appointments/ bespoke/ client-services/
    api/enquiries/          Logs "Send message" enquiries in the database
    api/newsletter/         Newsletter sign-ups
  components/
    admin/                  The admin panel's forms, pickers and layout
    brand/                  The logo as vector paths (traced from the logo file)
    home/                   Home page sections
    catalog/                Collection and category pages
    product/                Product card, listing (filters, sort), gallery, size picker
    layout/                 Opening animation, header, mega menu, bag drawer, search, footer
    shop/                   Bag lines, enquiry form
    ui/                     Picture, LoopVideo, Button, Icon, Rail …
    interior/               Components adapted from interior.dev
    bencho/                 Blocks adapted from bencho.dev
  lib/enquiry.ts            The WhatsApp order message and its references
  lib/db.ts                 The Neon (Postgres) connection
  lib/r2.ts                 Cloudflare R2 (S3 API) client
  lib/admin/                Admin sign-in, reads and the photo processing for uploads
  store/shop.tsx            Bag, wishlist, recently viewed, toasts
scripts/
  build-media.mjs           Turns the client's photos and films into web media
  media.config.mjs          Crops, film stills, trims and the hero edit
  trace-logo.py             Traces the logo file into the paths in components/brand/
  db-migrate.mjs            Applies db/migrations/ (npm run db:migrate, db:check)
  upload-media-r2.mjs       Copies public/media/ to Cloudflare R2 (npm run media:upload)
  db-import-catalogue.mjs   Copies pieces added in code into the database (npm run db:import-catalogue)
db/migrations/              The database schema, one numbered SQL file per change
assets/brand/               The logo file the paths were traced from
```

## Editing the catalogue

Use the admin panel (above). Everything there is stored in the database, and the website follows it.

**Where the catalogue comes from.** The pieces, categories and their photographs that shipped with the site are also written in code: `src/data/products.ts` and `src/data/categories.ts`. The first time the site runs against an empty database, it copies all of them into the database by itself; from then on the database is the catalogue, and the code files are only used when no database is connected. If more pieces are later added in code (for example after a new photo shoot is processed with `npm run media`), copy the new ones across without touching anything edited in the admin:

```bash
npm run db:import-catalogue
```

Add `-- --photos=slug-one,slug-two` to also replace the photographs of those existing pieces with the ones in the code.

**Categories without products.** Some categories (Kurtas, Heritage Trousers, Coats, and all of Accessories and Footwear) had no product photography in the supplied content. Their pages show an *edit*: where the piece appears across the rest of the collection, each photograph linked to the garment it was taken with. As soon as a category has products, its page becomes a normal product grid automatically.

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
| [interior.dev](https://github.com/ddoemonn/interior) (`src/components/interior/`) | Announcement bar, hide-on-scroll header, drawers (bag, menu, filters), accordions, tabs, sort dropdown, filter grid, search-within, segmented controls, carousels, lightbox, modal, tooltips, text reveal, loading button, form fields, show-more, load-more, scroll-spy |
| [Bencho](https://github.com/cabralorenzo/bencho) (`src/components/bencho/`) | Collections image accordion, wishlist heart, size picker, bag quantity counter, toasts, shop-the-look tilt card, cloth-room card stack, newsletter field |
| [react-useanimations](https://github.com/useAnimations/react-useanimations) (`src/components/ui/Icon.tsx`) | Animated icons: menu, search, bag, wishlist, play/pause, social |

The Interior and Bencho components were copied in and re-skinned to the site's look (square corners, hairlines, the Sartorial palette); their behaviour is unchanged.

## Deploying

Any host that runs Next.js works (Vercel, Netlify, or `npm run build && npm start` on a Node server). Set the environment variables listed under [Before going live](#before-going-live) there. Variables starting `NEXT_PUBLIC_` are built into the pages, so redeploy after changing them. `public/media/` is about 200 MB; hosts with a per-file limit are fine, as the largest file is the 23 MB atelier film.
