import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Thank You",
  robots: { index: false },
};

export default async function DonateSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  const params = await searchParams;
  const reference = params.reference ?? params.trxref;

  return (
    <section className="bg-cream py-24 sm:py-32">
      <Container className="max-w-xl text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-forest-700 text-white">
          <CheckCircle2 size={32} aria-hidden />
        </span>
        <h1 className="mt-6 text-3xl font-semibold text-forest-800 sm:text-4xl">
          Thank You for Your Generosity.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-stone-warm">
          Your donation helps us promote preventive health, self-care and
          dignity for older adults across our communities. A confirmation
          and receipt will be sent to the email address you provided.
        </p>
        {reference && (
          <p className="mt-4 text-sm text-stone-warm">
            Reference: <span className="font-mono">{reference}</span>
          </p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button href="/" variant="secondary" size="lg">
            Return Home
          </Button>
          <Button href="/impact" variant="outline-dark" size="lg">
            See Our Impact
          </Button>
        </div>
      </Container>
    </section>
  );
}
