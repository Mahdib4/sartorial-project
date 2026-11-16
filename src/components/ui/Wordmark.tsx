import { CITY_SPAN, LOGO, WORD_SPAN } from "@/components/brand/logo";
import { SITE } from "@/config/site";
import { cn } from "@/lib/cn";

/**
 * The Sartorial wordmark: the lettering of the house logo itself (traced from the
 * logo file, see components/brand/logo.ts), drawn in the current text colour.
 *
 * By default it is sized like type: it stands about 0.78em tall, so a
 * font-size class sets it. `fill="width"` stretches it to its container instead.
 * `withCity` adds DHAKA beneath, as in the full logo.
 */
export function Wordmark({ className, withCity = false, fill = "type" }: { className?: string; withCity?: boolean; fill?: "type" | "width" }) {
  const top = WORD_SPAN.top;
  const bottom = withCity ? CITY_SPAN.bottom : WORD_SPAN.bottom;
  return (
    <svg
      viewBox={`0 ${top} ${LOGO.width} ${bottom - top}`}
      className={cn("block fill-current", fill === "width" ? "h-auto w-full" : withCity ? "h-[1.1em] w-auto" : "h-[0.78em] w-auto", className)}
      role="img"
      aria-label={withCity ? `${SITE.name} ${SITE.city}` : SITE.name}
      focusable="false"
    >
      {LOGO.word.map((glyph, i) => (
        <path key={`w${i}`} d={glyph.d} />
      ))}
      {withCity ? LOGO.city.map((glyph, i) => <path key={`c${i}`} d={glyph.d} />) : null}
    </svg>
  );
}
