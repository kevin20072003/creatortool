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
  if (event.defaultPrevented) return;
  const target = event.target;
  if (target.closest("[onclick]")) return;
  if (target.closest("[data-menu]")) $("[data-nav]")?.classList.toggle("open");
  if (target.closest("[data-copy]")) copyResult(target.closest("[data-copy]"));
  if (target.closest("[data-reset]")) location.reload();
  if (target.closest("[data-example]")) loadExample();
  if (target.closest("[data-chat-toggle]")) toggleAssistant();
  if (target.closest("[data-chat-send]")) sendAssistantMessage();
  const suggestion = target.closest("[data-chat-suggestion]");
  if (suggestion) askAssistant(suggestion.dataset.chatSuggestion || suggestion.innerText);
});

document.addEventListener("input", () => runTool());
document.addEventListener("change", (event) => {
  if (event.target.matches('[name="reference_image"]')) previewReferenceImage(event.target);
  runTool();
});
document.addEventListener("DOMContentLoaded", () => runTool());
document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && event.target.matches("[data-chat-input]")) sendAssistantMessage();
});

function num(name) {
  return Number($(`[name="${name}"]`)?.value || 0);
}

function val(name) {
  return $(`[name="${name}"]`)?.value || "";
}

function toolSlug() {
  return $("[data-tool]")?.dataset.slug || "";
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
  const slug = wrap.dataset.slug || "";
  const slugHandlers = {
    "video-compression-ratio-calculator": compressionRatioOutput,
    "frame-rate-converter": frameRateConverterOutput,
    "audio-delay-calculator": audioDelayOutput,
    "audio-file-size-calculator": audioFileSizeOutput,
    "audio-bitrate-calculator": audioBitrateOutput,
    "wav-storage-calculator": audioFileSizeOutput,
    "podcast-duration-calculator": podcastDurationOutput,
  };
  const handlers = {
    "video-storage": storageOutput,
    "video-file-size": storageOutput,
    "bitrate": bitrateOutput,
    "recording-time": recordingTimeOutput,
    "streaming-bandwidth": streamingOutput,
    "aspect-ratio": aspectRatioOutput,
    "crop-factor": cropFactorOutput,
    "generator": smartGeneratorOutput,
    "description-generator": smartDescriptionOutput,
    "hashtag-generator": hashtagGeneratorOutput,
    "thumbnail-text-generator": thumbnailTextOutput,
    "srt-formatter": srtOutput,
    "line-break": lineBreakOutput,
    "upload-time": uploadTimeOutput,
    "export-helper": exportHelperOutput,
    "ai-image-prompt": aiImagePromptOutput,
    "image-to-prompt": imageToPromptOutput,
    "prompt-improver": promptImproverOutput,
  };
  const result = (slugHandlers[slug] || handlers[type] || storageOutput)();
  writeResult(result.text, result.summary);
}

function calculateAndShow() {
  runTool();
  const result = $("[data-result]");
  result?.classList.add("has-answer");
  result?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function exampleAndShow() {
  loadExample();
  calculateAndShow();
}

function resetTool() {
  location.reload();
}

function copyResult(button) {
  const text = $("[data-result]")?.innerText || "";
  navigator.clipboard?.writeText(text);
  if (!button) return;
  const old = button.innerText;
  button.innerText = "Copied";
  setTimeout(() => { button.innerText = old; }, 1300);
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

function smartGeneratorOutput() {
  const slug = toolSlug();
  if (slug.includes("hook")) return hookGeneratorOutput();
  if (slug.includes("bio")) return bioGeneratorOutput();
  if (slug.includes("idea")) return ideaGeneratorOutput();
  if (slug.includes("checklist")) return checklistOutput();
  if (slug.includes("color-palette")) return paletteOutput();
  if (slug.includes("keyword")) return keywordOutput();
  if (slug.includes("faq-schema")) return faqIdeasOutput();
  if (slug.includes("calendar")) return calendarOutput();
  return titleGeneratorOutput();
}

function smartDescriptionOutput() {
  const slug = toolSlug();
  if (slug.includes("checklist")) return checklistOutput();
  if (slug.includes("bio")) return bioGeneratorOutput();
  if (slug.includes("brief")) return contentBriefOutput();
  if (slug.includes("meta-description")) return metaDescriptionOutput();
  if (slug.includes("title-checker")) return titleCheckerOutput();
  if (slug.includes("audio-level")) return audioLevelNotesOutput();
  return descriptionGeneratorOutput();
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

#${slugTag(topic)} #CreatorTool #YouTubeTips`;
  return { text, summary: ["Description", "Ready", "Template", "generator"] };
}

function hashtagGeneratorOutput() {
  const words = (val("keyword") || "youtube creator tools").split(/[, ]+/).filter(Boolean);
  const tags = [...new Set(words.map(slugTag)), "CreatorTool", "YouTubeTips", "VideoEditing"].map((tag) => `#${tag}`);
  return { text: tags.join(" "), summary: ["Hashtags", `${tags.length}`, "Copy", "generator"] };
}

function thumbnailTextOutput() {
  const topic = val("keyword") || "video storage";
  const ideas = [`STOP WASTING SPACE`, `${topic.toUpperCase()}?`, `DO THIS FIRST`, `SAVE HOURS`, `BIG MISTAKE`];
  return { text: `Thumbnail text ideas:\n- ${ideas.join("\n- ")}`, summary: ["Thumbnail", "Short text", `${ideas.length} ideas`, "generator"] };
}

function hookGeneratorOutput() {
  const topic = val("keyword") || "AI creator tools";
  const hooks = [
    `Stop scrolling if you use ${topic}.`,
    `I tested ${topic} so you do not waste time.`,
    `Here is the fastest way to improve ${topic}.`,
    `Most creators do ${topic} the hard way.`,
    `This one ${topic} mistake costs views.`,
    `Before you post, check this ${topic} tip.`,
  ];
  return { text: `Hook ideas:\n- ${hooks.join("\n- ")}`, summary: ["Hooks", `${hooks.length} ideas`, "Short form", "Ready"] };
}

function bioGeneratorOutput() {
  const topic = val("keyword") || val("title") || "AI tools and creator workflows";
  const niche = val("niche") || "creators";
  const text = `Bio options:
1. Helping ${niche} create better content with ${topic}. Tools, prompts, and simple workflows.
2. ${topic} made simple for ${niche}. Follow for practical ideas, templates, and creator systems.
3. Creator-focused tips for ${topic}. Clear tools, faster planning, better content.`;
  return { text, summary: ["Bio", "3 options", "Profile-ready", "Generator"] };
}

function ideaGeneratorOutput() {
  const topic = val("keyword") || "AI prompt tools";
  const ideas = [
    `Beginner guide to ${topic}`,
    `Common mistakes people make with ${topic}`,
    `Before and after using ${topic}`,
    `${topic} workflow for busy creators`,
    `Free tools that improve ${topic}`,
    `How I would use ${topic} for a new channel`,
  ];
  return { text: `Content ideas:\n- ${ideas.join("\n- ")}`, summary: ["Ideas", `${ideas.length}`, "Creator content", "Ready"] };
}

function checklistOutput() {
  const topic = val("keyword") || val("title") || "creator upload";
  const text = `${topic} checklist:
1. Clear title with the main keyword.
2. Strong thumbnail or visual concept.
3. Description explains the value in the first two lines.
4. Add tags, hashtags, chapters, and related links.
5. Check mobile readability.
6. Add internal links to related tools or posts.
7. Review before publishing.`;
  return { text, summary: ["Checklist", "7 steps", "Publish-ready", "SEO"] };
}

function paletteOutput() {
  const topic = val("keyword") || "AI creator thumbnail";
  const text = `Color palette ideas for ${topic}:
1. Electric cyan, deep navy, clean white, graphite.
2. Lime accent, charcoal black, soft gray, warm yellow.
3. Premium teal, midnight blue, silver, subtle magenta.

Tip: use one bright accent for the subject and keep the background controlled.`;
  return { text, summary: ["Palette", "3 options", "Thumbnail", "Design"] };
}

function keywordOutput() {
  const topic = val("keyword") || "AI prompt generator";
  const words = topic.toLowerCase().split(/[, ]+/).filter(Boolean);
  const ideas = [
    topic,
    `${topic} free`,
    `${topic} for creators`,
    `${topic} for youtube`,
    `${topic} online`,
    `${words.join(" ")} tool`,
    `${words.join(" ")} ideas`,
  ];
  return { text: `Keyword ideas:\n- ${[...new Set(ideas)].join("\n- ")}`, summary: ["Keywords", `${ideas.length}`, "SEO", "Ready"] };
}

function faqIdeasOutput() {
  const topic = val("keyword") || "AI prompt generator";
  const faqs = [
    `What is ${topic}?`,
    `How do I use ${topic}?`,
    `Is ${topic} free?`,
    `Can beginners use ${topic}?`,
    `What are common mistakes with ${topic}?`,
  ];
  return { text: `FAQ ideas:\n- ${faqs.join("\n- ")}`, summary: ["FAQ", `${faqs.length}`, "Schema ideas", "SEO"] };
}

function calendarOutput() {
  const topic = val("keyword") || "AI creator tools";
  const text = `7-day content calendar for ${topic}:
Day 1: Beginner tutorial
Day 2: Common mistake post
Day 3: Quick tip Reel/Short
Day 4: Tool comparison
Day 5: Behind-the-scenes workflow
Day 6: FAQ post
Day 7: Case study or before/after`;
  return { text, summary: ["Calendar", "7 days", "Content plan", "Ready"] };
}

function contentBriefOutput() {
  const topic = val("keyword") || val("title") || "AI prompt generator";
  const text = `SEO content brief: ${topic}

Search intent: user wants a practical tool, examples, and copy-ready output.
Recommended sections:
1. What the tool does
2. How to use it
3. Example output
4. Best use cases
5. Mistakes to avoid
6. FAQ

Primary keywords:
- ${topic}
- ${topic} online
- free ${topic}

Internal links:
- Related prompt tools
- Blog guides
- Category page`;
  return { text, summary: ["Brief", "SEO", "Sections", "Ready"] };
}

function metaDescriptionOutput() {
  const topic = val("keyword") || val("title") || "AI prompt generator";
  const text = `Meta description options:
1. Use this free ${topic} to create clear, copy-ready prompts for creators, designers, YouTubers, and social media content.
2. Generate better ${topic} ideas with style, theme, lighting, composition, and practical prompt structure.
3. Free online ${topic} for fast creator workflows. No signup required.`;
  return { text, summary: ["Meta", "3 options", "SEO", "Ready"] };
}

function titleCheckerOutput() {
  const title = val("title") || val("keyword") || "Best AI Prompt Generator for Creators";
  const length = title.length;
  const hasNumber = /\d/.test(title);
  const score = Math.min(100, 45 + (length >= 35 && length <= 70 ? 25 : 10) + (hasNumber ? 10 : 0) + (/\b(best|free|how|tool|generator|guide)\b/i.test(title) ? 20 : 8));
  const text = `Title score: ${score}/100
Length: ${length} characters
Clarity: ${length >= 35 && length <= 70 ? "Good length for search and clickability." : "Try 35-70 characters for a stronger title."}
Power words: ${hasNumber ? "Number detected." : "Add a number only if it is honest and useful."}
Suggestion: Put the main keyword near the front and make the benefit obvious.`;
  return { text, summary: ["Title", `${score}/100`, `${length} chars`, "SEO"] };
}

function audioLevelNotesOutput() {
  const topic = val("keyword") || "voice recording";
  const text = `Audio level notes for ${topic}:
- Record voice peaks around -12 dB to -6 dB.
- Keep average speech around -18 dB to -14 dB before final loudness processing.
- Avoid clipping at 0 dB.
- Use headphones to check noise, hum, echo, and plosives.
- For web video, export AAC 192-320 kbps.`;
  return { text, summary: ["Audio", "Level notes", "Recording", "Ready"] };
}

function unitToGB(value, unit) {
  return value * (unit === "TB" ? 1024 : unit === "MB" ? 1 / 1024 : 1);
}

function compressionRatioOutput() {
  const originalGB = unitToGB(num("original_size") || 1, val("original_unit"));
  const compressedGB = unitToGB(num("compressed_size") || 1, val("compressed_unit"));
  const ratio = originalGB / Math.max(0.0001, compressedGB);
  const saved = Math.max(0, ((originalGB - compressedGB) / originalGB) * 100);
  const text = `Compression ratio: ${formatNumber(ratio, 2)}:1
Original size: ${formatNumber(originalGB)} GB
Compressed size: ${formatNumber(compressedGB)} GB
Space saved: ${formatNumber(saved, 1)}%

Professional note: a higher ratio saves storage but may reduce quality. For client delivery, check motion, gradients, skin tones, and text sharpness after compression.`;
  return { text, summary: [`${formatNumber(ratio, 2)}:1`, `${formatNumber(saved, 1)}% saved`, `${formatNumber(compressedGB)} GB`, "Compression"] };
}

function frameRateConverterOutput() {
  const source = Math.max(1, num("source_fps") || 60);
  const target = Math.max(1, num("target_fps") || 24);
  const seconds = Math.max(1, num("clip_seconds") || 10);
  const mode = val("conversion_mode") || "Conform speed";
  const sourceFrames = source * seconds;
  const targetDuration = mode === "Conform speed" ? sourceFrames / target : seconds;
  const speed = mode === "Conform speed" ? (seconds / targetDuration) * 100 : 100;
  const text = `Source frames: ${formatNumber(sourceFrames, 0)}
Source frame rate: ${formatNumber(source, source % 1 ? 2 : 0)} fps
Target frame rate: ${formatNumber(target, target % 1 ? 2 : 0)} fps
Mode: ${mode}
Output duration: ${formatNumber(targetDuration, 2)} seconds
Speed change: ${formatNumber(speed, 1)}%

Tip: use conform speed for slow motion. Use keep duration when you want normal playback and frame interpolation or frame dropping.`;
  return { text, summary: [`${source} -> ${target}`, `${formatNumber(targetDuration, 2)}s`, `${formatNumber(speed, 1)}%`, "Frame rate"] };
}

function audioDelayOutput() {
  const fps = Math.max(1, num("source_fps") || 30);
  const frames = num("delay_frames") || 0;
  const manualMs = num("audio_delay_ms") || 0;
  const frameMs = (frames / fps) * 1000;
  const total = frameMs + manualMs;
  const text = `Delay from frames: ${formatNumber(frameMs, 1)} ms
Manual audio delay: ${formatNumber(manualMs, 1)} ms
Total delay correction: ${formatNumber(total, 1)} ms

OBS / editor note: if audio is early, add positive delay to audio. If audio is late, reduce audio delay or delay the video layer.`;
  return { text, summary: [`${formatNumber(total, 1)} ms`, `${frames} frames`, `${fps} fps`, "Sync"] };
}

function audioBitrateMbps() {
  const format = val("audio_format");
  if (format.includes("24-bit")) return 2.304;
  if (format.includes("16-bit")) return 1.536;
  if (format.includes("mono")) return Math.max(32, num("audio") || 96) / 1000;
  return Math.max(32, num("audio") || 192) / 1000;
}

function audioFileSizeOutput() {
  const mbps = audioBitrateMbps();
  const seconds = durationSeconds();
  const gb = sizeGB(mbps, seconds);
  const text = `Estimated audio file size: ${formatNumber(gb * 1024)} MB / ${formatNumber(gb, 3)} GB
Audio format: ${val("audio_format") || "AAC / MP3 bitrate"}
Audio bitrate: ${formatNumber(mbps * 1000, 0)} Kbps
Duration: ${formatNumber(seconds / 60, 1)} minutes

Note: WAV is uncompressed and much larger than AAC/MP3. Final exported size can vary by encoder and metadata.`;
  return { text, summary: [`${formatNumber(gb * 1024)} MB`, `${formatNumber(mbps * 1000, 0)} Kbps`, `${formatNumber(seconds / 60, 1)} min`, "Audio"] };
}

function audioBitrateOutput() {
  const targetGB = unitToGB(num("target") || 100, val("unit"));
  const kbps = (targetGB * 8 * 1024 * 1000) / durationSeconds();
  const text = `Required audio bitrate: ${formatNumber(kbps, 0)} Kbps
Target size: ${formatNumber(targetGB * 1024)} MB
Duration: ${formatNumber(durationSeconds() / 60, 1)} minutes

Recommendation: voice-only podcasts often work well at 96-128 Kbps. Music or stereo content usually needs 192-320 Kbps.`;
  return { text, summary: [`${formatNumber(kbps, 0)} Kbps`, `${formatNumber(targetGB * 1024)} MB`, "Audio", "Bitrate"] };
}

function podcastDurationOutput() {
  const storageGB = unitToGB(num("storage") || 1, val("storage_unit"));
  const mbps = audioBitrateMbps();
  const minutes = (storageGB * 8 * 1024) / mbps / 60;
  const text = `Estimated podcast recording duration: ${formatNumber(minutes, 1)} minutes / ${formatNumber(minutes / 60, 2)} hours
Storage available: ${formatNumber(storageGB * 1024)} MB
Audio bitrate: ${formatNumber(mbps * 1000, 0)} Kbps

Tip: keep extra space for edits, backups, project files, and exported versions.`;
  return { text, summary: [`${formatNumber(minutes / 60, 2)} hr`, `${formatNumber(storageGB)} GB`, `${formatNumber(mbps * 1000, 0)} Kbps`, "Podcast"] };
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

function promptInputs() {
  const idea = (val("prompt_idea") || val("keyword") || "A premium creator workspace").trim();
  return {
    idea,
    model: val("prompt_model") || "ChatGPT / Gemini",
    style: val("prompt_style") || "Cinematic realistic",
    theme: val("prompt_theme") || "Modern premium",
    lighting: val("prompt_lighting") || "Soft cinematic lighting",
    composition: val("prompt_composition") || "Centered composition",
    ratio: val("prompt_ratio") || "16:9 YouTube / landscape",
    negative: (val("negative_prompt") || "blurry, low quality, watermark, distorted text").trim(),
  };
}

function buildImagePrompt(p, sourceLabel = "Prompt") {
  const main = `${p.idea}. ${p.style} style, ${p.theme} mood, ${p.lighting}, ${p.composition}, high detail, clean professional visual, strong subject clarity, balanced colors, sharp focus, polished creator-friendly finish.`;
  const modelNote = p.model.includes("Midjourney")
    ? `Midjourney format:\n/imagine prompt: ${main} --ar ${ratioValue(p.ratio)} --style raw`
    : p.model.includes("Stable")
      ? `Stable Diffusion / SDXL format:\nPositive prompt: ${main}\nNegative prompt: ${p.negative}`
      : `ChatGPT / Gemini format:\nCreate an image of ${main}\nUse aspect ratio ${p.ratio}. Avoid: ${p.negative}.`;
  return `${sourceLabel}

Main prompt:
${main}

Negative prompt:
${p.negative}

Recommended aspect ratio:
${p.ratio}

${modelNote}

Prompt tips:
1. Add brand colors if you need a consistent look.
2. Add camera/lens words only when you want a photo-real result.
3. For readable text, ask the AI to leave blank space and add final text manually in an editor.`;
}

function aiImagePromptOutput() {
  const p = promptInputs();
  return {
    text: buildImagePrompt(p, "AI image prompt generator"),
    summary: [p.model, p.style, p.ratio, "Prompt ready"],
  };
}

function imageToPromptOutput() {
  const p = promptInputs();
  const text = `${buildImagePrompt(p, "Image-to-prompt helper")}

Reference image note:
This browser tool previews your image locally, but it does not analyze pixels with AI. For the best result, describe the visible subject, colors, background, angle, and mood in the text box, then paste the generated prompt into Gemini, ChatGPT, Midjourney, or another image model.`;
  return { text, summary: [p.model, "Reference prompt", p.ratio, "Local preview"] };
}

function promptImproverOutput() {
  const p = promptInputs();
  const improved = `${p.idea}. Improve this into a clear image-generation prompt with a specific subject, visual style, lighting, composition, background, mood, color palette, camera angle, quality details, and aspect ratio. Output one final prompt and one negative prompt.`;
  const text = `Improved prompt instruction:
${improved}

Polished image prompt:
${buildImagePrompt(p, "Final prompt")}

Use this when:
- Your prompt is too short.
- The AI output looks random.
- You want a cleaner style, theme, and composition.`;
  return { text, summary: [p.model, "Improved", p.ratio, "Prompt ready"] };
}

function ratioValue(label) {
  if (label.includes("9:16")) return "9:16";
  if (label.includes("1:1")) return "1:1";
  if (label.includes("4:5")) return "4:5";
  if (label.includes("3:2")) return "3:2";
  if (label.includes("21:9")) return "21:9";
  return "16:9";
}

function previewReferenceImage(input) {
  const preview = $("[data-image-preview]");
  const file = input.files?.[0];
  if (!preview || !file) return;
  const reader = new FileReader();
  reader.onload = () => {
    preview.innerHTML = `<img src="${reader.result}" alt="Reference preview"><span>Reference preview only. Add image details in the text box for accurate prompt output.</span>`;
  };
  reader.readAsDataURL(file);
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
  const promptIdea = $('[name="prompt_idea"]');
  if (promptIdea) {
    promptIdea.value = "A premium AI creator dashboard on a dark desk, glowing prompt cards, camera gear, clean SaaS interface, made for YouTubers and designers";
    const style = $('[name="prompt_style"]');
    if (style) style.value = "Cinematic realistic";
    const theme = $('[name="prompt_theme"]');
    if (theme) theme.value = "Dark futuristic";
    const ratio = $('[name="prompt_ratio"]');
    if (ratio) ratio.value = "16:9 YouTube / landscape";
    runTool();
    return;
  }
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

function toggleAssistant() {
  $("[data-chat-panel]")?.classList.toggle("open");
}

function sendAssistantMessage() {
  const input = $("[data-chat-input]");
  const message = (input?.value || "").trim();
  if (!message) return;
  if (input) input.value = "";
  askAssistant(message);
}

function askAssistant(message) {
  addAssistantMessage(message, "user");
  const matches = findMatchingTools(message);
  if (!matches.length) {
    addAssistantMessage("I could not find an exact tool for that yet. Try words like prompt, image, YouTube, thumbnail, storage, bitrate, subtitle, audio, OBS, hashtag, bio, or upload time. You can also create a new tool from the admin panel.", "bot");
    return;
  }
  const links = matches.map((tool) => `<a href="${tool.url}"><strong>${escapeHtml(tool.name)}</strong><span>${escapeHtml(tool.category || "Tool")} - ${escapeHtml(tool.description || "")}</span></a>`).join("");
  addAssistantMessage(`Best tools for this:\n${links}`, "bot", true);
}

function findMatchingTools(query) {
  const tools = window.creatorToolsIndex || [];
  const normalized = query.toLowerCase();
  const intentBoosts = [
    [["prompt", "image", "gemini", "chatgpt", "midjourney", "ai art"], "prompt"],
    [["storage", "file size", "4k", "sd card", "recording"], "storage"],
    [["bitrate", "obs", "stream", "twitch", "live"], "stream"],
    [["thumbnail", "title", "description", "youtube", "tags", "hashtag"], "youtube"],
    [["subtitle", "caption", "srt"], "subtitle"],
    [["audio", "podcast", "wav", "delay", "sync"], "audio"],
    [["logo", "product", "character", "social", "instagram", "reel"], "creative"],
  ];
  return tools
    .map((tool) => {
      const haystack = `${tool.name} ${tool.description} ${tool.category} ${tool.type}`.toLowerCase();
      let score = 0;
      for (const word of normalized.split(/[^a-z0-9]+/).filter((part) => part.length > 2)) {
        if (haystack.includes(word)) score += word.length;
      }
      for (const [words, intent] of intentBoosts) {
        if (words.some((word) => normalized.includes(word))) {
          if (haystack.includes(intent) || words.some((word) => haystack.includes(word))) score += 18;
        }
      }
      if (tool.category?.toLowerCase().includes("ai prompt") && /prompt|image|gemini|chatgpt|midjourney|logo|product|character|thumbnail/.test(normalized)) score += 16;
      return { ...tool, score };
    })
    .filter((tool) => tool.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

function addAssistantMessage(message, who, html = false) {
  const box = $("[data-chat-messages]");
  if (!box) return;
  const div = document.createElement("div");
  div.className = `assistant-message ${who}`;
  if (html) div.innerHTML = message;
  else div.innerText = message;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
}
