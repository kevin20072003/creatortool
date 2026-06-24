<?php
require_once __DIR__ . '/functions.php';

function render_header(string $title = '', string $description = ''): void {
    $desc = $description ?: setting('global_meta_description', 'Free calculators and generators for YouTubers, editors, videographers, streamers, and content creators.');
    $siteName = setting('site_name', SITE_NAME);
    $logo = setting('site_logo', '');
    $favicon = setting('site_favicon', '');
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    $isAiPrompt = strpos($path, '/categories/ai-prompt-tools') === 0 || strpos($path, '/tools/ai-') === 0 || strpos($path, '/tools/image-to-prompt') === 0 || strpos($path, '/tools/prompt-') === 0 || strpos($path, '/tools/text-to-image') === 0 || strpos($path, '/tools/product-photo-prompt') === 0 || strpos($path, '/tools/youtube-thumbnail-prompt') === 0 || strpos($path, '/tools/logo-prompt') === 0 || strpos($path, '/tools/character-prompt') === 0 || strpos($path, '/tools/interior-design-prompt') === 0 || strpos($path, '/tools/social-media-post-prompt') === 0;
    $isTools = !$isAiPrompt && ($path === '/tools' || strpos($path, '/tools/') === 0 || strpos($path, '/categories/') === 0);
    $isBlog = $path === '/blog' || strpos($path, '/blog/') === 0;
    $isAbout = $path === '/pages/about';
    $isContact = $path === '/pages/contact';
    ?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark">
  <title><?= e(page_title($title)) ?></title>
  <meta name="description" content="<?= e($desc) ?>">
  <link rel="canonical" href="<?= e(SITE_URL . ($_SERVER['REQUEST_URI'] ?? '/')) ?>">
  <meta property="og:title" content="<?= e(page_title($title)) ?>">
  <meta property="og:description" content="<?= e($desc) ?>">
  <meta name="twitter:card" content="summary_large_image">
  <?php if ($favicon): ?><link rel="icon" href="<?= e($favicon) ?>"><?php endif; ?>
  <link rel="stylesheet" href="/assets/css/style.css?v=20260624-tool-fix3">
  <?php if (setting('search_console_code')): ?><?= setting('search_console_code') ?><?php endif; ?>
  <?php if (setting('google_analytics_code')): ?><?= setting('google_analytics_code') ?><?php endif; ?>
  <?php if (setting('custom_head_code')): ?><?= setting('custom_head_code') ?><?php endif; ?>
  <script defer src="/assets/js/tools.js?v=20260624-tool-fix3"></script>
</head>
<body>
  <header class="site-header">
    <div class="container nav">
      <a class="brand" href="/"><?php if ($logo): ?><img src="<?= e($logo) ?>" alt="<?= e($siteName) ?>"><?php else: ?><span>CT</span><?php endif; ?><?= e($siteName) ?></a>
      <button class="menu-btn" type="button" data-menu onclick="document.querySelector('[data-nav]')?.classList.toggle('open'); return false;">Menu</button>
      <nav class="nav-links" data-nav>
        <a class="<?= $isAiPrompt ? 'active' : '' ?>" href="/categories/ai-prompt-tools">AI Prompt Tools</a>
        <a class="<?= $isTools ? 'active' : '' ?>" href="/tools">Tools</a>
        <a class="<?= $isBlog ? 'active' : '' ?>" href="/blog">Blog</a>
        <a class="<?= $isAbout ? 'active' : '' ?>" href="/pages/about">About</a>
        <a class="<?= $isContact ? 'active' : '' ?>" href="/pages/contact">Contact</a>
      </nav>
    </div>
  </header>
  <?php if (trim(setting('maintenance_message'))): ?>
    <div class="notice-bar"><?= e(setting('maintenance_message')) ?></div>
  <?php endif; ?>
<?php }

function render_footer(): void {
    $siteName = setting('site_name', SITE_NAME);
    $logo = setting('site_logo', '');
    $footerImage = setting('footer_image', '');
    $assistantTools = [];
    try {
        $assistantTools = q('SELECT t.name, t.slug, t.description, t.template_type, c.name category FROM tools t LEFT JOIN categories c ON c.id = t.category_id WHERE t.status = "published" ORDER BY t.featured DESC, t.popular DESC, t.sort_order, t.name LIMIT 120')->fetchAll();
    } catch (Throwable $e) {
        $assistantTools = [];
    }
    ?>
  <footer class="footer">
    <div class="container footer-grid">
      <div>
        <?php if ($footerImage): ?>
          <a class="footer-image-link" href="/"><img class="footer-image" src="<?= e($footerImage) ?>" alt="<?= e($siteName) ?>"></a>
        <?php else: ?>
          <a class="brand" href="/"><?php if ($logo): ?><img src="<?= e($logo) ?>" alt="<?= e($siteName) ?>"><?php else: ?><span>CT</span><?php endif; ?><?= e($siteName) ?></a>
        <?php endif; ?>
        <p><?= e(setting('footer_text', 'Free creator tools for YouTubers, editors, videographers, and streamers.')) ?></p>
        <p class="social-links">
          <?php if (setting('youtube_url')): ?><a href="<?= e(setting('youtube_url')) ?>">YouTube</a><?php endif; ?>
          <?php if (setting('instagram_url')): ?><a href="<?= e(setting('instagram_url')) ?>">Instagram</a><?php endif; ?>
          <?php if (setting('x_url')): ?><a href="<?= e(setting('x_url')) ?>">X</a><?php endif; ?>
        </p>
      </div>
      <div><h3>Tools</h3><a href="/tools">All Tools</a><a href="/categories/ai-prompt-tools">AI Prompt Tools</a><a href="/categories/youtube-tools">YouTube Tools</a><a href="/categories/video-calculators">Video Calculators</a></div>
      <div><h3>Pages</h3><a href="/blog">Blog</a><a href="/pages/privacy-policy">Privacy</a><a href="/pages/terms-and-conditions">Terms</a></div>
      <div><h3>Admin</h3><a href="/admin/login.php">Login</a><a href="/sitemap.php">Sitemap</a></div>
    </div>
  </footer>
  <section class="assistant-widget" data-chat-widget>
    <button class="assistant-toggle" type="button" data-chat-toggle onclick="toggleAssistant(); return false;"><span>AI</span><strong>Find a tool</strong></button>
    <div class="assistant-panel" data-chat-panel>
      <div class="assistant-head">
        <div><p class="eyebrow">CreatorTool assistant</p><h3>Tell me what you need</h3></div>
        <button type="button" data-chat-toggle onclick="toggleAssistant(); return false;">Close</button>
      </div>
      <div class="assistant-messages" data-chat-messages>
        <div class="assistant-message bot">Hi. Tell me your task, like "make image prompt", "calculate 4K storage", "YouTube tags", or "OBS bitrate". I will suggest the right tool.</div>
      </div>
      <div class="assistant-suggestions">
        <button type="button" data-chat-suggestion="I need an AI image prompt" onclick="askAssistant('I need an AI image prompt'); return false;">Image prompt</button>
        <button type="button" data-chat-suggestion="Calculate video storage" onclick="askAssistant('Calculate video storage'); return false;">Video storage</button>
        <button type="button" data-chat-suggestion="YouTube thumbnail idea" onclick="askAssistant('YouTube thumbnail idea'); return false;">Thumbnail</button>
      </div>
      <div class="assistant-input-row">
        <input class="input" data-chat-input placeholder="Describe your need...">
        <button class="btn-primary" type="button" data-chat-send onclick="sendAssistantMessage(); return false;">Send</button>
      </div>
    </div>
  </section>
  <script>
    window.creatorToolsIndex = <?= json_encode(array_map(fn($tool) => [
        'name' => $tool['name'],
        'slug' => $tool['slug'],
        'description' => $tool['description'],
        'category' => $tool['category'],
        'type' => $tool['template_type'],
        'url' => tool_url($tool['slug']),
    ], $assistantTools), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?>;
  </script>
</body>
</html>
<?php }

function ad_slot(string $name): void {
    if (setting('ads_enabled', '0') !== '1') return;
    $slot = q('SELECT code FROM ad_slots WHERE name = ? AND enabled = 1', [$name])->fetch();
    if ($slot && trim($slot['code'])) {
        echo $slot['code'];
    } elseif (setting('show_ad_placeholders', '0') === '1') {
        echo '<div class="ad-slot">Ad placeholder - ' . e($name) . '</div>';
    }
}
