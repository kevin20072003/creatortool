<?php
$template = $tool['template_type'] ?? 'video-storage';

function video_format_fields(bool $withCameras = true, bool $withDuration = true): void { ?>
  <?php if ($withDuration): ?>
    <label class="label">Hours<input class="input" name="hours" value="1" inputmode="decimal"></label>
    <label class="label">Minutes<input class="input" name="minutes" value="0" inputmode="decimal"></label>
  <?php endif; ?>
  <label class="label">Video format<select class="select" name="format"><optgroup label="SD"><option value="480i29.97">480i 29.97</option><option>480p 29.97</option><option value="576i25">576i 25</option></optgroup><optgroup label="HD"><option value="720p59.94">720p 59.94</option><option value="1080i50">1080i 50</option><option value="1080i59.94">1080i 59.94</option><option value="1080p50" selected>1080p 50</option></optgroup><optgroup label="UHD / 4K"><option value="2160p60">2160p 60</option></optgroup><option value="custom">Custom</option></select></label>
  <label class="label">Codec<select class="select" name="codec"><option>H.264</option><option>H.265 / HEVC</option><option>MPEG-2</option><option>XAVC S</option><option>XAVC HS</option><option>ProRes 422</option><option>DNxHD / DNxHR</option><option>Custom</option></select></label>
  <label class="label">Bitrate mode<select class="select" name="mode"><option>Auto estimate</option><option>Manual bitrate</option></select></label>
  <label class="label">Manual bitrate Mbps<input class="input" name="manual" value="50" inputmode="decimal"></label>
  <label class="label">Audio Kbps<input class="input" name="audio" value="192" inputmode="decimal"></label>
  <?php if ($withCameras): ?><label class="label">Cameras / streams<input class="input" name="cameras" value="1" inputmode="numeric"></label><?php endif; ?>
<?php }
?>

<div class="tool-form-grid">
<?php if (in_array($template, ['video-storage', 'video-file-size'], true)): ?>
  <?php video_format_fields(true, true); ?>
  <label class="label">Safety margin %<input class="input" name="margin" value="20" inputmode="decimal"></label>
<?php elseif ($template === 'bitrate'): ?>
  <label class="label">Target file size<input class="input" name="target" value="5" inputmode="decimal"></label>
  <label class="label">Unit<select class="select" name="unit"><option>GB</option><option>MB</option><option>TB</option></select></label>
  <label class="label">Hours<input class="input" name="hours" value="1" inputmode="decimal"></label>
  <label class="label">Minutes<input class="input" name="minutes" value="0" inputmode="decimal"></label>
  <label class="label">Audio Kbps<input class="input" name="audio" value="192" inputmode="decimal"></label>
<?php elseif ($template === 'recording-time'): ?>
  <label class="label">Storage size<input class="input" name="storage" value="128" inputmode="decimal"></label>
  <label class="label">Storage unit<select class="select" name="storage_unit"><option>GB</option><option>MB</option><option>TB</option></select></label>
  <?php video_format_fields(true, false); ?>
<?php elseif ($template === 'streaming-bandwidth'): ?>
  <label class="label">Platform<select class="select" name="niche"><option>YouTube Live</option><option>Twitch</option><option>Facebook</option><option>Custom</option></select></label>
  <label class="label">Stream bitrate Mbps<input class="input" name="stream_bitrate" value="9" inputmode="decimal"></label>
  <label class="label">Audio Kbps<input class="input" name="audio" value="192" inputmode="decimal"></label>
  <label class="label">Streams<input class="input" name="cameras" value="1" inputmode="numeric"></label>
  <label class="label">Safety margin %<input class="input" name="margin" value="30" inputmode="decimal"></label>
  <label class="label">Video format<select class="select" name="format"><option value="1080p50">1080p 50</option><option value="1080i50">1080i 50</option><option value="2160p60">2160p 60</option></select></label>
<?php elseif ($template === 'aspect-ratio'): ?>
  <label class="label">Width<input class="input" name="width" value="1920" inputmode="numeric"></label>
  <label class="label">Height<input class="input" name="height" value="1080" inputmode="numeric"></label>
<?php elseif ($template === 'crop-factor'): ?>
  <label class="label">Lens focal length mm<input class="input" name="manual" value="50" inputmode="decimal"></label>
  <label class="label">Crop factor<select class="select" name="custom_rate"><option value="1">Full Frame 1.0x</option><option value="1.5" selected>APS-C Sony/Nikon 1.5x</option><option value="1.6">APS-C Canon 1.6x</option><option value="2">Micro Four Thirds 2.0x</option></select></label>
  <label class="label">Aperture<input class="input" name="target" value="2.8" inputmode="decimal"></label>
<?php elseif ($template === 'description-generator'): ?>
  <label class="label">Video title<input class="input" name="title" value="How to Calculate Video File Size"></label>
  <label class="label">Topic<input class="input" name="keyword" value="4K video storage"></label>
  <label class="label">Links / CTA<input class="input" name="links" value="Subscribe for more creator tips"></label>
<?php elseif ($template === 'hashtag-generator'): ?>
  <label class="label">Keywords<input class="input" name="keyword" value="youtube creator tools"></label>
<?php elseif ($template === 'thumbnail-text-generator'): ?>
  <label class="label">Video topic<input class="input" name="keyword" value="cinematic travel vlog"></label>
<?php elseif ($template === 'srt-formatter'): ?>
  <label class="label wide">Subtitle lines<textarea class="textarea" name="text">This is a sample subtitle line.
This is the next subtitle line.</textarea></label>
<?php elseif ($template === 'line-break'): ?>
  <label class="label wide">Caption text<textarea class="textarea" name="text">This is a sample subtitle line for creators who want clean readable captions.</textarea></label>
  <label class="label">Max line length<input class="input" name="line_length" value="42" inputmode="numeric"></label>
<?php elseif ($template === 'upload-time'): ?>
  <label class="label">File size GB<input class="input" name="file_size" value="10" inputmode="decimal"></label>
  <label class="label">Upload speed Mbps<input class="input" name="upload_speed" value="20" inputmode="decimal"></label>
<?php elseif ($template === 'export-helper'): ?>
  <?php video_format_fields(false, false); ?>
  <label class="label">Delivery platform<select class="select" name="niche"><option>YouTube</option><option>Instagram Reels</option><option>TikTok</option><option>Client delivery</option></select></label>
<?php else: ?>
  <label class="label">Keyword / topic<input class="input" name="keyword" value="4K video storage"></label>
  <label class="label">Niche / platform<input class="input" name="niche" value="YouTube creators"></label>
  <label class="label">Tone<select class="select" name="tone"><option>Helpful</option><option>Bold</option><option>Curious</option><option>Professional</option></select></label>
<?php endif; ?>
</div>
