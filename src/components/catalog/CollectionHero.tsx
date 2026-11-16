import { LoopVideo, type FilmSource } from "@/components/ui/LoopVideo";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/ui/Reveal";
import type { Shot } from "@/lib/media";

type CollectionHeroProps = {
  eyebrow: string;
  title: string;
  intro: string;
  image: Shot;
  imageAlt: string;
  imagePosition?: string;
  film?: FilmSource;
  filmLabel?: string;
};

/** The opening of a collection: a full-bleed film or photograph beneath the transparent header. */
export function CollectionHero({ eyebrow, title, intro, image, imageAlt, imagePosition, film, filmLabel }: CollectionHeroProps) {
  return (
    <section className="on-dark relative isolate flex min-h-[540px] flex-col justify-end overflow-hidden bg-ink text-white" style={{ height: "82svh" }}>
      {film ? (
        <LoopVideo film={film} label={filmLabel ?? imageAlt} fill priority className="-z-10" />
      ) : (
        <Picture shot={image} alt={imageAlt} sizes="100vw" ratio="fill" priority position={imagePosition} className="-z-10" />
      )}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(18,17,14,0.66)_0%,rgba(18,17,14,0.3)_16%,rgba(18,17,14,0)_32%,rgba(18,17,14,0)_45%,rgba(18,17,14,0.78)_100%)]" />
      <Reveal className="grid gap-6 px-gutter pb-10 md:pb-14 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="label mb-5 text-white/80">{eyebrow}</p>
          <h1 className="display">{title}</h1>
        </div>
        <p className="max-w-md text-[15px] leading-relaxed text-white/85 lg:col-span-5 lg:justify-self-end lg:pb-3">{intro}</p>
      </Reveal>
    </section>
  );
}
