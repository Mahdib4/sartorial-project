import { OfferForm } from "@/components/admin/OfferForm";
import { PageHead } from "@/components/admin/ui";
import { pickerOptions } from "@/lib/admin/options";

export default async function NewOfferPage() {
  const { departments, categories, products } = await pickerOptions();
  return (
    <>
      <PageHead title="Add an offer" intro="Name the offer, choose what it takes off and what it applies to, and save. It starts straight away unless you set a start date or switch it off." />
      <OfferForm offer={null} departments={departments} categories={categories} products={products} />
    </>
  );
}
