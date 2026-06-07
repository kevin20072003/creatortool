<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);

function install_error_page(string $title, string $message, string $detail = ''): void {
    http_response_code(500);
    ?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CreatorTool Install Error</title>
  <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
  <main class="container section">
    <div class="card">
      <p class="eyebrow">Install error</p>
      <h1><?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?></h1>
      <p><?= htmlspecialchars($message, ENT_QUOTES, 'UTF-8') ?></p>
      <?php if ($detail): ?><pre class="alert"><?= htmlspecialchars($detail, ENT_QUOTES, 'UTF-8') ?></pre><?php endif; ?>
      <h2>Quick checks</h2>
      <p class="muted">1. Edit <code>includes/config.php</code> with the exact Hostinger MySQL database name, username, and password.</p>
      <p class="muted">2. Make sure the files inside <code>php-mysql-version</code> are uploaded directly into <code>public_html</code>.</p>
      <p class="muted">3. Set Hostinger PHP version to PHP 8.1 or newer.</p>
      <p><a class="btn-secondary" href="/db-check.php">Run DB check</a></p>
    </div>
  </main>
</body>
</html>
<?php
    exit;
}

set_exception_handler(function (Throwable $e): void {
    install_error_page('Installation failed', 'The installer stopped because the server returned an error.', $e->getMessage());
});

require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';

if (DB_NAME === 'CreatorTool_db' || DB_USER === 'CreatorTool_user' || DB_PASS === 'change-this-password') {
    install_error_page(
        'Database config is still default',
        'Open includes/config.php in Hostinger File Manager and replace the sample database values with your real Hostinger MySQL details.'
    );
}

try {
    $pdo = db();
} catch (Throwable $e) {
    install_error_page('Database connection failed', 'The installer could not connect to MySQL. Check DB_HOST, DB_NAME, DB_USER, and DB_PASS in includes/config.php.', $e->getMessage());
}

$schema = [
    "CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(190) UNIQUE NOT NULL, name VARCHAR(190), password_hash VARCHAR(255) NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)",
    "CREATE TABLE IF NOT EXISTS categories (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(190) NOT NULL, slug VARCHAR(190) UNIQUE NOT NULL, description TEXT, icon VARCHAR(80), seo_title VARCHAR(255), seo_description TEXT, sort_order INT DEFAULT 0)",
    "CREATE TABLE IF NOT EXISTS tools (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(190) NOT NULL, slug VARCHAR(190) UNIQUE NOT NULL, category_id INT NULL, description TEXT NOT NULL, content MEDIUMTEXT, template_type VARCHAR(120) DEFAULT 'content-only', icon_name VARCHAR(80), status VARCHAR(30) DEFAULT 'published', featured TINYINT DEFAULT 0, popular TINYINT DEFAULT 0, seo_title VARCHAR(255), seo_description TEXT, keywords TEXT, sort_order INT DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)",
    "CREATE TABLE IF NOT EXISTS faqs (id INT AUTO_INCREMENT PRIMARY KEY, tool_id INT NULL, question TEXT NOT NULL, answer TEXT NOT NULL, sort_order INT DEFAULT 0)",
    "CREATE TABLE IF NOT EXISTS tool_relations (id INT AUTO_INCREMENT PRIMARY KEY, source_tool_id INT NOT NULL, related_tool_id INT NOT NULL)",
    "CREATE TABLE IF NOT EXISTS blog_posts (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, slug VARCHAR(190) UNIQUE NOT NULL, excerpt TEXT, content MEDIUMTEXT, status VARCHAR(30) DEFAULT 'published', seo_title VARCHAR(255), seo_description TEXT, tags TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)",
    "CREATE TABLE IF NOT EXISTS pages (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, slug VARCHAR(190) UNIQUE NOT NULL, content MEDIUMTEXT, seo_title VARCHAR(255), seo_description TEXT)",
    "CREATE TABLE IF NOT EXISTS settings (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(190) UNIQUE NOT NULL, value MEDIUMTEXT)",
    "CREATE TABLE IF NOT EXISTS ad_slots (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(80) UNIQUE NOT NULL, code MEDIUMTEXT, enabled TINYINT DEFAULT 1)",
    "CREATE TABLE IF NOT EXISTS media (id INT AUTO_INCREMENT PRIMARY KEY, filename VARCHAR(255), url VARCHAR(255), mime_type VARCHAR(120), size INT DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)",
    "CREATE TABLE IF NOT EXISTS analytics_events (id INT AUTO_INCREMENT PRIMARY KEY, type VARCHAR(80), path VARCHAR(255), entity_slug VARCHAR(190), device VARCHAR(50), country VARCHAR(80) DEFAULT 'Unknown', ip_hash VARCHAR(80), user_agent TEXT, referrer TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)",
    "CREATE TABLE IF NOT EXISTS search_logs (id INT AUTO_INCREMENT PRIMARY KEY, query VARCHAR(255), results INT DEFAULT 0, device VARCHAR(50), created_at DATETIME DEFAULT CURRENT_TIMESTAMP)"
];

foreach ($schema as $sql) $pdo->exec($sql);

function upsert(string $table, array $data, string $unique): void {
    $columns = array_keys($data);
    $updates = array_map(fn($col) => "$col = VALUES($col)", $columns);
    $sql = "INSERT INTO $table (" . implode(',', $columns) . ") VALUES (" . implode(',', array_fill(0, count($columns), '?')) . ") ON DUPLICATE KEY UPDATE " . implode(',', $updates);
    q($sql, array_values($data));
}

$categories = [
    ['YouTube Tools', 'youtube-tools', 'Tools for YouTube titles, descriptions, tags, ideas, and upload workflows.', 'YT'],
    ['Video Calculators', 'video-calculators', 'Storage, bitrate, upload, export, and recording calculators.', 'VC'],
    ['Thumbnail Tools', 'thumbnail-tools', 'Thumbnail copy, color, size, and safe area helpers.', 'TH'],
    ['Subtitle Tools', 'subtitle-tools', 'SRT, captions, timestamps, line breaks, and reading speed tools.', 'ST'],
    ['Live Streaming Tools', 'live-streaming-tools', 'OBS, Twitch, YouTube Live, bandwidth, and stream storage helpers.', 'LS'],
    ['Camera Tools', 'camera-tools', 'Camera planning tools for lenses, crop factor, and storage.', 'CA'],
    ['Audio Tools', 'audio-tools', 'Audio size, WAV storage, bitrate, podcast, and level note tools.', 'AU'],
    ['Social Media Tools', 'social-media-tools', 'Captions, hooks, hashtags, bio, and calendar idea tools.', 'SM'],
    ['SEO Tools', 'seo-tools', 'SEO checklists and metadata helpers for creators.', 'SE'],
    ['Content Planning Tools', 'content-planning-tools', 'Planning helpers for scripts, uploads, and calendars.', 'CP'],
];

foreach ($categories as $i => $cat) {
    upsert('categories', ['name' => $cat[0], 'slug' => $cat[1], 'description' => $cat[2], 'icon' => $cat[3], 'sort_order' => $i], 'slug');
}

$tools = [
    ['Video Storage Calculator', 'video-storage-calculator', 'video-calculators', 'video-storage', 'Calculate video storage from duration, format, bitrate, audio, cameras, and margin.', 1, 1],
    ['Video File Size Calculator', 'video-file-size-calculator', 'video-calculators', 'video-storage', 'Estimate video file size for common creator recording and export formats.', 1, 1],
    ['Video Compression Ratio Calculator', 'video-compression-ratio-calculator', 'video-calculators', 'bitrate', 'Compare original and compressed video size to understand compression ratio.', 0, 0],
    ['4K Storage Calculator', '4k-storage-calculator', 'video-calculators', 'video-storage', 'Plan storage for 4K recording, editing, and multi-camera shoots.', 1, 1],
    ['Multi-Camera Storage Calculator', 'multi-camera-storage-calculator', 'video-calculators', 'video-storage', 'Estimate total storage across multiple cameras and safety margins.', 1, 0],
    ['Daily Shoot Storage Planner', 'daily-shoot-storage-planner', 'video-calculators', 'video-storage', 'Plan daily storage needs for production days and creator shoots.', 0, 0],
    ['SD Card Recording Time Calculator', 'sd-card-recording-time-calculator', 'video-calculators', 'recording-time', 'Estimate how long an SD card can record at selected settings.', 1, 1],
    ['Hard Drive Requirement Calculator', 'hard-drive-requirement-calculator', 'video-calculators', 'video-storage', 'Estimate drive capacity needed for creator footage and backups.', 0, 0],
    ['YouTube Upload Time Calculator', 'youtube-upload-time-calculator', 'youtube-tools', 'upload-time', 'Estimate YouTube upload time from file size and upload speed.', 0, 1],
    ['Video Export Settings Helper', 'video-export-settings-helper', 'video-calculators', 'export-helper', 'Suggest export settings for creator platforms.', 1, 0],
    ['Frame Rate Converter', 'frame-rate-converter', 'video-calculators', 'export-helper', 'Compare frame rate and scan format choices for delivery.', 0, 0],
    ['Bitrate Calculator', 'bitrate-calculator', 'video-calculators', 'bitrate', 'Find required bitrate from target file size and duration.', 1, 1],
    ['Recording Time Calculator', 'recording-time-calculator', 'video-calculators', 'recording-time', 'Estimate how long a card or drive can record.', 1, 0],
    ['Streaming Bandwidth Calculator', 'streaming-bandwidth-calculator', 'live-streaming-tools', 'streaming-bandwidth', 'Calculate recommended upload speed for live streams.', 1, 1],
    ['Aspect Ratio Calculator', 'aspect-ratio-calculator', 'video-calculators', 'aspect-ratio', 'Simplify aspect ratio and calculate resize dimensions.', 0, 1],
    ['Camera Crop Factor Calculator', 'camera-crop-factor-calculator', 'camera-tools', 'crop-factor', 'Calculate full-frame equivalent focal length and aperture.', 0, 0],
    ['YouTube Title Generator', 'youtube-title-generator', 'youtube-tools', 'generator', 'Generate YouTube title ideas from keyword and tone.', 1, 1],
    ['YouTube Description Generator', 'youtube-description-generator', 'youtube-tools', 'description-generator', 'Generate YouTube description templates.', 0, 1],
    ['YouTube Tags Generator', 'youtube-tags-generator', 'youtube-tools', 'hashtag-generator', 'Generate YouTube tags and keyword ideas from a topic.', 0, 1],
    ['YouTube Hashtag Generator', 'youtube-hashtag-generator', 'youtube-tools', 'hashtag-generator', 'Generate YouTube hashtags from your video topic.', 0, 1],
    ['YouTube Shorts Hook Generator', 'youtube-shorts-hook-generator', 'youtube-tools', 'generator', 'Create short opening hook ideas for YouTube Shorts.', 1, 0],
    ['YouTube Channel Bio Generator', 'youtube-channel-bio-generator', 'youtube-tools', 'description-generator', 'Write a simple YouTube channel bio from niche and topic.', 0, 0],
    ['YouTube Video Idea Generator', 'youtube-video-idea-generator', 'youtube-tools', 'generator', 'Generate video ideas for a creator niche.', 0, 1],
    ['YouTube SEO Checklist', 'youtube-seo-checklist', 'youtube-tools', 'description-generator', 'Create a practical YouTube upload SEO checklist.', 0, 0],
    ['YouTube Thumbnail Text Generator', 'youtube-thumbnail-text-generator', 'youtube-tools', 'thumbnail-text-generator', 'Generate short text ideas for YouTube thumbnails.', 1, 0],
    ['YouTube Upload Checklist', 'youtube-upload-checklist', 'youtube-tools', 'description-generator', 'Generate a pre-upload checklist for YouTube videos.', 0, 0],
    ['Hashtag Generator', 'hashtag-generator', 'social-media-tools', 'hashtag-generator', 'Generate hashtags from keywords.', 0, 1],
    ['Thumbnail Text Generator', 'thumbnail-text-generator', 'thumbnail-tools', 'thumbnail-text-generator', 'Generate short thumbnail text ideas.', 1, 0],
    ['Thumbnail Size Checker', 'thumbnail-size-checker', 'thumbnail-tools', 'aspect-ratio', 'Check thumbnail dimensions and aspect ratio.', 0, 1],
    ['Thumbnail Text Idea Generator', 'thumbnail-text-idea-generator', 'thumbnail-tools', 'thumbnail-text-generator', 'Generate punchy text ideas for thumbnails.', 0, 1],
    ['Thumbnail Color Palette Idea Generator', 'thumbnail-color-palette-idea-generator', 'thumbnail-tools', 'generator', 'Generate thumbnail color palette ideas from a topic.', 0, 0],
    ['Clickable Thumbnail Checklist', 'clickable-thumbnail-checklist', 'thumbnail-tools', 'description-generator', 'Create a checklist for stronger thumbnail concepts.', 0, 0],
    ['Thumbnail Safe Area Guide', 'thumbnail-safe-area-guide', 'thumbnail-tools', 'aspect-ratio', 'Check safe-area friendly thumbnail sizing notes.', 0, 0],
    ['SRT Formatter', 'srt-formatter', 'subtitle-tools', 'srt-formatter', 'Format simple subtitle text into SRT blocks.', 0, 1],
    ['Subtitle Timestamp Generator', 'subtitle-timestamp-generator', 'subtitle-tools', 'srt-formatter', 'Generate basic subtitle timestamps from text lines.', 0, 0],
    ['Subtitle Line Break Tool', 'subtitle-line-break-tool', 'subtitle-tools', 'line-break', 'Break long subtitle lines into readable lines.', 0, 0],
    ['Caption Cleaner', 'caption-cleaner', 'subtitle-tools', 'line-break', 'Clean caption spacing and line breaks.', 0, 0],
    ['Subtitle Reading Speed Checker', 'subtitle-reading-speed-checker', 'subtitle-tools', 'line-break', 'Check subtitle readability with shorter line wrapping.', 0, 0],
    ['OBS Bitrate Calculator', 'obs-bitrate-calculator', 'live-streaming-tools', 'streaming-bandwidth', 'Estimate OBS bitrate and upload speed.', 0, 1],
    ['YouTube Live Settings Generator', 'youtube-live-settings-generator', 'live-streaming-tools', 'export-helper', 'Suggest YouTube Live stream settings.', 0, 1],
    ['Twitch Bitrate Calculator', 'twitch-bitrate-calculator', 'live-streaming-tools', 'streaming-bandwidth', 'Estimate Twitch bitrate and upload requirements.', 0, 1],
    ['Live Stream Internet Speed Calculator', 'live-stream-internet-speed-calculator', 'live-streaming-tools', 'streaming-bandwidth', 'Calculate internet speed needed for live streaming.', 1, 0],
    ['Multi-Platform Stream Bandwidth Calculator', 'multi-platform-stream-bandwidth-calculator', 'live-streaming-tools', 'streaming-bandwidth', 'Estimate bandwidth for multi-platform streaming.', 0, 0],
    ['Audio Delay Calculator', 'audio-delay-calculator', 'live-streaming-tools', 'recording-time', 'Estimate timing adjustments for live production workflows.', 0, 0],
    ['Stream Recording Storage Calculator', 'stream-recording-storage-calculator', 'live-streaming-tools', 'video-storage', 'Estimate storage for stream recordings.', 0, 1],
    ['Audio File Size Calculator', 'audio-file-size-calculator', 'audio-tools', 'bitrate', 'Estimate audio file size from bitrate and duration.', 0, 1],
    ['Podcast Duration Calculator', 'podcast-duration-calculator', 'audio-tools', 'recording-time', 'Estimate podcast recording duration from storage and bitrate.', 0, 0],
    ['Audio Bitrate Calculator', 'audio-bitrate-calculator', 'audio-tools', 'bitrate', 'Calculate audio bitrate for a target file size.', 0, 0],
    ['WAV Storage Calculator', 'wav-storage-calculator', 'audio-tools', 'recording-time', 'Estimate WAV recording storage needs.', 0, 1],
    ['Audio Level Notes Generator', 'audio-level-notes-generator', 'audio-tools', 'description-generator', 'Generate simple audio level notes for recording sessions.', 0, 0],
    ['Instagram Caption Generator', 'instagram-caption-generator', 'social-media-tools', 'description-generator', 'Generate Instagram caption drafts from a topic.', 0, 1],
    ['Reel Hook Generator', 'reel-hook-generator', 'social-media-tools', 'generator', 'Generate short Reel hook ideas.', 0, 1],
    ['Content Calendar Idea Generator', 'content-calendar-idea-generator', 'content-planning-tools', 'generator', 'Generate content calendar ideas for creators.', 0, 0],
    ['Bio Generator', 'bio-generator', 'social-media-tools', 'description-generator', 'Generate short social profile bio ideas.', 0, 0],
];

foreach ($tools as $i => $tool) {
    $cat = q('SELECT id FROM categories WHERE slug = ?', [$tool[2]])->fetch();
    $content = "# {$tool[0]}\n\n## What is this tool?\n{$tool[4]}\n\n## How to use\nEnter values, review the result, copy it, and use the recommendation for your creator workflow.\n\n## Note\nActual results can vary by camera, codec, scene complexity, platform processing, and export settings.";
    upsert('tools', [
        'name' => $tool[0],
        'slug' => $tool[1],
        'category_id' => $cat ? $cat['id'] : null,
        'template_type' => $tool[3],
        'description' => $tool[4],
        'content' => $content,
        'status' => 'published',
        'featured' => $tool[5],
        'popular' => $tool[6],
        'seo_title' => $tool[0] . ' - CreatorTool.in',
        'seo_description' => $tool[4],
        'sort_order' => $i,
    ], 'slug');
}

$toolRows = q('SELECT id FROM tools ORDER BY sort_order ASC')->fetchAll();
foreach ($toolRows as $row) {
    $exists = q('SELECT COUNT(*) c FROM faqs WHERE tool_id = ?', [$row['id']])->fetch()['c'];
    if (!$exists) {
        q('INSERT INTO faqs (tool_id, question, answer, sort_order) VALUES (?, ?, ?, ?)', [$row['id'], 'Is this tool free?', 'Yes. This tool is free and works in your browser.', 0]);
        q('INSERT INTO faqs (tool_id, question, answer, sort_order) VALUES (?, ?, ?, ?)', [$row['id'], 'Are results exact?', 'Results are approximate and depend on real-world camera, codec, and platform behavior.', 1]);
    }
}

upsert('users', ['email' => ADMIN_EMAIL, 'name' => 'Admin', 'password_hash' => password_hash(ADMIN_PASSWORD, PASSWORD_DEFAULT)], 'email');

$posts = ['How to Calculate Video File Size', 'Best Bitrate Settings for YouTube Videos', 'How Much Storage Do You Need for 4K Video', 'Best Free Tools for YouTubers', 'How to Write Better YouTube Titles'];
foreach ($posts as $title) {
    upsert('blog_posts', [
        'title' => $title,
        'slug' => slugify($title),
        'excerpt' => $title . ' with practical examples for creators.',
        'content' => "# $title\n\nThis guide explains the basics in simple creator-friendly language.\n\n## Practical tip\nUse CreatorTool.in calculators before recording, editing, streaming, or uploading.",
        'status' => 'published',
        'seo_title' => $title . ' - CreatorTool.in',
        'seo_description' => $title . ' explained for creators.',
    ], 'slug');
}

$pages = [
    ['About', 'about', '# About CreatorTool.in\n\nCreatorTool.in provides simple tools for creators, editors, streamers, and videographers.'],
    ['Contact', 'contact', '# Contact\n\nUpdate this page from admin.'],
    ['Privacy Policy', 'privacy-policy', '# Privacy Policy\n\nThis site stores basic analytics and admin content in MySQL.'],
    ['Terms and Conditions', 'terms-and-conditions', '# Terms and Conditions\n\nUse these tools for estimates and educational planning.'],
    ['Disclaimer', 'disclaimer', '# Disclaimer\n\nCalculator results are approximate and may vary.'],
];
foreach ($pages as $p) upsert('pages', ['title' => $p[0], 'slug' => $p[1], 'content' => $p[2], 'seo_title' => $p[0] . ' - CreatorTool.in'], 'slug');

foreach ([
    'site_name' => 'CreatorTool.in',
    'homeHeroTitle' => 'CreatorTool.in',
    'homeHeroSubtitle' => 'Fast tools for YouTubers, editors, videographers, streamers, and content creators.',
    'global_meta_description' => 'Free calculators and generators for YouTubers, editors, videographers, streamers, and content creators.',
    'footer_text' => 'Free creator tools for YouTubers, editors, videographers, and streamers.',
    'site_logo' => '',
    'site_favicon' => '',
    'youtube_url' => '',
    'instagram_url' => '',
    'x_url' => '',
    'google_analytics_code' => '',
    'search_console_code' => '',
    'custom_head_code' => '',
    'maintenance_message' => '',
] as $name => $value) {
    upsert('settings', ['name' => $name, 'value' => $value], 'name');
}
foreach (['header', 'in-content', 'sidebar', 'footer'] as $slot) upsert('ad_slots', ['name' => $slot, 'code' => '', 'enabled' => 1], 'name');

?>
<!doctype html>
<html><head><meta charset="utf-8"><title>CreatorTool Install</title><link rel="stylesheet" href="/assets/css/style.css"></head>
<body><main class="container section"><div class="card"><h1>Install complete</h1><p>MySQL tables and seed data are ready.</p><p><a class="btn-primary" href="/">Open website</a> <a class="btn-secondary" href="/admin/login.php">Admin login</a></p><p class="muted">Delete or rename <code>install.php</code> after setup.</p></div></main></body></html>
