import { Heart, Handshake, Users, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";
import type { CoreValue } from "@/data/values";

const icons: Record<CoreValue["icon"], LucideIcon> = {
  heart: Heart,
  handshake: Handshake,
  users: Users,
  "shield-check": ShieldCheck,
  sparkles: Sparkles,
};

export function ValueCard({ value }: { value: CoreValue }) {
  const Icon = icons[value.icon];
  return (
    <div className="flex h-full flex-col gap-4 rounded-lg border border-forest-100 bg-white p-7 shadow-sm">
      <span className="flex h-12 w-12 items-center justify-center rounded-md bg-forest-700 text-gold-300">
        <Icon size={24} aria-hidden />
      </span>
      <h3 className="text-xl sm:text-[25px] font-normal text-forest-800 leading-[120%]">{value.title}</h3>
      <p className="text-base sm:text-[20px] leading-relaxed text-[#43586C]">
        {value.description}
      </p>
    </div>
  );
}
