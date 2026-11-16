import { ButtonLink } from "@/components/ui/Button";
import { LoopVideo, type FilmSource } from "@/components/ui/LoopVideo";
import { Reveal } from "@/components/ui/Reveal";

type FilmBandProps = {
  film: FilmSource;
  label: string;
  eyebrow: string;
  title: string;
  links: Array<{ label: string; href: string }>;
};

/** A full-bleed film with its title and links set centre-bottom over the footage. */
export function FilmBand({ film, label, eyebrow, title, links }: FilmBandProps) {
  return (
    <section className="on-dark relative isolate flex min-h-[560px] items-end justify-center overflow-hidden bg-ink text-white" style={{ height: "92svh" }} aria-label={title}>
      <LoopVideo film={film} label={label} fill className="-z-10" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(18,17,14,0.72)_0%,rgba(18,17,14,0)_45%)]" />
      <Reveal className="px-gutter pb-12 text-center md:pb-16">
        <p className="label text-white/80">{eyebrow}</p>
        <h2 className="display-md mx-auto mt-5 max-w-[16ch]">{title}</h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {links.map((link) => (
            <ButtonLink key={link.href} href={link.href} variant="outline-light" size="sm">
              {link.label}
            </ButtonLink>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
