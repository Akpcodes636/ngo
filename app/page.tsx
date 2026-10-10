import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, ShieldCheck, Users2, Sparkles } from "lucide-react";
import { Hero } from "@/components/Hero";
import { SectionHeading } from "@/components/SectionHeading";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ProgramCard } from "@/components/ProgramCard";
import { ValueCard } from "@/components/ValueCard";
import { ImpactCard } from "@/components/ImpactCard";
import { GalleryPreview } from "@/components/GalleryPreview";
import { CTASection } from "@/components/CTASection";
import { AnimateIn } from "@/components/AnimateIn";
import { programs, approachSteps } from "@/data/programs";
import { coreValues } from "@/data/values";
import { impactStats } from "@/data/impact";
import { whyWeExistImage } from "@/data/images";
import { site } from "@/data/site";

const approachIcons = [BookOpen, ShieldCheck, Users2, Sparkles];

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* WHY WE EXIST — the narrative begins: older adults deserve dignity */}
      <section className="bg-cream py-20 sm:py-[90px]">
        <Container className="grid items-center gap-[18px] lg:grid-cols-2 lg:gap-[18px]">
          <AnimateIn animation="fade-left" className="relative order-2 aspect-4/3 w-full overflow-hidden rounded-lg lg:order-1">
            <Image
              src="/image/why-we-exist.jpg"
              alt={whyWeExistImage.alt}
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </AnimateIn>
          <AnimateIn animation="fade-right" delay={100} className="order-1 lg:order-2">
            <SectionHeading
              eyebrow="Why We Exist"
              title="Growing Older Should Come With Dignity."
            />
            <p className="mt-2 text-base sm:text-[20px] leading-[150%] text-[#43586C]">
              As people age, they face real health and social challenges
              but growing older should never mean losing dignity,
              independence or connection. Every older adult deserves
              knowledge, preventive healthcare, community, respect and the
              freedom to live life on their own terms.
            </p>
            <p className="mt-2 text-base sm:text-[20px] leading-[150%] text-[#43586C]">
              Healthy Golden Years Initiative exists to close that gap
              promoting prevention and self-care so ageing becomes a season
              of continued strength, not decline.
            </p>
            <div className="mt-6">
              <Button href="/about" variant="secondary" size="lg">
                Discover Our Mission
                <ArrowRight size={18} aria-hidden />
              </Button>
            </div>
          </AnimateIn>
        </Container>
      </section>

      {/* OUR APPROACH */}
      <section className="bg-forest-800 py-14 sm:py-[74px]">
        <Container>
          <AnimateIn animation="fade-up">
            <SectionHeading
              eyebrow="Our Approach"
              title="From Awareness to Independence."
              description="We work through a simple, deliberate approach that turns health knowledge into lasting dignity and independence for older adults."
              align="center"
              tone="light"
              className="mx-auto"
            />
          </AnimateIn>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {approachSteps.map((step, i) => {
              const Icon = approachIcons[i];
              return (
                <AnimateIn key={step.title} animation="fade-up" delay={i * 80}>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-5 text-center sm:p-7">
                    <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gold-500 text-forest-900">
                      <Icon size={26} aria-hidden />
                    </span>
                    <h3 className="text-xl font-semibold text-white">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-sage-light">
                      {step.description}
                    </p>
                  </div>
                </AnimateIn>
              );
            })}
          </div>
        </Container>
      </section>

      {/* OUR PROGRAMS */}
      <section className="bg-cream py-20 sm:py-[90px]">
        <Container>
          <AnimateIn animation="fade-up">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
              <SectionHeading
                eyebrow="Our Programs"
                title="Practical Support, Rooted in Community."
                description="We work through education, outreach and community programs designed around how older adults actually live."
              />
              <Button href="/programs" variant="outline-dark" size="md" className="shrink-0">
                View All Programs
              </Button>
            </div>
          </AnimateIn>
          <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {programs.slice(0, 6).map((program, i) => (
              <AnimateIn key={program.slug} animation="fade-up" delay={i * 70}>
                <ProgramCard program={program} />
              </AnimateIn>
            ))}
          </div>
        </Container>
      </section>

      {/* MISSION + VALUES */}
      <section className="bg-sage-light py-20 sm:py-28">
        <Container>
          <AnimateIn animation="fade-in">
            <div className="grid gap-10 rounded-2xl bg-forest-700 p-8 text-white sm:p-12 lg:grid-cols-2 lg:p-16">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-gold-300">
                  Our Mission
                </p>
                <p className="mt-4 font-display text-2xl font-medium leading-snug sm:text-3xl">
                  &ldquo;{site.mission}&rdquo;
                </p>
                <p className="mt-8 text-sm font-bold uppercase tracking-[0.15em] text-gold-300">
                  Our Vision
                </p>
                <p className="mt-4 text-lg leading-relaxed text-sage-light">
                  {site.vision}
                </p>
              </div>
              <div className="flex flex-col justify-center gap-4 border-t border-white/10 pt-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-gold-300">
                  What Guides Us
                </p>
                <ul className="space-y-3 text-[15px] leading-relaxed text-sage-light">
                  {coreValues.map((v) => (
                    <li key={v.title}>
                      <span className="font-semibold text-white">{v.title}.</span>{" "}
                      {v.description}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </AnimateIn>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coreValues.map((value, i) => (
              <AnimateIn key={value.title} animation="fade-up" delay={i * 80}>
                <ValueCard value={value} />
              </AnimateIn>
            ))}
          </div>
        </Container>
      </section>

    
      {/* GALLERY PREVIEW */}
      <section className="bg-cream py-20 sm:py-28">
        <Container>
          <AnimateIn animation="fade-up">
            <SectionHeading
              eyebrow="Gallery"
              title="See Our Work in the Community."
              align="center"
              className="mx-auto"
            />
          </AnimateIn>
          <AnimateIn animation="fade-up" delay={150} className="mt-12">
            <GalleryPreview />
          </AnimateIn>
          <AnimateIn animation="fade-up" delay={250} className="mt-10 text-center">
            <Button href="/gallery" variant="secondary" size="lg">
              View Our Gallery
            </Button>
          </AnimateIn>
        </Container>
      </section>

      {/* FINAL CTA */}
      <CTASection
        title="People Can Support the Mission."
        description="Your support helps us reach more older adults with the health education, outreach and community care they deserve."
        primaryLabel="Support Our Mission"
        primaryHref="/donate"
        secondaryLabel="Get Involved"
        secondaryHref="/get-involved"
      >
        <p className="mt-6 text-sm text-sage-light/80">
          <Link href="/contact" className="underline underline-offset-4 hover:text-white">
            Or reach out to partner with us
          </Link>
        </p>
      </CTASection>
    </>
  );
}
