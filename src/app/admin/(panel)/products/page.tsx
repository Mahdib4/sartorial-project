import Link from "next/link";
import { moveProduct, setProductVisible } from "@/app/admin/actions/products";
import { ButtonLink, Empty, inputClass, Notice, PageHead, Pill, Select } from "@/components/admin/ui";
import { COLLECTIONS } from "@/data/categories";
import { listCategories, listProducts, thumbsFor } from "@/lib/admin/data";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { whyOffWebsite } from "./visibility";

export default async function ProductsPage({ searchParams }: PageProps<"/admin/products">) {
  const sp = await searchParams;
  // Keep what was typed (case and all) in the box; match without regard to case.
  const typed = typeof sp.q === "string" ? sp.q.trim() : "";
  const q = typed.toLowerCase();
  const category = typeof sp.category === "string" ? sp.category : "";
  const [products, categories] = await Promise.all([listProducts(), listCategories()]);
  const catByKey = new Map(categories.map((c) => [c.key, c]));
  const names = new Map(categories.map((c) => [c.key, c.name]));
  const shown = products.filter((p) => (!category || p.category === category) && (!q || `${p.name} ${p.colour} ${p.code ?? ""} ${names.get(p.category)}`.toLowerCase().includes(q)));
  const thumbs = new Map((await thumbsFor(shown.map((p) => p.images[0]).filter(Boolean))).map((t) => [t.id, t.src]));
  const offSite = (p: (typeof products)[number]) => whyOffWebsite(p, catByKey.get(p.category));
  const hidden = products.filter((p) => offSite(p)).length;

  // The first and last piece of each category, whose ↑ / ↓ has nowhere to go (the list is in category order).
  const firstOf = new Map<string, string>();
  const lastOf = new Map<string, string>();
  for (const p of products) {
    if (!firstOf.has(p.category)) firstOf.set(p.category, p.slug);
    lastOf.set(p.category, p.slug);
  }

  const saved = typeof sp.saved === "string" ? products.find((p) => p.slug === sp.saved) : undefined;
  const savedOff = saved ? offSite(saved) : null;
  const chosen = category ? catByKey.get(category) : undefined;
  const addHref = `/admin/products/new${category ? `?category=${encodeURIComponent(category)}` : ""}`;

  return (
    <>
      <PageHead
        title="Products"
        intro={`${products.length} pieces, ${hidden} hidden. Open one to change its photographs, words, price or category. The arrows set the order within a category.`}
        action={<ButtonLink href={addHref}>Add a product</ButtonLink>}
      />
      {saved ? (
        <div className="mb-5">
          <Notice tone="success">
            Saved “{saved.name}”.{" "}
            {savedOff ? (
              <>It is not on the website: {savedOff.short}.</>
            ) : (
              <>
                The website shows the change straight away.{" "}
                <a href={`/products/${saved.slug}`} target="_blank" rel="noreferrer" className="underline">
                  View on the website ↗
                </a>
              </>
            )}
          </Notice>
        </div>
      ) : typeof sp.saved === "string" ? (
        <div className="mb-5">
          <Notice tone="success">Saved. The website shows the change straight away.</Notice>
        </div>
      ) : null}
      {sp.deleted ? (
        <div className="mb-5">
          <Notice tone="success">The product was deleted.</Notice>
        </div>
      ) : null}

      <form className="mb-5 grid gap-2 sm:grid-cols-[1fr_260px_auto]" role="search">
        <input name="q" defaultValue={typed} placeholder="Search by name, colour or code" className={inputClass} aria-label="Search products" />
        <Select name="category" defaultValue={category} aria-label="Category">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.key} value={c.key}>
              {c.name} ({COLLECTIONS[c.collection]?.name ?? c.collection}
              {c.visible === false ? ", hidden" : ""})
            </option>
          ))}
        </Select>
        <button type="submit" className="h-[42px] border border-ink bg-ink px-4 text-[13.5px] text-white">
          Find
        </button>
      </form>

      {chosen?.visible === false ? (
        <div className="mb-5">
          <Notice tone="warning">
            The category “{chosen.name}” is hidden, so none of its pieces are on the website.{" "}
            <Link href={`/admin/categories/${chosen.key}`} className="underline">
              Open the category
            </Link>{" "}
            and switch on “Show on the website” to bring them back.
          </Notice>
        </div>
      ) : null}

      {shown.length === 0 ? (
        <Empty action={<ButtonLink href={addHref}>Add a product</ButtonLink>}>
          {q ? `No products match “${typed}”${chosen ? ` in ${chosen.name}` : ""}.` : chosen ? `No products in ${chosen.name} yet.` : "No products yet."}
        </Empty>
      ) : (
        <ul className="divide-y divide-line border border-line bg-white">
          {shown.map((p) => {
            const off = offSite(p);
            const isFirst = firstOf.get(p.category) === p.slug;
            const isLast = lastOf.get(p.category) === p.slug;
            return (
              <li key={p.slug} className={cn("flex items-center gap-3 p-3 md:gap-4", saved?.slug === p.slug && "bg-[#eef5ef]")}>
                <Link href={`/admin/products/${p.slug}`} className="relative block h-16 w-[52px] shrink-0 bg-paper">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {thumbs.get(p.images[0]) ? <img src={thumbs.get(p.images[0])} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" /> : null}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/products/${p.slug}`} className="block truncate text-[14.5px] hover:underline">
                    {p.name}
                  </Link>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-ink-3">
                    <span>{names.get(p.category) ?? p.category}</span>
                    <span aria-hidden>·</span>
                    <span>{typeof p.salePrice === "number" && typeof p.price === "number" ? `${formatPrice(p.salePrice)} (was ${formatPrice(p.price)})` : formatPrice(p.price)}</span>
                    {p.badge ? <Pill tone="accent">{p.badge}</Pill> : null}
                    {p.featured ? <Pill tone="neutral">Featured</Pill> : null}
                    {off ? <Pill tone="off">{off.pill}</Pill> : null}
                  </p>
                </div>
                {/* Phones stack the arrows; wider screens put them side by side. */}
                <div className="flex shrink-0 flex-col sm:flex-row sm:items-center">
                  <form action={moveProduct}>
                    <input type="hidden" name="slug" value={p.slug} />
                    <input type="hidden" name="direction" value="up" />
                    <button
                      disabled={isFirst}
                      className="grid h-8 w-10 place-items-center text-ink-3 hover:text-ink disabled:cursor-default disabled:opacity-25 disabled:hover:text-ink-3 sm:h-9 sm:w-9"
                      aria-label={isFirst ? `${p.name} is first in its category` : `Move ${p.name} earlier`}
                      title={isFirst ? "Already first in its category" : "Move earlier in its category"}
                    >
                      ↑
                    </button>
                  </form>
                  <form action={moveProduct}>
                    <input type="hidden" name="slug" value={p.slug} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      disabled={isLast}
                      className="grid h-8 w-10 place-items-center text-ink-3 hover:text-ink disabled:cursor-default disabled:opacity-25 disabled:hover:text-ink-3 sm:h-9 sm:w-9"
                      aria-label={isLast ? `${p.name} is last in its category` : `Move ${p.name} later`}
                      title={isLast ? "Already last in its category" : "Move later in its category"}
                    >
                      ↓
                    </button>
                  </form>
                </div>
                <form action={setProductVisible}>
                  <input type="hidden" name="slug" value={p.slug} />
                  <input type="hidden" name="visible" value={p.visible === false ? "true" : "false"} />
                  <button className="h-9 min-w-16 border border-line px-2 text-[12.5px] text-ink-2 hover:border-ink">{p.visible === false ? "Show" : "Hide"}</button>
                </form>
                <Link href={`/admin/products/${p.slug}`} className="hidden h-9 items-center border border-line px-3 text-[12.5px] hover:border-ink md:inline-flex">
                  Edit
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
