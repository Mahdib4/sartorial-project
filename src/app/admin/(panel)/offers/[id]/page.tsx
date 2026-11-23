import { notFound } from "next/navigation";
import { deleteOffer } from "@/app/admin/actions/offers";
import { ConfirmButton } from "@/components/admin/ActionForm";
import { OfferForm } from "@/components/admin/OfferForm";
import { PageHead } from "@/components/admin/ui";
import { getOffer } from "@/lib/admin/data";
import { pickerOptions } from "@/lib/admin/options";

export default async function EditOfferPage({ params }: PageProps<"/admin/offers/[id]">) {
  const { id } = await params;
  const n = Number(id);
  if (!Number.isSafeInteger(n) || n <= 0) notFound();
  const offer = await getOffer(n);
  if (!offer) notFound();
  const { departments, categories, products } = await pickerOptions();
  return (
    <>
      <PageHead
        title={offer.name}
        action={
          <form action={deleteOffer}>
            <input type="hidden" name="id" value={offer.id} />
            <ConfirmButton message={`Delete the offer “${offer.name}”? Prices go back to normal straight away. This cannot be undone. (To pause it, switch it off instead.)`}>Delete</ConfirmButton>
          </form>
        }
      />
      <OfferForm offer={offer} departments={departments} categories={categories} products={products} />
    </>
  );
}
