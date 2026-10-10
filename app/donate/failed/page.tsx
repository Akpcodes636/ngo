import type { Metadata } from "next";
import { XCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { contact } from "@/data/site";

export const metadata: Metadata = {
  title: "Payment Unsuccessful",
  robots: { index: false },
};

export default function DonateFailedPage() {
  return (
    <section className="bg-cream py-24 sm:py-32">
      <Container className="max-w-xl text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-600 text-white">
          <XCircle size={32} aria-hidden />
        </span>
        <h1 className="mt-6 text-3xl font-semibold text-forest-800 sm:text-4xl">
          Your Donation Wasn&rsquo;t Completed.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-stone-warm">
          It looks like your payment didn&rsquo;t go through. No amount has
          been charged. You&rsquo;re welcome to try again, use bank transfer, or
          reach us at {contact.phone} if you need help.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button href="/donate" variant="secondary" size="lg">
            Try Again
          </Button>
          <Button href="/contact" variant="outline-dark" size="lg">
            Contact Us
          </Button>
        </div>
      </Container>
    </section>
  );
}
