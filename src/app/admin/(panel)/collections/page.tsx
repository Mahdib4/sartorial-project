import Link from "next/link";
import { setCuratedVisible } from "@/app/admin/actions/curated";
import { ButtonLink, Empty, Notice, PageHead, Pill } from "@/components/admin/ui";
import { getSettings, listCurated, thumbsFor } from "@/lib/admin/data";
import { pickerOptions } from "@/lib/admin/options";
import { pluralise } from "@/lib/format";

/** The banner form, filled in to announce this collection on the home page. */
function announceHref(c: { slug: string; title: string }): string {
  return `/admin/banners/new?${new URLSearchParams({ placement: "home", linkType: "curated", linkTarget: c.slug, title: c.title, cta: "Discover" })}`;
}

export default async function CollectionsPage({ searchParams }: PageProps<"/admin/collections">) {
  const sp = await searchParams;
  const [collections, options, settings] = await Promise.all([listCurated(), pickerOptions(), getSettings()]);
  const bySlug = new Map(options.products.map((p) => [p.slug, p]));
  const covers = new Map((await thumbsFor(collections.flatMap((c) => (c.cover ? [c.cover] : [])))).map((t) => [t.id, t.src]));
  const hidden = collections.filter((c) => !c.visible).length;

  return (
    <>
      <PageHead
        title="Collections & launches"
        intro={`${collections.length} ${collections.length === 1 ? "collection" : "collections"}${hidden ? `, ${hidden} hidden` : ""}. Each has its own page on the website. The first six show in “Collections and launches” on the home page, and the first three at the top of the Clothing menu.`}
        action={<ButtonLink href="/admin/collections/new">Add a collection</ButtonLink>}
      />
      {typeof sp.saved === "string" ? <div className="mb-5"><Notice tone="success">Saved. The website shows the change straight away.</Notice></div> : null}
      {sp.deleted ? <div className="mb-5"><Notice tone="success">The collection was deleted.</Notice></div> : null}
      {settings.home.sections.launches === false && collections.length ? (
        <div className="mb-5">
          <Notice tone="info">
            The “New collections and launches” section is turned off on the home page, so collections show only in the Clothing menu and on their own pages.{" "}
            <Link href="/admin/homepage" className="underline">
              Change the home page
            </Link>
          </Notice>
        </div>
      ) : null}

      {collections.length === 0 ? (
        <Empty action={<ButtonLink href="/admin/collections/new">Add a collection</ButtonLink>}>
          No collections or launches yet. Make one for a season, an occasion or new arrivals: it gets its own page, and shows on the home page and in the Clothing menu.
        </Empty>
      ) : (
        <ul className="divide-y divide-line border border-line bg-white">
          {collections.map((c) => {
            const pieces = c.products.flatMap((s) => bySlug.get(s) ?? []);
            const live = pieces.filter((p) => p.visible);
            const thumb = (c.cover && covers.get(c.cover)) || live[0]?.thumb || pieces[0]?.thumb || null;
            const href = `/admin/collections/${c.slug}`;
            return (
              <li key={c.slug} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:gap-3 md:gap-4">
                <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-4">
                  <Link href={href} className="relative block h-16 w-[52px] shrink-0 bg-paper" tabIndex={-1} aria-hidden>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {thumb ? <img src={thumb} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" /> : null}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={href} className="block truncate text-[14.5px] hover:underline">
                      {c.title}
                    </Link>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-ink-3">
                      {c.eyebrow ? (
                        <>
                          <span>{c.eyebrow}</span>
                          <span>·</span>
                        </>
                      ) : null}
                      <span>
                        {pieces.length ? pluralise(pieces.length, "piece") : "No pieces yet"}
                        {pieces.length > live.length ? ` (${pieces.length - live.length} hidden)` : ""}
                      </span>
                      {c.isLaunch ? <Pill tone="accent">New launch</Pill> : null}
                      {!c.visible ? <Pill tone="off">Hidden</Pill> : null}
                    </p>
                    <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px]">
                      {c.visible ? (
                        <a href={`/collections/${c.slug}`} target="_blank" rel="noreferrer" className="text-ink-2 underline hover:text-ink">
                          View on the website ↗
                        </a>
                      ) : null}
                      <Link href={announceHref(c)} className="text-ink-2 underline hover:text-ink" title="Make a home page banner that leads to this collection" aria-label={`Announce “${c.title}” with a home page banner`}>
                        Announce it
                      </Link>
                    </p>
                  </div>
                </div>
                {/* Edit first and on phones too: it is the main thing to do with a collection. */}
                <div className="flex items-center justify-end gap-2">
                  <Link href={href} className="inline-flex h-9 items-center border border-line px-3 text-[12.5px] hover:border-ink" aria-label={`Edit “${c.title}”`}>
                    Edit
                  </Link>
                  <form action={setCuratedVisible}>
                    <input type="hidden" name="slug" value={c.slug} />
                    <input type="hidden" name="visible" value={c.visible ? "false" : "true"} />
                    <button className="h-9 min-w-16 border border-line px-2 text-[12.5px] text-ink-2 hover:border-ink" aria-label={`${c.visible ? "Hide" : "Show"} “${c.title}” ${c.visible ? "from" : "on"} the website`} title={c.visible ? "Take it off the website without deleting it" : "Put it back on the website"}>
                      {c.visible ? "Hide" : "Show"}
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
