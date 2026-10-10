import { Quote } from "lucide-react";
import type { Testimonial } from "@/data/impact";

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="flex h-full flex-col gap-4 rounded-lg bg-white p-7 shadow-sm ring-1 ring-forest-100">
      <Quote className="text-gold-500" size={28} aria-hidden />
      <blockquote className="flex-1 text-[15px] italic leading-relaxed text-forest-800">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
      <figcaption className="text-sm">
        <span className="block font-semibold text-forest-800">
          {testimonial.name}
        </span>
        <span className="text-stone-warm">{testimonial.role}</span>
      </figcaption>
    </figure>
  );
}
