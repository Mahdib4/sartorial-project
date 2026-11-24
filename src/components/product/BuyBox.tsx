"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Like } from "@/components/bencho/like/Like";
import { MagneticSelect } from "@/components/bencho/magnet-select/MagneticSelect";
import { LoadingButton } from "@/components/interior/loading-button";
import { PriceTag } from "@/components/product/PriceTag";
import { SizeGuide } from "@/components/product/SizeGuide";
import { ButtonLink } from "@/components/ui/Button";
import { useMediaQuery } from "@/components/ui/use-media-query";
import { BESPOKE_SIZE, type SizeScale } from "@/config/site";
import { cn } from "@/lib/cn";
import { useShop } from "@/store/shop";

type BuyBoxProps = {
  slug: string;
  name: string;
  scale: SizeScale;
  /** Shown in the bar that follows you down the page on phones. */
  price?: number | null;
  compareAt?: number | null;
};

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Size, add to bag, save. Sizes are chosen on a magnetic picker; tailoring can
 * instead be marked "Made to measure". The button will not add a piece until a
 * size is chosen, and says so.
 *
 * On phones and tablets, once the button has scrolled away, a slim bar keeps
 * "Add to bag" at the foot of the screen. With no size chosen it brings the
 * size picker back into view instead of adding.
 */
export function BuyBox({ slug, name, scale, price = null, compareAt = null }: BuyBoxProps) {
  const { add, isSaved, toggleSaved, ready, markViewed, open, overlay } = useShop();
  const reduce = useReducedMotion();
  const touchLayout = useMediaQuery("(max-width: 63.99rem)");
  const pickerRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [past, setPast] = useState(false);
  const [footerInView, setFooterInView] = useState(false);
  const [barState, setBarState] = useState<"idle" | "adding" | "added">("idle");
  const single = scale.sizes.length === 1 && !scale.allowBespoke;
  const [size, setSize] = useState<string | null>(single ? scale.sizes[0] : null);
  const [error, setError] = useState(false);
  const saved = ready && isSaved(slug);

  useEffect(() => {
    markViewed(slug);
  }, [slug, markViewed]);

  // Has the real button scrolled up out of view, and is the footer showing? Measured on scroll
  // (not with an IntersectionObserver, which misses a jump straight from one side to the other).
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const action = actionRef.current;
      if (!action) return;
      setPast(action.getBoundingClientRect().bottom < 0);
      const footer = document.querySelector("[data-site-footer]");
      setFooterInView(Boolean(footer && footer.getBoundingClientRect().top < window.innerHeight));
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const choose = (value: string | null) => {
    setSize(value);
    setError(false);
  };

  const barShown = touchLayout && past && !footerInView && overlay === null;

  // While the bar is up, publish its height as --buy-bar-h so the toasts ("Added to your bag") sit above it, not on it.
  useEffect(() => {
    const root = document.documentElement;
    const bar = barRef.current;
    if (!barShown || !bar) {
      root.style.removeProperty("--buy-bar-h");
      return;
    }
    const publish = () => root.style.setProperty("--buy-bar-h", `${bar.offsetHeight}px`);
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(bar);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--buy-bar-h");
    };
  }, [barShown]);

  const addFromBar = async () => {
    if (barState !== "idle") return;
    if (!size) {
      setError(true);
      const picker = pickerRef.current;
      if (picker) {
        picker.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
        // The sizes themselves (where Tab would land in them), not the "Size guide" link above them.
        const target =
          picker.querySelector<HTMLElement>('[role="radiogroup"] [role="radio"][tabindex="0"]') ??
          picker.querySelector<HTMLElement>('[role="radiogroup"] [role="radio"]:not(:disabled)');
        target?.focus({ preventScroll: true });
      }
      return;
    }
    setBarState("adding");
    await new Promise((resolve) => setTimeout(resolve, 380));
    add(slug, size);
    setBarState("added");
    window.setTimeout(() => setBarState("idle"), 1800);
  };

  return (
    <div>
      {!single ? (
        <div ref={pickerRef} className="scroll-mt-[calc(var(--header-h)+var(--banner-h)+1rem)]">
          <div className="mb-3 flex items-baseline justify-between">
            <p className="label text-ink">
              {scale.label}
              {size ? <span className="ml-3 tracking-[0.04em] text-ink-3 normal-case">{size}</span> : null}
            </p>
            <SizeGuide scale={scale} />
          </div>
          <MagneticSelect label={`${scale.label} for ${name}`} options={scale.sizes.map((s) => ({ value: s, label: s }))} value={size === BESPOKE_SIZE ? null : size} onChange={choose} />
          {scale.allowBespoke ? (
            <button
              type="button"
              role="switch"
              aria-checked={size === BESPOKE_SIZE}
              onClick={() => choose(size === BESPOKE_SIZE ? null : BESPOKE_SIZE)}
              className={cn(
                "mt-2 flex w-full items-center justify-between gap-4 border px-4 py-3.5 text-left transition-colors duration-300",
                size === BESPOKE_SIZE ? "border-ink bg-ink text-white" : "border-line text-ink hover:border-ink",
              )}
            >
              <span>
                <span className="block text-[13.5px]">{BESPOKE_SIZE}</span>
                <span className={cn("mt-0.5 block text-[12px]", size === BESPOKE_SIZE ? "text-white/70" : "text-ink-3")}>We take your measurements at a fitting</span>
              </span>
              <span aria-hidden className={cn("grid h-4 w-4 shrink-0 place-items-center border", size === BESPOKE_SIZE ? "border-white" : "border-ink-3")}>
                {size === BESPOKE_SIZE ? <span className="h-2 w-2 bg-white" /> : null}
              </span>
            </button>
          ) : null}
          <p role="alert" className={cn("mt-2 min-h-5 text-[12.5px] text-accent transition-opacity", error ? "opacity-100" : "opacity-0")}>
            {error ? "Please choose a size first." : ""}
          </p>
        </div>
      ) : null}

      <div ref={actionRef} className="mt-2 flex items-stretch gap-2">
        <LoadingButton
          className="flex-1"
          pendingLabel="Adding"
          successLabel="Added to bag"
          errorLabel="Choose a size"
          resetAfter={1800}
          onAction={async () => {
            if (!size) {
              setError(true);
              throw new Error("no-size");
            }
            // A short beat so the button's own confirmation can be read.
            await new Promise((resolve) => setTimeout(resolve, 380));
            add(slug, size);
          }}
        >
          Add to bag
        </LoadingButton>
        <span className="grid w-12 shrink-0 place-items-center border border-line text-ink">
          <Like active={saved} onChange={() => toggleSaved(slug)} label={saved ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`} size={18} color="Ink" variant="bare" />
        </span>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <ButtonLink href={`/appointments?piece=${slug}`} variant="outline" arrow={false} className="min-w-0 px-3">
          Book a fitting
        </ButtonLink>
        <button type="button" onClick={() => open("bag")} className="h-12 border border-line text-[13px] tracking-[0.04em] text-ink transition-colors duration-300 hover:border-ink">
          View bag
        </button>
      </div>

      {/* Phones and tablets: the button follows you down the page. */}
      <AnimatePresence>
        {barShown ? (
          <motion.div
            key="buy-bar"
            ref={barRef}
            className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-gutter pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden"
            initial={reduce ? { opacity: 0 } : { y: "100%" }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            exit={reduce ? { opacity: 0 } : { y: "100%" }}
            transition={{ duration: reduce ? 0.15 : 0.45, ease: EASE }}
          >
            <div className="flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] leading-snug text-ink">{name}</p>
                <p className="mt-0.5 flex items-baseline gap-2 truncate text-[12px] text-ink-3">
                  {size && !single ? <span className="shrink-0 text-ink-2">{size}</span> : null}
                  {size && !single ? <span aria-hidden>·</span> : null}
                  <PriceTag price={price} compareAt={compareAt} />
                </p>
              </div>
              <button
                type="button"
                onClick={addFromBar}
                aria-live="polite"
                className="relative h-12 shrink-0 bg-ink px-6 text-[13px] tracking-[0.04em] text-white transition-colors duration-300 hover:bg-ink-2 disabled:opacity-60"
              >
                {barState === "adding" ? "Adding…" : barState === "added" ? "Added to bag" : "Add to bag"}
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
