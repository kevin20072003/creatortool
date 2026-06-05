import { formatRate } from "@/lib/video/videoCalculations";
import { scanTypeLabel, type VideoFormatPreset } from "@/lib/video/videoFormats";

export function ScanTypeInfo({ format }: { format: VideoFormatPreset }) {
  return (
    <div className="card p-5">
      <h3 className="text-lg font-black">What is i and p?</h3>
      <div className="mt-3 grid gap-2 text-sm leading-6 muted">
        <p><strong className="text-[var(--foreground)]">p</strong> means progressive scan. Every frame is captured/drawn as a complete image.</p>
        <p><strong className="text-[var(--foreground)]">i</strong> means interlaced scan. Each frame is split into two fields: odd lines and even lines.</p>
        <p>1080p50 means 50 full frames per second.</p>
        <p>1080i50 means 50 fields per second, usually 25 full frames per second.</p>
        <p>Interlaced can show combing artifacts on movement if not deinterlaced properly.</p>
        <p>Progressive is generally better for YouTube, social media, phones, computer screens, and modern web delivery.</p>
        <p>Interlaced is mostly used in broadcast, older cameras, and legacy workflows.</p>
      </div>
      <div className="mt-4 grid gap-2 rounded-lg bg-[var(--background)] p-3 text-sm">
        <p><strong>Selected video format:</strong> {format.label}</p>
        <p><strong>Resolution:</strong> {format.width} x {format.height}</p>
        <p><strong>Scan type:</strong> {scanTypeLabel(format.scanType)}</p>
        <p><strong>Frame rate:</strong> {formatRate(format.frameRate)} fps</p>
        {format.fieldRate ? <p><strong>Field rate:</strong> {formatRate(format.fieldRate)} fields/sec</p> : null}
        <p><strong>Effective motion rate:</strong> {formatRate(format.effectiveMotionRate)} motion samples/sec</p>
      </div>
    </div>
  );
}
