import { SITE } from "@/config/site";
import { cn } from "@/lib/cn";

/**
 * The Sartorial wordmark, set in spaced Didone capitals to match the mark on
 * the client's labels and films. Swap this component's contents for an <img>
 * or inline SVG if a logo file is supplied.
 */
export function Wordmark({ className, withCity = false }: { className?: string; withCity?: boolean }) {
  return (
    <span className={cn("inline-flex flex-col items-center leading-none", className)}>
      <span className="wordmark pl-[0.34em] tracking-[0.34em]">{SITE.name}</span>
      {withCity ? <span className="mt-[0.5em] pl-[0.5em] text-[0.3em] font-normal tracking-[0.5em] uppercase">{SITE.city}</span> : null}
    </span>
  );
}
