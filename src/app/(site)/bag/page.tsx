import type { Metadata } from "next";
import { BagView } from "@/components/pages/BagView";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Your bag",
  description: "Review the pieces in your bag and send them to Sartorial as one enquiry.",
  robots: { index: false },
};

export default function BagPage() {
  return (
    <main className="pt-header">
      <PageHeader crumbs={[{ label: "Home", href: "/" }, { label: "Your bag" }]} title="Your bag" />
      <BagView />
    </main>
  );
}
