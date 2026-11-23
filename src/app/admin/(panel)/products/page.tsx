import Link from "next/link";
import { moveProduct, setProductVisible } from "@/app/admin/actions/products";
import { ButtonLink, Empty, inputClass, Notice, PageHead, Pill, Select } from "@/components/admin/ui";
import { listCategories, listProducts, thumbsFor } from "@/lib/admin/data";
import { formatPrice } from "@/lib/format";

export default async function ProductsPage({ searchParams }: PageProps<"/admin/products">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";
  const category = typeof sp.category === "string" ? sp.category : "";
  const [products, categories] = await Promise.all([listProducts(), listCategories()]);
  const names = new Map(categories.map((c) => [c.key, c.name]));
  const shown = products.filter((p) => (!category || p.category === category) && (!q || `${p.name} ${p.colour} ${p.code ?? ""} ${names.get(p.category)}`.toLowerCase().includes(q)));
  const thumbs = new Map((await thumbsFor(shown.map((p) => p.images[0]).filter(Boolean))).map((t) => [t.id, t.src]));

  return (
    <>
      <PageHead
        title="Products"
        intro={`${products.length} pieces, ${products.filter((p) => p.visible === false).length} hidden. Open one to change its photographs, words, price or category.`}
        action={<ButtonLink href={`/admin/products/new${category ? `?category=${encodeURIComponent(category)}` : ""}`}>Add a product</ButtonLink>}
      />
      {typeof sp.saved === "string" ? <div className="mb-5"><Notice tone="success">Saved. The website shows the change straight away.</Notice></div> : null}
      {sp.deleted ? <div className="mb-5"><Notice tone="success">The product was deleted.</Notice></div> : null}

      <form className="mb-5 grid gap-2 sm:grid-cols-[1fr_240px_auto]" role="search">
        <input name="q" defaultValue={q} placeholder="Search by name, colour or code" className={inputClass} aria-label="Search products" />
        <Select name="category" defaultValue={category} aria-label="Category">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.key} value={c.key}>
              {c.name} ({c.collection})
            </option>
          ))}
        </Select>
        <button type="submit" className="h-[42px] border border-ink bg-ink px-4 text-[13.5px] text-white">
          Find
        </button>
      </form>

      {shown.length === 0 ? (
        <Empty action={<ButtonLink href="/admin/products/new">Add a product</ButtonLink>}>No products match.</Empty>
      ) : (
        <ul className="divide-y divide-line border border-line bg-white">
          {shown.map((p) => (
            <li key={p.slug} className="flex items-center gap-3 p-3 md:gap-4">
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
                  <span>·</span>
                  <span>{typeof p.salePrice === "number" ? `${formatPrice(p.salePrice)} (was ${formatPrice(p.price)})` : formatPrice(p.price)}</span>
                  {p.badge ? <Pill tone="accent">{p.badge}</Pill> : null}
                  {p.visible === false ? <Pill tone="off">Hidden</Pill> : null}
                </p>
              </div>
              <div className="hidden items-center sm:flex">
                <form action={moveProduct}>
                  <input type="hidden" name="slug" value={p.slug} />
                  <input type="hidden" name="direction" value="up" />
                  <button className="grid h-9 w-9 place-items-center text-ink-3 hover:text-ink" aria-label={`Move ${p.name} earlier`} title="Move earlier in its category">
                    ↑
                  </button>
                </form>
                <form action={moveProduct}>
                  <input type="hidden" name="slug" value={p.slug} />
                  <input type="hidden" name="direction" value="down" />
                  <button className="grid h-9 w-9 place-items-center text-ink-3 hover:text-ink" aria-label={`Move ${p.name} later`} title="Move later in its category">
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
          ))}
        </ul>
      )}
    </>
  );
}
