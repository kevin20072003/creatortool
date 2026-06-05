export type ScanType = "progressive" | "interlaced" | "psf";

export type VideoFormatPreset = {
  id: string;
  label: string;
  group: "SD" | "HD" | "UHD / 4K" | "8K" | "Custom";
  width: number;
  height: number;
  scanType: ScanType;
  displayRate: number;
  frameRate: number;
  fieldRate: number | null;
  effectiveMotionRate: number;
};

function progressive(id: string, label: string, group: VideoFormatPreset["group"], width: number, height: number, fps: number): VideoFormatPreset {
  return { id, label, group, width, height, scanType: "progressive", displayRate: fps, frameRate: fps, fieldRate: null, effectiveMotionRate: fps };
}

function interlaced(id: string, label: string, group: VideoFormatPreset["group"], width: number, height: number, fieldRate: number): VideoFormatPreset {
  return { id, label, group, width, height, scanType: "interlaced", displayRate: fieldRate, frameRate: fieldRate / 2, fieldRate, effectiveMotionRate: fieldRate };
}

function interlacedFrameLabel(id: string, label: string, group: VideoFormatPreset["group"], width: number, height: number, frameRate: number): VideoFormatPreset {
  const fieldRate = frameRate * 2;
  return { id, label, group, width, height, scanType: "interlaced", displayRate: frameRate, frameRate, fieldRate, effectiveMotionRate: fieldRate };
}

function psf(id: string, label: string, group: VideoFormatPreset["group"], width: number, height: number, fps: number): VideoFormatPreset {
  return { id, label, group, width, height, scanType: "psf", displayRate: fps, frameRate: fps, fieldRate: null, effectiveMotionRate: fps };
}

export const videoFormatPresets: VideoFormatPreset[] = [
  interlacedFrameLabel("480i-29.97", "480i 29.97", "SD", 720, 480, 29.97),
  progressive("480p-29.97", "480p 29.97", "SD", 720, 480, 29.97),
  interlacedFrameLabel("576i-25", "576i 25", "SD", 720, 576, 25),
  progressive("576p-25", "576p 25", "SD", 720, 576, 25),
  progressive("720p-25", "720p 25", "HD", 1280, 720, 25),
  progressive("720p-29.97", "720p 29.97", "HD", 1280, 720, 29.97),
  progressive("720p-50", "720p 50", "HD", 1280, 720, 50),
  progressive("720p-59.94", "720p 59.94", "HD", 1280, 720, 59.94),
  interlaced("1080i-50", "1080i 50", "HD", 1920, 1080, 50),
  interlaced("1080i-59.94", "1080i 59.94", "HD", 1920, 1080, 59.94),
  psf("1080psf-23.976", "1080PsF 23.976", "HD", 1920, 1080, 23.976),
  psf("1080psf-24", "1080PsF 24", "HD", 1920, 1080, 24),
  progressive("1080p-23.976", "1080p 23.976", "HD", 1920, 1080, 23.976),
  progressive("1080p-24", "1080p 24", "HD", 1920, 1080, 24),
  progressive("1080p-25", "1080p 25", "HD", 1920, 1080, 25),
  progressive("1080p-29.97", "1080p 29.97", "HD", 1920, 1080, 29.97),
  progressive("1080p-50", "1080p 50", "HD", 1920, 1080, 50),
  progressive("1080p-59.94", "1080p 59.94", "HD", 1920, 1080, 59.94),
  progressive("1080p-60", "1080p 60", "HD", 1920, 1080, 60),
  progressive("2160p-23.976", "2160p 23.976", "UHD / 4K", 3840, 2160, 23.976),
  progressive("2160p-24", "2160p 24", "UHD / 4K", 3840, 2160, 24),
  progressive("2160p-25", "2160p 25", "UHD / 4K", 3840, 2160, 25),
  progressive("2160p-29.97", "2160p 29.97", "UHD / 4K", 3840, 2160, 29.97),
  progressive("2160p-50", "2160p 50", "UHD / 4K", 3840, 2160, 50),
  progressive("2160p-59.94", "2160p 59.94", "UHD / 4K", 3840, 2160, 59.94),
  progressive("2160p-60", "2160p 60", "UHD / 4K", 3840, 2160, 60),
  progressive("4320p-24", "4320p 24", "8K", 7680, 4320, 24),
  progressive("4320p-30", "4320p 30", "8K", 7680, 4320, 30),
  progressive("4320p-60", "4320p 60", "8K", 7680, 4320, 60),
];

export const groupedVideoFormats = ["SD", "HD", "UHD / 4K", "8K"] as const;

export type VideoFormatSelectorValue = {
  presetId: string;
  customWidth: string;
  customHeight: string;
  customRate: string;
  customScanType: ScanType;
};

export const defaultVideoFormatValue: VideoFormatSelectorValue = {
  presetId: "1080p-50",
  customWidth: "1920",
  customHeight: "1080",
  customRate: "50",
  customScanType: "progressive",
};

export function getVideoFormatPreset(id: string) {
  return videoFormatPresets.find((format) => format.id === id) || videoFormatPresets.find((format) => format.id === "1080p-50")!;
}

export function resolveVideoFormat(value: VideoFormatSelectorValue): VideoFormatPreset {
  if (value.presetId !== "custom") return getVideoFormatPreset(value.presetId);
  const width = Number(value.customWidth) || 1920;
  const height = Number(value.customHeight) || 1080;
  const rate = Number(value.customRate) || 25;
  if (value.customScanType === "interlaced") {
    return interlaced(`custom-${width}x${height}i-${rate}`, `Custom ${height}i ${rate}`, "Custom", width, height, rate);
  }
  if (value.customScanType === "psf") {
    return psf(`custom-${width}x${height}psf-${rate}`, `Custom ${height}PsF ${rate}`, "Custom", width, height, rate);
  }
  return progressive(`custom-${width}x${height}p-${rate}`, `Custom ${height}p ${rate}`, "Custom", width, height, rate);
}

export function scanTypeLabel(scanType: ScanType) {
  if (scanType === "interlaced") return "Interlaced scan";
  if (scanType === "psf") return "PsF / Progressive Segmented Frame";
  return "Progressive scan";
}
