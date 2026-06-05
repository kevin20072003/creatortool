"use client";

import { groupedVideoFormats, resolveVideoFormat, scanTypeLabel, videoFormatPresets, type ScanType, type VideoFormatSelectorValue } from "@/lib/video/videoFormats";

export function VideoFormatSelector({
  value,
  onChange,
}: {
  value: VideoFormatSelectorValue;
  onChange: (value: VideoFormatSelectorValue) => void;
}) {
  const selected = resolveVideoFormat(value);
  const set = (patch: Partial<VideoFormatSelectorValue>) => onChange({ ...value, ...patch });

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <label className="label md:col-span-2">
        Video format preset
        <select className="select" value={value.presetId} onChange={(event) => set({ presetId: event.target.value })}>
          {groupedVideoFormats.map((group) => (
            <optgroup label={group} key={group}>
              {videoFormatPresets.filter((format) => format.group === group).map((format) => (
                <option value={format.id} key={format.id}>{format.label}</option>
              ))}
            </optgroup>
          ))}
          <optgroup label="Custom">
            <option value="custom">Custom format</option>
          </optgroup>
        </select>
      </label>
      <label className="label">
        Video Scan Format
        <input className="input" readOnly value={scanTypeLabel(selected.scanType)} />
      </label>
      {value.presetId === "custom" ? (
        <>
          <label className="label">Width<input className="input" value={value.customWidth} onChange={(event) => set({ customWidth: event.target.value })} inputMode="numeric" /></label>
          <label className="label">Height<input className="input" value={value.customHeight} onChange={(event) => set({ customHeight: event.target.value })} inputMode="numeric" /></label>
          <label className="label">Frame or field rate<input className="input" value={value.customRate} onChange={(event) => set({ customRate: event.target.value })} inputMode="decimal" /></label>
          <label className="label">Scan type<select className="select" value={value.customScanType} onChange={(event) => set({ customScanType: event.target.value as ScanType })}><option value="progressive">Progressive</option><option value="interlaced">Interlaced</option><option value="psf">PsF</option></select></label>
        </>
      ) : null}
      <p className="rounded-lg bg-[var(--background)] p-3 text-sm leading-6 muted md:col-span-3">
        Interlaced video uses two fields to make one frame. For example, 1080i50 has 50 fields per second but 25 full frames per second.
      </p>
    </div>
  );
}
