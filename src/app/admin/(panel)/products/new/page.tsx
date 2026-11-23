import { ProductForm } from "@/components/admin/ProductForm";
import { PageHead } from "@/components/admin/ui";
import { listCategories, mediaLibrary } from "@/lib/admin/data";

export default async function NewProductPage({ searchParams }: PageProps<"/admin/products/new">) {
  const sp = await searchParams;
  const [categories, library] = await Promise.all([listCategories(), mediaLibrary()]);
  return (
    <>
      <PageHead title="Add a product" intro="Upload its photographs, give it a name and a category, and save. It appears on the website straight away (untick “Show on the website” to prepare it first)." />
      <ProductForm product={null} categories={categories.map((c) => ({ key: c.key, name: c.name, collection: c.collection }))} images={[]} library={library} defaultCategory={typeof sp.category === "string" ? sp.category : undefined} />
    </>
  );
}
