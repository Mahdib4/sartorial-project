import Link from "next/link";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { curatedHref, type Catalog } from "@/data/catalog";
import { pluralise } from "@/lib/format";
import { shot } from "@/lib/media";

/** New launches and curated collections made in the admin, newest first. */
export function Launches({ cat }: { cat: Catalog }) {
  const items = cat.curated().slice(0, 6).flatMap((c) => {
    const products = cat.productsOf(c);
    const cover = c.cover ?? products[0]?.images[0];
    if (!cover) return [];
    try {
      return [{ c, count: products.length, image: shot(cover) }];
    } catch {
      return [];
    }
  });
  if (!items.length) return null;

  return (
    <section className="py-16 md:py-24" aria-labelledby="launches-title">
      <SectionHeading eyebrow="New from the house" title={<span id="launches-title">Collections and launches.</span>} className="mb-8 md:mb-12" />
      <ul className="no-scrollbar flex snap-x snap-mandatory gap-1 overflow-x-auto px-gutter md:grid md:grid-cols-3 md:overflow-visible">
        {items.map(({ c, count, image }, i) => (
          <li key={c.slug} className="w-[78vw] shrink-0 snap-start xs:w-[60vw] md:w-auto">
            <Reveal delay={i * 0.06}>
              <Link href={curatedHref(c)} className="group/launch block">
                <div className="relative aspect-[4/5] overflow-hidden bg-paper">
                  <div className="absolute inset-0 transition-transform duration-[1400ms] ease-out-expo group-hover/launch:scale-[1.04]">
                    <Picture shot={image} alt="" sizes="(min-width: 768px) 32vw, 78vw" ratio="fill" />
                  </div>
                  {c.isLaunch ? <span className="absolute top-3 left-3 bg-white px-2.5 py-1 text-[10.5px] tracking-[0.14em] text-ink uppercase">New launch</span> : null}
                </div>
                <p className="label-sm mt-4 text-ink-3">{c.eyebrow || pluralise(count, "piece")}</p>
                <p className="mt-1.5 text-[18px] leading-snug tracking-[-0.01em]">{c.title}</p>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
