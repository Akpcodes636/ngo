import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Privacy Policy",
  robots: { index: false },
};

export default function PrivacyPolicyPage() {
  return (
    <section className="bg-cream py-20 sm:py-28">
      <Container className="max-w-3xl">
        <h1 className="text-3xl font-semibold text-forest-800 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-6 rounded-md border-2 border-dashed border-forest-200 bg-white p-6 text-stone-warm">
          Our full Privacy Policy is being finalized and will be published
          here. It will explain what information we collect (such as
          contact and donation details), how it is used and protected, and
          the choices available to you. For questions in the meantime,
          please contact us directly.
        </p>
      </Container>
    </section>
  );
}
