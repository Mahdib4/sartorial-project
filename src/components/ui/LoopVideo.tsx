"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { Film } from "@/lib/media";

export type FilmSource = Pick<Film, "src" | "poster" | "posterSrcSet" | "blur">;

type LoopVideoProps = {
  film: FilmSource;
  /** Alternative encodes by viewport, e.g. a portrait cut for phones. First matching media query wins. */
  sources?: Array<{ media: string; film: FilmSource }>;
  /** Describes the footage for screen readers. */
  label: string;
  /**
   * "inview": plays whenever it is on screen (default).
   * "hover":  plays while `active` is true (the parent decides, e.g. on card hover).
   */
  mode?: "inview" | "hover";
  active?: boolean;
  /** Pause regardless of visibility (the hero's pause button). */
  paused?: boolean;
  /** Reports playback position, 0–1. */
  onProgress?: (fraction: number) => void;
  position?: string;
  /** Fetch the poster at high priority (above the fold). */
  priority?: boolean;
  /** Fill a positioned parent instead of sizing from `className`. */
  fill?: boolean;
  className?: string;
};

/**
 * A silent, looping film. The poster paints immediately; the video file is only
 * requested when the frame comes near the viewport, plays while visible and
 * pauses when it leaves. Honours prefers-reduced-motion by staying on the poster.
 */
export function LoopVideo({ film, sources, label, mode = "inview", active = false, paused = false, onProgress, position = "50% 50%", priority = false, fill = false, className }: LoopVideoProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [chosen, setChosen] = useState<FilmSource>(film);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [still, setStill] = useState(false);

  // Pick the encode for this viewport, and respect reduced motion.
  useEffect(() => {
    const pick = () => {
      const match = sources?.find((s) => window.matchMedia(s.media).matches);
      setChosen(match ? match.film : film);
    };
    pick();
    const queries = (sources ?? []).map((s) => window.matchMedia(s.media));
    queries.forEach((q) => q.addEventListener("change", pick));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onReduce = () => setStill(reduce.matches);
    onReduce();
    reduce.addEventListener("change", onReduce);
    return () => {
      queries.forEach((q) => q.removeEventListener("change", pick));
      reduce.removeEventListener("change", onReduce);
    };
  }, [film, sources]);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const nearObserver = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "400px 0px" });
    const visibleObserver = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.2 });
    nearObserver.observe(el);
    visibleObserver.observe(el);
    return () => {
      nearObserver.disconnect();
      visibleObserver.disconnect();
    };
  }, []);

  const wantLoaded = mode === "hover" ? active : near;
  const wantPlaying = !still && !paused && (mode === "hover" ? active : visible);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !wantLoaded) return;
    if (wantPlaying) {
      const attempt = video.play();
      if (attempt) attempt.catch(() => undefined); // autoplay refused: the poster stays
    } else {
      video.pause();
    }
  }, [wantPlaying, wantLoaded, chosen.src]);

  return (
    <div ref={frameRef} className={cn(fill ? "absolute inset-0" : "relative", "overflow-hidden bg-ink", className)} style={{ backgroundImage: `url(${chosen.blur})`, backgroundSize: "cover", backgroundPosition: "center" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- poster frames are pre-built */}
      <img
        src={chosen.poster}
        srcSet={chosen.posterSrcSet}
        sizes="100vw"
        alt=""
        aria-hidden
        loading="lazy"
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: position }}
      />
      {wantLoaded ? (
        <video
          ref={videoRef}
          key={chosen.src}
          src={chosen.src}
          muted
          loop
          playsInline
          preload="auto"
          aria-label={label}
          disablePictureInPicture
          onPlaying={() => setPlaying(true)}
          onTimeUpdate={onProgress ? (e) => onProgress(e.currentTarget.duration ? e.currentTarget.currentTime / e.currentTarget.duration : 0) : undefined}
          className={cn("absolute inset-0 h-full w-full object-cover transition-opacity duration-700", playing ? "opacity-100" : "opacity-0")}
          style={{ objectPosition: position }}
        />
      ) : null}
    </div>
  );
}
