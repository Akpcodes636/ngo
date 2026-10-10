import type { Metadata } from "next";
import Image from "next/image";
import {
  BookOpen,
  HeartHandshake,
  Activity,
  Users,
  HandHeart,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { CTASection } from "@/components/CTASection";
import { AnimateIn } from "@/components/AnimateIn";
import { programs } from "@/data/programs";
import type { Program } from "@/data/programs";

export const metadata: Metadata = {
  title: "Our Programs",
  description:
    "Explore Healthy Golden Years Initiative's programs: preventive health education, community outreach, self-care, elderly support, caregiver education and health screening across Nigeria.",
};

const icons: Record<Program["icon"], LucideIcon> = {
  "book-open": BookOpen,
  "heart-handshake": HeartHandshake,
  activity: Activity,
  users: Users,
  "hand-heart": HandHeart,
  stethoscope: Stethoscope,
};

export default function ProgramsPage() {
  return (
    <>
      <section className="bg-forest-900 py-20 sm:py-28">
        <Container>
          <SectionHeading
            level="h1"
            eyebrow="Our Programs"
            title="Six Ways We Support Healthy Ageing."
            description="Every program is built around education, prevention, connection and independence — meeting older adults where they are."
            tone="light"
            className="max-w-3xl"
          />
        </Container>
      </section>

      <section className="bg-cream py-20 sm:py-24">
        <Container className="space-y-14 sm:space-y-20">
          {programs.map((program, i) => {
            const Icon = icons[program.icon];
            const imageFirst = i % 2 === 0;
            return (
              <AnimateIn key={program.slug} animation="fade-up">
                <div
                  id={program.slug}
                  className="grid scroll-mt-28 items-center gap-[18px] lg:grid-cols-2"
                >
                  <div
                    className={`relative aspect-4/3 w-full overflow-hidden rounded-lg ${
                      imageFirst ? "lg:order-1" : "lg:order-2"
                    }`}
                  >
                    <Image
                      src={program.image.src}
                      alt={program.image.alt}
                      fill
                      sizes="(min-width: 1024px) 45vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className={imageFirst ? "lg:order-2" : "lg:order-1"}>
                    <span className="flex h-12 w-12 items-center justify-center rounded-md bg-forest-700 text-gold-300">
                      <Icon size={24} aria-hidden />
                    </span>
                    <h2 className="mt-5 text-2xl font-semibold text-forest-800 sm:text-3xl">
                      {program.title}
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed text-stone-warm">
                      {program.description}
                    </p>
                  </div>
                </div>
              </AnimateIn>
            );
          })}
        </Container>
      </section>

      <CTASection
        title="Partner With Us on a Program."
        description="Whether you're a healthcare provider, corporate partner or community group, there's a way to work with us."
        primaryLabel="Get Involved"
        primaryHref="/get-involved"
        secondaryLabel="Support Our Mission"
        secondaryHref="/donate"
      />
    </>
  );
}
