import type { Metadata } from "next";
import { SearchView } from "@/components/pages/SearchView";
import { PageHeader } from "@/components/ui/PageHeader";
import { allProducts, toCard } from "@/data/catalog";
import { navGroups } from "@/data/navigation";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the Sartorial collection by garment, colour, cloth or occasion.",
  robots: { index: false },
};

export default function SearchPage() {
  return (
    <main className="pt-header">
      <PageHeader crumbs={[{ label: "Home", href: "/" }, { label: "Search" }]} title="Search" />
      <SearchView cards={allProducts().map(toCard)} groups={navGroups()} />
    </main>
  );
}
