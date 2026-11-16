"use client";

import { useRef, useState } from "react";
import type { Film } from "@/lib/media";

/**
 * A film played on request, with the browser's own controls and sound.
 * Nothing is downloaded until the visitor presses play.
 */
export function FilmPlayer({ film, title, credit }: { film: Film; title: string; credit?: string }) {
  const [started, setStarted] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const minutes = Math.floor(film.duration / 60);
  const seconds = Math.round(film.duration % 60);

  return (
    <figure>
      <div className="relative aspect-video w-full overflow-hidden bg-ink">
        {started ? (
          <video ref={video} src={film.src} poster={film.poster} controls autoPlay playsInline preload="auto" className="absolute inset-0 h-full w-full" aria-label={title} />
        ) : (
          <button type="button" onClick={() => setStarted(true)} className="on-dark group/play absolute inset-0 block w-full text-white" aria-label={`Play ${title} (${minutes} minutes ${seconds} seconds, with sound)`}>
            {/* eslint-disable-next-line @next/next/no-img-element -- poster frames are pre-built */}
            <img src={film.poster} srcSet={film.posterSrcSet} sizes="100vw" alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1600ms] ease-out-expo group-hover/play:scale-[1.03]" />
            <span aria-hidden className="absolute inset-0 bg-ink/30 transition-colors duration-500 group-hover/play:bg-ink/20" />
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid h-20 w-20 place-items-center rounded-full border border-white/80 transition-transform duration-500 ease-out-expo group-hover/play:scale-110 md:h-24 md:w-24">
                <svg aria-hidden viewBox="0 0 16 16" className="ml-1 h-5 w-5 fill-current">
                  <path d="M3 1.5v13l11-6.5z" />
                </svg>
              </span>
            </span>
            <span className="label absolute bottom-5 left-5 md:bottom-8 md:left-8">
              Play film&ensp;·&ensp;{minutes}:{String(seconds).padStart(2, "0")}
            </span>
          </button>
        )}
      </div>
      {credit ? <figcaption className="mt-3 px-gutter text-[12.5px] text-ink-3 md:px-0">{credit}</figcaption> : null}
    </figure>
  );
}
