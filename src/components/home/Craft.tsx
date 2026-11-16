import { ButtonLink } from "@/components/ui/Button";
import { LoopVideo, type FilmSource } from "@/components/ui/LoopVideo";
import { Picture } from "@/components/ui/Picture";
import { Reveal, RevealMask } from "@/components/ui/Reveal";
import type { Shot } from "@/lib/media";

const STEPS = [
  { title: "The pattern", text: "Your measurements become a paper pattern, drawn for you alone." },
  { title: "The basted fitting", text: "The cloth is tacked together in white thread and tried on, then taken apart and corrected." },
  { title: "The finish", text: "Canvas, lining, buttonholes and embroidery are worked by hand before the final pressing." },
];

/** The workroom: atelier footage beside the three stages every commission passes through. */
export function Craft({ film, still }: { film: FilmSource; still: Shot }) {
  return (
    <section className="bg-ink text-white" aria-labelledby="craft-title">
      <div className="on-dark grid gap-x-10 gap-y-12 px-gutter py-20 md:py-28 lg:grid-cols-12 lg:items-center">
        <div className="relative lg:col-span-5">
          <RevealMask>
            <LoopVideo film={film} label="A tailor basting the canvas of a navy suit by hand" className="aspect-[4/5] w-full" />
          </RevealMask>
          <RevealMask delay={0.15} className="absolute -right-3 -bottom-10 hidden w-[42%] border-4 border-ink md:block lg:-right-16">
            <Picture shot={still} alt="A client's suit in the Sartorial cloth room" sizes="20vw" ratio="4 / 5" />
          </RevealMask>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <Reveal>
            <p className="label text-white/70">The workroom</p>
            <h2 id="craft-title" className="headline mt-5 max-w-[14ch]">
              The hand leaves a line a machine cannot.
            </h2>
          </Reveal>
          <ol className="mt-12 border-t border-white/20">
            {STEPS.map((step, i) => (
              <Reveal as="li" key={step.title} delay={0.08 * i} className="grid grid-cols-[3rem_1fr] gap-x-4 border-b border-white/20 py-6 md:grid-cols-[4rem_14rem_1fr]">
                <span className="label-sm pt-1.5 text-white/60 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="text-[20px] leading-tight font-light tracking-[-0.02em]">{step.title}</h3>
                <p className="col-start-2 mt-2 text-[14px] leading-relaxed text-white/75 md:col-start-3 md:mt-0">{step.text}</p>
              </Reveal>
            ))}
          </ol>
          <Reveal delay={0.2} className="mt-10 flex flex-col gap-3 xs:flex-row">
            <ButtonLink href="/bespoke" variant="light">
              The bespoke process
            </ButtonLink>
            <ButtonLink href="/appointments" variant="outline-light">
              Book a fitting
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
