import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryView, categoryMetadata } from "@/components/catalog/CategoryView";
import { catalog } from "@/data/catalog";

export async function generateStaticParams() {
  const cat = await catalog();
  return (["heritage", "classic"] as const).flatMap((collection) => cat.categoriesOf(collection).map((category) => ({ collection, category: category.slug })));
}

export async function generateMetadata({ params }: PageProps<"/clothing/[collection]/[category]">): Promise<Metadata> {
  const { collection, category: slug } = await params;
  const category = (await catalog()).getCategory(`${collection}/${slug}`);
  return category ? categoryMetadata(category) : {};
}

export default async function ClothingCategoryPage({ params }: PageProps<"/clothing/[collection]/[category]">) {
  const { collection, category: slug } = await params;
  const cat = await catalog();
  const category = collection === "heritage" || collection === "classic" ? cat.getCategory(`${collection}/${slug}`) : undefined;
  if (!category) notFound();
  return <CategoryView cat={cat} category={category} />;
}
