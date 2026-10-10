import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  HeartHandshake,
  Activity,
  Users,
  HandHeart,
  Stethoscope,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import type { Program } from "@/data/programs";

const icons: Record<Program["icon"], LucideIcon> = {
  "book-open": BookOpen,
  "heart-handshake": HeartHandshake,
  activity: Activity,
  users: Users,
  "hand-heart": HandHeart,
  stethoscope: Stethoscope,
};

export function ProgramCard({ program }: { program: Program }) {
  const Icon = icons[program.icon];

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-forest-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative h-52 w-full overflow-hidden">
        <Image
          src={program.image.src}
          alt={program.image.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-md bg-forest-800/90 text-gold-300 shadow">
          <Icon size={22} aria-hidden />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="text-lg font-semibold text-forest-800">
          {program.title}
        </h3>
        <p className="flex-1 text-[15px] leading-relaxed text-stone-warm">
          {program.shortDescription}
        </p>
        <Link
          href={`/programs#${program.slug}`}
          className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-forest-700 hover:text-gold-600"
        >
          Learn More
          <ArrowRight size={16} aria-hidden />
        </Link>
      </div>
    </article>
  );
}
