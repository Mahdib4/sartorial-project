import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteProduct } from "@/app/admin/actions/products";
import { ConfirmButton } from "@/components/admin/ActionForm";
import { ProductForm } from "@/components/admin/ProductForm";
import { Notice, PageHead } from "@/components/admin/ui";
import { getProduct, listCategories, listOffers, mediaLibrary, thumbsFor } from "@/lib/admin/data";
import { LEFT_OUT_ADVICE, leftOutMessage, offersLeftOut, whyOffWebsite } from "../visibility";

export default async function EditProductPage({ params }: PageProps<"/admin/products/[slug]">) {
  const { slug } = await params;
  const product = await getProduct(decodeURIComponent(slug));
  if (!product) notFound();
  const [categories, library, images, offers] = await Promise.all([listCategories(), mediaLibrary(), thumbsFor(product.images), listOffers()]);
  const category = categories.find((c) => c.key === product.category);
  const off = whyOffWebsite(product, category);
  // Live "amount off" offers that would take this piece's price to nothing are not applied to it.
  const leftOut = typeof product.price === "number" ? offersLeftOut(product, category, offers).map((o) => leftOutMessage(o, product.price!)) : [];
  return (
    <>
      <PageHead
        title={product.name}
        action={
          <>
            {off ? null : (
              <a href={`/products/${product.slug}`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center border border-line bg-white px-4 text-[13.5px] hover:border-ink">
                View on the website ↗
              </a>
            )}
            <form action={deleteProduct}>
              <input type="hidden" name="slug" value={product.slug} />
              <ConfirmButton message={`Delete “${product.name}”? This cannot be undone. (To take it off the website for now, hide it instead.)`}>Delete</ConfirmButton>
            </form>
          </>
        }
      />
      {off ? (
        <div className="mb-6">
          <Notice tone="warning">
            {off.long}
            {category && category.visible === false ? (
              <>
                {" "}
                <Link href={`/admin/categories/${category.key}`} className="underline">
                  Open “{category.name}”
                </Link>
              </>
            ) : null}
          </Notice>
        </div>
      ) : null}
      {leftOut.length ? (
        <div className="mb-6">
          <Notice tone="warning">{leftOut.join(" ")} {LEFT_OUT_ADVICE}</Notice>
        </div>
      ) : null}
      <ProductForm product={product} categories={categories.map((c) => ({ key: c.key, name: c.name, collection: c.collection, visible: c.visible !== false }))} images={images} library={library} offWebsite={off !== null} />
    </>
  );
}
