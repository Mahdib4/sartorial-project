import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryView, categoryMetadata } from "@/components/catalog/CategoryView";
import { catalog } from "@/data/catalog";

export async function generateStaticParams() {
  const cat = await catalog();
  return cat.categoriesOf("accessories").map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: PageProps<"/accessories/[category]">): Promise<Metadata> {
  const { category: slug } = await params;
  const category = (await catalog()).getCategory(`accessories/${slug}`);
  return category ? categoryMetadata(category) : {};
}

export default async function AccessoriesCategoryPage({ params }: PageProps<"/accessories/[category]">) {
  const { category: slug } = await params;
  const cat = await catalog();
  const category = cat.getCategory(`accessories/${slug}`);
  if (!category) notFound();
  return <CategoryView cat={cat} category={category} />;
}
