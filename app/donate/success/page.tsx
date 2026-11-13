import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { contact } from "@/data/site";
import { verifyDonationPayment } from "@/app/lib/supabase/payments/service";
import type { VerificationResult } from "@/app/lib/supabase/payments/verification";

export const metadata: Metadata = {
  title: "Donation Status",
  robots: { index: false },
};

// GlobalPay redirects here with OUR merchant reference (we put it in the
// redirectUrl). The query string is never treated as proof of payment: the
// page shows success only after server-side requery confirms it.

function firstParam(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  // Defensive: if GlobalPay appends its own "?param=" to our URL naively,
  // keep only our reference.
  return raw?.split("?")[0]?.trim() || undefined;
}

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
});

type View = {
  icon: ReactNode;
  iconClass: string;
  title: string;
  body: string;
  showReference: boolean;
  primary: { href: string; label: string };
  secondary: { href: string; label: string };
};

function viewFor(result: VerificationResult, retryHref: string): View {
  const home = { href: "/", label: "Return Home" };
  const contactUs = { href: "/contact", label: "Contact Us" };

  switch (result.state) {
    case "successful":
      return {
        icon: <CheckCircle2 size={32} aria-hidden />,
        iconClass: "bg-forest-700",
        title: "Thank You for Your Generosity.",
        body:
          (result.amount !== null
            ? `Your donation of ${naira.format(result.amount)} has been confirmed. `
            : "Your donation has been confirmed. ") +
          "It helps us promote preventive health, self-care and dignity for older adults across our communities. Please keep your reference for your records.",
        showReference: true,
        primary: home,
        secondary: { href: "/impact", label: "See Our Impact" },
      };

    case "pending":
      return {
        icon: <Clock size={32} aria-hidden />,
        iconClass: "bg-gold-600",
        title: "We're Confirming Your Payment.",
        body: "Your payment has not been confirmed yet. This can take a few minutes. Please don't pay again. Check the status again shortly, or contact us with your reference if this persists.",
        showReference: true,
        primary: { href: retryHref, label: "Check Again" },
        secondary: contactUs,
      };

    case "failed":
      return {
        icon: <XCircle size={32} aria-hidden />,
        iconClass: "bg-gold-600",
        title: "Your Donation Wasn't Completed.",
        body: `The payment was not successful. You're welcome to try again, use bank transfer, or reach us at ${contact.phone} if you need help.`,
        showReference: true,
        primary: { href: "/donate", label: "Try Again" },
        secondary: contactUs,
      };

    case "needs_review":
      return {
        icon: <AlertTriangle size={32} aria-hidden />,
        iconClass: "bg-gold-600",
        title: "We Need to Review This Payment.",
        body: "We couldn't automatically match this payment to your donation. Please don't pay again. Contact us with your reference and we'll resolve it.",
        showReference: true,
        primary: contactUs,
        secondary: home,
      };

    case "unavailable":
      return {
        icon: <Clock size={32} aria-hidden />,
        iconClass: "bg-gold-600",
        title: "We Can't Confirm Your Payment Right Now.",
        body: "We couldn't reach the payment provider to confirm your donation. Please don't pay again. Check the status again in a few minutes.",
        showReference: true,
        primary: { href: retryHref, label: "Check Again" },
        secondary: contactUs,
      };

    case "not_found":
    case "invalid_reference":
      return {
        icon: <AlertTriangle size={32} aria-hidden />,
        iconClass: "bg-gold-600",
        title: "We Couldn't Find This Donation.",
        body: "This link doesn't match a donation in our records. If you were charged, please contact us and we'll help.",
        showReference: false,
        primary: contactUs,
        secondary: home,
      };
  }
}

export default async function DonateSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string | string[] }>;
}) {
  const params = await searchParams;
  const reference = firstParam(params.reference);

  const result = await verifyDonationPayment(reference);
  const retryHref = result.reference
    ? `/donate/success?reference=${encodeURIComponent(result.reference)}`
    : "/donate";
  const view = viewFor(result, retryHref);

  return (
    <section className="bg-cream py-24 sm:py-32">
      <Container className="max-w-xl text-center">
        <span
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-white ${view.iconClass}`}
        >
          {view.icon}
        </span>
        <h1 className="mt-6 text-3xl font-semibold text-forest-800 sm:text-4xl">
          {view.title}
        </h1>
        <p
          role={result.state === "successful" ? undefined : "status"}
          className="mt-4 text-lg leading-relaxed text-stone-warm"
        >
          {view.body}
        </p>
        {view.showReference && result.reference && (
          <p className="mt-4 text-sm text-stone-warm">
            Reference: <span className="font-mono">{result.reference}</span>
          </p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button href={view.primary.href} variant="secondary" size="lg">
            {view.primary.label}
          </Button>
          <Button href={view.secondary.href} variant="outline-dark" size="lg">
            {view.secondary.label}
          </Button>
        </div>
      </Container>
    </section>
  );
}
