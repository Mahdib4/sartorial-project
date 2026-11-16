import type { Metadata } from "next";
import { ImageAccordion } from "@/components/bencho/image-accordion/ImageAccordion";
import { CategoryExplorer } from "@/components/home/CategoryExplorer";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { navGroups } from "@/data/navigation";
import { pluralise } from "@/lib/format";
import { shot } from "@/lib/media";

export const metadata: Metadata = {
  title: "Clothing: Heritage and Classic",
  description: "The two Sartorial wardrobes: Heritage sherwanis, achkans, bandhgalas and Jodhpuri jackets, and Classic suits, jackets, shirts and trousers.",
  alternates: { canonical: "/clothing" },
};

const BANNER: Record<string, string> = {
  heritage: "heritage/stoles/ivory-gold-embroidered-border-heritage-stole-ensemble-06",
  classic: "classic/suits/light-grey-double-breasted-peak-lapel-suit-01",
};

export default function ClothingPage() {
  const groups = navGroups().filter((g) => g.department === "Clothing");

  return (
    <main>
      {/* Two wardrobes, side by side beneath the header */}
      <section className="relative bg-ink" aria-label="Clothing collections">
        <h1 className="sr-only">Clothing</h1>
        {/* Keeps the transparent header legible over light photographs. */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-10 h-44 bg-gradient-to-b from-ink/70 to-transparent" />
        <ImageAccordion
          className="h-auto md:h-[100svh] md:min-h-[600px]"
          open={64}
          reach={40}
          gap={4}
          items={groups.map((group) => {
            const image = shot(BANNER[group.key]);
            return {
              src: image.src,
              srcSet: image.srcSet,
              sizes: "(min-width: 768px) 64vw, 100vw",
              alt: `${group.name}: ${group.tagline}`,
              label: group.name,
              sublabel: `${group.tagline} · ${pluralise(group.count, "piece")}`,
              href: group.href,
            };
          })}
        />
      </section>

      <section className="py-20 md:py-28" aria-labelledby="clothing-explorer">
        <SectionHeading eyebrow="Clothing" title={<span id="clothing-explorer">Fourteen categories, two wardrobes.</span>} className="mb-10 md:mb-14" />
        <CategoryExplorer groups={groups} />
      </section>

      <section className="bg-paper px-gutter py-16 text-center md:py-24">
        <Reveal>
          <p className="label text-ink-3">By appointment</p>
          <h2 className="headline mx-auto mt-5 max-w-[20ch]">Not sure where to begin? Begin with a fitting.</h2>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 xs:flex-row">
            <ButtonLink href="/appointments">Book a fitting</ButtonLink>
            <ButtonLink href="/bespoke" variant="outline">
              How it works
            </ButtonLink>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
