import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Terms of Use",
  robots: { index: false },
};

export default function TermsPage() {
  return (
    <section className="bg-cream py-20 sm:py-28">
      <Container className="max-w-3xl">
        <h1 className="text-3xl font-semibold text-forest-800 sm:text-4xl">
          Terms of Use
        </h1>
        <p className="mt-6 rounded-md border-2 border-dashed border-forest-200 bg-white p-6 text-stone-warm">
          Our Terms of Use are being finalized and will be published here.
          They will cover acceptable use of this website, intellectual
          property and donation terms. For questions in the meantime,
          please contact us directly.
        </p>
      </Container>
    </section>
  );
}
