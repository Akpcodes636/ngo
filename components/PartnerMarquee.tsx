"use client";

import Image from "next/image";
import type { PartnerPlaceholder } from "@/data/team";

export function PartnerMarquee({ partners }: { partners: PartnerPlaceholder[] }) {
  // Duplicate the list so the scroll loops seamlessly
  const items = [...partners, ...partners];

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

      <div
        className="flex w-max gap-6"
        style={{ animation: "marquee 28s linear infinite" }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLDivElement).style.animationPlayState = "paused")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLDivElement).style.animationPlayState = "running")
        }
      >
        {items.map((partner, i) => (
          <div
            key={`${partner.name}-${i}`}
            className="group flex h-20 w-40 shrink-0 items-center justify-center rounded-lg border border-forest-100 bg-white px-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold-300 hover:shadow-md sm:h-24 sm:w-48"
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
