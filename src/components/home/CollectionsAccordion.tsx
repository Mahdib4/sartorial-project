import { ImageAccordion } from "@/components/bencho/image-accordion/ImageAccordion";
import type { NavGroup } from "@/data/navigation";
import { pluralise } from "@/lib/format";

/**
 * The four collections as one band of photographs. Pointing at a panel opens
 * it and its neighbours give way; clicking goes to that collection.
 */
export function CollectionsAccordion({ groups }: { groups: NavGroup[] }) {
  return (
    <section aria-label="Collections" className="px-1">
      <ImageAccordion
        className="h-auto md:h-[78vh] md:min-h-[520px]"
        open={58}
        reach={30}
        gap={4}
        items={groups.map((group) => ({
          src: group.cover.src,
          srcSet: group.cover.srcSet,
          sizes: "(min-width: 768px) 50vw, 100vw",
          alt: `${group.name}: ${group.tagline}`,
          label: group.name,
          sublabel: group.count > 0 ? `${group.tagline} · ${pluralise(group.count, "piece")}` : group.tagline,
          href: group.href,
        }))}
      />
    </section>
  );
}
