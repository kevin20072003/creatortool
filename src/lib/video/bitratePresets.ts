import type { ScanType, VideoFormatPreset } from "./videoFormats";

export const videoCodecs = [
  "H.264",
  "H.265 / HEVC",
  "MPEG-2",
  "ProRes 422 Proxy",
  "ProRes 422 LT",
  "ProRes 422",
  "ProRes 422 HQ",
  "ProRes 4444",
  "DNxHD / DNxHR",
  "XAVC S",
  "XAVC HS",
  "Blackmagic RAW",
  "REDCODE RAW",
  "Custom",
];

const codecBase1080p30: Record<string, number> = {
  "H.264": 12,
  "H.265 / HEVC": 8,
  "MPEG-2": 25,
  "XAVC S": 50,
  "XAVC HS": 25,
  "ProRes 422 Proxy": 45,
  "ProRes 422 LT": 102,
  "ProRes 422": 147,
  "ProRes 422 HQ": 220,
  "ProRes 4444": 330,
  "DNxHD / DNxHR": 145,
  "Blackmagic RAW": 120,
  "REDCODE RAW": 160,
  "Custom": 50,
};

const interlaceFactors: Record<string, number> = {
  "H.264": 1.1,
  "H.265 / HEVC": 1.15,
  "MPEG-2": 1.2,
  "ProRes 422 Proxy": 1.05,
  "ProRes 422 LT": 1.05,
  "ProRes 422": 1.05,
  "ProRes 422 HQ": 1.05,
  "ProRes 4444": 1.05,
  "DNxHD / DNxHR": 1.05,
  "XAVC S": 1.1,
  "XAVC HS": 1.1,
  "Blackmagic RAW": 1.1,
  "REDCODE RAW": 1.1,
  "Custom": 1.1,
};

export function interlaceFactorForCodec(codec: string) {
  return interlaceFactors[codec] || 1.1;
}

export function estimateScanAwareBitrateMbps(codec: string, format: VideoFormatPreset, manualBitrate?: number) {
  if (manualBitrate && manualBitrate > 0) return manualBitrate;
  const base = codecBase1080p30[codec] || codecBase1080p30.Custom;
  const pixelRatio = (format.width * format.height) / (1920 * 1080);
  const rateForStorage = format.scanType === "interlaced" ? format.frameRate : format.frameRate;
  const scanFactor = format.scanType === "interlaced" ? interlaceFactorForCodec(codec) : 1;
  return Math.max(0.5, base * pixelRatio * (rateForStorage / 30) * scanFactor);
}

export function scanComplexityNote(scanType: ScanType, codec: string) {
  if (scanType !== "interlaced") return "Progressive/PsF storage is estimated from full frames per second.";
  return `Interlaced bitrate is estimated from full frame rate, then multiplied by a ${interlaceFactorForCodec(codec).toFixed(2)}x ${codec} interlace complexity factor.`;
}
