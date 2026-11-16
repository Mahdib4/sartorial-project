import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Accordion } from "@/components/interior/accordion";
import { BuyBox } from "@/components/product/BuyBox";
import { ProductGallery, type GalleryItem } from "@/components/product/ProductGallery";
import { ProductRail } from "@/components/product/ProductRail";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SITE } from "@/config/site";
import { allProducts, categoryHref, COLLECTIONS, getCategory, getProduct, productHref, relatedTo, sizeScaleFor, toCard } from "@/data/catalog";
import type { Product } from "@/data/types";
import { formatPrice } from "@/lib/format";
import { film, shot } from "@/lib/media";

export function generateStaticParams() {
  return allProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  const image = shot(product.images[0]);
  return {
    title: product.name,
    description: `${product.summary} ${product.description}`.slice(0, 300),
    alternates: { canonical: productHref(product) },
    openGraph: { title: `${product.name} — ${SITE.name}`, description: product.summary, images: [{ url: image.src, width: image.width, height: image.height }] },
  };
}

const CARE: Record<string, string[]> = {
  tailoring: ["Dry clean only, and as seldom as you can: brushing and airing after each wear does more for the cloth.", "Hang on a shaped, wide-shouldered hanger and give the garment a day's rest between wears.", "Steam rather than iron. If you must press, use a cloth between the iron and the garment."],
  heritage: ["Specialist dry clean only. Point out the embroidery to your cleaner before it is treated.", "Store on a padded hanger in a breathable garment bag, away from light. Never hang by the embroidery.", "Keep perfume and moisture away from metal-thread work, which can tarnish."],
  shirts: ["Machine wash cool with similar colours; unbutton the collar and cuffs first.", "Hang to dry on a hanger and iron while still slightly damp, collar first.", "Avoid tumble drying, which shortens the life of the collar interlining."],
  trousers: ["Follow the care note in the details above; wool dress trousers are dry clean only.", "Hang full length by the hem to let creases fall out between wears.", "Press along the existing crease using a pressing cloth."],
};

function careFor(product: Product): string[] {
  const [collection, category] = product.category.split("/");
  if (collection === "heritage") return CARE.heritage;
  if (category === "shirts") return CARE.shirts;
  if (category === "trousers") return CARE.trousers;
  return CARE.tailoring;
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const category = getCategory(product.category)!;
  const collection = COLLECTIONS[category.collection];
  const scale = sizeScaleFor(product);
  const images = product.images.map(shot);
  const films = (product.videos ?? []).map(film);

  // Photographs first, with the first film placed straight after the lead image.
  const gallery: GalleryItem[] = images.map((image, i) => ({ kind: "image", shot: image, alt: i === 0 ? `${product.name}, ${product.colour.toLowerCase()}` : `${product.name}, view ${i + 1}` }));
  films.forEach((clip, i) => {
    const item: GalleryItem = { kind: "film", film: clip, label: `${product.name}, filmed` };
    gallery.splice(Math.min(gallery.length, 1 + i * 3), 0, item);
  });

  const related = relatedTo(product, 8).map(toCard);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: images.slice(0, 4).map((image) => new URL(image.src, SITE.url).toString()),
    brand: { "@type": "Brand", name: SITE.name },
    category: `${collection.name} > ${category.name}`,
    color: product.colour,
    ...(product.fabric ? { material: product.fabric } : {}),
    ...(product.code ? { sku: product.code } : {}),
    ...(typeof product.price === "number"
      ? { offers: { "@type": "Offer", price: product.price, priceCurrency: SITE.commerce.currency, availability: "https://schema.org/MadeToOrder", url: new URL(productHref(product), SITE.url).toString() } }
      : {}),
  };

  return (
    <main className="pt-header">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <div className="grid gap-x-12 lg:grid-cols-12">
        {/* Photographs and films */}
        <div className="lg:col-span-7 xl:col-span-7">
          <ProductGallery items={gallery} name={product.name} />
        </div>

        {/* Details */}
        <div className="px-gutter pt-7 pb-14 lg:col-span-5 lg:pt-8 lg:pr-[max(var(--gutter),3vw)] lg:pl-0">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+var(--banner-h)+1.5rem)]">
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: collection.name, href: collection.href },
                { label: category.name, href: categoryHref(category) },
                { label: product.name },
              ]}
            />

            <p className="label mt-8 text-ink-3">
              {collection.name}&ensp;·&ensp;
              <Link href={categoryHref(category)} className="link-under">
                {category.name}
              </Link>
            </p>
            <h1 className="headline mt-4 text-[clamp(1.9rem,3.1vw,3rem)]">{product.name}</h1>
            <p className="mt-4 text-[15px] tracking-[0.02em] text-ink">{formatPrice(product.price)}</p>
            <p className="mt-5 max-w-lg text-[15.5px] leading-relaxed text-ink-2">{product.summary}</p>

            <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-[13px]">
              <dt className="text-ink-3">Colour</dt>
              <dd>{product.colour}</dd>
              {product.fabric ? (
                <>
                  <dt className="text-ink-3">Cloth</dt>
                  <dd>{product.fabric}</dd>
                </>
              ) : null}
              {product.code ? (
                <>
                  <dt className="text-ink-3">Reference</dt>
                  <dd className="tabular-nums">{product.code}</dd>
                </>
              ) : null}
            </dl>

            <div className="mt-8">
              <BuyBox slug={product.slug} name={product.name} scale={scale} />
            </div>

            <div className="mt-10 border-t border-line">
              <Accordion
                type="multiple"
                defaultOpen={["description"]}
                maxPanelHeight={900}
                headingLevel={2}
                items={[
                  {
                    id: "description",
                    title: "Description",
                    content: (
                      <div className="pb-2 text-[14.5px] leading-relaxed text-ink-2">
                        <p>{product.description}</p>
                        {product.note ? <p className="mt-4 text-[13px] text-ink-3">* {product.note}</p> : null}
                      </div>
                    ),
                  },
                  {
                    id: "details",
                    title: "Details",
                    content: (
                      <ul className="space-y-2 pb-2 text-[14.5px] text-ink-2">
                        {product.details.map((detail) => (
                          <li key={detail} className="flex gap-3">
                            <span aria-hidden className="mt-[0.7em] h-px w-3 shrink-0 bg-ink-3" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    ),
                  },
                  {
                    id: "ordering",
                    title: "Ordering and fittings",
                    content: (
                      <div className="space-y-3 pb-2 text-[14.5px] leading-relaxed text-ink-2">
                        <p>Add the piece to your bag and send your selection as one enquiry. We will reply to confirm the cloth, the price and a time for your fitting.</p>
                        <p>
                          Would you rather begin in person?{" "}
                          <Link href={`/appointments?piece=${product.slug}`} className="link-under text-ink">
                            Book a fitting
                          </Link>{" "}
                          and we will have this piece ready to show you.
                        </p>
                      </div>
                    ),
                  },
                  {
                    id: "care",
                    title: "Care",
                    content: (
                      <ul className="space-y-2 pb-2 text-[14.5px] leading-relaxed text-ink-2">
                        {careFor(product).map((line) => (
                          <li key={line} className="flex gap-3">
                            <span aria-hidden className="mt-[0.7em] h-px w-3 shrink-0 bg-ink-3" />
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="border-t border-line-soft py-14 md:py-20">
          <ProductRail eyebrow={collection.name} title="You may also like" products={related} />
        </section>
      ) : null}

      <RecentlyViewed exclude={product.slug} />
    </main>
  );
}
