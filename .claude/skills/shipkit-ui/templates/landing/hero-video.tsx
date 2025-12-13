/**
 * HeroVideo
 * A hero section with video background and overlay content.
 * Best for: High-impact landing pages, product launches, brand pages
 */

'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Pause } from 'lucide-react';
import { useState, useRef } from 'react';

interface HeroVideoProps {
  /** Main headline text */
  headline: string;
  /** Supporting subheadline text */
  subheadline: string;
  /** Primary CTA button text */
  primaryCta: string;
  /** Primary CTA link */
  primaryHref: string;
  /** Secondary CTA button text (optional) */
  secondaryCta?: string;
  /** Secondary CTA link */
  secondaryHref?: string;
  /** Video source URL (MP4) */
  videoSrc: string;
  /** Poster image for video */
  posterSrc?: string;
  /** Overlay opacity (0-100) */
  overlayOpacity?: number;
  /** Additional CSS classes */
  className?: string;
}

export function HeroVideo({
  headline,
  subheadline,
  primaryCta,
  primaryHref,
  secondaryCta,
  secondaryHref,
  videoSrc,
  posterSrc,
  overlayOpacity = 60,
  className,
}: HeroVideoProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <section
      className={cn(
        'relative flex min-h-[80vh] items-center overflow-hidden',
        className
      )}
    >
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        poster={posterSrc}
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity / 100 }}
      />

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            {headline}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80 md:text-xl">
            {subheadline}
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <a href={primaryHref}>
                {primaryCta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>

            {secondaryCta && secondaryHref && (
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                asChild
              >
                <a href={secondaryHref}>{secondaryCta}</a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Video Control Button */}
      <button
        onClick={togglePlay}
        className="absolute bottom-6 right-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
        aria-label={isPlaying ? 'Pause video' : 'Play video'}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </button>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <div className="flex h-8 w-5 items-start justify-center rounded-full border-2 border-white/30 p-1">
          <div className="h-2 w-1 animate-bounce rounded-full bg-white/60" />
        </div>
      </div>
    </section>
  );
}

// Example usage:
// <HeroVideo
//   headline="The Future of SaaS Development"
//   subheadline="Build production-ready applications with enterprise-grade features in days, not months."
//   primaryCta="Get Started Free"
//   primaryHref="/signup"
//   secondaryCta="Learn More"
//   secondaryHref="/features"
//   videoSrc="/videos/hero-background.mp4"
//   posterSrc="/images/hero-poster.jpg"
//   overlayOpacity={50}
// />
