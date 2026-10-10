import Image from "next/image";
import { galleryImages, galleryHomepagePreviewIds } from "@/data/images";

export function GalleryPreview() {
  const images = galleryHomepagePreviewIds
    .map((id) => galleryImages.find((img) => img.id === id))
    .filter((img): img is NonNullable<typeof img> => Boolean(img));

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
      {images.map((image) => (
        <div
          key={image.id}
          className="group relative aspect-4/3 overflow-hidden rounded-lg bg-forest-100"
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 768px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-900/70 via-transparent to-transparent" />
          <p className="absolute inset-x-0 bottom-0 p-3 text-sm font-semibold text-white">
            {image.caption}
          </p>
        </div>
      ))}
    </div>
  );
}
