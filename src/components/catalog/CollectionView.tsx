import Link from "next/link";
import { CategoryTiles } from "@/components/catalog/CategoryTiles";
import { CollectionHero } from "@/components/catalog/CollectionHero";
import { Listing } from "@/components/product/Listing";
import { ButtonLink } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Catalog } from "@/data/catalog";
import { navGroups } from "@/data/navigation";
import type { Collection } from "@/data/types";
import { film, shot } from "@/lib/media";

const HERO: Record<string, { position?: string; alt: string; filmLabel?: string }> = {
  heritage: { alt: "Two grooms in ivory brocade sherwanis with gold-bordered stoles", filmLabel: "Zardosi-embroidered sherwanis on the stand in the Sartorial atelier" },
  classic: { alt: "Three men in bespoke suits in the Sartorial salon", position: "50% 28%" },
  accessories: { alt: "Folded dress shirts with a printed silk tie", position: "50% 45%" },
  footwear: { alt: "Double monk strap shoes beside a stack of side-tab trousers", position: "50% 82%" },
};

/** A collection: its film or photograph, its categories, and (where it has them) every piece in one filterable grid. */
export function CollectionView({ cat, collection }: { cat: Catalog; collection: Collection }) {
  const group = navGroups(cat).find((g) => g.key === collection.key)!;
  const products = cat.productsInCollection(collection.key);
  const categories = cat.categoriesOf(collection.key);
  const hero = HERO[collection.key];
  // Heritage opens on its collection film; the others open on a photograph.
  const heroFilm = collection.key === "heritage" && collection.film ? film(collection.film) : undefined;

  return (
    <main>
      <CollectionHero
        eyebrow={collection.department === collection.name ? collection.tagline : `${collection.department} · ${collection.tagline}`}
        title={collection.name}
        intro={collection.intro}
        image={shot(collection.banner)}
        imageAlt={hero.alt}
        imagePosition={hero.position}
        film={heroFilm}
        filmLabel={hero.filmLabel}
      />

      <section className="py-14 md:py-20" aria-labelledby="categories-title">
        <SectionHeading eyebrow={collection.name} title={<span id="categories-title">Shop by category.</span>} className="mb-8 md:mb-12" />
        <CategoryTiles categories={group.categories} label={`${collection.name} categories`} />
      </section>

      {products.length > 0 ? (
        <section className="border-t border-line-soft py-12 md:py-16" aria-labelledby="all-title">
          <SectionHeading eyebrow="The collection" title={<span id="all-title">Every piece in {collection.name}.</span>} className="mb-8 md:mb-10" />
          <Listing products={products.map(cat.toCard)} chips="category" categoryOrder={categories.map((c) => c.name)} label={collection.name} />
        </section>
      ) : (
        <div className="border-t border-line-soft">
          {categories.map((category, i) => {
            const nav = group.categories.find((c) => c.key === category.key)!;
            return (
              <section key={category.key} className="grid gap-x-10 gap-y-8 border-b border-line-soft px-gutter py-14 md:py-20 lg:grid-cols-12 lg:items-center" aria-labelledby={`cat-${category.slug}`}>
                <Reveal className={i % 2 ? "lg:order-2 lg:col-span-4 lg:col-start-9" : "lg:col-span-4"}>
                  <p className="label-sm text-mute tabular-nums">{String(i + 1).padStart(2, "0")}</p>
                  <h2 id={`cat-${category.slug}`} className="headline mt-4">
                    {category.name}
                  </h2>
                  <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-ink-2">{category.intro}</p>
                  <ButtonLink href={nav.href} variant="outline" className="mt-7">
                    View the edit
                  </ButtonLink>
                </Reveal>
                <ul className={i % 2 ? "grid grid-cols-3 gap-1 lg:order-1 lg:col-span-7" : "grid grid-cols-3 gap-1 lg:col-span-7 lg:col-start-6"}>
                  {nav.preview.slice(0, 3).map((image, n) => (
                    <Reveal as="li" key={image.id} delay={n * 0.07}>
                      <Link href={nav.href} tabIndex={-1} aria-hidden className="zoom-frame block">
                        <div className="zoom-target">
                          <Picture shot={image} alt="" sizes="(min-width: 1024px) 20vw, 33vw" ratio="3 / 4" />
                        </div>
                      </Link>
                    </Reveal>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      <section className="bg-paper px-gutter py-16 text-center md:py-24">
        <Reveal>
          <p className="label text-ink-3">By appointment</p>
          <h2 className="headline mx-auto mt-5 max-w-[20ch]">Everything here can be made for you.</h2>
          <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-ink-2">Choose the cloth, the cut and the details at a fitting in Dhaka.</p>
          <div className="mt-8 grid gap-3 sm:flex sm:flex-row sm:items-center sm:justify-center">
            <ButtonLink href="/appointments">Book a fitting</ButtonLink>
            <ButtonLink href="/bespoke" variant="outline">
              How it works
            </ButtonLink>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
