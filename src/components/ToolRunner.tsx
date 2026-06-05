"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Clipboard, RotateCcw, Sparkles } from "lucide-react";
import { audioPresetsMbps, suggestCardSize } from "@/lib/toolPresets";
import { ProfessionalRecommendationCard } from "@/components/tools/ProfessionalRecommendationCard";
import { ScanTypeInfo } from "@/components/tools/ScanTypeInfo";
import { VideoFormatSelector } from "@/components/tools/VideoFormatSelector";
import { videoCodecs } from "@/lib/video/bitratePresets";
import { calculateVideoEstimate, formatRate, interlacedComparison, videoFileSizeDisclaimer } from "@/lib/video/videoCalculations";
import { defaultVideoFormatValue, resolveVideoFormat, type VideoFormatSelectorValue } from "@/lib/video/videoFormats";

function numberValue(value: string | number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function track(templateType: string) {
  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "tool_usage", path: window.location.pathname, entitySlug: templateType }),
  }).catch(() => {});
}

function copy(text: string) {
  navigator.clipboard?.writeText(text).catch(() => {});
}

function ToolShell({
  templateType,
  children,
  resultText,
  onReset,
  onExample,
  formula,
  useCases,
}: {
  templateType: string;
  children: ReactNode;
  resultText: string;
  onReset: () => void;
  onExample: () => void;
  formula: string;
  useCases: string[];
}) {
  const [copied, setCopied] = useState(false);
  return (
    <section className="tool-surface">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="card tool-panel grid gap-5 p-5 md:p-6">
          {children}
          <div className="flex flex-wrap gap-3">
            <button className="btn-primary" type="button" onClick={() => track(templateType)}>
              Calculate
            </button>
            <button className="btn-secondary" type="button" onClick={onExample} title="Load realistic example values">
              <Sparkles size={17} /> Example
            </button>
            <button className="btn-secondary" type="button" onClick={onReset} title="Reset inputs">
              <RotateCcw size={17} /> Reset
            </button>
            <button
              className="btn-secondary"
              type="button"
              onClick={() => {
                copy(resultText);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              title="Copy result"
            >
              <Clipboard size={17} /> {copied ? "Copied" : "Copy result"}
            </button>
          </div>
        </div>
        <aside className="card sticky-result grid h-fit gap-4 p-5">
          <p className="text-sm font-black uppercase tracking-wide text-[var(--accent)]">Result summary</p>
          <pre className="whitespace-pre-wrap rounded-lg bg-[var(--background)] p-4 text-sm leading-6">{resultText}</pre>
        </aside>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <InfoBox title="How this is calculated" text={formula} />
        <InfoBox title="Common use cases" text={useCases.join("\n")} />
      </div>
    </section>
  );
}

function InfoBox({ title, text }: { title: string; text: string }) {
  return (
    <div className="card p-5">
      <h3 className="text-lg font-black">{title}</h3>
      <p className="mt-3 whitespace-pre-line text-sm leading-6 muted">{text}</p>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="label">
      <span className="flex items-center gap-2">
        {label}
        {hint ? <span className="tooltip" title={hint}>?</span> : null}
      </span>
      {children}
    </label>
  );
}

function ResultGrid({ rows }: { rows: Array<[string, string]> }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {rows.map(([label, value]) => (
        <div className="result-box" key={label}>
          <p>{label}</p>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

export function ToolRunner({ templateType, toolName }: { templateType: string; toolName: string }) {
  if (templateType === "video-storage-calculator") return <VideoStorageCalculator />;
  if (templateType === "bitrate-calculator") return <BitrateCalculator />;
  if (templateType === "recording-time-calculator") return <RecordingTimeCalculator />;
  if (templateType === "streaming-bandwidth-calculator") return <StreamingBandwidthCalculator />;
  if (templateType === "aspect-ratio-calculator") return <AspectRatioCalculator />;
  if (templateType === "camera-crop-factor-calculator") return <CameraCropFactorCalculator />;
  if (scanAwareTemplates.has(templateType)) return <ScanAwareVideoTool templateType={templateType} toolName={toolName} />;
  return <GenericCreatorTool templateType={templateType} toolName={toolName} />;
}

const scanAwareTemplates = new Set([
  "video-file-size-calculator",
  "four-k-storage-calculator",
  "multi-camera-storage-calculator",
  "sd-card-recording-time-calculator",
  "obs-bitrate-calculator",
  "live-settings-generator",
  "video-export-settings-helper",
]);

function VideoStorageCalculator() {
  const defaults = {
    hours: "1",
    minutes: "0",
    seconds: "0",
    format: defaultVideoFormatValue,
    codec: "H.264",
    mode: "Auto estimate",
    manualBitrate: "50",
    audio: "AAC 192 kbps",
    customAudio: "192",
    cameras: "1",
    customCameras: "1",
    margin: "20",
    days: "1",
  };
  const [state, setState] = useState(defaults);
  const set = (key: keyof Omit<typeof defaults, "format">, value: string) => setState((current) => ({ ...current, [key]: value }));
  const setFormat = (format: VideoFormatSelectorValue) => setState((current) => ({ ...current, format }));
  const format = resolveVideoFormat(state.format);
  const seconds = numberValue(state.hours) * 3600 + numberValue(state.minutes) * 60 + numberValue(state.seconds);
  const cameras = state.cameras === "Custom" ? numberValue(state.customCameras) : numberValue(state.cameras);
  const audioMbps = state.audio === "Custom audio bitrate" ? numberValue(state.customAudio) / 1000 : audioPresetsMbps[state.audio] ?? 0.192;
  const estimate = calculateVideoEstimate({
    format,
    codec: state.codec,
    bitrateMode: state.mode as "Auto estimate" | "Manual bitrate",
    manualBitrateMbps: numberValue(state.manualBitrate),
    audioMbps,
    durationSeconds: seconds,
    cameras: Math.max(1, cameras),
    safetyMarginPercent: numberValue(state.margin),
    days: numberValue(state.days),
  });
  const comparison = interlacedComparison(format);
  const result = [
    `Selected video format: ${format.label}`,
    `Resolution: ${format.width} x ${format.height}`,
    `Scan type: ${format.scanType}`,
    `Frame rate: ${formatRate(format.frameRate)} fps`,
    format.fieldRate ? `Field rate: ${formatRate(format.fieldRate)} fields/sec` : "Field rate: none",
    `Effective motion rate: ${formatRate(format.effectiveMotionRate)} samples/sec`,
    `Codec: ${state.codec}`,
    `Estimated video bitrate: ${estimate.videoMbps.toFixed(2)} Mbps`,
    `Audio bitrate: ${audioMbps.toFixed(3)} Mbps`,
    `Estimated file size: ${estimate.mb.toFixed(0)} MB / ${estimate.singleCameraGb.toFixed(2)} GB / ${(estimate.singleCameraGb / 1024).toFixed(3)} TB`,
    `Multi-camera total: ${estimate.multiCameraGb.toFixed(2)} GB`,
    `Storage with ${state.margin}% margin: ${estimate.withMarginGb.toFixed(2)} GB`,
    `Suggested SD card size: ${suggestCardSize(estimate.withMarginGb)}`,
    `Estimated daily storage: ${estimate.dailyGb.toFixed(2)} GB`,
    comparison,
    videoFileSizeDisclaimer,
  ].filter(Boolean).join("\n");

  return (
    <ToolShell
      templateType="video-storage-calculator"
      resultText={result}
      onReset={() => setState(defaults)}
      onExample={() => setState({ ...defaults, format: { ...defaultVideoFormatValue, presetId: "1080i-50" }, hours: "2", codec: "XAVC S", cameras: "2", margin: "30", days: "3" })}
      formula={`Manual mode: ((video Mbps + audio Mbps) x duration seconds / 8) / 1024. Auto mode estimates bitrate by resolution, codec, scan type, and true frame rate. ${estimate.bitrateNote}`}
      useCases={["Plan SD cards before shoots", "Estimate multi-camera event storage", "Budget drive space for client projects", "Compare H.264, H.265, ProRes, XAVC, and RAW-style workflows"]}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Hours"><input className="input" value={state.hours} onChange={(e) => set("hours", e.target.value)} inputMode="decimal" /></Field>
        <Field label="Minutes"><input className="input" value={state.minutes} onChange={(e) => set("minutes", e.target.value)} inputMode="decimal" /></Field>
        <Field label="Seconds"><input className="input" value={state.seconds} onChange={(e) => set("seconds", e.target.value)} inputMode="decimal" /></Field>
      </div>
      <VideoFormatSelector value={state.format} onChange={setFormat} />
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Codec"><select className="select" value={state.codec} onChange={(e) => set("codec", e.target.value)}>{videoCodecs.map((item) => <option key={item}>{item}</option>)}</select></Field>
        <Field label="Bitrate mode"><select className="select" value={state.mode} onChange={(e) => set("mode", e.target.value)}><option>Auto estimate</option><option>Manual bitrate</option></select></Field>
        {state.mode === "Manual bitrate" ? <Field label="Manual bitrate Mbps"><input className="input" value={state.manualBitrate} onChange={(e) => set("manualBitrate", e.target.value)} /></Field> : null}
        <Field label="Audio"><select className="select" value={state.audio} onChange={(e) => set("audio", e.target.value)}>{[...Object.keys(audioPresetsMbps), "Custom audio bitrate"].map((item) => <option key={item}>{item}</option>)}</select></Field>
        {state.audio === "Custom audio bitrate" ? <Field label="Audio Kbps"><input className="input" value={state.customAudio} onChange={(e) => set("customAudio", e.target.value)} /></Field> : null}
        <Field label="Number of cameras"><select className="select" value={state.cameras} onChange={(e) => set("cameras", e.target.value)}>{["1", "2", "3", "4", "Custom"].map((item) => <option value={item} key={item}>{item === "Custom" ? item : `${item} camera${item === "1" ? "" : "s"}`}</option>)}</select></Field>
        {state.cameras === "Custom" ? <Field label="Custom cameras"><input className="input" value={state.customCameras} onChange={(e) => set("customCameras", e.target.value)} /></Field> : null}
        <Field label="Safety margin"><select className="select" value={state.margin} onChange={(e) => set("margin", e.target.value)}>{["0", "10", "20", "30"].map((item) => <option value={item} key={item}>{item}%</option>)}</select></Field>
        <Field label="Shooting days" hint="Used only for daily storage estimate"><input className="input" value={state.days} onChange={(e) => set("days", e.target.value)} /></Field>
      </div>
      <ResultGrid rows={[["Selected format", format.label], ["Frame / field rate", format.fieldRate ? `${formatRate(format.frameRate)} fps / ${formatRate(format.fieldRate)} fields` : `${formatRate(format.frameRate)} fps`], ["Estimated storage", `${estimate.singleCameraGb.toFixed(2)} GB`], ["With margin", `${estimate.withMarginGb.toFixed(2)} GB`]]} />
      <ScanTypeInfo format={format} />
      <ProfessionalRecommendationCard format={format} deliveryTarget="YouTube online web" />
      <p className="rounded-lg bg-[var(--background)] p-3 text-sm muted">{videoFileSizeDisclaimer}</p>
    </ToolShell>
  );
}

function BitrateCalculator() {
  const defaults = { size: "5", unit: "GB", hours: "0", minutes: "10", seconds: "0", audio: "192", output: "Mbps" };
  const [s, setS] = useState(defaults);
  const set = (k: keyof typeof defaults, v: string) => setS((x) => ({ ...x, [k]: v }));
  const sizeGb = numberValue(s.size) * (s.unit === "MB" ? 1 / 1024 : s.unit === "TB" ? 1024 : 1);
  const seconds = numberValue(s.hours) * 3600 + numberValue(s.minutes) * 60 + numberValue(s.seconds);
  const totalMbps = (sizeGb * 8 * 1024) / Math.max(1, seconds);
  const audioMbps = numberValue(s.audio) / 1000;
  const videoMbps = Math.max(0, totalMbps - audioMbps);
  const unitValue = s.output === "Kbps" ? videoMbps * 1000 : videoMbps;
  const warning = videoMbps > 50 ? "High bitrate: upload may be slow and streaming may require very strong internet." : "Bitrate is in a practical range for most creator uploads.";
  const result = `Required video bitrate: ${unitValue.toFixed(2)} ${s.output}\nRequired total bitrate: ${totalMbps.toFixed(2)} Mbps\nYouTube recommendation: ${videoMbps < 8 ? "Good for 1080p uploads" : videoMbps < 45 ? "Good for high quality 1080p/1440p" : "Suitable for high quality 4K exports"}\n${warning}`;
  return (
    <ToolShell templateType="bitrate-calculator" resultText={result} onReset={() => setS(defaults)} onExample={() => setS({ ...defaults, size: "12", minutes: "20", audio: "320" })} formula="Total Mbps = file size GB x 8 x 1024 / duration seconds. Video Mbps = total Mbps - audio Mbps." useCases={["Fit a video into a target file size", "Estimate export bitrate", "Balance upload quality and speed"]}>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Target file size"><input className="input" value={s.size} onChange={(e) => set("size", e.target.value)} /></Field>
        <Field label="File size unit"><select className="select" value={s.unit} onChange={(e) => set("unit", e.target.value)}><option>MB</option><option>GB</option><option>TB</option></select></Field>
        <Field label="Audio bitrate Kbps"><input className="input" value={s.audio} onChange={(e) => set("audio", e.target.value)} /></Field>
        <Field label="Hours"><input className="input" value={s.hours} onChange={(e) => set("hours", e.target.value)} /></Field>
        <Field label="Minutes"><input className="input" value={s.minutes} onChange={(e) => set("minutes", e.target.value)} /></Field>
        <Field label="Seconds"><input className="input" value={s.seconds} onChange={(e) => set("seconds", e.target.value)} /></Field>
        <Field label="Output unit"><select className="select" value={s.output} onChange={(e) => set("output", e.target.value)}><option>Mbps</option><option>Kbps</option></select></Field>
      </div>
      <ResultGrid rows={[["Video bitrate", `${unitValue.toFixed(2)} ${s.output}`], ["Total bitrate", `${totalMbps.toFixed(2)} Mbps`], ["Audio", `${audioMbps.toFixed(3)} Mbps`], ["Warning", warning]]} />
    </ToolShell>
  );
}

function RecordingTimeCalculator() {
  const defaults = { storage: "128", unit: "GB", codec: "H.264", format: defaultVideoFormatValue, mode: "Auto estimate", manual: "50", audio: "192", cameras: "1" };
  const [s, setS] = useState(defaults);
  const set = (k: keyof Omit<typeof defaults, "format">, v: string) => setS((x) => ({ ...x, [k]: v }));
  const setFormat = (format: VideoFormatSelectorValue) => setS((x) => ({ ...x, format }));
  const format = resolveVideoFormat(s.format);
  const storageGb = numberValue(s.storage) * (s.unit === "MB" ? 1 / 1024 : s.unit === "TB" ? 1024 : 1);
  const oneHourEstimate = calculateVideoEstimate({
    format,
    codec: s.codec,
    bitrateMode: s.mode as "Auto estimate" | "Manual bitrate",
    manualBitrateMbps: numberValue(s.manual),
    audioMbps: numberValue(s.audio) / 1000,
    durationSeconds: 3600,
    cameras: Math.max(1, numberValue(s.cameras)),
    safetyMarginPercent: 0,
  });
  const totalMbps = oneHourEstimate.totalMbps * Math.max(1, numberValue(s.cameras));
  const minutes = (storageGb * 8 * 1024) / Math.max(1, totalMbps) / 60;
  const comparison = interlacedComparison(format);
  const result = [
    `Selected video format: ${format.label}`,
    `Resolution: ${format.width} x ${format.height}`,
    `Scan type: ${format.scanType}`,
    `Frame rate: ${formatRate(format.frameRate)} fps`,
    format.fieldRate ? `Field rate: ${formatRate(format.fieldRate)} fields/sec` : "Field rate: none",
    `Effective motion rate: ${formatRate(format.effectiveMotionRate)} samples/sec`,
    `Codec: ${s.codec}`,
    `Estimated video bitrate: ${oneHourEstimate.videoMbps.toFixed(2)} Mbps`,
    `Audio bitrate: ${(numberValue(s.audio) / 1000).toFixed(3)} Mbps`,
    `Estimated recording time: ${minutes.toFixed(1)} minutes / ${(minutes / 60).toFixed(2)} hours`,
    `Recording time per card: ${minutes.toFixed(1)} minutes`,
    `Total multi-camera bitrate: ${totalMbps.toFixed(2)} Mbps`,
    `Recommended card capacity for 2 hours: ${suggestCardSize((totalMbps * 7200) / 8 / 1024)}`,
    comparison,
    videoFileSizeDisclaimer,
  ].filter(Boolean).join("\n");
  return (
    <ToolShell templateType="recording-time-calculator" resultText={result} onReset={() => setS(defaults)} onExample={() => setS({ ...defaults, storage: "256", codec: "XAVC S", format: { ...defaultVideoFormatValue, presetId: "1080i-59.94" }, cameras: "2" })} formula={`Recording time minutes = storage GB x 8 x 1024 / total Mbps / 60. ${oneHourEstimate.bitrateNote}`} useCases={["Estimate SD card record time", "Plan interview or event coverage", "Compare codec choices"]}>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Storage size"><input className="input" value={s.storage} onChange={(e) => set("storage", e.target.value)} /></Field>
        <Field label="Storage unit"><select className="select" value={s.unit} onChange={(e) => set("unit", e.target.value)}><option>MB</option><option>GB</option><option>TB</option></select></Field>
      </div>
      <VideoFormatSelector value={s.format} onChange={setFormat} />
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Codec"><select className="select" value={s.codec} onChange={(e) => set("codec", e.target.value)}>{videoCodecs.map((x) => <option key={x}>{x}</option>)}</select></Field>
        <Field label="Bitrate mode"><select className="select" value={s.mode} onChange={(e) => set("mode", e.target.value)}><option>Auto estimate</option><option>Manual bitrate</option></select></Field>
        {s.mode === "Manual bitrate" ? <Field label="Manual Mbps"><input className="input" value={s.manual} onChange={(e) => set("manual", e.target.value)} /></Field> : null}
        <Field label="Audio Kbps"><input className="input" value={s.audio} onChange={(e) => set("audio", e.target.value)} /></Field>
        <Field label="Number of cameras"><input className="input" value={s.cameras} onChange={(e) => set("cameras", e.target.value)} /></Field>
      </div>
      <ResultGrid rows={[["Format", format.label], ["Frame / field rate", format.fieldRate ? `${formatRate(format.frameRate)} fps / ${formatRate(format.fieldRate)} fields` : `${formatRate(format.frameRate)} fps`], ["Recording time", `${(minutes / 60).toFixed(2)} hours`], ["Recommended", suggestCardSize((totalMbps * 7200) / 8 / 1024)]]} />
      <ScanTypeInfo format={format} />
      <ProfessionalRecommendationCard format={format} deliveryTarget="YouTube online web" />
    </ToolShell>
  );
}

function StreamingBandwidthCalculator() {
  const defaults = { platform: "YouTube", format: defaultVideoFormatValue, video: "9", audio: "192", streams: "1", margin: "30" };
  const [s, setS] = useState(defaults);
  const set = (k: keyof Omit<typeof defaults, "format">, v: string) => setS((x) => ({ ...x, [k]: v }));
  const setFormat = (format: VideoFormatSelectorValue) => setS((x) => ({ ...x, format }));
  const format = resolveVideoFormat(s.format);
  const total = (numberValue(s.video) + numberValue(s.audio) / 1000) * Math.max(1, numberValue(s.streams));
  const recommended = total * (1 + numberValue(s.margin) / 100);
  const range = s.platform === "Twitch" ? "4.5-6 Mbps for 1080p60" : format.height >= 2160 ? "20-51 Mbps for 4K" : "6-12 Mbps for 1080p";
  const comparison = interlacedComparison(format);
  const result = [
    `Selected video format: ${format.label}`,
    `Resolution: ${format.width} x ${format.height}`,
    `Scan type: ${format.scanType}`,
    `Frame rate: ${formatRate(format.frameRate)} fps`,
    format.fieldRate ? `Field rate: ${formatRate(format.fieldRate)} fields/sec` : "Field rate: none",
    `Effective motion rate: ${formatRate(format.effectiveMotionRate)} samples/sec`,
    `Video bitrate: ${numberValue(s.video).toFixed(2)} Mbps`,
    `Audio bitrate: ${(numberValue(s.audio) / 1000).toFixed(3)} Mbps`,
    `Minimum upload speed: ${total.toFixed(2)} Mbps`,
    `Recommended upload speed: ${recommended.toFixed(2)} Mbps`,
    `Suggested ${s.platform} range: ${range}`,
    `Network stability: ${recommended > 20 ? "Use wired internet and test before going live." : "A stable wired or strong Wi-Fi connection should work."}`,
    comparison,
  ].filter(Boolean).join("\n");
  return (
    <ToolShell templateType="streaming-bandwidth-calculator" resultText={result} onReset={() => setS(defaults)} onExample={() => setS({ ...defaults, platform: "YouTube", format: { ...defaultVideoFormatValue, presetId: "2160p-60" }, video: "35", streams: "2" })} formula="Recommended upload = (video Mbps + audio Mbps) x number of streams x safety margin. Interlaced streams should normally be deinterlaced before online delivery." useCases={["Plan OBS stream bitrate", "Check if upload speed is enough", "Estimate multi-platform streaming bandwidth"]}>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Platform"><select className="select" value={s.platform} onChange={(e) => set("platform", e.target.value)}><option>YouTube</option><option>Facebook</option><option>Twitch</option><option>Custom</option></select></Field>
        <Field label="Video bitrate Mbps"><input className="input" value={s.video} onChange={(e) => set("video", e.target.value)} /></Field>
        <Field label="Audio bitrate Kbps"><input className="input" value={s.audio} onChange={(e) => set("audio", e.target.value)} /></Field>
      </div>
      <VideoFormatSelector value={s.format} onChange={setFormat} />
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Number of streams"><input className="input" value={s.streams} onChange={(e) => set("streams", e.target.value)} /></Field>
        <Field label="Safety margin"><select className="select" value={s.margin} onChange={(e) => set("margin", e.target.value)}><option>0</option><option>10</option><option>20</option><option>30</option></select></Field>
      </div>
      <ResultGrid rows={[["Format", format.label], ["Frame / field rate", format.fieldRate ? `${formatRate(format.frameRate)} fps / ${formatRate(format.fieldRate)} fields` : `${formatRate(format.frameRate)} fps`], ["Minimum upload", `${total.toFixed(2)} Mbps`], ["Recommended", `${recommended.toFixed(2)} Mbps`]]} />
      <ScanTypeInfo format={format} />
      <ProfessionalRecommendationCard format={format} deliveryTarget={s.platform} />
    </ToolShell>
  );
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function AspectRatioCalculator() {
  const defaults = { width: "1920", height: "1080", targetWidth: "1280", targetHeight: "" };
  const [s, setS] = useState(defaults);
  const set = (k: keyof typeof defaults, v: string) => setS((x) => ({ ...x, [k]: v }));
  const w = Math.round(numberValue(s.width));
  const h = Math.round(numberValue(s.height));
  const divisor = w && h ? gcd(w, h) : 1;
  const ratio = `${w / divisor}:${h / divisor}`;
  const decimal = w / Math.max(1, h);
  const orientation = Math.abs(w - h) < 3 ? "square" : w > h ? "landscape" : "portrait";
  const common = Math.abs(decimal - 16 / 9) < 0.03 ? "16:9 YouTube landscape" : Math.abs(decimal - 9 / 16) < 0.03 ? "9:16 Shorts/Reels" : Math.abs(decimal - 1) < 0.03 ? "1:1 Instagram square" : Math.abs(decimal - 4 / 5) < 0.03 ? "4:5 Instagram portrait" : Math.abs(decimal - 21 / 9) < 0.05 ? "21:9 cinematic" : "Custom format";
  const calcHeight = s.targetWidth ? Math.round(numberValue(s.targetWidth) / decimal) : 0;
  const calcWidth = s.targetHeight ? Math.round(numberValue(s.targetHeight) * decimal) : 0;
  const result = `Aspect ratio: ${ratio}\nOrientation: ${orientation}\nFormat: ${common}\nResize: ${s.targetWidth ? `${s.targetWidth} x ${calcHeight}` : calcWidth ? `${calcWidth} x ${s.targetHeight}` : "Add target size"}`;
  return (
    <ToolShell templateType="aspect-ratio-calculator" resultText={result} onReset={() => setS(defaults)} onExample={() => setS({ ...defaults, width: "1080", height: "1920", targetWidth: "720" })} formula="Aspect ratio is simplified by dividing width and height by their greatest common divisor. Resize values preserve the same width/height ratio." useCases={["Check Shorts/Reels dimensions", "Resize thumbnails", "Convert video canvas sizes"]}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Width"><input className="input" value={s.width} onChange={(e) => set("width", e.target.value)} /></Field>
        <Field label="Height"><input className="input" value={s.height} onChange={(e) => set("height", e.target.value)} /></Field>
        <Field label="Target width"><input className="input" value={s.targetWidth} onChange={(e) => set("targetWidth", e.target.value)} /></Field>
        <Field label="Target height"><input className="input" value={s.targetHeight} onChange={(e) => set("targetHeight", e.target.value)} /></Field>
      </div>
      <ResultGrid rows={[["Ratio", ratio], ["Orientation", orientation], ["Common format", common], ["Resize", s.targetWidth ? `${s.targetWidth} x ${calcHeight}` : `${calcWidth} x ${s.targetHeight || 0}`]]} />
    </ToolShell>
  );
}

function CameraCropFactorCalculator() {
  const defaults = { sensor: "APS-C Sony/Nikon 1.5x", custom: "1.5", focal: "35", aperture: "1.8" };
  const [s, setS] = useState(defaults);
  const set = (k: keyof typeof defaults, v: string) => setS((x) => ({ ...x, [k]: v }));
  const crop = s.sensor === "Custom" ? numberValue(s.custom) : Number((s.sensor.match(/([0-9.]+)x/) || [0, "1"])[1]);
  const equivalent = numberValue(s.focal) * crop;
  const apertureEq = numberValue(s.aperture) * crop;
  const fov = equivalent < 24 ? "Ultra-wide" : equivalent < 35 ? "Wide" : equivalent < 70 ? "Standard" : "Telephoto";
  const result = `Full-frame equivalent focal length: ${equivalent.toFixed(1)} mm\nEquivalent aperture DOF estimate: f/${apertureEq.toFixed(1)}\nField of view category: ${fov}`;
  return (
    <ToolShell templateType="camera-crop-factor-calculator" resultText={result} onReset={() => setS(defaults)} onExample={() => setS({ ...defaults, sensor: "Micro Four Thirds 2.0x", focal: "25", aperture: "1.7" })} formula="Equivalent focal length = lens focal length x crop factor. Equivalent aperture estimate for depth of field = aperture x crop factor." useCases={["Compare lenses across sensor sizes", "Plan camera field of view", "Estimate depth-of-field behavior"]}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Sensor type"><select className="select" value={s.sensor} onChange={(e) => set("sensor", e.target.value)}>{["Full Frame 1.0x", "APS-C Sony/Nikon 1.5x", "APS-C Canon 1.6x", "Micro Four Thirds 2.0x", "Super 35 1.5x", "Custom"].map((x) => <option key={x}>{x}</option>)}</select></Field>
        {s.sensor === "Custom" ? <Field label="Custom crop factor"><input className="input" value={s.custom} onChange={(e) => set("custom", e.target.value)} /></Field> : null}
        <Field label="Lens focal length"><input className="input" value={s.focal} onChange={(e) => set("focal", e.target.value)} /></Field>
        <Field label="Aperture"><input className="input" value={s.aperture} onChange={(e) => set("aperture", e.target.value)} /></Field>
      </div>
      <ResultGrid rows={[["Equivalent focal length", `${equivalent.toFixed(1)} mm`], ["DOF aperture estimate", `f/${apertureEq.toFixed(1)}`], ["Field of view", fov]]} />
    </ToolShell>
  );
}

function ScanAwareVideoTool({ templateType, toolName }: { templateType: string; toolName: string }) {
  const isLive = /obs|live|stream|export/.test(templateType);
  const defaults = {
    hours: isLive ? "0" : "1",
    minutes: isLive ? "30" : "0",
    seconds: "0",
    format: { ...defaultVideoFormatValue, presetId: templateType.includes("four-k") ? "2160p-60" : "1080p-50" },
    codec: templateType.includes("live") || templateType.includes("obs") ? "H.264" : "H.265 / HEVC",
    mode: "Auto estimate",
    manualBitrate: isLive ? "9" : "50",
    audio: "AAC 192 kbps",
    customAudio: "192",
    cameras: templateType.includes("multi-camera") ? "2" : "1",
    margin: "20",
    platform: templateType.includes("twitch") ? "Twitch" : "YouTube / online",
  };
  const [state, setState] = useState(defaults);
  const set = (key: keyof Omit<typeof defaults, "format">, value: string) => setState((current) => ({ ...current, [key]: value }));
  const setFormat = (format: VideoFormatSelectorValue) => setState((current) => ({ ...current, format }));
  const format = resolveVideoFormat(state.format);
  const durationSeconds = numberValue(state.hours) * 3600 + numberValue(state.minutes) * 60 + numberValue(state.seconds);
  const audioMbps = state.audio === "Custom audio bitrate" ? numberValue(state.customAudio) / 1000 : audioPresetsMbps[state.audio] ?? 0.192;
  const estimate = calculateVideoEstimate({
    format,
    codec: state.codec,
    bitrateMode: state.mode as "Auto estimate" | "Manual bitrate",
    manualBitrateMbps: numberValue(state.manualBitrate),
    audioMbps,
    durationSeconds,
    cameras: Math.max(1, numberValue(state.cameras)),
    safetyMarginPercent: numberValue(state.margin),
  });
  const uploadRecommended = estimate.totalMbps * Math.max(1, numberValue(state.cameras)) * (1 + numberValue(state.margin) / 100);
  const comparison = interlacedComparison(format);
  const recommendation = format.scanType === "interlaced"
    ? "Recommended: deinterlace to progressive before YouTube, OBS, social, or web delivery."
    : format.height >= 2160
      ? "Use H.265/HEVC for smaller files or H.264 at higher bitrate for maximum compatibility."
      : "Progressive delivery is suitable for modern web and creator platforms.";
  const result = [
    `Tool: ${toolName}`,
    `Selected video format: ${format.label}`,
    `Resolution: ${format.width} x ${format.height}`,
    `Scan type: ${format.scanType}`,
    `Frame rate: ${formatRate(format.frameRate)} fps`,
    format.fieldRate ? `Field rate: ${formatRate(format.fieldRate)} fields/sec` : "Field rate: none",
    `Effective motion rate: ${formatRate(format.effectiveMotionRate)} samples/sec`,
    `Codec: ${state.codec}`,
    `Estimated video bitrate: ${estimate.videoMbps.toFixed(2)} Mbps`,
    `Audio bitrate: ${audioMbps.toFixed(3)} Mbps`,
    isLive ? `Recommended upload speed: ${uploadRecommended.toFixed(2)} Mbps` : `Estimated storage size: ${estimate.singleCameraGb.toFixed(2)} GB`,
    `Safety margin: ${state.margin}%`,
    `Multi-camera total: ${estimate.withMarginGb.toFixed(2)} GB`,
    `Professional recommendation: ${recommendation}`,
    comparison,
    videoFileSizeDisclaimer,
  ].filter(Boolean).join("\n");

  return (
    <ToolShell
      templateType={templateType}
      resultText={result}
      onReset={() => setState(defaults)}
      onExample={() => setState({ ...defaults, format: { ...defaultVideoFormatValue, presetId: "1080i-59.94" }, codec: "XAVC S", hours: "2", cameras: "2", margin: "30" })}
      formula={`Approximate bitrate is estimated from codec, pixel count, frame rate, and scan type. ${estimate.bitrateNote}`}
      useCases={["Compare progressive and interlaced workflows", "Plan recording, export, or streaming settings", "Estimate storage and delivery requirements"]}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Hours"><input className="input" value={state.hours} onChange={(event) => set("hours", event.target.value)} inputMode="decimal" /></Field>
        <Field label="Minutes"><input className="input" value={state.minutes} onChange={(event) => set("minutes", event.target.value)} inputMode="decimal" /></Field>
        <Field label="Seconds"><input className="input" value={state.seconds} onChange={(event) => set("seconds", event.target.value)} inputMode="decimal" /></Field>
      </div>
      <VideoFormatSelector value={state.format} onChange={setFormat} />
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Codec"><select className="select" value={state.codec} onChange={(event) => set("codec", event.target.value)}>{videoCodecs.map((codec) => <option key={codec}>{codec}</option>)}</select></Field>
        <Field label="Bitrate mode"><select className="select" value={state.mode} onChange={(event) => set("mode", event.target.value)}><option>Auto estimate</option><option>Manual bitrate</option></select></Field>
        {state.mode === "Manual bitrate" ? <Field label="Manual bitrate Mbps"><input className="input" value={state.manualBitrate} onChange={(event) => set("manualBitrate", event.target.value)} /></Field> : null}
        <Field label="Audio"><select className="select" value={state.audio} onChange={(event) => set("audio", event.target.value)}>{[...Object.keys(audioPresetsMbps), "Custom audio bitrate"].map((audio) => <option key={audio}>{audio}</option>)}</select></Field>
        {state.audio === "Custom audio bitrate" ? <Field label="Audio Kbps"><input className="input" value={state.customAudio} onChange={(event) => set("customAudio", event.target.value)} /></Field> : null}
        <Field label="Number of cameras / streams"><input className="input" value={state.cameras} onChange={(event) => set("cameras", event.target.value)} /></Field>
        <Field label="Safety margin"><select className="select" value={state.margin} onChange={(event) => set("margin", event.target.value)}><option>0</option><option>10</option><option>20</option><option>30</option></select></Field>
        <Field label="Delivery target"><input className="input" value={state.platform} onChange={(event) => set("platform", event.target.value)} /></Field>
      </div>
      <ResultGrid rows={[["Format", format.label], ["Scan", format.scanType], ["Bitrate", `${estimate.videoMbps.toFixed(2)} Mbps`], [isLive ? "Upload speed" : "Storage", isLive ? `${uploadRecommended.toFixed(2)} Mbps` : `${estimate.withMarginGb.toFixed(2)} GB`]]} />
      <ScanTypeInfo format={format} />
      <ProfessionalRecommendationCard format={format} deliveryTarget={state.platform} />
      <p className="rounded-lg bg-[var(--background)] p-3 text-sm muted">{videoFileSizeDisclaimer}</p>
    </ToolShell>
  );
}

function GenericCreatorTool({ templateType, toolName }: { templateType: string; toolName: string }) {
  const defaults = { topic: "video editing", valueA: "10", valueB: "50", valueC: "192", option: "YouTube", tone: "helpful" };
  const [s, setS] = useState(defaults);
  const set = (k: keyof typeof defaults, v: string) => setS((x) => ({ ...x, [k]: v }));
  const output = useMemo(() => genericOutput(templateType, toolName, s), [templateType, toolName, s]);
  return (
    <ToolShell templateType={templateType} resultText={output} onReset={() => setS(defaults)} onExample={() => setS({ topic: "4K travel vlog", valueA: "60", valueB: "100", valueC: "320", option: "YouTube", tone: "energetic" })} formula={genericFormula(templateType)} useCases={genericUseCases(templateType)}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Topic / project"><input className="input" value={s.topic} onChange={(e) => set("topic", e.target.value)} /></Field>
        <Field label="Platform / option"><input className="input" value={s.option} onChange={(e) => set("option", e.target.value)} /></Field>
        <Field label="Primary value"><input className="input" value={s.valueA} onChange={(e) => set("valueA", e.target.value)} /></Field>
        <Field label="Secondary value"><input className="input" value={s.valueB} onChange={(e) => set("valueB", e.target.value)} /></Field>
        <Field label="Audio / extra value"><input className="input" value={s.valueC} onChange={(e) => set("valueC", e.target.value)} /></Field>
        <Field label="Tone"><input className="input" value={s.tone} onChange={(e) => set("tone", e.target.value)} /></Field>
      </div>
    </ToolShell>
  );
}

function genericOutput(template: string, name: string, s: Record<string, string>) {
  const a = numberValue(s.valueA);
  const b = numberValue(s.valueB);
  const c = numberValue(s.valueC);
  if (template.includes("compression")) return `Compression ratio: ${(a / Math.max(1, b)).toFixed(2)}:1\nSpace saved: ${Math.max(0, ((a - b) / Math.max(1, a)) * 100).toFixed(1)}%\nWorkflow note: keep a master export before heavy compression.`;
  if (template.includes("upload-time")) return `Estimated upload time: ${((a * 8 * 1024) / Math.max(1, b) / 60).toFixed(1)} minutes\nFor ${s.option}, keep the browser open until processing starts.`;
  if (template.includes("frame-rate")) return `Frame count: ${(a * b).toFixed(0)} frames\nConverted duration at ${c || 30} fps: ${((a * b) / Math.max(1, c)).toFixed(2)} seconds`;
  if (template.includes("audio-delay")) return `Delay: ${a} ms\nFrames at ${b || 30} fps: ${((a / 1000) * (b || 30)).toFixed(2)} frames\nUse this in OBS audio sync offset.`;
  if (template.includes("reading-speed")) return `Reading speed: ${(s.topic.length / Math.max(1, a)).toFixed(1)} characters/sec\nRecommendation: ${s.topic.length / Math.max(1, a) > 20 ? "Shorten this subtitle line." : "Readable for most viewers."}`;
  if (template.includes("wav") || template.includes("audio-file-size")) return `Estimated audio size: ${((a * 60 * Math.max(1, b)) / 8 / 1024).toFixed(2)} GB\nUse lossless WAV for recording, compressed AAC/MP3 for delivery.`;
  if (template.includes("checklist")) return `Checklist for ${s.topic}:\n- Clear promise in title\n- Strong thumbnail contrast\n- Correct export resolution\n- Description, tags, and chapters added\n- Audio checked on headphones\n- Final preview on mobile`;
  if (template.includes("palette")) return `Palette ideas for ${s.topic}:\n- Electric blue + white + charcoal\n- Yellow + black + warm red\n- Teal + cream + deep navy\nUse one bright accent and keep text readable.`;
  if (template.includes("caption-cleaner")) return s.topic.replace(/\s+/g, " ").replace(/[.]{2,}/g, ".").trim();
  if (template.includes("srt") || template.includes("timestamp")) return s.topic.split(/[.\n]+/).filter(Boolean).map((line, i) => `${i + 1}\n00:00:${String(i * 3).padStart(2, "0")},000 --> 00:00:${String(i * 3 + 3).padStart(2, "0")},000\n${line.trim()}`).join("\n\n");
  if (template.includes("hashtag")) return s.topic.split(/[,\s]+/).filter(Boolean).slice(0, 12).map((x) => `#${x.replace(/[^a-z0-9]/gi, "")}`).join(" ");
  if (template.includes("bio")) return `${s.tone} ${s.option} creator making practical content about ${s.topic}. Follow for tips, behind-the-scenes notes, and new ideas every week.`;
  if (template.includes("hook")) return [`You are doing ${s.topic} wrong`, `Before you try ${s.topic}, watch this`, `The fastest way to improve ${s.topic}`, `Nobody tells beginners this about ${s.topic}`].join("\n");
  if (template.includes("generator") || template.includes("idea")) return [`How to improve ${s.topic} in 7 days`, `${s.topic}: beginner mistakes to avoid`, `I tested ${s.topic} so you do not have to`, `The simple ${s.topic} workflow for ${s.option}`, `${s.topic} checklist for creators`].join("\n");
  const gb = ((a + c / 1000) * b * 60) / 8 / 1024;
  return `${name} result:\nEstimated size or requirement: ${gb.toFixed(2)} GB\nPrimary recommendation: use a ${suggestCardSize(gb * 1.2)} card/drive with 20% spare capacity.\nCreator note: verify settings on your actual camera, encoder, or platform.`;
}

function genericFormula(template: string) {
  if (template.includes("generator") || template.includes("checklist") || template.includes("bio") || template.includes("hook")) return "This generator combines your topic, platform, and tone into reusable creator prompts and checklist items.";
  if (template.includes("compression")) return "Compression ratio = original file size / compressed file size. Space saved = (original - compressed) / original.";
  return "Most creator calculators use bitrate, duration, storage size, frame rate, or platform settings to estimate practical planning numbers.";
}

function genericUseCases(template: string) {
  if (template.includes("generator") || template.includes("checklist") || template.includes("bio") || template.includes("hook")) return ["Plan content faster", "Create reusable publishing assets", "Avoid blank-page friction"];
  return ["Estimate storage or bandwidth", "Plan production settings", "Compare export and recording choices"];
}
