import Link from "next/link";
import { CategoryTiles } from "@/components/catalog/CategoryTiles";
import { EditGallery } from "@/components/catalog/EditGallery";
import { Listing } from "@/components/product/Listing";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { LoopVideo } from "@/components/ui/LoopVideo";
import { Picture } from "@/components/ui/Picture";
import { Reveal, RevealMask } from "@/components/ui/Reveal";
import { categoryHref, COLLECTIONS, type Catalog } from "@/data/catalog";
import { hasPhoto, navGroups } from "@/data/navigation";
import type { Category } from "@/data/types";
import { cn } from "@/lib/cn";
import { pluralise } from "@/lib/format";
import { film, shot } from "@/lib/media";

/**
 * One category: its introduction and film, then its products. Where none are
 * listed yet it shows its edit (where the piece appears across the collection)
 * or, for a category with no photographs of that kind either (a new one made in
 * the admin), a short note that new pieces are on their way, with a fitting.
 */
export function CategoryView({ cat, category }: { cat: Catalog; category: Category }) {
  const collection = COLLECTIONS[category.collection];
  const products = cat.productsIn(category.key);
  const group = navGroups(cat).find((g) => g.key === category.collection)!;
  const siblings = group.categories;
  const self = siblings.find((s) => s.key === category.key);
  const others = siblings.filter((s) => s.key !== category.key);
  const editorial = cat.editorialFor(category.key);
  const clip = category.film ? film(category.film) : null;
  // A new category may have no photographs of its own yet: fall back to a piece in it, then the department.
  const lead = shot(editorial[0] ?? category.preview[0] ?? products[0]?.images[0] ?? collection.cover);
  const isEdit = products.length === 0;
  const editShots = (category.edit ?? []).filter((e) => hasPhoto(e.image));
  const interest = `/appointments?interest=${encodeURIComponent(category.name)}`;

  return (
    <main className="pt-header">
      {/* Introduction */}
      <section className="grid gap-x-10 gap-y-6 px-gutter pt-6 pb-8 md:gap-y-8 md:pt-10 md:pb-12 lg:grid-cols-12 lg:pb-16">
        <div className="flex flex-col lg:col-span-5">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              ...(collection.department === "Clothing" ? [{ label: "Clothing", href: "/clothing" }] : []),
              { label: collection.name, href: collection.href },
              { label: category.name },
            ]}
          />
          <Reveal className="mt-7 md:mt-10 lg:mt-auto lg:pt-16">
            <p className="label text-ink-3">
              {collection.name}&ensp;·&ensp;{self?.summary ?? pluralise(products.length, "piece")}
            </p>
            <h1 className="display-md mt-4 md:mt-5">{category.name}</h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-2 md:mt-6 md:text-[16px]">{category.intro}</p>
          </Reveal>
        </div>
        <RevealMask className="lg:col-span-7">
          {clip ? (
            <LoopVideo film={clip} label={`${category.name}, filmed in the Sartorial atelier`} priority className={cn("w-full", clip.portrait ? "aspect-[5/4] md:aspect-[16/11]" : "aspect-[16/10]")} position={clip.portrait ? "50% 28%" : "50% 50%"} />
          ) : (
            <Picture shot={lead} alt="" sizes="(min-width: 1024px) 58vw, 100vw" ratio="16 / 10" priority className="aspect-[5/4]! md:aspect-[16/10]!" />
          )}
        </RevealMask>
      </section>

      {/* Sibling categories */}
      <nav aria-label={`${collection.name} categories`} className="no-scrollbar flex gap-x-7 overflow-x-auto border-y border-line-soft px-gutter">
        {siblings.map((sibling) => {
          const current = sibling.key === category.key;
          return (
            <Link
              key={sibling.key}
              href={sibling.href}
              aria-current={current ? "page" : undefined}
              className={cn("relative flex h-12 shrink-0 items-center gap-2 text-[13.5px] whitespace-nowrap transition-colors duration-300", current ? "text-ink" : "text-ink-3 hover:text-ink")}
            >
              {sibling.name}
              {sibling.count > 0 ? <span className="text-[10.5px] text-mute tabular-nums">{sibling.count}</span> : null}
              {current ? <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-ink" /> : null}
            </Link>
          );
        })}
      </nav>

      {/* Products; or, with none listed yet, the edit; or, with nothing to show at all, a note and a fitting */}
      {!isEdit ? (
        <section className="pt-4 pb-10 md:py-12" aria-label={`${category.name}: all pieces`}>
          <Listing products={products.map(cat.toCard)} chips="occasion" label={category.name} />
        </section>
      ) : editShots.length > 0 ? (
        <section className="py-12 md:py-16" aria-labelledby="edit-title">
          <div className="mb-10 grid gap-6 px-gutter lg:grid-cols-12 lg:items-end">
            <h2 id="edit-title" className="headline lg:col-span-7">
              {category.name}, as worn across the collection.
            </h2>
            <div className="lg:col-span-5 lg:justify-self-end">
              <p className="max-w-sm text-[14.5px] leading-relaxed text-ink-2">
                These pieces are chosen in person rather than listed online. Tell us what you have in mind and we will show you what is available at your fitting.
              </p>
              <div className="mt-6 grid gap-3 sm:flex sm:flex-row">
                <ButtonLink href={interest}>Ask about {category.name}</ButtonLink>
              </div>
            </div>
          </div>
          <EditGallery cat={cat} shots={editShots} name={category.name} />
        </section>
      ) : (
        <section className="px-gutter py-14 md:py-24" aria-labelledby="soon-title">
          <div className="grid gap-x-10 gap-y-5 lg:grid-cols-12">
            <p className="label text-ink-3 lg:col-span-4 lg:pt-3">Made to order</p>
            <div className="lg:col-span-8">
              <h2 id="soon-title" className="headline max-w-[20ch] text-balance">
                New pieces are being photographed.
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-2 md:mt-6">
                Everything we make is cut for one person, so there is always more in the atelier than is shown here. Book a fitting and we will show you the cloths and the cuts in person.
              </p>
              <div className="mt-8 grid gap-3 sm:flex sm:flex-row sm:items-start">
                <ButtonLink href={interest}>Book a fitting</ButtonLink>
                <ButtonLink href={collection.href} variant="outline">
                  View all {collection.name}
                </ButtonLink>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Group and stack photographs */}
      {!isEdit && editorial.length > 0 ? (
        <section className="pb-16 md:pb-24" aria-label={`${category.name}: from the collection`}>
          <p className="label mb-6 px-gutter text-ink-3">From the collection</p>
          <ul className={cn("grid gap-1 px-1", editorial.length === 1 ? "grid-cols-1" : editorial.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3")}>
            {editorial.slice(0, 3).map((id) => (
              <Reveal as="li" key={id}>
                <Picture shot={shot(id)} alt="" sizes={editorial.length === 1 ? "100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"} ratio={editorial.length === 1 ? "16 / 9" : "4 / 5"} />
              </Reveal>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Onward, when the department has other categories to show */}
      {others.length > 0 ? (
        <section className="border-t border-line-soft py-14 md:py-20" aria-labelledby="more-title">
          <div className="mb-8 flex items-end justify-between px-gutter">
            <h2 id="more-title" className="headline-sm">
              More from {collection.name}
            </h2>
            <Link href={collection.href} className="-my-3 py-3 text-[13.5px]">
              <span className="link-under inline-block">View all</span>
            </Link>
          </div>
          <CategoryTiles categories={others} label={`More ${collection.name} categories`} />
        </section>
      ) : null}
    </main>
  );
}

export function categoryMetadata(category: Category) {
  const collection = COLLECTIONS[category.collection];
  return {
    title: `${category.name} · ${collection.name}`,
    description: category.intro,
    alternates: { canonical: categoryHref(category) },
    openGraph: { title: `${category.name} — Sartorial ${collection.name}`, description: category.blurb, images: [{ url: shot(category.preview[0] ?? collection.cover).src }] },
  };
}
