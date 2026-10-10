import type { Metadata } from "next";
import Image from "next/image";
import { HeartHandshake, HandCoins, Handshake, Megaphone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { Button } from "@/components/ui/Button";
import { CTASection } from "@/components/CTASection";
import { getInvolvedImage } from "@/data/images";

export const metadata: Metadata = {
  title: "Get Involved",
  description:
    "Support Healthy Golden Years Initiative by donating, volunteering, partnering or advocating for healthy ageing and elderly dignity in Nigeria.",
};

const ways = [
  {
    icon: HandCoins,
    title: "Donate",
    description:
      "Support the organization's programs — from preventive health education to community outreach and elderly support.",
    cta: "Donate Now",
    href: "/donate",
  },
  {
    icon: HeartHandshake,
    title: "Volunteer",
    description:
      "Give your time and skills to support community outreach, health education sessions and elder support activities.",
    cta: "Volunteer With Us",
    href: "/contact?interest=volunteer",
  },
  {
    icon: Handshake,
    title: "Partner",
    description:
      "Work with us as a healthcare provider, corporate partner, community group or development organization.",
    cta: "Become a Partner",
    href: "/contact?interest=partner",
  },
  {
    icon: Megaphone,
    title: "Advocate",
    description:
      "Help spread awareness about healthy ageing, preventive health and the dignity older adults deserve.",
    cta: "Help Spread the Word",
    href: "/contact?interest=advocate",
  },
];

export default function GetInvolvedPage() {
  return (
    <>
      <section className="bg-forest-900 py-20 sm:py-28">
        <Container className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
          <SectionHeading
            level="h1"
            eyebrow="Get Involved"
            title="Everyone Has a Role to Play."
            description="Whether through giving, time, partnership or your voice — there's a meaningful way for you to support healthy ageing in our communities."
            tone="light"
          />
          <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg">
            <Image
              src="/image/volunteers-3.jpg"
              alt={getInvolvedImage.alt}
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
        </Container>
      </section>

      <section className="bg-cream py-20 sm:py-24">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2">
            {ways.map((way) => (
              <div
                key={way.title}
                className="flex flex-col gap-4 rounded-lg border border-forest-100 bg-white p-6 sm:p-8 shadow-sm"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-md bg-forest-700 text-gold-300">
                  <way.icon size={26} aria-hidden />
                </span>
                <h3 className="text-2xl font-semibold text-forest-800">
                  {way.title}
                </h3>
                <p className="flex-1 text-[15px] leading-relaxed text-stone-warm">
                  {way.description}
                </p>
                <div>
                  <Button href={way.href} variant="secondary" size="md">
                    {way.cta}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <CTASection
        title="Not Sure Where to Start?"
        description="Reach out and tell us how you'd like to help — we'll help you find the right fit."
        primaryLabel="Contact Us"
        primaryHref="/contact"
      />
    </>
  );
}
