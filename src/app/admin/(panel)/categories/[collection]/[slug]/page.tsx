import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteCategory } from "@/app/admin/actions/categories";
import { ConfirmButton } from "@/components/admin/ActionForm";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { ButtonLink, Notice, PageHead } from "@/components/admin/ui";
import { COLLECTION_ORDER, COLLECTIONS } from "@/data/categories";
import { listCategories, mediaLibrary, thumbsFor } from "@/lib/admin/data";

const products = (n: number) => (n === 1 ? "1 product" : `${n} products`);

export default async function EditCategoryPage({ params, searchParams }: PageProps<"/admin/categories/[collection]/[slug]">) {
  const [{ collection, slug }, sp] = await Promise.all([params, searchParams]);
  const key = `${decodeURIComponent(collection)}/${decodeURIComponent(slug)}`;
  const [categories, library] = await Promise.all([listCategories(), mediaLibrary()]);
  const category = categories.find((c) => c.key === key);
  if (!category) notFound();
  const preview = await thumbsFor(category.preview);
  const count = category.productCount;
  const dept = COLLECTIONS[category.collection];
  const productsHref = `/admin/products?category=${encodeURIComponent(category.key)}`;
  const hidden = category.visible === false;

  return (
    <>
      <PageHead
        title={category.name}
        intro={
          <>
            {dept.name} ·{" "}
            <Link href={productsHref} className="underline hover:text-ink">
              {count === 0 ? "no products yet" : products(count)}
            </Link>
            {hidden ? " · Hidden from the website" : null}
          </>
        }
        action={
          <>
            {!hidden ? (
              <a href={`${dept.href}/${category.slug}`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center border border-line bg-white px-4 text-[13.5px] hover:border-ink">
                View on the website ↗
              </a>
            ) : null}
            {count === 0 ? (
              <form action={deleteCategory}>
                <input type="hidden" name="key" value={category.key} />
                <ConfirmButton message={`Delete the “${category.name}” category? This cannot be undone. (To take it off the website for now, hide it instead.)`}>Delete</ConfirmButton>
              </form>
            ) : (
              <ButtonLink href={`/admin/categories/${category.key}?delete=1`} variant="danger">
                Delete
              </ButtonLink>
            )}
          </>
        }
      />
      {sp.delete && count > 0 ? (
        <div className="mb-5">
          <Notice tone="warning">
            “{category.name}” cannot be deleted while it has products. Move or delete its {products(count)} first:{" "}
            <Link href={productsHref} className="underline">
              see its {products(count)}
            </Link>
            . To take it off the website for now, turn off “Show on the website” below instead.
          </Notice>
        </div>
      ) : null}
      <CategoryForm
        category={category}
        preview={preview}
        library={library}
        departments={COLLECTION_ORDER.map((k) => ({ key: k, name: COLLECTIONS[k].name, href: COLLECTIONS[k].href }))}
      />
    </>
  );
}
