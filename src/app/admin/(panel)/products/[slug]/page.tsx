import { notFound } from "next/navigation";
import { deleteProduct } from "@/app/admin/actions/products";
import { ConfirmButton } from "@/components/admin/ActionForm";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageHead } from "@/components/admin/ui";
import { getProduct, listCategories, mediaLibrary, thumbsFor } from "@/lib/admin/data";

export default async function EditProductPage({ params }: PageProps<"/admin/products/[slug]">) {
  const { slug } = await params;
  const product = await getProduct(decodeURIComponent(slug));
  if (!product) notFound();
  const [categories, library, images] = await Promise.all([listCategories(), mediaLibrary(), thumbsFor(product.images)]);
  return (
    <>
      <PageHead
        title={product.name}
        action={
          <>
            <a href={`/products/${product.slug}`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center border border-line bg-white px-4 text-[13.5px] hover:border-ink">
              View on the website ↗
            </a>
            <form action={deleteProduct}>
              <input type="hidden" name="slug" value={product.slug} />
              <ConfirmButton message={`Delete “${product.name}”? This cannot be undone. (To take it off the website for now, hide it instead.)`}>Delete</ConfirmButton>
            </form>
          </>
        }
      />
      <ProductForm product={product} categories={categories.map((c) => ({ key: c.key, name: c.name, collection: c.collection }))} images={images} library={library} />
    </>
  );
}
