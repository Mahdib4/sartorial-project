import { CategoryForm } from "@/components/admin/CategoryForm";
import { PageHead } from "@/components/admin/ui";
import { COLLECTION_ORDER, COLLECTIONS } from "@/data/categories";
import type { CollectionKey } from "@/data/types";
import { mediaLibrary } from "@/lib/admin/data";

export default async function NewCategoryPage({ searchParams }: PageProps<"/admin/categories/new">) {
  const sp = await searchParams;
  const library = await mediaLibrary();
  const department = COLLECTION_ORDER.find((k) => k === sp.department) as CollectionKey | undefined;
  return (
    <>
      <PageHead
        title="Add a category"
        intro="Choose its department, give it a name and at least one hover photograph, and save. It appears in the menus straight away (untick “Show on the website” to prepare it first). Then add products to it from the Products page."
      />
      <CategoryForm
        category={null}
        preview={[]}
        library={library}
        departments={COLLECTION_ORDER.map((k) => ({ key: k, name: COLLECTIONS[k].name, href: COLLECTIONS[k].href }))}
        defaultDepartment={department}
      />
    </>
  );
}
