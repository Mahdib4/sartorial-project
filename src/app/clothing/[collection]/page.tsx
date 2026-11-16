import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionView } from "@/components/catalog/CollectionView";
import { getCollection } from "@/data/catalog";
import { shot } from "@/lib/media";

const CLOTHING = ["heritage", "classic"];

export function generateStaticParams() {
  return CLOTHING.map((collection) => ({ collection }));
}

export async function generateMetadata({ params }: PageProps<"/clothing/[collection]">): Promise<Metadata> {
  const { collection: key } = await params;
  const collection = CLOTHING.includes(key) ? getCollection(key) : undefined;
  if (!collection) return {};
  return {
    title: `${collection.name}: ${collection.tagline}`,
    description: collection.intro,
    alternates: { canonical: collection.href },
    openGraph: { title: `Sartorial ${collection.name}`, description: collection.intro, images: [{ url: shot(collection.cover).src }] },
  };
}

export default async function ClothingCollectionPage({ params }: PageProps<"/clothing/[collection]">) {
  const { collection: key } = await params;
  const collection = CLOTHING.includes(key) ? getCollection(key) : undefined;
  if (!collection) notFound();
  return <CollectionView collection={collection} />;
}
