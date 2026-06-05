import { estimateScanAwareBitrateMbps, scanComplexityNote } from "./bitratePresets";
import type { VideoFormatPreset } from "./videoFormats";

export const videoFileSizeDisclaimer =
  "Actual file size can vary based on camera model, codec profile, chroma subsampling, bit depth, scene complexity, audio format, and manufacturer implementation.";

export type VideoEstimateInput = {
  format: VideoFormatPreset;
  codec: string;
  bitrateMode: "Auto estimate" | "Manual bitrate";
  manualBitrateMbps: number;
  audioMbps: number;
  durationSeconds: number;
  cameras: number;
  safetyMarginPercent: number;
  days?: number;
};

export function calculateVideoEstimate(input: VideoEstimateInput) {
  const videoMbps = estimateScanAwareBitrateMbps(
    input.codec,
    input.format,
    input.bitrateMode === "Manual bitrate" ? input.manualBitrateMbps : undefined,
  );
  const totalMbps = videoMbps + input.audioMbps;
  const singleCameraGb = (totalMbps * input.durationSeconds) / 8 / 1024;
  const multiCameraGb = singleCameraGb * Math.max(1, input.cameras);
  const withMarginGb = multiCameraGb * (1 + input.safetyMarginPercent / 100);
  const dailyGb = withMarginGb * Math.max(1, input.days || 1);
  return {
    videoMbps,
    totalMbps,
    singleCameraGb,
    multiCameraGb,
    withMarginGb,
    dailyGb,
    mb: singleCameraGb * 1024,
    tb: singleCameraGb / 1024,
    bitrateNote: scanComplexityNote(input.format.scanType, input.codec),
  };
}

export function formatRate(value: number | null) {
  if (value === null) return "None";
  return Number.isInteger(value) ? value.toFixed(0) : value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

export function professionalVideoWarnings(format: VideoFormatPreset, deliveryTarget = "") {
  const warnings: string[] = [];
  if (format.scanType === "interlaced") {
    warnings.push("Interlaced formats like 1080i are common in broadcast workflows, but YouTube, web video, modern TVs, phones, and computer screens are progressive-first. For online upload, deinterlacing to progressive is usually recommended.");
    if (format.id === "1080i-50") warnings.push("1080i50 means 50 fields per second, not 50 full frames per second. It is roughly 25 full frames per second with 50 motion samples.");
    if (format.id === "1080i-59.94") warnings.push("1080i59.94 means 59.94 fields per second, not 59.94 full frames per second. It is roughly 29.97 full frames per second with 59.94 motion samples.");
    if (/youtube|online|web|stream/i.test(deliveryTarget)) warnings.push("Recommended: convert/deinterlace to progressive before uploading.");
    warnings.push("For fast motion, 720p50/60 or 1080p50/60 is usually cleaner than 1080i for web delivery.");
  }
  if (format.scanType === "psf") {
    warnings.push("PsF is progressive content carried in an interlaced-style signal. Storage is usually closer to progressive, but workflow compatibility depends on camera and editor.");
  }
  if (!warnings.length) warnings.push("Progressive scan is generally best for YouTube, social media, phones, computer screens, and modern web delivery.");
  return warnings;
}

export function interlacedComparison(format: VideoFormatPreset) {
  if (format.scanType !== "interlaced") return "";
  return `Selected: ${format.label}
Equivalent full frames: ${formatRate(format.frameRate)} fps
Motion samples: ${formatRate(format.fieldRate)} fields/sec
Web recommendation: deinterlace to ${format.height}p${formatRate(format.frameRate)} or ${format.height}p${formatRate(format.effectiveMotionRate)} depending on workflow.`;
}
