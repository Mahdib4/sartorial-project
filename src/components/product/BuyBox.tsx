"use client";

import { useEffect, useState } from "react";
import { Like } from "@/components/bencho/like/Like";
import { MagneticSelect } from "@/components/bencho/magnet-select/MagneticSelect";
import { LoadingButton } from "@/components/interior/loading-button";
import { SizeGuide } from "@/components/product/SizeGuide";
import { ButtonLink } from "@/components/ui/Button";
import { BESPOKE_SIZE, type SizeScale } from "@/config/site";
import { cn } from "@/lib/cn";
import { useShop } from "@/store/shop";

type BuyBoxProps = {
  slug: string;
  name: string;
  scale: SizeScale;
};

/**
 * Size, add to bag, save. Sizes are chosen on a magnetic picker; tailoring can
 * instead be marked "Made to measure". The button will not add a piece until a
 * size is chosen, and says so.
 */
export function BuyBox({ slug, name, scale }: BuyBoxProps) {
  const { add, isSaved, toggleSaved, ready, markViewed, open } = useShop();
  const single = scale.sizes.length === 1 && !scale.allowBespoke;
  const [size, setSize] = useState<string | null>(single ? scale.sizes[0] : null);
  const [error, setError] = useState(false);
  const saved = ready && isSaved(slug);

  useEffect(() => {
    markViewed(slug);
  }, [slug, markViewed]);

  const choose = (value: string | null) => {
    setSize(value);
    setError(false);
  };

  return (
    <div>
      {!single ? (
        <div>
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

      <div className="mt-2 flex items-stretch gap-2">
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
    </div>
  );
}
