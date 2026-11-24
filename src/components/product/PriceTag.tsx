import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";

/**
 * A price, with the original struck through when a discount applies. Screen
 * readers hear "now BDT 45,000, was BDT 50,000": the words are hidden text,
 * since a label on <s> is not read out. `stacked` puts the original under the
 * price, right-aligned (the bag's lines).
 */
export function PriceTag({ price, compareAt, stacked = false, className }: { price: number | null; compareAt?: number | null; stacked?: boolean; className?: string }) {
  return (
    <span className={cn(stacked ? "inline-flex flex-col items-end gap-y-0.5 text-right" : "inline-flex flex-wrap items-baseline gap-x-2", className)}>
      <span className={compareAt ? "text-accent" : undefined}>
        {compareAt ? <span className="sr-only">now </span> : null}
        {formatPrice(price)}
      </span>
      {compareAt ? (
        <s className="text-mute decoration-1">
          <span className="sr-only">was </span>
          {formatPrice(compareAt)}
        </s>
      ) : null}
    </span>
  );
}
