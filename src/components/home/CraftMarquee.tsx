"use client";

import { LogoMarquee } from "@/components/interior/logo-marquee";

const WORDS = ["Patterns drawn by hand", "Hand-basted fittings", "Hand-padded canvas", "Zardosi embroidery", "Hand-sewn buttonholes", "Raw and dupioni silks", "Flannel, worsted and tweed", "Made to measure in Dhaka"];

/** The vocabulary of the workroom, drifting past. Pauses under the pointer. */
export function CraftMarquee() {
  return (
    <LogoMarquee
      label="What goes into a Sartorial garment"
      speed={42}
      gap={44}
      fade={0}
      className="border-y border-line py-6 md:py-7"
      classNames={{ face: "text-[clamp(1.25rem,2.4vw,2.1rem)] font-light tracking-[-0.02em] text-ink" }}
      separator={<span aria-hidden className="h-1.5 w-1.5 rotate-45 bg-accent" />}
      items={WORDS.map((label) => ({ id: label, label }))}
    />
  );
}
