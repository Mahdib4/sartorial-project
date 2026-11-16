import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryView, categoryMetadata } from "@/components/catalog/CategoryView";
import { categoriesOf, getCategory } from "@/data/catalog";

export function generateStaticParams() {
  return categoriesOf("accessories").map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: PageProps<"/accessories/[category]">): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategory(`accessories/${slug}`);
  return category ? categoryMetadata(category) : {};
}

export default async function AccessoriesCategoryPage({ params }: PageProps<"/accessories/[category]">) {
  const { category: slug } = await params;
  const category = getCategory(`accessories/${slug}`);
  if (!category) notFound();
  return <CategoryView category={category} />;
}
