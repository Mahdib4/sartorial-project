import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";

/** A price, with the original struck through when a discount applies. */
export function PriceTag({ price, compareAt, className }: { price: number | null; compareAt?: number | null; className?: string }) {
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-2", className)}>
      <span className={compareAt ? "text-accent" : undefined}>{formatPrice(price)}</span>
      {compareAt ? (
        <s className="text-mute decoration-1" aria-label={`was ${formatPrice(compareAt)}`}>
          {formatPrice(compareAt)}
        </s>
      ) : null}
    </span>
  );
}
