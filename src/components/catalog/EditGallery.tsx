import Link from "next/link";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/ui/Reveal";
import { productHref, type Catalog } from "@/data/catalog";
import type { EditShot } from "@/data/types";
import { shot } from "@/lib/media";

/**
 * For categories that have not been photographed as products yet: where the
 * piece appears across the rest of the collection, each photograph linked to
 * the garment it was taken with.
 */
export function EditGallery({ cat, shots, name }: { cat: Catalog; shots: EditShot[]; name: string }) {
  return (
    <ul className="columns-2 gap-1 px-1 lg:columns-3" aria-label={`${name}, as seen across the collection`}>
      {shots.map((entry, i) => {
        const image = shot(entry.image);
        const product = cat.productForImage(entry.image);
        return (
          <Reveal as="li" key={entry.image} delay={(i % 3) * 0.06} className="mb-1 break-inside-avoid">
            <figure>
              <Picture shot={image} alt={entry.caption} sizes="(min-width: 1024px) 33vw, 50vw" />
              <figcaption className="px-2 pt-3 pb-5">
                <p className="text-[13.5px] leading-snug text-ink">{entry.caption}</p>
                {product ? (
                  <p className="mt-1 text-[12px] text-ink-3">
                    Photographed with{" "}
                    <Link href={productHref(product)} className="link-under text-ink">
                      {product.name}
                    </Link>
                  </p>
                ) : null}
              </figcaption>
            </figure>
          </Reveal>
        );
      })}
    </ul>
  );
}
