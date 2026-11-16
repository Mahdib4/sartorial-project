import { ProductCard } from "@/components/product/ProductCard";
import { ButtonLink } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/ui/Reveal";
import type { CardData } from "@/data/catalog";
import { cn } from "@/lib/cn";
import type { Shot } from "@/lib/media";

type SplitFeatureProps = {
  eyebrow: string;
  title: string;
  href: string;
  cta: string;
  image: Shot;
  imageAlt: string;
  imagePosition?: string;
  products: CardData[];
  /** Put the photograph on the right. */
  flip?: boolean;
};

/** Half the page is one photograph with a headline; the other half is four pieces from the same story. */
export function SplitFeature({ eyebrow, title, href, cta, image, imageAlt, imagePosition, products, flip }: SplitFeatureProps) {
  return (
    <section className="grid gap-1 px-1 lg:grid-cols-2" aria-label={title}>
      <div className={cn("on-dark relative min-h-[72vh] overflow-hidden text-white lg:min-h-0", flip && "lg:order-2")}>
        <div className="zoom-frame absolute inset-0">
          <div className="zoom-target absolute inset-0">
            <Picture shot={image} alt={imageAlt} sizes="(min-width: 1024px) 50vw, 100vw" ratio="fill" position={imagePosition} />
          </div>
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(18,17,14,0.7)_0%,rgba(18,17,14,0)_48%)]" />
        <Reveal className="absolute inset-x-0 bottom-0 p-5 md:p-8">
          <p className="label mb-4 text-white/80">{eyebrow}</p>
          <h2 className="headline max-w-[12ch]">{title}</h2>
          <ButtonLink href={href} variant="outline-light" className="mt-7">
            {cta}
          </ButtonLink>
        </Reveal>
      </div>
      <ul className="grid grid-cols-2 gap-x-1 gap-y-6 pb-4">
        {products.slice(0, 4).map((product) => (
          <li key={product.slug}>
            <ProductCard product={product} sizes="(min-width: 1024px) 25vw, 50vw" />
          </li>
        ))}
      </ul>
    </section>
  );
}
