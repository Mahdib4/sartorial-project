"use client";

import { useSyncExternalStore } from "react";
import { INTRO_EVENT } from "@/lib/intro-script";

function subscribe(onChange: () => void) {
  window.addEventListener(INTRO_EVENT, onChange);
  return () => window.removeEventListener(INTRO_EVENT, onChange);
}

function isRevealed() {
  const root = document.documentElement;
  const phase = root.getAttribute("data-intro");
  const running = phase === "wait" || phase === "play" || phase === "leave";
  return !running || root.hasAttribute("data-intro-revealed");
}

/**
 * False while the opening animation covers the page; true once its curtain starts
 * to lift (or straight away when it is not playing). Lets an entrance animation
 * wait to be seen. Always false during server rendering and hydration.
 */
export function useIntroRevealed(): boolean {
  return useSyncExternalStore(subscribe, isRevealed, () => false);
}
