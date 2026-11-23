import Link from "next/link";
import { moveCategory, setCategoryVisible } from "@/app/admin/actions/categories";
import { ButtonLink, Empty, Notice, PageHead, Pill } from "@/components/admin/ui";
import { COLLECTION_ORDER, COLLECTIONS } from "@/data/categories";
import { listCategories, thumbsFor } from "@/lib/admin/data";

const products = (n: number) => (n === 0 ? "No products yet" : n === 1 ? "1 product" : `${n} products`);

export default async function CategoriesPage({ searchParams }: PageProps<"/admin/categories">) {
  const sp = await searchParams;
  const categories = await listCategories();
  const thumbs = new Map((await thumbsFor(categories.map((c) => c.preview[0]).filter(Boolean))).map((t) => [t.id, t.src]));

  return (
    <>
      <PageHead
        title="Categories"
        intro={`${categories.length} categories in four departments, ${categories.filter((c) => c.visible === false).length} hidden. The order here is the order of the menus and department pages. Open one to change its name, words or hover photographs.`}
        action={<ButtonLink href="/admin/categories/new">Add a category</ButtonLink>}
      />
      {typeof sp.saved === "string" ? <div className="mb-5"><Notice tone="success">Saved. The website shows the change straight away.</Notice></div> : null}
      {sp.deleted ? <div className="mb-5"><Notice tone="success">The category was deleted.</Notice></div> : null}

      <div className="space-y-8">
        {COLLECTION_ORDER.map((dept) => {
          const list = categories.filter((c) => c.collection === dept);
          const deptName = COLLECTIONS[dept].name;
          return (
            <section key={dept} aria-labelledby={`dept-${dept}`}>
              <div className="mb-2 flex items-end justify-between gap-3">
                <h2 id={`dept-${dept}`} className="text-[16px] font-medium tracking-[-0.01em]">
                  {deptName} <span className="text-[13px] font-normal text-ink-3">· {list.length}</span>
                </h2>
                <Link href={`/admin/categories/new?department=${dept}`} className="text-[13px] text-ink-2 underline hover:text-ink">
                  Add to {deptName}
                </Link>
              </div>
              {list.length === 0 ? (
                <Empty action={<ButtonLink href={`/admin/categories/new?department=${dept}`}>Add a category</ButtonLink>}>No categories in {deptName} yet.</Empty>
              ) : (
                <ul className="divide-y divide-line border border-line bg-white">
                  {list.map((c, i) => (
                    <li key={c.key} className="flex items-center gap-3 p-3 md:gap-4">
                      <Link href={`/admin/categories/${c.key}`} className="relative block h-16 w-[52px] shrink-0 bg-paper">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {thumbs.get(c.preview[0]) ? <img src={thumbs.get(c.preview[0])} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" /> : null}
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link href={`/admin/categories/${c.key}`} className="block truncate text-[14.5px] hover:underline">
                          {c.name}
                        </Link>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-ink-3">
                          <Link href={`/admin/products?category=${encodeURIComponent(c.key)}`} className="underline hover:text-ink">
                            {products(c.productCount)}
                          </Link>
                          {c.visible === false ? <Pill tone="off">Hidden</Pill> : null}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <form action={moveCategory}>
                          <input type="hidden" name="key" value={c.key} />
                          <input type="hidden" name="direction" value="up" />
                          <button disabled={i === 0} className="grid h-9 w-8 place-items-center text-ink-3 hover:text-ink disabled:opacity-25" aria-label={`Move ${c.name} earlier`} title={`Move earlier in ${deptName}`}>
                            ↑
                          </button>
                        </form>
                        <form action={moveCategory}>
                          <input type="hidden" name="key" value={c.key} />
                          <input type="hidden" name="direction" value="down" />
                          <button disabled={i === list.length - 1} className="grid h-9 w-8 place-items-center text-ink-3 hover:text-ink disabled:opacity-25" aria-label={`Move ${c.name} later`} title={`Move later in ${deptName}`}>
                            ↓
                          </button>
                        </form>
                      </div>
                      <form action={setCategoryVisible}>
                        <input type="hidden" name="key" value={c.key} />
                        <input type="hidden" name="visible" value={c.visible === false ? "true" : "false"} />
                        <button className="h-9 min-w-16 border border-line px-2 text-[12.5px] text-ink-2 hover:border-ink">{c.visible === false ? "Show" : "Hide"}</button>
                      </form>
                      <Link href={`/admin/categories/${c.key}`} className="hidden h-9 items-center border border-line px-3 text-[12.5px] hover:border-ink md:inline-flex">
                        Edit
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
