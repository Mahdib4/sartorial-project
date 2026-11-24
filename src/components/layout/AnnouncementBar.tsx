"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CollapsibleBanner } from "@/components/interior/collapsible-banner";
import { cn } from "@/lib/cn";

const KEY = "sartorial:announcement-dismissed";
const HEIGHT = 36;

export type Notice = { id: number; text: string; href: string | null; cta: string };

/**
 * The slim notice above the navigation. It rotates through the notices set in
 * the admin (Banners & notices → Announcement bar), can be dismissed for the
 * session, and publishes its height as --banner-h so the page beneath can make
 * room for it. With no live notices it is not shown at all.
 */
export function AnnouncementBar({ overlay, notices }: { overlay: boolean; notices: Notice[] }) {
  const reduce = useReducedMotion();
  const messages = notices;
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let stored = false;
    try {
      stored = window.sessionStorage.getItem(KEY) === "1";
    } catch {
      // sessionStorage unavailable: show the bar
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- storage is only readable after mount
    if (stored) setDismissed(true);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--banner-h", dismissed || messages.length === 0 ? "0px" : `${HEIGHT}px`);
  }, [dismissed, messages.length]);

  useEffect(() => {
    if (dismissed || reduce || messages.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % messages.length), 6500);
    return () => window.clearInterval(id);
  }, [dismissed, reduce, messages.length]);

  const message = messages[index % Math.max(messages.length, 1)];
  if (!message) return null;

  return (
    <CollapsibleBanner
      state={dismissed ? "dismissed" : "folded"}
      onDismiss={() => {
        setDismissed(true);
        try {
          window.sessionStorage.setItem(KEY, "1");
        } catch {
          // ignore
        }
      }}
      dismissLabel="Dismiss announcement"
      dismissedMessage="Announcement dismissed."
      className={cn("transition-colors duration-500", overlay ? "bg-white/10 text-white backdrop-blur-md" : "bg-paper text-ink")}
      classNames={{
        // Phones: the text starts nearer the left edge so more of the message fits beside the dismiss button.
        bar: "h-9 overflow-hidden max-sm:pr-10 max-sm:pl-4",
        title: "w-full truncate py-0! max-sm:tracking-[0.16em]",
        dismiss: overlay ? "text-white/70 hover:text-white" : undefined,
      }}
      title={
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={index}
            className="flex h-9 min-w-0 items-center justify-center"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* The message always shows (cut short with "…" if the screen is too narrow). With a link, the whole bar is the link. */}
            {message.href ? (
              <Link href={message.href} className="group/notice flex h-9 w-full min-w-0 items-center justify-center gap-3">
                <span className="min-w-0 truncate">{message.text}</span>
                {message.cta ? (
                  <>
                    <span aria-hidden className="hidden h-2.5 w-px shrink-0 bg-current opacity-40 sm:inline-block" />
                    <span className="link-under hidden shrink-0 sm:inline">{message.cta}</span>
                  </>
                ) : null}
                <svg aria-hidden viewBox="0 0 16 16" className="-ml-1 h-2.5 w-2.5 shrink-0 transition-transform duration-500 ease-out-expo group-hover/notice:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M5.5 2.5 11 8l-5.5 5.5" />
                </svg>
              </Link>
            ) : (
              <span className="min-w-0 truncate">{message.text}</span>
            )}
          </motion.span>
        </AnimatePresence>
      }
    />
  );
}
