import type { Metadata } from "next";
import Image from "next/image";
import { UserRound } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { ValueCard } from "@/components/ValueCard";
import { CTASection } from "@/components/CTASection";
import { PartnerMarquee } from "@/components/PartnerMarquee";
import { AnimateIn } from "@/components/AnimateIn";
import { approachSteps } from "@/data/programs";
import { coreValues } from "@/data/values";
import { aboutImages } from "@/data/images";
import { founder, partnerPlaceholders } from "@/data/team";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Healthy Golden Years Initiative's mission, vision, values and approach to promoting healthy ageing and elderly dignity in Nigeria.",
};

export default function AboutPage() {
  return (
    <>
      <section className="bg-forest-900 py-20 sm:py-28">
        <Container>
          <SectionHeading
            level="h1"
            eyebrow="About Us"
            title="A Nigerian Initiative Built Around Dignity in Ageing."
            description={site.tagline}
            tone="light"
            className="max-w-3xl"
          />
        </Container>
      </section>

      {/* OUR STORY */}
      <section className="bg-cream py-20">
        <Container className="grid items-center gap-[18px] lg:grid-cols-2 lg:gap-[18px]">
          <AnimateIn animation="fade-right">
            <SectionHeading eyebrow="Our Story" title="Why We Began" />
            <p className="mt-6 text-base sm:text-[20px] leading-relaxed text-[#43586C]">
              Healthy Golden Years Initiative was founded on a simple
              observation: older adults in our communities are often left
              without the health knowledge, preventive care and support
              systems they need to age well. Too often, ageing is treated
              as something to manage rather than a season of life to be
              supported with dignity.
            </p>
            <p className="mt-2 text-base sm:text-[20px] leading-relaxed text-[#43586C]">
              We set out to change that — starting with education,
              community outreach and a belief that prevention and self-care
              can meaningfully improve how older adults experience their
              later years.
            </p>
          </AnimateIn>
          <AnimateIn animation="fade-left" delay={100} className="relative aspect-4/3 w-full overflow-hidden rounded-[8px]">
            <Image
              src="/image/about-1.jpg"
              alt={aboutImages.ourStory.alt}
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </AnimateIn>
        </Container>
      </section>

      {/* MISSION / VISION */}
      <section className="bg-forest-700 py-20 text-white sm:py-24">
        <Container className="grid gap-10 lg:grid-cols-2">
          <AnimateIn animation="fade-left">
            <div className="rounded-lg border border-white/10 bg-white/5 p-8 sm:p-10">
              <p className="text-sm font-bold uppercase tracking-[0.15em] text-gold-300">
                Mission
              </p>
              <p className="mt-4 font-display text-2xl font-medium leading-snug">
                &ldquo;{site.mission}&rdquo;
              </p>
            </div>
          </AnimateIn>
          <AnimateIn animation="fade-right" delay={100}>
            <div className="rounded-lg border border-white/10 bg-white/5 p-8 sm:p-10">
              <p className="text-sm font-bold uppercase tracking-[0.15em] text-gold-300">
                Vision
              </p>
              <p className="mt-4 font-display text-2xl font-medium leading-snug">
                &ldquo;{site.vision}&rdquo;
              </p>
            </div>
          </AnimateIn>
        </Container>
      </section>

      {/* CORE VALUES */}
      <section className="bg-cream py-20 sm:py-24">
        <Container>
          <AnimateIn animation="fade-up">
            <SectionHeading
              eyebrow="Core Values"
              title="What Guides Everything We Do."
              align="center"
              className="mx-auto"
            />
          </AnimateIn>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coreValues.map((value, i) => (
              <AnimateIn key={value.title} animation="fade-up" delay={i * 80}>
                <ValueCard value={value} />
              </AnimateIn>
            ))}
          </div>
        </Container>
      </section>

      {/* OUR APPROACH */}
      <section className="bg-sage-light py-20 sm:py-24">
        <Container>
          <AnimateIn animation="fade-up">
            <SectionHeading
              eyebrow="Our Approach"
              title="How We Turn Values Into Action."
              align="center"
              className="mx-auto"
            />
          </AnimateIn>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {approachSteps.map((step, i) => (
              <AnimateIn key={step.title} animation="fade-up" delay={i * 80}>
                <div className="rounded-lg bg-white p-7 shadow-sm">
                  <span className="font-display text-3xl font-bold text-gold-500">
                    0{i + 1}
                  </span>
                  <h3 className="mt-[2px] text-lg sm:text-[25px] font-semibold text-forest-800">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-base sm:text-[18px] leading-relaxed text-[#43586C]">
                    {step.description}
                  </p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </Container>
      </section>

      {/* WHO WE SERVE */}
      <section className="bg-cream py-20">
        <Container className="grid items-center gap-[18px] lg:grid-cols-2 ">
          <AnimateIn animation="fade-left" className="relative order-2 aspect-4/3 w-full overflow-hidden rounded-lg lg:order-1">
            <Image
              src="/image/about-2.jpg"
              alt={aboutImages.whoWeServe.alt}
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </AnimateIn>
          <AnimateIn animation="fade-right" delay={100} className="order-1 lg:order-2">
            <SectionHeading eyebrow="Who We Serve" title="Older Adults, Families and Communities." />
            <p className="mt-2 text-base sm:text-[20px] leading-relaxed text-[#43586C]">
              Our programs are designed for older adults across Nigerian
              communities as well as the families, caregivers and
              community networks that support them. We work with people
              from all walks of life who share one thing in common: a
              desire to age with health, dignity and independence.
            </p>
            <ul className="mt-2 space-y-2 text-base sm:text-[20px] font-medium text-[#43586C]">
              <li>• Older adults seeking preventive health knowledge</li>
              <li>• Families and caregivers supporting elderly loved ones</li>
              <li>• Community groups and local health volunteers</li>
              <li>• Vulnerable elderly individuals needing extra support</li>
            </ul>
          </AnimateIn>
        </Container>
      </section>

      {/* FOUNDER BIOGRAPHY */}
      <section className="bg-forest-800 py-20">
        <Container>
          <AnimateIn animation="fade-up">
            <SectionHeading
              eyebrow="Our Founder"
              title="The Heart Behind the Initiative."
              align="center"
              tone="light"
              className="mx-auto"
            />
          </AnimateIn>

          {/* Founder card */}
          <AnimateIn animation="fade-up" delay={100}>
          <div className="mt-14 rounded-2xl border border-white/10 bg-white/5 p-8 sm:p-12">
            {/* Name + credentials */}
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white/10 text-sage-light">
                <UserRound size={40} aria-hidden />
              </span>
              <div>
                <h3 className="font-display text-2xl font-semibold text-white">
                  {founder.name}
                </h3>
                <p className="mt-1 text-sm font-medium tracking-wide text-gold-300">
                  {founder.credentials}
                </p>
                <p className="mt-0.5 text-sm text-sage-light/80">
                  {founder.role}
                </p>
              </div>
            </div>

            {/* Biography paragraphs */}
            <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-sage-light/90">
              {founder.bio.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* Quote */}
            <blockquote className="mt-10 border-l-4 border-gold-400 pl-6">
              <p className="font-display text-lg italic leading-relaxed text-white/90">
                &ldquo;{founder.quote}&rdquo;
              </p>
              <footer className="mt-2 text-sm text-gold-300">
                — {founder.name}
              </footer>
            </blockquote>

            {/* Qualifications + Certifications */}
            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-gold-300">
                  Qualifications
                </p>
                <ul className="mt-4 space-y-2">
                  {founder.qualifications.map((q) => (
                    <li
                      key={q}
                      className="flex items-start gap-2 text-sm text-sage-light/90"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" />
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-gold-300">
                  Additional Certifications
                </p>
                <div className="mt-4 space-y-5">
                  {founder.certifications.map((group) => (
                    <div key={group.issuer}>
                      <p className="text-xs font-semibold text-sage-light">
                        {group.issuer}
                      </p>
                      <ul className="mt-2 space-y-1.5">
                        {group.courses.map((course) => (
                          <li
                            key={course}
                            className="flex items-start gap-2 text-sm text-sage-light/80"
                          >
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400/60" />
                            {course}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          </AnimateIn>

        </Container>
      </section>

      {/* PARTNERS */}
      <section className="bg-cream py-20">
        <Container>
          <AnimateIn animation="fade-up">
            <SectionHeading
              eyebrow="Partners"
              title="Working Alongside Trusted Organizations."
              align="center"
              className="mx-auto"
            />
          </AnimateIn>
        </Container>
        <AnimateIn animation="fade-up" delay={150} className="mt-12">
          <PartnerMarquee partners={partnerPlaceholders} />
        </AnimateIn>
      </section>

      <CTASection
        title="Want to Learn More About Our Work?"
        description="Explore our programs or reach out — we would love to connect with you."
        primaryLabel="View Our Programs"
        primaryHref="/programs"
        secondaryLabel="Contact Us"
        secondaryHref="/contact"
      />
    </>
  );
}
