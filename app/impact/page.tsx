import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { ImpactCard } from "@/components/ImpactCard";
import { TestimonialCard } from "@/components/TestimonialCard";
import { CTASection } from "@/components/CTASection";
import { AnimateIn } from "@/components/AnimateIn";
import { impactStats, futureGoals, testimonials } from "@/data/impact";
import { impactImage } from "@/data/images";

export const metadata: Metadata = {
  title: "Our Impact",
  description:
    "See the impact of Healthy Golden Years Initiative's community health outreach, preventive health education and elderly support programs in Nigeria.",
};

export default function ImpactPage() {
  return (
    <>
      <section className="bg-forest-900 py-20 sm:py-28">
        <Container>
          <SectionHeading
            level="h1"
            eyebrow="Our Impact"
            title="Every Number Represents a Person."
            description="We are an early-stage initiative building our track record transparently. The figures below will be updated as programs launch and outcomes are verified — we will never inflate what we haven't yet achieved."
            tone="light"
            className="max-w-3xl"
          />
        </Container>
      </section>

      <section className="bg-forest-800 py-16">
        <Container>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {impactStats.map((stat, i) => (
              <AnimateIn key={stat.label} animation="fade-up" delay={i * 80}>
                <ImpactCard stat={stat} />
              </AnimateIn>
            ))}
          </div>
        </Container>
      </section>

      {/* THE PEOPLE BEHIND THE NUMBERS */}
      <section className="bg-cream py-20 sm:py-24">
        <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <AnimateIn animation="fade-right">
            <SectionHeading
              eyebrow="Beyond the Statistics"
              title="Real Communities, Real Outcomes."
            />
            <p className="mt-6 text-lg leading-relaxed text-stone-warm">
              Behind every statistic is a person — an older adult who
              learned how to manage a health condition, a family that felt
              less alone, a community that came together to support its
              elders. As our programs grow, we are committed to sharing
              honest, verified stories of the people we serve.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-stone-warm">
              We report our outcomes transparently — publishing real
              progress rather than inflated numbers, so partners and
              supporters can trust what we share.
            </p>
          </AnimateIn>
          <AnimateIn animation="fade-left" delay={100} className="relative aspect-4/5 w-full overflow-hidden rounded-lg">
            <Image
              src={impactImage.src}
              alt={impactImage.alt}
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </AnimateIn>
        </Container>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-sage-light py-20 sm:py-24">
        <Container>
          <AnimateIn animation="fade-up">
            <SectionHeading
              eyebrow="Voices From Our Community"
              title="What People Are Saying."
              description="Testimonials below are placeholders pending consent to publish real stories from participants, caregivers and volunteers."
              align="center"
              className="mx-auto"
            />
          </AnimateIn>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <AnimateIn key={t.name + t.role} animation="fade-up" delay={i * 80}>
                <TestimonialCard testimonial={t} />
              </AnimateIn>
            ))}
          </div>
        </Container>
      </section>

      {/* FUTURE GOALS */}
      <section className="bg-cream py-20 sm:py-24">
        <Container>
          <AnimateIn animation="fade-up">
            <SectionHeading
              eyebrow="Looking Ahead"
              title="Where We're Headed Next."
              align="center"
              className="mx-auto"
            />
          </AnimateIn>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {futureGoals.map((goal, i) => (
              <AnimateIn key={goal.title} animation="fade-up" delay={i * 80}>
                <div className="rounded-lg border border-forest-100 bg-white p-7 shadow-sm">
                  <h3 className="text-lg font-semibold text-forest-800">
                    {goal.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-stone-warm">
                    {goal.description}
                  </p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </Container>
      </section>

      <CTASection
        title="Help Us Grow This Impact."
        description="Every contribution helps us reach more older adults with preventive health education and community support."
        primaryLabel="Donate Now"
        primaryHref="/donate"
        secondaryLabel="View Our Programs"
        secondaryHref="/programs"
      />
    </>
  );
}
