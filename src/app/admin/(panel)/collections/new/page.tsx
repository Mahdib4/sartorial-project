import { CollectionForm } from "@/components/admin/CollectionForm";
import { PageHead } from "@/components/admin/ui";
import { mediaLibrary } from "@/lib/admin/data";
import { pickerOptions } from "@/lib/admin/options";

export default async function NewCollectionPage() {
  const [library, options] = await Promise.all([mediaLibrary(), pickerOptions()]);
  return (
    <>
      <PageHead
        title="Add a collection"
        intro="A collection or launch gathers pieces for a season, an occasion or new arrivals on a page of its own. Give it a title, choose its pieces and save. It appears on the website straight away (untick “Show on the website” to prepare it first)."
      />
      <CollectionForm collection={null} cover={[]} library={library} products={options.products} />
    </>
  );
}
