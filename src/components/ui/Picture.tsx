import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import type { Shot } from "@/lib/media";

type PictureShot = Pick<Shot, "src" | "srcSet" | "width" | "height" | "bg" | "flat"> & { blur?: string; position?: string; cut?: boolean };

type PictureProps = {
  shot: PictureShot;
  alt: string;
  /** The `sizes` attribute: how wide the photo is drawn at each breakpoint. */
  sizes: string;
  /** CSS aspect-ratio of the frame ("4 / 5"). Omit to use the photo's own ratio; "fill" to fill a positioned parent. */
  ratio?: string | "fill";
  /** `object-position` for cropped photos. Model shots default to the upper third so heads stay in frame. */
  position?: string;
  /** Fetch at high priority. For the first photo on a page only. */
  priority?: boolean;
  /**
   * "cover" (default) fills the frame. "product" is for catalogue frames: a
   * landscape studio photograph (trousers laid flat) is shown whole on the
   * frame's tint instead of being cropped to the frame.
   */
  fit?: "cover" | "contain" | "product";
  className?: string;
  imgClassName?: string;
  style?: CSSProperties;
};

/**
 * One photograph: responsive sources, a blurred preview painted behind it while
 * it loads, and a frame that reserves its space so nothing shifts.
 * Server-renderable; no client JavaScript.
 */
export function Picture({ shot, alt, sizes, ratio, position, priority, fit, className, imgClassName, style }: PictureProps) {
  // A studio photograph on a levelled white backdrop, in a catalogue frame: shown
  // whole and slightly enlarged. Multiplying it onto the frame's own tint makes the
  // white backdrop take that tint, so the photo has no visible edge.
  const afloat = fit === "product" && Boolean(shot.cut);
  const contain = fit === "contain" || afloat;
  const portrait = shot.height > shot.width;
  const fill = ratio === "fill";
  return (
    <div
      className={cn(fill ? "absolute inset-0" : "relative", "overflow-hidden", className)}
      style={{
        aspectRatio: fill ? undefined : (ratio ?? `${shot.width} / ${shot.height}`),
        backgroundColor: afloat ? "var(--color-studio)" : shot.bg,
        backgroundImage: !contain && shot.blur ? `url(${shot.blur})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        ...style,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- sources are pre-built by scripts/build-media.mjs */}
      <img
        src={shot.src}
        srcSet={shot.srcSet}
        sizes={sizes}
        alt={alt}
        width={shot.width}
        height={shot.height}
        // Always lazy, even for the lead photo: an eager image makes React emit a
        // preload hint, and those hints also fire when Next *prefetches* a linked
        // page, downloading that page's lead photo before anyone has asked for it.
        // A lazy image that is already in view still loads at once, at high priority.
        loading="lazy"
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        draggable={false}
        className={cn(
          "absolute",
          afloat ? "top-1/2 left-[-8%] h-auto w-[116%] max-w-none -translate-y-1/2 mix-blend-multiply" : "inset-0 h-full w-full",
          !afloat && (contain ? "object-contain" : "object-cover"),
          imgClassName,
        )}
        style={afloat ? undefined : { objectPosition: contain ? "center" : (position ?? shot.position ?? (portrait ? "50% 22%" : "50% 35%")) }}
      />
    </div>
  );
}
