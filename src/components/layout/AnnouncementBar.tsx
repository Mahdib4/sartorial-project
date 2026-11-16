"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CollapsibleBanner } from "@/components/interior/collapsible-banner";
import { SITE } from "@/config/site";
import { cn } from "@/lib/cn";

const KEY = "sartorial:announcement-dismissed";
const HEIGHT = 36;

/**
 * The slim notice above the navigation. It rotates through the messages in
 * site config, can be dismissed for the session, and publishes its height as
 * --banner-h so the page beneath can make room for it.
 */
export function AnnouncementBar({ overlay }: { overlay: boolean }) {
  const reduce = useReducedMotion();
  const messages = SITE.announcement;
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
    document.documentElement.style.setProperty("--banner-h", dismissed ? "0px" : `${HEIGHT}px`);
  }, [dismissed]);

  useEffect(() => {
    if (dismissed || reduce || messages.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % messages.length), 6500);
    return () => window.clearInterval(id);
  }, [dismissed, reduce, messages.length]);

  const message = messages[index];

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
        bar: "h-9 overflow-hidden",
        title: "truncate",
        dismiss: overlay ? "text-white/70 hover:text-white" : undefined,
      }}
      title={
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={index}
            className="inline-flex items-center gap-3"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="hidden sm:inline">{message.text}</span>
            <span aria-hidden className="hidden h-2.5 w-px bg-current opacity-40 sm:inline-block" />
            <Link href={message.href} className="link-under">
              {message.cta}
            </Link>
          </motion.span>
        </AnimatePresence>
      }
    />
  );
}
