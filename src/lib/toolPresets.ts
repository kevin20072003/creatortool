export const resolutionPresets = {
  "720p HD": { width: 1280, height: 720 },
  "1080p Full HD": { width: 1920, height: 1080 },
  "1440p 2K": { width: 2560, height: 1440 },
  "2160p 4K UHD": { width: 3840, height: 2160 },
  "4320p 8K": { width: 7680, height: 4320 },
};

export const audioPresetsMbps: Record<string, number> = {
  "No audio": 0,
  "AAC 128 kbps": 0.128,
  "AAC 192 kbps": 0.192,
  "AAC 320 kbps": 0.32,
  "PCM/WAV 16-bit 48kHz stereo": 1.536,
  "PCM/WAV 24-bit 48kHz stereo": 2.304,
};

export const bitrateBaseMbps: Record<string, Record<string, number>> = {
  "H.264": { "1080p Full HD-30": 12, "1080p Full HD-60": 20, "2160p 4K UHD-30": 50, "2160p 4K UHD-60": 100 },
  "H.265 / HEVC": { "1080p Full HD-30": 8, "1080p Full HD-60": 14, "2160p 4K UHD-30": 35, "2160p 4K UHD-60": 65 },
  "XAVC S": { "1080p Full HD-30": 50, "2160p 4K UHD-30": 100, "2160p 4K UHD-60": 150 },
  "XAVC HS": { "2160p 4K UHD-30": 50, "2160p 4K UHD-60": 100 },
  "ProRes 422 Proxy": { "1080p Full HD-30": 45, "2160p 4K UHD-30": 180 },
  "ProRes 422 LT": { "1080p Full HD-30": 102, "2160p 4K UHD-30": 410 },
  "ProRes 422": { "1080p Full HD-30": 147, "2160p 4K UHD-30": 589 },
  "ProRes 422 HQ": { "1080p Full HD-30": 220, "2160p 4K UHD-30": 884 },
  "ProRes 4444": { "1080p Full HD-30": 330, "2160p 4K UHD-30": 1320 },
  "DNxHD / DNxHR": { "1080p Full HD-30": 145, "2160p 4K UHD-30": 580 },
  "Blackmagic RAW": { "1080p Full HD-30": 120, "2160p 4K UHD-30": 480 },
  "REDCODE RAW": { "1080p Full HD-30": 160, "2160p 4K UHD-30": 640 },
};

const codecEfficiency: Record<string, number> = {
  "H.264": 1,
  "H.265 / HEVC": 0.68,
  "XAVC S": 4.1,
  "XAVC HS": 2.1,
  "ProRes 422 Proxy": 15,
  "ProRes 422 LT": 34,
  "ProRes 422": 49,
  "ProRes 422 HQ": 73,
  "ProRes 4444": 110,
  "DNxHD / DNxHR": 48,
  "Blackmagic RAW": 40,
  "REDCODE RAW": 53,
};

export function estimateVideoBitrateMbps(codec: string, resolution: string, fps: number, customWidth?: number, customHeight?: number) {
  if (codec === "Custom") return 50;
  const direct = bitrateBaseMbps[codec]?.[`${resolution}-${fps}`];
  if (direct) return direct;

  const selected = resolutionPresets[resolution as keyof typeof resolutionPresets] || { width: customWidth || 1920, height: customHeight || 1080 };
  const baseResolution = resolution.includes("2160p") || resolution.includes("4320p") ? resolutionPresets["2160p 4K UHD"] : resolutionPresets["1080p Full HD"];
  const codecTable = bitrateBaseMbps[codec] || bitrateBaseMbps["H.264"];
  const baseKey = codecTable["2160p 4K UHD-30"] ? "2160p 4K UHD-30" : "1080p Full HD-30";
  const baseBitrate = codecTable[baseKey] || (12 * (codecEfficiency[codec] || 1));
  const base = baseKey.startsWith("2160p") ? resolutionPresets["2160p 4K UHD"] : baseResolution;
  const pixelRatio = (selected.width * selected.height) / (base.width * base.height);
  return Math.max(1, baseBitrate * pixelRatio * (fps / 30));
}

export function suggestCardSize(gb: number) {
  const cards = [32, 64, 128, 256, 512, 1024, 2048];
  const found = cards.find((card) => card >= gb);
  return found ? `${found >= 1024 ? found / 1024 : found} ${found >= 1024 ? "TB" : "GB"}` : "Multiple 2 TB cards/drives";
}

export function formatSize(gb: number) {
  return {
    mb: gb * 1024,
    gb,
    tb: gb / 1024,
  };
}
