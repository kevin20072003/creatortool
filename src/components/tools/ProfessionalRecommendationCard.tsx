import { professionalVideoWarnings } from "@/lib/video/videoCalculations";
import type { VideoFormatPreset } from "@/lib/video/videoFormats";

export function ProfessionalRecommendationCard({ format, deliveryTarget = "" }: { format: VideoFormatPreset; deliveryTarget?: string }) {
  const warnings = professionalVideoWarnings(format, deliveryTarget);
  return (
    <div className="card p-5">
      <h3 className="text-lg font-black">Professional recommendation</h3>
      <div className="mt-3 grid gap-3">
        {warnings.map((warning) => (
          <p className="rounded-lg bg-[var(--background)] p-3 text-sm leading-6 muted" key={warning}>{warning}</p>
        ))}
      </div>
    </div>
  );
}
