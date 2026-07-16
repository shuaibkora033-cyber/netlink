"use client";

import { useState } from "react";
import { SectionHeading } from "./SectionHeading";
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
 * "See How The System Works" video proof section for /book-consultation.
 * `videoSrc` is null when no admin-uploaded video and no
 * public/proof/netlink-proof-video.mp4 fallback exist (resolved server-side,
 * see lib/publicAsset.ts) — renders a clean "coming soon" placeholder
 * instead of a broken <video>, so the page never breaks for missing media.
 */
export function VideoProofCard({
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
    <section className="relative overflow-clip border-y border-line/60 bg-charcoal/20 py-14 md:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <SectionHeading eyebrow={eyebrow} title={title} subtitle={text} />

        <Reveal index={1}>
          <div className="relative mt-10 aspect-video w-full overflow-hidden rounded-2xl border border-cyan/20 bg-charcoal shadow-[0_0_60px_-20px_rgba(34,211,238,0.25)] sm:mt-14">
            {videoSrc && playing ? (
              <video
                src={videoSrc}
                poster={posterSrc ?? undefined}
                controls
                autoPlay
                className="h-full w-full object-cover"
              />
            ) : videoSrc ? (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                aria-label="Play video walkthrough"
                className="group relative flex h-full w-full items-center justify-center bg-gradient-to-br from-charcoal-2 to-ink"
              >
                {posterSrc && (
                  // eslint-disable-next-line @next/next/no-img-element -- arbitrary CMS-uploaded Storage URL
                  <img src={posterSrc} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
                )}
                <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.12),transparent_65%)]" />
                <span className="relative flex h-16 w-16 items-center justify-center rounded-full border border-cyan/40 bg-cyan/10 text-cyan shadow-[0_0_32px_-6px_rgba(34,211,238,0.55)] transition-transform duration-300 group-hover:scale-110 sm:h-20 sm:w-20">
                  <PlayIcon />
                </span>
              </button>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-charcoal-2 to-ink text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-line text-muted/60">
                  <FilmIcon />
                </span>
                <p className="text-sm font-medium text-muted">{placeholderText}</p>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
