import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Safeguarding Policy",
  robots: { index: false },
};

export default function SafeguardingPolicyPage() {
  return (
    <section className="bg-cream py-20 sm:py-28">
      <Container className="max-w-3xl">
        <h1 className="text-3xl font-semibold text-forest-800 sm:text-4xl">
          Safeguarding Policy
        </h1>
        <p className="mt-6 rounded-md border-2 border-dashed border-forest-200 bg-white p-6 text-stone-warm">
          Protecting the wellbeing and dignity of the older adults and
          vulnerable people we serve is central to our work. Our formal
          Safeguarding Policy is being finalized and will be published here.
          For questions in the meantime, please contact us directly.
        </p>
      </Container>
    </section>
  );
}
