import type { Metadata } from "next";
import { CardStack } from "@/components/bencho/card-stack/CardStack";
import { ScrollSpy } from "@/components/interior/scroll-spy";
import { TextReveal } from "@/components/interior/text-reveal";
import { ButtonLink } from "@/components/ui/Button";
import { FilmPlayer } from "@/components/ui/FilmPlayer";
import { LoopVideo } from "@/components/ui/LoopVideo";
import { Picture } from "@/components/ui/Picture";
import { Reveal, RevealMask } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import { film, shot } from "@/lib/media";

export const metadata: Metadata = {
  title: "The bespoke process",
  description: "How a Sartorial garment is made: the pattern, the basted fitting, the canvas, the embroidery and the finish, by hand in Dhaka.",
  alternates: { canonical: "/bespoke" },
};

const C = "classic/suits";

type Step = { id: string; title: string; text: string; image?: string; video?: string; alt: string };

const STEPS: Step[] = [
  { id: "consultation", title: "The consultation", text: "We begin with a conversation: the occasion, how you like your clothes to sit, what you already own. Then the cloth, chosen from the bolt.", image: `${C}/mid-grey-flannel-two-piece-suit-03`, alt: "A client seated in the Sartorial cloth room beside shelves of suiting" },
  { id: "pattern", title: "The pattern", text: "Your measurements are taken by hand and drawn out as a paper pattern: made for you, not adjusted from a standard size.", image: "still/atelier-pattern", alt: "A tailor drawing a pattern with a rule and chalk" },
  { id: "cutting", title: "The cut", text: "The cloth is laid out, chalked from the pattern and cut by hand with shears.", image: "still/atelier-cloth", alt: "Hands laying a paper pattern on dark suiting cloth" },
  { id: "basting", title: "The basted fitting", text: "The pieces are tacked together in long white stitches and tried on you. Balance, length and shoulder are corrected on the body, then the garment is taken apart again.", video: `${C}/bespoke-navy-suit-hand-basting-craftsmanship-01`, alt: "A tailor hand-basting the front of a navy suit" },
  { id: "canvas", title: "The canvas", text: "Inside every jacket sits a canvas that gives the chest its shape. Ours is pad-stitched to the cloth by hand, so the lapel rolls rather than folds.", video: `${C}/bespoke-navy-suit-lapel-canvas-craftsmanship-02`, alt: "A lapel canvas being pad-stitched by hand" },
  { id: "finishing", title: "The finish", text: "Buttonholes are sewn by hand, the label is stitched in, and the garment is pressed for its final fitting.", image: "still/atelier-buttonhole", alt: "A buttonhole being sewn by hand" },
];

export default function BespokePage() {
  const atelierFilm = film(`${C}/vitale-barberis-canonico-bespoke-suit-tailoring-film`);

  return (
    <main>
      {/* Opening */}
      <section className="on-dark relative isolate flex min-h-[560px] flex-col justify-end overflow-hidden bg-ink text-white" style={{ height: "86svh" }}>
        <LoopVideo
          film={film("film/hero-desktop")}
          sources={[
            { media: "(max-width: 767px) and (orientation: portrait)", film: film("film/hero-mobile") },
            { media: "(max-width: 1279px)", film: film("film/hero-tablet") },
          ]}
          label="Hands chalking, cutting and stitching a suit in the Sartorial atelier"
          fill
          priority
          className="-z-10"
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(18,17,14,0.55)_0%,rgba(18,17,14,0)_28%,rgba(18,17,14,0)_45%,rgba(18,17,14,0.78)_100%)]" />
        <div className="grid gap-6 px-gutter pb-10 md:pb-14 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="label mb-5 text-white/80">The house · How it is made</p>
            <h1 className="display">Bespoke</h1>
          </div>
          <p className="max-w-md text-[15px] leading-relaxed text-white/85 lg:col-span-5 lg:justify-self-end lg:pb-3">Bespoke means the garment did not exist before you ordered it. This is how it comes into being.</p>
        </div>
      </section>

      {/* Section navigation */}
      <div className="top-header sticky z-20 border-b border-line-soft bg-white/95 backdrop-blur-sm">
        <ScrollSpy
          orientation="horizontal"
          label="On this page"
          className="px-gutter"
          sections={[
            { id: "film", label: "The film" },
            { id: "process", label: "The process" },
            { id: "embroidery", label: "Embroidery" },
            { id: "cloth-room", label: "The cloth room" },
            { id: "book", label: "Book a fitting" },
          ]}
        />
      </div>

      {/* Statement */}
      <section className="px-gutter py-20 md:py-28">
        <h2 className="headline max-w-[26ch] text-balance">
          <span data-text-reveal>
              <TextReveal text="A suit bought from a rail was made for no one in particular. A bespoke suit is made for one person, and most of the work in it is never seen." stagger={0.026} maxDuration={1.8} />
            </span>
        </h2>
      </section>

      {/* The film */}
      <section id="film" className="scroll-mt-40 md:px-gutter" aria-labelledby="film-title">
        <div className="mb-6 flex items-end justify-between px-gutter md:px-0">
          <h2 id="film-title" className="label text-ink-3">
            The film
          </h2>
        </div>
        <FilmPlayer film={atelierFilm} title="the Sartorial atelier film" credit="An art film by Sheikh Ali, produced by Studio Baklava. Cloth by Vitale Barberis Canonico. Handcrafted in Bangladesh." />
      </section>

      {/* The process */}
      <section id="process" className="scroll-mt-40 py-20 md:py-28" aria-labelledby="process-title">
        <div className="mb-12 px-gutter md:mb-20">
          <p className="label mb-4 text-ink-3">The process</p>
          <h2 id="process-title" className="headline max-w-[16ch]">
            Six stages, all of them by hand.
          </h2>
        </div>
        <ol>
          {STEPS.map((step, i) => (
            <li key={step.id} id={step.id} className="grid gap-x-10 gap-y-6 border-t border-line-soft px-gutter py-10 md:py-14 lg:grid-cols-12 lg:items-center">
              <Reveal className={cn("lg:col-span-5", i % 2 ? "lg:order-2 lg:col-start-8" : "")}>
                <p className="label-sm text-mute tabular-nums">
                  {String(i + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
                </p>
                <h3 className="headline-sm mt-4 text-[clamp(1.6rem,2.6vw,2.4rem)]">{step.title}</h3>
                <p className="mt-4 max-w-md text-[15.5px] leading-relaxed text-ink-2">{step.text}</p>
              </Reveal>
              <RevealMask className={cn("lg:col-span-6", i % 2 ? "lg:order-1" : "lg:col-start-7")}>
                {step.video ? (
                  <LoopVideo film={film(step.video)} label={step.alt} className="aspect-[4/5] w-full sm:aspect-[16/11]" />
                ) : (
                  <Picture shot={shot(step.image!)} alt={step.alt} sizes="(min-width: 1024px) 50vw, 100vw" ratio="16 / 11" className="aspect-[4/5]! sm:aspect-[16/11]!" />
                )}
              </RevealMask>
            </li>
          ))}
        </ol>
      </section>

      {/* Embroidery */}
      <section id="embroidery" className="scroll-mt-40 bg-ink text-white" aria-labelledby="embroidery-title">
        <div className="on-dark grid gap-x-10 gap-y-10 px-gutter py-20 md:py-28 lg:grid-cols-12 lg:items-center">
          <Reveal className="lg:col-span-5">
            <p className="label text-white/70">Heritage</p>
            <h2 id="embroidery-title" className="headline mt-5 max-w-[12ch]">
              Zardosi, a thread at a time.
            </h2>
            <p className="mt-6 max-w-md text-[15.5px] leading-relaxed text-white/80">
              Zardosi is embroidery in metal thread: fine wire, beads and pearls laid onto silk and stitched down by hand. On a sherwani it gathers at the collar and cuff and then scatters, or covers the coat from shoulder to hem.
            </p>
            <div className="mt-8 flex flex-col gap-3 xs:flex-row">
              <ButtonLink href="/clothing/heritage/sherwanis" variant="light">
                Sherwanis
              </ButtonLink>
              <ButtonLink href="/clothing/heritage" variant="outline-light">
                All Heritage
              </ButtonLink>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 gap-1 lg:col-span-7">
            <RevealMask className="row-span-2">
              <Picture shot={shot("heritage/sherwanis/emerald-dupioni-silk-sherwani-with-zardosi-05")} alt="A gold zardosi cuff on emerald dupioni silk" sizes="(min-width: 1024px) 29vw, 50vw" ratio="4 / 5" className="h-full" />
            </RevealMask>
            <RevealMask delay={0.08}>
              <Picture shot={shot("still/champagne-gold-zardosi-sherwani-03")} alt="Gold zardosi on a champagne ground with a pearl-edged velvet stole" sizes="(min-width: 1024px) 29vw, 50vw" ratio="16 / 10" />
            </RevealMask>
            <RevealMask delay={0.16}>
              <Picture shot={shot("still/midnight-navy-gold-zardosi-sherwani-02")} alt="Gold zardosi leaves on midnight navy" sizes="(min-width: 1024px) 29vw, 50vw" ratio="16 / 10" />
            </RevealMask>
          </div>
        </div>
      </section>

      {/* The cloth room */}
      <section id="cloth-room" className="scroll-mt-40 grid gap-x-10 gap-y-12 px-gutter py-20 md:py-28 lg:grid-cols-12 lg:items-center" aria-labelledby="cloth-title">
        <Reveal className="lg:col-span-5">
          <p className="label text-ink-3">The cloth room</p>
          <h2 id="cloth-title" className="headline mt-5 max-w-[12ch]">
            Everything starts at the bolt.
          </h2>
          <p className="mt-6 max-w-md text-[15.5px] leading-relaxed text-ink-2">Worsteds for the working week, flannel and tweed for the cooler months, cotton twill for the heat, silk for the wedding. Reach into the stack: the photographs fan out, and a card comes forward when you choose it.</p>
        </Reveal>
        <div className="overflow-hidden py-10 lg:col-span-7">
          <CardStack
            className="mx-auto max-w-[720px]!"
            spread={80}
            images={[
              { src: shot("classic/sports-jackets/charcoal-textured-wool-sports-jacket-01").src, srcSet: shot("classic/sports-jackets/charcoal-textured-wool-sports-jacket-01").srcSet, sizes: "(min-width: 1024px) 26vw, 46vw", alt: "A client beside shelves of cloth in the Sartorial salon" },
              { src: shot("classic/suits/mid-grey-flannel-two-piece-suit-04").src, srcSet: shot("classic/suits/mid-grey-flannel-two-piece-suit-04").srcSet, sizes: "(min-width: 1024px) 26vw, 46vw", alt: "Mid-grey flannel suit beside bolts of cloth" },
              { src: shot("classic/casual-jackets/dark-olive-cotton-twill-casual-field-jacket-01").src, srcSet: shot("classic/casual-jackets/dark-olive-cotton-twill-casual-field-jacket-01").srcSet, sizes: "(min-width: 1024px) 26vw, 46vw", alt: "A dark olive field jacket in the cloth room" },
              { src: shot("classic/suits/charcoal-double-breasted-bespoke-suit-01").src, srcSet: shot("classic/suits/charcoal-double-breasted-bespoke-suit-01").srcSet, sizes: "(min-width: 1024px) 26vw, 46vw", alt: "A charcoal double-breasted suit at the salon counter" },
              { src: shot("classic/shirts/bespoke-pinstripe-and-poplin-shirts-stack-01").src, srcSet: shot("classic/shirts/bespoke-pinstripe-and-poplin-shirts-stack-01").srcSet, sizes: "(min-width: 1024px) 26vw, 46vw", alt: "A stack of folded shirts in stripe and poplin" },
            ]}
          />
        </div>
      </section>

      {/* Book */}
      <section id="book" className="scroll-mt-40 bg-paper px-gutter py-20 text-center md:py-28">
        <Reveal>
          <p className="label text-ink-3">By appointment</p>
          <h2 className="headline mx-auto mt-5 max-w-[16ch]">The first fitting is a conversation.</h2>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 xs:flex-row">
            <ButtonLink href="/appointments">Book a fitting</ButtonLink>
            <ButtonLink href="/clothing" variant="outline">
              See the collections
            </ButtonLink>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
