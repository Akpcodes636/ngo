import Image from "next/image";
import { MapPin } from "lucide-react";
import type { GalleryImage } from "@/data/images";

export function GalleryCard({
  image,
  priority = false,
}: {
  image: GalleryImage;
  priority?: boolean;
}) {
  return (
    <figure className="group relative mb-4 break-inside-avoid overflow-hidden rounded-lg bg-forest-800 shadow-sm sm:mb-5">
      <div className="relative w-full">
        <Image
          src={image.src}
          alt={image.alt}
          width={800}
          height={1000}
          priority={priority}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
          className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-900/90 via-forest-900/10 to-transparent opacity-90" />
      <figcaption className="absolute inset-x-0 bottom-0 p-4">
        <span className="mb-1.5 inline-block rounded-full bg-gold-500/95 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-forest-900">
          {image.category}
        </span>
        <p className="text-[15px] font-semibold leading-snug text-white">
          {image.caption}
        </p>
        {(image.location || image.date) && (
          <p className="mt-1 flex items-center gap-1 text-xs text-sage-light/90">
            <MapPin size={12} aria-hidden />
            {[image.location, image.date].filter(Boolean).join(" · ")}
          </p>
        )}
      </figcaption>
    </figure>
  );
}
