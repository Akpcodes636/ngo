
import Image from "next/image";
import { Button } from "./ui/Button";
import { Container } from "./ui/Container";
import { heroImages } from "@/data/images";

export function Hero() {
  const image = heroImages[0];

  return (
    <section className="relative isolate overflow-hidden bg-black">
      <div className="absolute inset-0">
        <Image
          src="/image/hero-2.jpg"
          alt={image.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        {/* Subtle black overlay */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-black/5"
        />

        {/* Very subtle left-side overlay for text readability */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/10 to-transparent"
        />
      </div>

      <Container className="relative flex min-h-[88vh] flex-col justify-end gap-8 py-12 sm:min-h-[92vh] sm:py-20">
        <div className="max-w-2xl">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold-300 backdrop-blur sm:px-4 sm:py-1.5 sm:text-sm">
            Healthy Golden Years Initiative
          </p>

          <h1 className="text-3xl font-bold leading-[1.1] text-white sm:text-5xl lg:text-6xl">
            Healthy Ageing. Dignified Living. Stronger Communities.
          </h1>

          <p className="mt-4 max-w-xl text-base leading-relaxed text-sage-light sm:mt-6 sm:text-xl">
            Healthy Golden Years Initiative promotes preventive health,
            self-care and community support so older adults can live
            healthier, more independent and dignified lives.
          </p>

          <div className="mt-7 flex flex-wrap gap-3 sm:mt-9 sm:gap-4">
            <Button href="/donate" size="lg" variant="primary">
              Support Our Mission
            </Button>

            <Button href="/about" size="lg" variant="outline-light">
              Learn About Our Work
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
