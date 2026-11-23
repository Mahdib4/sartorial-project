import type { Metadata } from "next";
import { WishlistView } from "@/components/pages/WishlistView";
import { PageHeader } from "@/components/ui/PageHeader";
import { catalog } from "@/data/catalog";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "The pieces you have saved.",
  robots: { index: false },
};

export default async function WishlistPage() {
  const cat = await catalog();
  return (
    <main className="pt-header">
      <PageHeader crumbs={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} title="Wishlist" />
      <WishlistView cards={cat.allProducts().map(cat.toCard)} />
    </main>
  );
}
