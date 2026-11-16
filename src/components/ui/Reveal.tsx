"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Seconds to wait after entering the viewport. */
  delay?: number;
  /** Pixels of upward travel. */
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "figure";
};

const EASE = [0.16, 1, 0.3, 1] as const;

/** Fades and lifts its children into place the first time they scroll into view. */
export function Reveal({ children, delay = 0, y = 22, className, as = "div" }: RevealProps) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      data-reveal
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 1, delay, ease: EASE }}
    >
      {children}
    </Tag>
  );
}

/** Wipes an image frame open from the bottom edge as it enters the viewport. */
export function RevealMask({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      data-reveal
      className={className}
      initial={reduce ? false : { clipPath: "inset(100% 0% 0% 0%)" }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1.3, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
