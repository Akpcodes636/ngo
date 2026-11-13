"use client";

import Image from "next/image";
import type { PartnerPlaceholder } from "@/data/team";

// Each half of the track must be wider than the widest screen, otherwise an
// empty stretch shows before the loop restarts. 12 cards × 216px ≈ 2600px.
const MIN_CARDS_PER_HALF = 12;

// Seconds each card takes to scroll past, so speed stays the same no matter
// how many partners there are.
const SECONDS_PER_CARD = 7;

export function PartnerMarquee({ partners }: { partners: PartnerPlaceholder[] }) {
  if (partners.length === 0) return null;

  // Repeat the partners until one half is wide enough, then duplicate that
  // half so translateX(-50%) loops seamlessly.
  const repeats = Math.max(1, Math.ceil(MIN_CARDS_PER_HALF / partners.length));
  const half = Array.from({ length: repeats }, () => partners).flat();
  const items = [...half, ...half];
  const duration = `${half.length * SECONDS_PER_CARD}s`;

  return (
    <div
      className="relative overflow-hidden"
      aria-label="Our partners"
    >
      {/* Fade edges */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-cream to-transparent sm:w-24"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-cream to-transparent sm:w-24"
      />

      {/*
        - py-3 leaves room inside overflow-hidden for the hover lift and
          shadow, so cards don't get clipped at the top.
        - Spacing uses mr-6 on each card (not gap-6) so the track is exactly
          two identical halves; translateX(-50%) then loops with no jump.
      */}
      <div
        className="flex w-max animate-marquee py-3 hover:[animation-play-state:paused] motion-reduce:animate-none"
        style={{ animationDuration: duration }}
      >
        {items.map((partner, i) => (
          <div
            key={`${partner.name}-${i}`}
            // Screen readers only need each partner once.
            aria-hidden={i >= partners.length || undefined}
            className="group mr-6 flex h-20 w-40 shrink-0 items-center justify-center rounded-lg border border-forest-100 bg-white px-4 shadow-sm transition-[translate,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-gold-300 hover:shadow-md sm:h-24 sm:w-48"
          >
            <Image
              src={partner.image}
              alt={`${partner.name} logo`}
              width={140}
              height={64}
              className="h-12 w-auto object-contain opacity-70 transition-opacity duration-300 group-hover:opacity-100 sm:h-14"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
