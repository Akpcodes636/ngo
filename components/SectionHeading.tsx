import { ReactNode } from "react";
import clsx from "clsx";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "dark",
  level = "h2",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  tone?: "dark" | "light";
  level?: "h1" | "h2";
  className?: string;
}) {
  const Heading = level;
  return (
    <div
      className={clsx(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <p
          className={clsx(
            "mb-[2px] text-sm font-bold uppercase tracking-[0.15em]",
            tone === "dark" ? "text-gold-600" : "text-gold-300"
          )}
        >
          {eyebrow}
        </p>
      )}
      <Heading
        className={clsx(
          "text-[26px] sm:text-[32px] md:text-[39px] font-medium leading-[120%] text-[#1C2A38]",
          tone === "light" && "text-white"
        )}
      >
        {title}
      </Heading>
      {description && (
        <p
          className={clsx(
            "mt-4 text-lg leading-relaxed",
            tone === "dark" ? "text-stone-warm" : "text-sage-light"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
