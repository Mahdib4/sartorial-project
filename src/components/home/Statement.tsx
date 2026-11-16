import { TextReveal } from "@/components/interior/text-reveal";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

/** The house in one paragraph, set large and read in as it scrolls into view. */
export function Statement() {
  return (
    <section className="px-gutter py-20 md:py-32" aria-labelledby="statement-title">
      <div className="grid gap-10 lg:grid-cols-12">
        <p className="label text-ink-3 lg:col-span-3 lg:pt-3">The house</p>
        <div className="lg:col-span-9">
          <h2 id="statement-title" className="headline max-w-[24ch] text-balance">
            <span data-text-reveal>
              <TextReveal text="Sartorial is a tailoring house in Dhaka. We make two wardrobes: Heritage, for the wedding and the festival, and Classic, for every other day." stagger={0.028} maxDuration={1.8} />
            </span>
          </h2>
          <Reveal delay={0.25} className="mt-10 grid gap-8 md:grid-cols-2 md:gap-12">
            <p className="max-w-md text-[16px] leading-relaxed text-ink-2">
              Both are made the same way. A pattern is drawn for one person, the cloth is cut by hand, and the garment is basted, fitted and finished by hand. Sherwanis are embroidered in zardosi; suits are built over a hand-padded canvas.
            </p>
            <div className="flex flex-col items-start gap-3 xs:flex-row md:justify-end">
              <ButtonLink href="/bespoke">The bespoke process</ButtonLink>
              <ButtonLink href="/appointments" variant="outline">
                Book a fitting
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
