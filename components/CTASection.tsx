import { ReactNode } from "react";
import { Button } from "./ui/Button";
import { Container } from "./ui/Container";

export function CTASection({
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-forest-800 py-20 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <Container className="relative text-center">
        <h2 className="mx-auto max-w-2xl text-3xl font-semibold leading-tight text-white sm:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="mx-auto mt-4 max-w-xl text-lg text-sage-light">
            {description}
          </p>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button href={primaryHref} variant="primary" size="lg">
            {primaryLabel}
          </Button>
          {secondaryLabel && secondaryHref && (
            <Button href={secondaryHref} variant="outline-light" size="lg">
              {secondaryLabel}
            </Button>
          )}
        </div>
        {children}
      </Container>
    </section>
  );
}
