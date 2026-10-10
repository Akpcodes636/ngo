import type { ImpactStat } from "@/data/impact";

export function ImpactCard({ stat }: { stat: ImpactStat }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm sm:p-8">
      <p className="font-display text-4xl font-bold text-gold-300 sm:text-5xl">
        {stat.value}
      </p>
      <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-sage-light sm:text-base">
        {stat.label}
      </p>
      {stat.isPlaceholder && (
        <p className="mt-2 text-xs text-sage-light/60">
          Figure to be updated once reported
        </p>
      )}
    </div>
  );
}
