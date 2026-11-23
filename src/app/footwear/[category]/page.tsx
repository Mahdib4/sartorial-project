import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryView, categoryMetadata } from "@/components/catalog/CategoryView";
import { catalog } from "@/data/catalog";

export async function generateStaticParams() {
  const cat = await catalog();
  return cat.categoriesOf("footwear").map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: PageProps<"/footwear/[category]">): Promise<Metadata> {
  const { category: slug } = await params;
  const category = (await catalog()).getCategory(`footwear/${slug}`);
  return category ? categoryMetadata(category) : {};
}

export default async function FootwearCategoryPage({ params }: PageProps<"/footwear/[category]">) {
  const { category: slug } = await params;
  const cat = await catalog();
  const category = cat.getCategory(`footwear/${slug}`);
  if (!category) notFound();
  return <CategoryView cat={cat} category={category} />;
}
