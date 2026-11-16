import type { Metadata } from "next";
import { WishlistView } from "@/components/pages/WishlistView";
import { PageHeader } from "@/components/ui/PageHeader";
import { allProducts, toCard } from "@/data/catalog";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "The pieces you have saved.",
  robots: { index: false },
};

export default function WishlistPage() {
  return (
    <main className="pt-header">
      <PageHeader crumbs={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} title="Wishlist" />
      <WishlistView cards={allProducts().map(toCard)} />
    </main>
  );
}
