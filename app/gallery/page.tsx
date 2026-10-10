import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { GalleryGrid } from "@/components/GalleryGrid";
import { CTASection } from "@/components/CTASection";
import { galleryImages } from "@/data/images";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "A visual look at Healthy Golden Years Initiative's community health outreach, elderly support programs, volunteers and partnerships across Nigeria.",
};

export default function GalleryPage() {
  return (
    <>
      <section className="bg-forest-900 py-20 sm:py-28">
        <Container>
          <SectionHeading
            level="h1"
            eyebrow="Gallery"
            title="Our Work, In Pictures."
            description="A visual record of the communities, outreach programs, volunteers and partnerships that make our mission possible."
            tone="light"
            className="max-w-3xl"
          />
        </Container>
      </section>

      <section className="bg-cream py-16 sm:py-20">
        <Container>
          <GalleryGrid images={galleryImages} />
        </Container>
      </section>

      <CTASection
        title="Be Part of the Next Story."
        description="Volunteer, partner or support our work to help write the next chapter of healthy ageing in our communities."
        primaryLabel="Get Involved"
        primaryHref="/get-involved"
        secondaryLabel="Support Our Mission"
        secondaryHref="/donate"
      />
    </>
  );
}
