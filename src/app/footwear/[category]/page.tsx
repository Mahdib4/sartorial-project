import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryView, categoryMetadata } from "@/components/catalog/CategoryView";
import { categoriesOf, getCategory } from "@/data/catalog";

export function generateStaticParams() {
  return categoriesOf("footwear").map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: PageProps<"/footwear/[category]">): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategory(`footwear/${slug}`);
  return category ? categoryMetadata(category) : {};
}

export default async function FootwearCategoryPage({ params }: PageProps<"/footwear/[category]">) {
  const { category: slug } = await params;
  const category = getCategory(`footwear/${slug}`);
  if (!category) notFound();
  return <CategoryView category={category} />;
}
