import type { Metadata } from "next";
import { CollectionView } from "@/components/catalog/CollectionView";
import { COLLECTIONS } from "@/data/catalog";
import { shot } from "@/lib/media";

const collection = COLLECTIONS.footwear;

export const metadata: Metadata = {
  title: `${collection.name}: ${collection.tagline}`,
  description: collection.intro,
  alternates: { canonical: collection.href },
  openGraph: { title: `Sartorial ${collection.name}`, description: collection.intro, images: [{ url: shot(collection.cover).src }] },
};

export default function FootwearPage() {
  return <CollectionView collection={collection} />;
}
