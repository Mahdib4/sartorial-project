import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionHero } from "@/components/catalog/CollectionHero";
import { Listing } from "@/components/product/Listing";
import { catalog, curatedHref } from "@/data/catalog";
import { shot } from "@/lib/media";

/** Curated collections and launches are made in the admin; each has a page here. */
export async function generateStaticParams() {
  const cat = await catalog();
  const slugs = cat.curated().map((c) => ({ slug: c.slug }));
  // Cache Components needs at least one entry; this one simply renders "not found".
  return slugs.length ? slugs : [{ slug: "none" }];
}

export async function generateMetadata({ params }: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const cat = await catalog();
  const c = cat.getCurated(slug);
  if (!c) return {};
  const cover = c.cover ?? cat.productsOf(c)[0]?.images[0];
  return {
    title: c.title,
    description: c.intro || `${c.title}, from Sartorial.`,
    alternates: { canonical: curatedHref(c) },
    ...(cover ? { openGraph: { title: `${c.title} — Sartorial`, description: c.intro, images: [{ url: shot(cover).src }] } } : {}),
  };
}

export default async function CuratedPage({ params }: PageProps<"/collections/[slug]">) {
  const { slug } = await params;
  const cat = await catalog();
  const c = cat.getCurated(slug);
  if (!c) notFound();
  const products = cat.productsOf(c);
  const cover = c.cover ?? products[0]?.images[0];

  return (
    <main>
      <CollectionHero
        eyebrow={c.eyebrow || (c.isLaunch ? "New launch" : "Collection")}
        title={c.title}
        intro={c.intro}
        image={cover ? shot(cover) : shot("heritage/stoles/ivory-gold-embroidered-border-heritage-stole-ensemble-08")}
        imageAlt=""
      />
      <section className="py-12 md:py-16" aria-label={`${c.title}: the pieces`}>
        {products.length ? (
          <Listing products={products.map(cat.toCard)} chips="category" label={c.title} />
        ) : (
          <p className="px-gutter text-[15px] text-ink-2">The pieces for this collection are on their way.</p>
        )}
      </section>
    </main>
  );
}
