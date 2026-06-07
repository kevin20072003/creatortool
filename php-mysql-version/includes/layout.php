<?php
require_once __DIR__ . '/functions.php';

function render_header(string $title = '', string $description = ''): void {
    $desc = $description ?: setting('global_meta_description', 'Free calculators and generators for YouTubers, editors, videographers, streamers, and content creators.');
    $siteName = setting('site_name', SITE_NAME);
    $logo = setting('site_logo', '');
    $favicon = setting('site_favicon', '');
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
  <link rel="stylesheet" href="/assets/css/style.css?v=20260607-dark-analytics">
  <?php if (setting('search_console_code')): ?><?= setting('search_console_code') ?><?php endif; ?>
  <?php if (setting('google_analytics_code')): ?><?= setting('google_analytics_code') ?><?php endif; ?>
  <?php if (setting('custom_head_code')): ?><?= setting('custom_head_code') ?><?php endif; ?>
  <script defer src="/assets/js/tools.js"></script>
</head>
<body>
  <header class="site-header">
    <div class="container nav">
      <a class="brand" href="/"><?php if ($logo): ?><img src="<?= e($logo) ?>" alt="<?= e($siteName) ?>"><?php else: ?><span>CT</span><?php endif; ?><?= e($siteName) ?></a>
      <button class="menu-btn" type="button" data-menu>Menu</button>
      <nav class="nav-links" data-nav>
        <a href="/tools.php">Tools</a>
        <a href="/blog.php">Blog</a>
        <a href="/page.php?slug=about">About</a>
        <a href="/page.php?slug=contact">Contact</a>
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
    ?>
  <footer class="footer">
    <div class="container footer-grid">
      <div>
        <a class="brand" href="/"><?php if ($logo): ?><img src="<?= e($logo) ?>" alt="<?= e($siteName) ?>"><?php else: ?><span>CT</span><?php endif; ?><?= e($siteName) ?></a>
        <p><?= e(setting('footer_text', 'Free creator tools for YouTubers, editors, videographers, and streamers.')) ?></p>
        <p class="social-links">
          <?php if (setting('youtube_url')): ?><a href="<?= e(setting('youtube_url')) ?>">YouTube</a><?php endif; ?>
          <?php if (setting('instagram_url')): ?><a href="<?= e(setting('instagram_url')) ?>">Instagram</a><?php endif; ?>
          <?php if (setting('x_url')): ?><a href="<?= e(setting('x_url')) ?>">X</a><?php endif; ?>
        </p>
      </div>
      <div><h3>Tools</h3><a href="/tools.php">All Tools</a><a href="/category.php?slug=youtube-tools">YouTube Tools</a><a href="/category.php?slug=video-calculators">Video Calculators</a></div>
      <div><h3>Pages</h3><a href="/blog.php">Blog</a><a href="/page.php?slug=privacy-policy">Privacy</a><a href="/page.php?slug=terms-and-conditions">Terms</a></div>
      <div><h3>Admin</h3><a href="/admin/login.php">Login</a><a href="/sitemap.php">Sitemap</a></div>
    </div>
  </footer>
</body>
</html>
<?php }

function ad_slot(string $name): void {
    $slot = q('SELECT code FROM ad_slots WHERE name = ? AND enabled = 1', [$name])->fetch();
    if ($slot && trim($slot['code'])) {
        echo $slot['code'];
    } else {
        echo '<div class="ad-slot">Ad placeholder - ' . e($name) . '</div>';
    }
}
