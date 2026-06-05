export type ToolDefinition = {
  name: string;
  slug: string;
  category: string;
  templateType: string;
  iconName: string;
  description: string;
  featured?: boolean;
  popular?: boolean;
};

const t = (name: string, slug: string, category: string, templateType: string, iconName: string, description: string, featured = false, popular = false): ToolDefinition => ({
  name,
  slug,
  category,
  templateType,
  iconName,
  description,
  featured,
  popular,
});

export const toolDefinitions: ToolDefinition[] = [
  t("Video Storage Calculator", "video-storage-calculator", "video-calculators", "video-storage-calculator", "HardDrive", "Advanced camera storage calculator with codec, resolution, audio, multi-camera, and safety margin estimates.", true, true),
  t("Bitrate Calculator", "bitrate-calculator", "video-calculators", "bitrate-calculator", "Gauge", "Calculate required video bitrate from file size, duration, audio bitrate, and output unit.", true, true),
  t("Recording Time Calculator", "recording-time-calculator", "video-calculators", "recording-time-calculator", "Clock", "Estimate recording time from storage, codec, resolution, frame rate, audio, and camera count.", true),
  t("Streaming Bandwidth Calculator", "streaming-bandwidth-calculator", "live-streaming-tools", "streaming-bandwidth-calculator", "Wifi", "Calculate recommended upload speed and stability warnings for livestreaming.", true, true),
  t("Aspect Ratio Calculator", "aspect-ratio-calculator", "video-calculators", "aspect-ratio-calculator", "RectangleHorizontal", "Simplify aspect ratios and calculate matching resize dimensions.", false, true),
  t("Camera Crop Factor Calculator", "camera-crop-factor-calculator", "camera-tools", "camera-crop-factor-calculator", "Camera", "Calculate full-frame equivalent focal length, depth-of-field estimate, and field-of-view category."),
  t("Video File Size Calculator", "video-file-size-calculator", "video-calculators", "video-file-size-calculator", "FileVideo", "Estimate video file size from bitrate, duration, audio, and camera count.", true, true),
  t("Video Compression Ratio Calculator", "video-compression-ratio-calculator", "video-calculators", "compression-ratio-calculator", "Archive", "Compare original and compressed video sizes and calculate compression savings."),
  t("4K Storage Calculator", "4k-storage-calculator", "video-calculators", "four-k-storage-calculator", "Monitor", "Estimate storage needs for 4K camera footage using codec, frame rate, and shoot duration.", true),
  t("Multi-Camera Storage Calculator", "multi-camera-storage-calculator", "video-calculators", "multi-camera-storage-calculator", "PanelsTopLeft", "Plan storage for multi-camera shoots with safety margin."),
  t("Daily Shoot Storage Planner", "daily-shoot-storage-planner", "video-calculators", "daily-shoot-storage-planner", "CalendarDays", "Plan storage requirements across multiple shooting days."),
  t("SD Card Recording Time Calculator", "sd-card-recording-time-calculator", "video-calculators", "sd-card-recording-time-calculator", "SdCard", "Estimate recording time for SD cards and camera bitrates."),
  t("Hard Drive Requirement Calculator", "hard-drive-requirement-calculator", "video-calculators", "hard-drive-requirement-calculator", "Database", "Calculate drive capacity needed for footage, proxies, exports, and backups."),
  t("YouTube Upload Time Calculator", "youtube-upload-time-calculator", "youtube-tools", "youtube-upload-time-calculator", "Upload", "Estimate YouTube upload time from file size and internet upload speed."),
  t("Video Export Settings Helper", "video-export-settings-helper", "video-calculators", "video-export-settings-helper", "SlidersHorizontal", "Get suggested export settings by platform, resolution, and frame rate."),
  t("Frame Rate Converter", "frame-rate-converter", "video-calculators", "frame-rate-converter", "Repeat", "Convert timeline duration between frame rates and estimate frame counts."),
  t("YouTube Title Generator", "youtube-title-generator", "youtube-tools", "youtube-title-generator", "Sparkles", "Generate title ideas from keyword, niche, tone, and video type.", true, true),
  t("YouTube Description Generator", "youtube-description-generator", "youtube-tools", "youtube-description-generator", "FileText", "Create a structured YouTube description template with links and CTA.", false, true),
  t("YouTube Tags Generator", "youtube-tags-generator", "youtube-tools", "youtube-tags-generator", "Tags", "Generate searchable YouTube tag ideas from topic and niche."),
  t("YouTube Hashtag Generator", "youtube-hashtag-generator", "youtube-tools", "hashtag-generator", "Hash", "Generate clean YouTube hashtags from keywords."),
  t("YouTube Shorts Hook Generator", "youtube-shorts-hook-generator", "youtube-tools", "shorts-hook-generator", "Zap", "Generate short-form video hook ideas for Shorts and Reels.", true),
  t("YouTube Channel Bio Generator", "youtube-channel-bio-generator", "youtube-tools", "bio-generator", "UserRound", "Create concise YouTube channel bio drafts."),
  t("YouTube Video Idea Generator", "youtube-video-idea-generator", "youtube-tools", "video-idea-generator", "Lightbulb", "Generate video ideas, angles, and formats from a niche."),
  t("YouTube SEO Checklist", "youtube-seo-checklist", "seo-tools", "youtube-seo-checklist", "CheckSquare", "Generate a practical SEO checklist for your upload."),
  t("YouTube Thumbnail Text Generator", "youtube-thumbnail-text-generator", "thumbnail-tools", "thumbnail-text-generator", "Type", "Generate short thumbnail text ideas for YouTube videos.", true),
  t("YouTube Upload Checklist", "youtube-upload-checklist", "content-planning-tools", "youtube-upload-checklist", "ListChecks", "Create a complete upload checklist before publishing."),
  t("OBS Bitrate Calculator", "obs-bitrate-calculator", "live-streaming-tools", "obs-bitrate-calculator", "Radio", "Calculate OBS video bitrate and upload recommendation."),
  t("YouTube Live Settings Generator", "youtube-live-settings-generator", "live-streaming-tools", "live-settings-generator", "Youtube", "Generate YouTube Live settings from resolution and FPS."),
  t("Twitch Bitrate Calculator", "twitch-bitrate-calculator", "live-streaming-tools", "twitch-bitrate-calculator", "Tv", "Calculate Twitch bitrate ranges and upload needs."),
  t("Live Stream Internet Speed Calculator", "live-stream-internet-speed-calculator", "live-streaming-tools", "stream-internet-speed-calculator", "Wifi", "Estimate internet speed needed for stable streaming."),
  t("Multi-Platform Stream Bandwidth Calculator", "multi-platform-stream-bandwidth-calculator", "live-streaming-tools", "multi-platform-bandwidth-calculator", "Network", "Plan upload bandwidth for simultaneous streams."),
  t("Audio Delay Calculator", "audio-delay-calculator", "audio-tools", "audio-delay-calculator", "AudioLines", "Convert audio delay between milliseconds and video frames."),
  t("Stream Recording Storage Calculator", "stream-recording-storage-calculator", "live-streaming-tools", "stream-recording-storage-calculator", "HardDriveDownload", "Estimate storage for livestream recordings."),
  t("Thumbnail Size Checker", "thumbnail-size-checker", "thumbnail-tools", "thumbnail-size-checker", "Image", "Check if a thumbnail matches recommended dimensions and file size."),
  t("Thumbnail Text Idea Generator", "thumbnail-text-idea-generator", "thumbnail-tools", "thumbnail-text-generator", "Type", "Generate punchy thumbnail text ideas."),
  t("Thumbnail Color Palette Idea Generator", "thumbnail-color-palette-idea-generator", "thumbnail-tools", "palette-generator", "Palette", "Generate thumbnail color palette ideas by mood and topic."),
  t("Clickable Thumbnail Checklist", "clickable-thumbnail-checklist", "thumbnail-tools", "thumbnail-checklist", "MousePointerClick", "Create a thumbnail improvement checklist."),
  t("Thumbnail Safe Area Guide", "thumbnail-safe-area-guide", "thumbnail-tools", "thumbnail-safe-area-guide", "ScanEye", "Check safe text zones for thumbnails."),
  t("SRT Formatter", "srt-formatter", "subtitle-tools", "srt-formatter", "Captions", "Clean subtitle text and format simple SRT blocks.", false, true),
  t("Subtitle Timestamp Generator", "subtitle-timestamp-generator", "subtitle-tools", "subtitle-timestamp-generator", "Timer", "Generate simple subtitle timestamps from text lines."),
  t("Subtitle Line Break Tool", "subtitle-line-break-tool", "subtitle-tools", "subtitle-line-break-tool", "WrapText", "Break long subtitle lines into readable short lines."),
  t("Caption Cleaner", "caption-cleaner", "subtitle-tools", "caption-cleaner", "Eraser", "Clean captions by removing extra spaces, filler markers, and repeated punctuation."),
  t("Subtitle Reading Speed Checker", "subtitle-reading-speed-checker", "subtitle-tools", "subtitle-reading-speed-checker", "Gauge", "Check subtitle reading speed in characters per second."),
  t("Audio File Size Calculator", "audio-file-size-calculator", "audio-tools", "audio-file-size-calculator", "FileAudio", "Estimate audio file size from duration and bitrate."),
  t("Podcast Duration Calculator", "podcast-duration-calculator", "audio-tools", "podcast-duration-calculator", "Mic", "Estimate podcast duration from segments and breaks."),
  t("Audio Bitrate Calculator", "audio-bitrate-calculator", "audio-tools", "audio-bitrate-calculator", "Volume2", "Calculate audio bitrate from file size and duration."),
  t("WAV Storage Calculator", "wav-storage-calculator", "audio-tools", "wav-storage-calculator", "Waveform", "Estimate WAV storage from bit depth, sample rate, channels, and duration."),
  t("Audio Level Notes Generator", "audio-level-notes-generator", "audio-tools", "audio-level-notes-generator", "NotebookPen", "Generate recording and editing audio level notes."),
  t("Instagram Caption Generator", "instagram-caption-generator", "social-media-tools", "social-caption-generator", "Instagram", "Generate Instagram captions from topic, tone, and CTA."),
  t("Reel Hook Generator", "reel-hook-generator", "social-media-tools", "shorts-hook-generator", "Clapperboard", "Generate hooks for Reels, Shorts, and short-form content."),
  t("Hashtag Generator", "hashtag-generator", "social-media-tools", "hashtag-generator", "Hash", "Generate useful social media hashtags from keywords."),
  t("Content Calendar Idea Generator", "content-calendar-idea-generator", "content-planning-tools", "content-calendar-generator", "CalendarPlus", "Generate a weekly content calendar from a niche."),
  t("Bio Generator", "bio-generator", "social-media-tools", "bio-generator", "UserRound", "Generate creator bio options for social platforms."),
];

export function getToolDefinition(templateType?: string | null, slug?: string | null) {
  return toolDefinitions.find((tool) => tool.templateType === templateType || tool.slug === slug);
}

export const toolTemplateTypes = Array.from(new Set(["content-only", ...toolDefinitions.map((tool) => tool.templateType)]));
