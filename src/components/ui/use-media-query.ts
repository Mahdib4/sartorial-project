"use client";

import { useSyncExternalStore } from "react";

/**
 * Whether a media query matches, kept in step as the viewport changes.
 * Renders with `fallback` on the server and during hydration, so use it for
 * things that are not on screen at first paint (a closed sheet, a hidden bar).
 */
export function useMediaQuery(query: string, fallback = false): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => fallback,
  );
}

/** Phones in portrait and landscape: below the `md` breakpoint (48rem). */
export const PHONE = "(max-width: 47.99rem)";
