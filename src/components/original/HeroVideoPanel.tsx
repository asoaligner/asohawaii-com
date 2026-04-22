"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type VideoClip = { src: string; poster?: string; name?: string };
export type ImageSlide = { src: string; alt: string; name?: string };

export type HeroVideoPanelProps = {
  /** Optional list of video clips to rotate through (MP4, web-optimized). */
  videos?: VideoClip[];
  /** Required fallback when no videos exist — rotated on a timer. */
  fallbackImages: ImageSlide[];
  /** Title shown only when alignment === "center". */
  title?: React.ReactNode;
  cta: { label: string; href: string };
  alignment: "center" | "bottom-right";
  /** Interval for image-mode crossfade rotation. */
  intervalMs?: number;
};

/**
 * Full-bleed hero panel that rotates through video clips (with onEnded
 * handoff) when supplied, or falls back to a crossfading image slideshow
 * when `videos` is empty. Used twice by the Home hero to form a 50/50
 * split composition.
 */
export default function HeroVideoPanel({
  videos = [],
  fallbackImages,
  title,
  cta,
  alignment,
  intervalMs = 5000,
}: HeroVideoPanelProps) {
  const useVideos = videos.length > 0;
  const slideCount = useVideos ? videos.length : fallbackImages.length;
  const [index, setIndex] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Image-mode: rotate every intervalMs
  useEffect(() => {
    if (useVideos || slideCount <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slideCount);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [useVideos, slideCount, intervalMs]);

  // Video-mode: play active clip when index changes
  useEffect(() => {
    if (!useVideos) return;
    const v = videoRefs.current[index];
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {
        /* autoplay may be blocked; ignore */
      });
    }
  }, [index, useVideos]);

  const advance = () =>
    setIndex((i) => (i + 1) % Math.max(slideCount, 1));

  const currentName = useVideos
    ? videos[index]?.name
    : fallbackImages[index]?.name;

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* Video layers */}
      {useVideos &&
        videos.map((v, i) => (
          <video
            key={v.src}
            ref={(el) => {
              videoRefs.current[i] = el;
            }}
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-700 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            autoPlay={i === index}
            muted
            playsInline
            preload={i === 0 ? "auto" : "metadata"}
            loop={videos.length === 1}
            onEnded={i === index ? advance : undefined}
            poster={v.poster}
            aria-hidden={i !== index}
          >
            <source src={v.src} type="video/mp4" />
          </video>
        ))}

      {/* Image fallback layers */}
      {!useVideos &&
        fallbackImages.map((img, i) => (
          <div
            key={img.src}
            className={`absolute inset-0 transition-opacity duration-[1200ms] ease-out ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={i !== index}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain"
              priority={i === 0}
            />
          </div>
        ))}

      {/* Gradient overlay for text readability */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/15 to-black/60 pointer-events-none"
      />

      {/* Product name caption (bottom-left, non-intrusive) */}
      {currentName && (
        <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 z-10 max-w-[240px] pointer-events-none">
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/60">
            In frame
          </div>
          <div
            key={`caption-${index}`}
            className="font-serif italic text-white text-base md:text-lg leading-tight drop-shadow-[0_1px_12px_rgba(0,0,0,0.65)] mt-1 animate-[fadeIn_600ms_ease-out]"
          >
            {currentName}
          </div>
        </div>
      )}

      {/* Slide indicator dots */}
      {slideCount > 1 && (
        <div
          className={`absolute z-10 flex gap-1.5 ${
            alignment === "center"
              ? "bottom-5 left-1/2 -translate-x-1/2"
              : "top-5 right-5"
          }`}
        >
          {Array.from({ length: slideCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1 rounded-full transition-all ${
                i === index
                  ? "w-6 bg-white"
                  : "w-3 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}

      {/* Content overlay */}
      {alignment === "center" && (
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 md:px-12 pt-[6vh] md:pt-[7vh] pb-10 md:pb-14">
          {title && <div className="mb-6 md:mb-8">{title}</div>}
          <HeroCtaButton href={cta.href} label={cta.label} />
        </div>
      )}
      {alignment === "bottom-right" && (
        <div className="absolute inset-x-0 bottom-6 md:bottom-10 flex justify-center md:justify-end px-6 md:px-12 z-10">
          <HeroCtaButton href={cta.href} label={cta.label} />
        </div>
      )}
    </div>
  );
}

function HeroCtaButton({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full text-sm font-medium border border-white/25 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] hover:bg-white hover:text-black hover:border-white transition-colors"
    >
      {label}
      <svg
        className="w-4 h-4"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 8h10M9 4l4 4-4 4" />
      </svg>
    </Link>
  );
}
