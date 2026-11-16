import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryView, categoryMetadata } from "@/components/catalog/CategoryView";
import { categoriesOf, getCategory } from "@/data/catalog";

export function generateStaticParams() {
  return (["heritage", "classic"] as const).flatMap((collection) => categoriesOf(collection).map((category) => ({ collection, category: category.slug })));
}

export async function generateMetadata({ params }: PageProps<"/clothing/[collection]/[category]">): Promise<Metadata> {
  const { collection, category: slug } = await params;
  const category = getCategory(`${collection}/${slug}`);
  return category ? categoryMetadata(category) : {};
}

export default async function ClothingCategoryPage({ params }: PageProps<"/clothing/[collection]/[category]">) {
  const { collection, category: slug } = await params;
  const category = collection === "heritage" || collection === "classic" ? getCategory(`${collection}/${slug}`) : undefined;
  if (!category) notFound();
  return <CategoryView category={category} />;
}
