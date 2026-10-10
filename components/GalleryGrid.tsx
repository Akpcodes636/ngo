"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import type { GalleryCategory, GalleryImage } from "@/data/images";
import { GalleryCard } from "./GalleryCard";

const categories: (GalleryCategory | "All")[] = [
  "All",
  "Community Outreach",
  "Health & Wellness",
  "Older Adults",
  "Volunteers",
  "Community Events",
  "Education",
  "Partnerships",
];

export function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = useState<GalleryCategory | "All">("All");

  const filtered = useMemo(
    () => (active === "All" ? images : images.filter((img) => img.category === active)),
    [active, images]
  );

  return (
    <div>
      <div
        role="group"
        aria-label="Filter gallery by category"
        className="mb-10 flex flex-wrap gap-2.5"
      >
        {categories.map((cat) => {
          const isActive = active === cat;
          return (
            <button
              key={cat}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActive(cat)}
              className={clsx(
                "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                isActive
                  ? "border-forest-700 bg-forest-700 text-white"
                  : "border-forest-200 bg-white text-forest-700 hover:border-forest-400"
              )}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="text-stone-warm">No images in this category yet.</p>
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 sm:gap-5">
          {filtered.map((image, i) => (
            <GalleryCard image={image} key={image.id} priority={i < 4} />
          ))}
        </div>
      )}
    </div>
  );
}
