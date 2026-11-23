import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteCurated } from "@/app/admin/actions/curated";
import { ConfirmButton } from "@/components/admin/ActionForm";
import { CollectionForm } from "@/components/admin/CollectionForm";
import { PageHead } from "@/components/admin/ui";
import { getCurated, listBanners, mediaLibrary, thumbsFor } from "@/lib/admin/data";
import { pickerOptions } from "@/lib/admin/options";

/** The banner form, filled in to announce this collection on the home page. */
function announceHref(c: { slug: string; title: string }): string {
  return `/admin/banners/new?${new URLSearchParams({ placement: "home", linkType: "curated", linkTarget: c.slug, title: c.title, cta: "Discover" })}`;
}

export default async function EditCollectionPage({ params }: PageProps<"/admin/collections/[slug]">) {
  const { slug } = await params;
  const collection = await getCurated(decodeURIComponent(slug));
  if (!collection) notFound();
  const [library, options, cover, banners] = await Promise.all([mediaLibrary(), pickerOptions(), thumbsFor(collection.cover ? [collection.cover] : []), listBanners()]);
  const linked = banners.filter((b) => b.linkType === "curated" && b.linkTarget === collection.slug).length;

  return (
    <>
      <PageHead
        title={collection.title}
        intro={collection.visible ? undefined : "Hidden from the website. Turn on “Show on the website” below to publish it."}
        action={
          <>
            {collection.visible ? (
              <a href={`/collections/${collection.slug}`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center border border-line bg-white px-4 text-[13.5px] hover:border-ink">
                View on the website ↗
              </a>
            ) : null}
            <Link href={announceHref(collection)} className="inline-flex h-10 items-center border border-line bg-white px-4 text-[13.5px] hover:border-ink" title="Make a home page banner that leads to this collection">
              Announce it
            </Link>
            <form action={deleteCurated}>
              <input type="hidden" name="slug" value={collection.slug} />
              <ConfirmButton
                message={`Delete “${collection.title}”? Its page will stop working. The pieces themselves are not deleted.${linked ? ` ${linked === 1 ? "A banner leads" : `${linked} banners lead`} to it and will show without a link.` : ""} This cannot be undone. (To take it off the website for now, hide it instead.)`}
              >
                Delete
              </ConfirmButton>
            </form>
          </>
        }
      />
      <CollectionForm collection={collection} cover={cover} library={library} products={options.products} />
    </>
  );
}
