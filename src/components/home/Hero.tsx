"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/Icon";
import { LoopVideo, type FilmSource } from "@/components/ui/LoopVideo";
import { useIntroRevealed } from "@/lib/use-intro";

type HeroProps = {
  desktop: FilmSource;
  tablet: FilmSource;
  mobile: FilmSource;
};

const EASE = [0.16, 1, 0.3, 1] as const;
const LINES = ["Cut by hand.", "Made for one."];

const fadeUp = (y: number) => ({ hidden: { opacity: 0, y }, shown: { opacity: 1, y: 0 } });
const LABEL = fadeUp(10);
const RISE = { hidden: { y: "105%" }, shown: { y: 0 } };
const ACTIONS = fadeUp(14);

/**
 * The opening frame: the atelier film, full-bleed and silent, with the house
 * line set large over it. A hairline at the foot tracks the film; the control
 * beside it pauses the footage for anyone who would rather it stood still.
 */
export function Hero({ desktop, tablet, mobile }: HeroProps) {
  const reduce = useReducedMotion();
  // The words wait for the opening animation's curtain to lift, so they are seen arriving.
  const revealed = useIntroRevealed();
  const initial = reduce ? false : "hidden";
  const animate = revealed || reduce ? "shown" : "hidden";
  const [paused, setPaused] = useState(false);
  const bar = useRef<HTMLSpanElement>(null);

  return (
    <section className="on-dark relative isolate flex min-h-[620px] flex-col justify-end overflow-hidden bg-ink text-white" style={{ height: "100svh" }} aria-label="Sartorial: bespoke tailoring">
      <LoopVideo
        film={desktop}
        sources={[
          { media: "(max-width: 767px) and (orientation: portrait)", film: mobile },
          { media: "(max-width: 1279px)", film: tablet },
        ]}
        label="Hands chalking, cutting and stitching a suit in the Sartorial atelier"
        paused={paused || !revealed}
        priority
        fill
        onProgress={(f) => {
          if (bar.current) bar.current.style.transform = `scaleX(${f})`;
        }}
        className="-z-10"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(18,17,14,0.55)_0%,rgba(18,17,14,0)_26%,rgba(18,17,14,0)_48%,rgba(18,17,14,0.72)_100%)]" />

      <div className="px-gutter pb-9 md:pb-12">
        <motion.p
          className="label mb-5 text-white/80 md:mb-7"
          data-reveal
          variants={LABEL}
          initial={initial}
          animate={animate}
          transition={{ duration: 1, delay: 0.25, ease: EASE }}
        >
          Bespoke tailoring&ensp;·&ensp;Dhaka
        </motion.p>

        <h1 className="display max-w-[15ch]">
          {LINES.map((line, i) => (
            <span key={line} className="block overflow-hidden pb-[0.06em]">
              <motion.span
                className="block"
                data-reveal
                variants={RISE}
                initial={initial}
                animate={animate}
                transition={{ duration: 1.25, delay: 0.35 + i * 0.12, ease: EASE }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.div
          className="mt-8 flex flex-col gap-8 md:mt-10 md:flex-row md:items-end md:justify-between"
          data-reveal
          variants={ACTIONS}
          initial={initial}
          animate={animate}
          transition={{ duration: 1.1, delay: 0.75, ease: EASE }}
        >
          <div className="flex flex-col gap-3 xs:flex-row">
            <ButtonLink href="/clothing/heritage" variant="light">
              Explore Heritage
            </ButtonLink>
            <ButtonLink href="/clothing/classic" variant="outline-light">
              Explore Classic
            </ButtonLink>
          </div>

          <div className="flex items-center gap-4 text-white/80">
            <IconButton
              name="playPause"
              size={22}
              active={paused}
              pressed={paused}
              label={paused ? "Play the film" : "Pause the film"}
              onClick={() => setPaused((p) => !p)}
              className="h-11 w-11 border border-white/40 text-white hover:opacity-100 hover:border-white"
            />
            <p className="text-[12px] leading-snug tracking-[0.04em]">
              <Link href="/bespoke#film" className="link-under text-white">
                Watch it in full
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      <div aria-hidden className="h-px w-full bg-white/20">
        <span ref={bar} className="block h-full w-full origin-left scale-x-0 bg-white/90 transition-transform duration-300 ease-linear" />
      </div>
    </section>
  );
}
