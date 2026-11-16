import Link from "next/link";
import { CategoryTiles } from "@/components/catalog/CategoryTiles";
import { EditGallery } from "@/components/catalog/EditGallery";
import { Listing } from "@/components/product/Listing";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { LoopVideo } from "@/components/ui/LoopVideo";
import { Picture } from "@/components/ui/Picture";
import { Reveal, RevealMask } from "@/components/ui/Reveal";
import { categoryHref, COLLECTIONS, editorialFor, productsIn, toCard } from "@/data/catalog";
import { navGroups } from "@/data/navigation";
import type { Category } from "@/data/types";
import { cn } from "@/lib/cn";
import { pluralise } from "@/lib/format";
import { film, shot } from "@/lib/media";

/** One category: its introduction and film, then either its products or, where none are listed yet, its edit. */
export function CategoryView({ category }: { category: Category }) {
  const collection = COLLECTIONS[category.collection];
  const products = productsIn(category.key);
  const group = navGroups().find((g) => g.key === category.collection)!;
  const siblings = group.categories;
  const editorial = editorialFor(category.key);
  const clip = category.film ? film(category.film) : null;
  const lead = shot(editorial[0] ?? category.preview[0]);
  const isEdit = products.length === 0;

  return (
    <main className="pt-header">
      {/* Introduction */}
      <section className="grid gap-x-10 gap-y-8 px-gutter pt-8 pb-12 md:pt-10 lg:grid-cols-12 lg:pb-16">
        <div className="flex flex-col lg:col-span-5">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              ...(collection.department === "Clothing" ? [{ label: "Clothing", href: "/clothing" }] : []),
              { label: collection.name, href: collection.href },
              { label: category.name },
            ]}
          />
          <Reveal className="mt-10 lg:mt-auto lg:pt-16">
            <p className="label text-ink-3">
              {collection.name}&ensp;·&ensp;{isEdit ? "The edit" : pluralise(products.length, "piece")}
            </p>
            <h1 className="display-md mt-5">{category.name}</h1>
            <p className="mt-6 max-w-md text-[16px] leading-relaxed text-ink-2">{category.intro}</p>
          </Reveal>
        </div>
        <RevealMask className="lg:col-span-7">
          {clip ? (
            <LoopVideo film={clip} label={`${category.name}, filmed in the Sartorial atelier`} priority className={cn("w-full", clip.portrait ? "aspect-[4/5] md:aspect-[16/11]" : "aspect-[16/10]")} position={clip.portrait ? "50% 28%" : "50% 50%"} />
          ) : (
            <Picture shot={lead} alt="" sizes="(min-width: 1024px) 58vw, 100vw" ratio="16 / 10" priority className="aspect-[4/5]! md:aspect-[16/10]!" />
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

      {/* Products, or the edit */}
      {isEdit ? (
        <section className="py-12 md:py-16" aria-labelledby="edit-title">
          <div className="mb-10 grid gap-6 px-gutter lg:grid-cols-12 lg:items-end">
            <h2 id="edit-title" className="headline lg:col-span-7">
              {category.name}, as worn across the collection.
            </h2>
            <div className="lg:col-span-5 lg:justify-self-end">
              <p className="max-w-sm text-[14.5px] leading-relaxed text-ink-2">
                {category.name} are arranged in person rather than listed online. Tell us what you have in mind and we will show you what is available at your fitting.
              </p>
              <div className="mt-6 flex flex-col gap-3 xs:flex-row">
                <ButtonLink href={`/appointments?interest=${encodeURIComponent(category.name)}`}>Ask about {category.name.toLowerCase()}</ButtonLink>
              </div>
            </div>
          </div>
          <EditGallery shots={category.edit ?? []} name={category.name} />
        </section>
      ) : (
        <section className="py-10 md:py-12" aria-label={`${category.name}: all pieces`}>
          <Listing products={products.map(toCard)} chips="occasion" label={category.name} />
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

      {/* Onward */}
      <section className="border-t border-line-soft py-14 md:py-20" aria-labelledby="more-title">
        <div className="mb-8 flex items-end justify-between px-gutter">
          <h2 id="more-title" className="headline-sm">
            More from {collection.name}
          </h2>
          <Link href={collection.href} className="link-under text-[13.5px]">
            View all
          </Link>
        </div>
        <CategoryTiles categories={siblings.filter((s) => s.key !== category.key)} label={`More ${collection.name} categories`} />
      </section>
    </main>
  );
}

export function categoryMetadata(category: Category) {
  const collection = COLLECTIONS[category.collection];
  return {
    title: `${category.name} · ${collection.name}`,
    description: category.intro,
    alternates: { canonical: categoryHref(category) },
    openGraph: { title: `${category.name} — Sartorial ${collection.name}`, description: category.blurb, images: [{ url: shot(category.preview[0]).src }] },
  };
}
