const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const videoFormats = {
  "480i29.97": { label: "480i 29.97", w: 720, h: 480, scan: "interlaced", fps: 29.97, field: 59.94, motion: 59.94 },
  "480p 29.97": { label: "480p 29.97", w: 720, h: 480, scan: "progressive", fps: 29.97, field: null, motion: 29.97 },
  "576i25": { label: "576i 25", w: 720, h: 576, scan: "interlaced", fps: 25, field: 50, motion: 50 },
  "576p 25": { label: "576p 25", w: 720, h: 576, scan: "progressive", fps: 25, field: null, motion: 25 },
  "720p59.94": { label: "720p 59.94", w: 1280, h: 720, scan: "progressive", fps: 59.94, field: null, motion: 59.94 },
  "1080i50": { label: "1080i 50", w: 1920, h: 1080, scan: "interlaced", fps: 25, field: 50, motion: 50 },
  "1080i59.94": { label: "1080i 59.94", w: 1920, h: 1080, scan: "interlaced", fps: 29.97, field: 59.94, motion: 59.94 },
  "1080p50": { label: "1080p 50", w: 1920, h: 1080, scan: "progressive", fps: 50, field: null, motion: 50 },
  "2160p60": { label: "2160p 60", w: 3840, h: 2160, scan: "progressive", fps: 60, field: null, motion: 60 },
};

const codecBase = {
  "H.264": 12,
  "H.265 / HEVC": 8,
  "MPEG-2": 25,
  "XAVC S": 50,
  "XAVC HS": 25,
  "ProRes 422": 147,
  "DNxHD / DNxHR": 145,
  "Custom": 50,
};

const interlaceFactor = {
  "H.264": 1.1,
  "H.265 / HEVC": 1.15,
  "MPEG-2": 1.2,
  "XAVC S": 1.1,
  "XAVC HS": 1.1,
  "ProRes 422": 1.05,
  "DNxHD / DNxHR": 1.05,
  "Custom": 1.1,
};

document.addEventListener("click", (event) => {
  if (event.target.matches("[data-menu]")) $("[data-nav]")?.classList.toggle("open");
  if (event.target.matches("[data-copy]")) navigator.clipboard?.writeText($("[data-result]")?.innerText || "");
  if (event.target.matches("[data-reset]")) location.reload();
  if (event.target.matches("[data-example]")) loadExample();
});

document.addEventListener("input", () => runTool());
document.addEventListener("DOMContentLoaded", () => runTool());

function num(name) {
  return Number($(`[name="${name}"]`)?.value || 0);
}

function val(name) {
  return $(`[name="${name}"]`)?.value || "";
}

function formatNumber(value, decimals = 2) {
  return Number(value || 0).toFixed(decimals);
}

function durationSeconds() {
  return Math.max(1, num("hours") * 3600 + num("minutes") * 60 + num("seconds"));
}

function selectedFormat() {
  const key = val("format") || "1080p50";
  if (key === "custom") {
    const rate = num("custom_rate") || 25;
    const scan = val("scan") || "progressive";
    return {
      label: `Custom ${num("width") || 1920}x${num("height") || 1080} ${scan} ${rate}`,
      w: num("width") || 1920,
      h: num("height") || 1080,
      scan,
      fps: scan === "interlaced" ? rate / 2 : rate,
      field: scan === "interlaced" ? rate : null,
      motion: rate,
    };
  }
  return videoFormats[key] || videoFormats["1080p50"];
}

function estimateVideoBitrate(codec, format) {
  const base = codecBase[codec] || 12;
  const pixelScale = (format.w * format.h) / (1920 * 1080);
  const fpsScale = format.fps / 30;
  const factor = format.scan === "interlaced" ? (interlaceFactor[codec] || 1.1) : 1;
  return base * pixelScale * fpsScale * factor;
}

function sizeGB(mbps, seconds) {
  return (mbps * seconds) / 8 / 1024;
}

function suggestedCard(gb) {
  for (const size of [32, 64, 128, 256, 512, 1024, 2048, 4096]) {
    if (size >= gb) return size >= 1024 ? `${size / 1024} TB` : `${size} GB`;
  }
  return "Multiple drives";
}

function baseVideoSummary() {
  const format = selectedFormat();
  const codec = val("codec") || "H.264";
  const audioMbps = (num("audio") || 192) / 1000;
  const videoMbps = val("mode") === "Manual bitrate" ? num("manual") : estimateVideoBitrate(codec, format);
  const cameras = Math.max(1, num("cameras") || 1);
  const margin = (num("margin") || 20) / 100;
  const totalMbps = videoMbps + audioMbps;
  const gb = sizeGB(totalMbps, durationSeconds());
  const multi = gb * cameras;
  const safe = multi * (1 + margin);
  return { format, codec, audioMbps, videoMbps, cameras, margin, totalMbps, gb, multi, safe };
}

function runTool() {
  const wrap = $("[data-tool]");
  if (!wrap) return;
  const type = wrap.dataset.tool;
  const handlers = {
    "video-storage": storageOutput,
    "video-file-size": storageOutput,
    "bitrate": bitrateOutput,
    "recording-time": recordingTimeOutput,
    "streaming-bandwidth": streamingOutput,
    "aspect-ratio": aspectRatioOutput,
    "crop-factor": cropFactorOutput,
    "generator": titleGeneratorOutput,
    "description-generator": descriptionGeneratorOutput,
    "hashtag-generator": hashtagGeneratorOutput,
    "thumbnail-text-generator": thumbnailTextOutput,
    "srt-formatter": srtOutput,
    "line-break": lineBreakOutput,
    "upload-time": uploadTimeOutput,
    "export-helper": exportHelperOutput,
  };
  const result = (handlers[type] || storageOutput)();
  writeResult(result.text, result.summary);
}

function writeResult(text, summary = []) {
  const result = $("[data-result]");
  if (result) result.innerText = text;
  $$("[data-summary]").forEach((el, index) => {
    el.innerText = summary[index] || "";
  });
}

function formatBlock(summary) {
  const f = summary.format;
  return [
    `Selected video format: ${f.label}`,
    `Resolution: ${f.w} x ${f.h}`,
    `Scan type: ${f.scan}`,
    `Frame rate: ${formatNumber(f.fps, f.fps % 1 ? 2 : 0)} fps`,
    `Field rate: ${f.field ? `${formatNumber(f.field, f.field % 1 ? 2 : 0)} fields/sec` : "none"}`,
    `Effective motion rate: ${formatNumber(f.motion, f.motion % 1 ? 2 : 0)} samples/sec`,
    `Codec: ${summary.codec}`,
    `Estimated video bitrate: ${formatNumber(summary.videoMbps)} Mbps`,
    `Audio bitrate: ${formatNumber(summary.audioMbps, 3)} Mbps`,
  ].join("\n");
}

function professionalWarning(format) {
  if (format.scan === "psf") {
    return "PsF is progressive content carried in an interlaced-style signal. Storage is usually closer to progressive, but workflow compatibility depends on camera and editor.";
  }
  if (format.scan === "interlaced") {
    return `${format.label} uses ${format.field} fields/sec and ${format.fps} full frames/sec. Recommended: convert or deinterlace to progressive before YouTube, web, phone, or computer-screen delivery. For fast motion, 720p50/60 or 1080p50/60 is usually cleaner than 1080i for web delivery.`;
  }
  return "Progressive scan is usually the best choice for YouTube, social media, phones, computer screens, and modern web delivery.";
}

function disclaimer() {
  return "Actual file size can vary based on camera model, codec profile, chroma subsampling, bit depth, scene complexity, audio format, and manufacturer implementation.";
}

function storageOutput() {
  const s = baseVideoSummary();
  const text = `${formatBlock(s)}
Estimated file size: ${formatNumber(s.gb * 1024)} MB / ${formatNumber(s.gb)} GB / ${formatNumber(s.gb / 1024, 3)} TB
Multi-camera total: ${formatNumber(s.multi)} GB
Storage with safety margin: ${formatNumber(s.safe)} GB
Suggested card or drive size: ${suggestedCard(s.safe)}

${professionalWarning(s.format)}

${disclaimer()}`;
  return { text, summary: [s.format.label, `${formatNumber(s.videoMbps)} Mbps`, `${formatNumber(s.safe)} GB`, s.format.scan] };
}

function bitrateOutput() {
  const s = baseVideoSummary();
  const unit = val("unit");
  const targetGB = num("target") * (unit === "TB" ? 1024 : unit === "MB" ? 1 / 1024 : 1);
  const requiredTotal = (targetGB * 8 * 1024) / durationSeconds();
  const video = Math.max(0, requiredTotal - s.audioMbps);
  const warning = video > 50 ? "This is a high bitrate for web streaming. Uploading is fine, but live streaming may need a stronger connection." : "This bitrate is reasonable for common upload workflows.";
  const text = `${formatBlock({ ...s, videoMbps: video })}
Target size: ${formatNumber(targetGB)} GB
Required total bitrate: ${formatNumber(requiredTotal)} Mbps
Required video bitrate: ${formatNumber(video)} Mbps
YouTube upload note: use high quality source exports when possible; YouTube will re-encode the video.
Streaming warning: ${warning}

${professionalWarning(s.format)}

${disclaimer()}`;
  return { text, summary: [s.format.label, `${formatNumber(video)} Mbps`, `${formatNumber(targetGB)} GB`, s.format.scan] };
}

function recordingTimeOutput() {
  const s = baseVideoSummary();
  const storageGB = num("storage") * (val("storage_unit") === "TB" ? 1024 : val("storage_unit") === "MB" ? 1 / 1024 : 1);
  const minutes = (storageGB * 8 * 1024) / (s.totalMbps * s.cameras) / 60;
  const text = `${formatBlock(s)}
Storage available: ${formatNumber(storageGB)} GB
Estimated recording time: ${formatNumber(minutes, 1)} minutes / ${formatNumber(minutes / 60)} hours
Recording time per card: ${formatNumber(minutes, 1)} minutes
Recommended larger card for two hours: ${suggestedCard(sizeGB(s.totalMbps * s.cameras, 7200))}

${professionalWarning(s.format)}

${disclaimer()}`;
  return { text, summary: [s.format.label, `${formatNumber(s.totalMbps)} Mbps`, `${formatNumber(minutes / 60)} hr`, s.format.scan] };
}

function streamingOutput() {
  const s = baseVideoSummary();
  const streamMbps = num("stream_bitrate") || s.videoMbps;
  const minimum = (streamMbps + s.audioMbps) * s.cameras;
  const recommended = minimum * (1 + s.margin);
  const text = `${formatBlock({ ...s, videoMbps: streamMbps })}
Minimum upload speed: ${formatNumber(minimum)} Mbps
Recommended upload speed with margin: ${formatNumber(recommended)} Mbps
Suggested bitrate range: ${formatNumber(streamMbps * 0.8)}-${formatNumber(streamMbps * 1.2)} Mbps
Network stability warning: use wired internet where possible and leave extra headroom for drops.

${professionalWarning(s.format)}`;
  return { text, summary: [s.format.label, `${formatNumber(streamMbps)} Mbps`, `${formatNumber(recommended)} Mbps`, s.format.scan] };
}

function gcd(a, b) {
  return b ? gcd(b, a % b) : a;
}

function aspectRatioOutput() {
  const width = Math.max(1, Math.round(num("width") || 1920));
  const height = Math.max(1, Math.round(num("height") || 1080));
  const div = gcd(width, height);
  const ratio = `${width / div}:${height / div}`;
  const names = { "16:9": "YouTube landscape", "9:16": "Shorts/Reels vertical", "1:1": "Instagram square", "4:5": "Instagram portrait", "21:9": "Cinematic widescreen" };
  const orientation = width === height ? "square" : width > height ? "landscape" : "portrait";
  const text = `Simplified aspect ratio: ${ratio}
Orientation: ${orientation}
Common format: ${names[ratio] || "Custom format"}
Resize helper: at 1080px wide, height should be ${Math.round((1080 / width) * height)}px. At 1920px wide, height should be ${Math.round((1920 / width) * height)}px.`;
  return { text, summary: [ratio, orientation, names[ratio] || "Custom", "progressive"] };
}

function cropFactorOutput() {
  const focal = num("manual") || 50;
  const crop = num("custom_rate") || 1.5;
  const aperture = Math.max(0.7, num("target") || 2.8);
  const equiv = focal * crop;
  const equivAperture = aperture * crop;
  const category = equiv < 24 ? "Ultra-wide" : equiv < 35 ? "Wide" : equiv < 70 ? "Standard" : "Telephoto";
  const text = `Full-frame equivalent focal length: ${formatNumber(equiv, 1)}mm
Equivalent aperture depth-of-field estimate: f/${formatNumber(equivAperture, 1)}
Field of view category: ${category}
Note: exposure does not change; equivalent aperture is only a depth-of-field comparison.`;
  return { text, summary: [`${formatNumber(equiv)}mm`, `f/${formatNumber(equivAperture, 1)}`, category, "lens"] };
}

function titleGeneratorOutput() {
  const keyword = val("keyword") || "video editing";
  const niche = val("niche") || "creators";
  const tone = val("tone") || "Helpful";
  const ideas = [
    `How to Master ${keyword} Without Guesswork`,
    `${keyword}: The Simple Guide for ${niche}`,
    `I Tested ${keyword} So You Do Not Have To`,
    `${tone} Tips to Improve ${keyword} Today`,
    `The ${keyword} Mistakes Most ${niche} Make`,
  ];
  return { text: `Title ideas:\n- ${ideas.join("\n- ")}`, summary: ["Titles", tone, `${ideas.length} ideas`, "generator"] };
}

function descriptionGeneratorOutput() {
  const title = val("title") || val("keyword") || "New creator video";
  const topic = val("keyword") || "creator workflow";
  const links = val("links") || "Subscribe for more.";
  const text = `${title}

In this video, we cover ${topic} in a simple, practical way for creators.

What you will learn:
1. The key idea
2. Common mistakes
3. Practical next steps

${links}

#${slugTag(topic)} #CreatorTools #YouTubeTips`;
  return { text, summary: ["Description", "Ready", "Template", "generator"] };
}

function hashtagGeneratorOutput() {
  const words = (val("keyword") || "youtube creator tools").split(/[, ]+/).filter(Boolean);
  const tags = [...new Set(words.map(slugTag)), "CreatorTools", "YouTubeTips", "VideoEditing"].map((tag) => `#${tag}`);
  return { text: tags.join(" "), summary: ["Hashtags", `${tags.length}`, "Copy", "generator"] };
}

function thumbnailTextOutput() {
  const topic = val("keyword") || "video storage";
  const ideas = [`STOP WASTING SPACE`, `${topic.toUpperCase()}?`, `DO THIS FIRST`, `SAVE HOURS`, `BIG MISTAKE`];
  return { text: `Thumbnail text ideas:\n- ${ideas.join("\n- ")}`, summary: ["Thumbnail", "Short text", `${ideas.length} ideas`, "generator"] };
}

function srtOutput() {
  const lines = (val("text") || "").split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const blocks = lines.map((line, index) => {
    const start = index * 4;
    const end = start + 3;
    return `${index + 1}\n${timecode(start)} --> ${timecode(end)}\n${line}`;
  });
  return { text: blocks.join("\n\n"), summary: ["SRT", `${blocks.length} blocks`, "Formatted", "subtitle"] };
}

function lineBreakOutput() {
  const max = Math.max(20, num("line_length") || 42);
  const output = wrapText(val("text") || "", max);
  return { text: output, summary: ["Captions", `${max} chars`, "Wrapped", "subtitle"] };
}

function uploadTimeOutput() {
  const gb = num("file_size") || 10;
  const speed = Math.max(0.1, num("upload_speed") || 20);
  const minutes = (gb * 8 * 1024) / speed / 60;
  const text = `Estimated upload time: ${formatNumber(minutes, 1)} minutes / ${formatNumber(minutes / 60)} hours
File size: ${formatNumber(gb)} GB
Upload speed: ${formatNumber(speed)} Mbps
Recommendation: keep extra time for platform processing after upload completes.`;
  return { text, summary: ["Upload", `${formatNumber(minutes)} min`, `${formatNumber(speed)} Mbps`, "online"] };
}

function exportHelperOutput() {
  const s = baseVideoSummary();
  const target = s.format.scan === "interlaced" ? `Deinterlace to ${s.format.h}p${Math.round(s.format.fps)} or ${s.format.h}p${Math.round(s.format.motion)}` : `${s.format.h}p${Math.round(s.format.fps)}`;
  const text = `${formatBlock(s)}
Recommended export format: MP4, H.264 or H.265, progressive scan
Suggested target: ${target}
Audio: AAC 192-320 kbps
Quality note: export a high quality master first, then create platform-specific versions.

${professionalWarning(s.format)}`;
  return { text, summary: [s.format.label, "MP4", target, s.format.scan] };
}

function slugTag(text) {
  return text.replace(/[^a-z0-9 ]/gi, " ").trim().split(/\s+/).map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join("");
}

function timecode(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},000`;
}

function wrapText(text, max) {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    if ((line + " " + word).trim().length > max) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = `${line} ${word}`.trim();
    }
  }
  if (line) lines.push(line);
  return lines.join("\n");
}

function loadExample() {
  const format = $('[name="format"]');
  if (format) format.value = "1080i50";
  const codec = $('[name="codec"]');
  if (codec) codec.value = "XAVC S";
  const hours = $('[name="hours"]');
  if (hours) hours.value = "2";
  const cameras = $('[name="cameras"]');
  if (cameras) cameras.value = "2";
  const keyword = $('[name="keyword"]');
  if (keyword) keyword.value = "cinematic travel vlog";
  runTool();
}
