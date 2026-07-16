"use client";

import { useState } from "react";
import { Reveal } from "./Reveal";

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 translate-x-0.5 sm:h-7 sm:w-7">
      <path d="M7 4.5v15l13-7.5-13-7.5z" fill="currentColor" />
    </svg>
  );
}

function FilmIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 5v14M16 5v14M3 10h5M16 10h5M3 15h5M16 15h5" stroke="currentColor" strokeWidth="1.3" opacity=".6" />
    </svg>
  );
}

/**
 * Vertical reel-style proof video for /book-consultation — sits beside the
 * form instead of as its own full-width section. 9:16 like an Instagram
 * Reel / TikTok, so it reads as UGC/founder-walkthrough proof rather than a
 * produced marketing video. `videoSrc`/`posterSrc` are resolved server-side
 * (admin-uploaded Storage URL, else the legacy public/proof/* local file,
 * else null) — renders a premium placeholder instead of a broken <video>.
 */
export function VideoReelCard({
  eyebrow,
  title,
  text,
  videoSrc,
  posterSrc,
  placeholderText = "Video walkthrough coming soon",
}: {
  eyebrow: string;
  title: string;
  text: string;
  videoSrc: string | null;
  posterSrc?: string | null;
  placeholderText?: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <Reveal className="flex flex-col gap-4">
      {(eyebrow || title) && (
        <div className="flex flex-col gap-1.5 text-center lg:text-left">
          {eyebrow && (
            <span className="mx-auto inline-flex w-fit items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-neon/90 lg:mx-0">
              <span className="h-1.5 w-1.5 rounded-full bg-neon" />
              {eyebrow}
            </span>
          )}
          {title && <h3 className="text-base font-semibold tracking-tight text-fg sm:text-lg">{title}</h3>}
        </div>
      )}

      <div className="relative mx-auto aspect-[9/16] w-full max-w-[320px] overflow-hidden rounded-3xl border border-cyan/20 bg-charcoal shadow-[0_0_50px_-16px_rgba(34,211,238,0.35)]">
        <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-cyan/30 bg-ink/70 px-3 py-1 text-[0.6rem] font-medium text-cyan backdrop-blur-sm">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan" />
          Watch the 60-sec walkthrough
        </span>

        {videoSrc && playing ? (
          <video
            src={videoSrc}
            poster={posterSrc ?? undefined}
            controls
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
        ) : videoSrc ? (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label="Play video walkthrough"
            className="group relative flex h-full w-full items-center justify-center bg-gradient-to-b from-charcoal-2 to-ink"
          >
            {posterSrc && (
              // eslint-disable-next-line @next/next/no-img-element -- arbitrary CMS-uploaded Storage URL
              <img src={posterSrc} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
            )}
            <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.15),transparent_65%)]" />
            <span className="relative flex h-16 w-16 items-center justify-center rounded-full border border-cyan/40 bg-cyan/10 text-cyan shadow-[0_0_32px_-6px_rgba(34,211,238,0.55)] transition-transform duration-300 group-hover:scale-110">
              <PlayIcon />
            </span>
          </button>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-charcoal-2 to-ink px-4 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-line text-muted/60">
              <FilmIcon />
            </span>
            <p className="text-sm font-medium text-muted">{placeholderText}</p>
          </div>
        )}
      </div>

      {text && (
        <p className="mx-auto max-w-[320px] text-pretty text-center text-xs leading-relaxed text-muted sm:text-sm lg:mx-0 lg:text-left">
          {text}
        </p>
      )}
    </Reveal>
  );
}
