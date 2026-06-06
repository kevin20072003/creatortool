<?php
require_once __DIR__ . '/functions.php';

function render_header(string $title = '', string $description = ''): void {
    $desc = $description ?: 'Free calculators and generators for YouTubers, editors, videographers, streamers, and content creators.';
    ?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= e(page_title($title)) ?></title>
  <meta name="description" content="<?= e($desc) ?>">
  <link rel="canonical" href="<?= e(SITE_URL . ($_SERVER['REQUEST_URI'] ?? '/')) ?>">
  <meta property="og:title" content="<?= e(page_title($title)) ?>">
  <meta property="og:description" content="<?= e($desc) ?>">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="/assets/css/style.css">
  <script defer src="/assets/js/tools.js"></script>
</head>
<body>
  <header class="site-header">
    <div class="container nav">
      <a class="brand" href="/"><span>CT</span><?= e(SITE_NAME) ?></a>
      <button class="menu-btn" type="button" data-menu>Menu</button>
      <nav class="nav-links" data-nav>
        <a href="/tools.php">Tools</a>
        <a href="/blog.php">Blog</a>
        <a href="/page.php?slug=about">About</a>
        <a href="/page.php?slug=contact">Contact</a>
        <button class="theme-btn" type="button" data-theme>Theme</button>
      </nav>
    </div>
  </header>
<?php }

function render_footer(): void { ?>
  <footer class="footer">
    <div class="container footer-grid">
      <div>
        <a class="brand" href="/"><span>CT</span><?= e(SITE_NAME) ?></a>
        <p><?= e(setting('footer_text', 'Free creator tools for YouTubers, editors, videographers, and streamers.')) ?></p>
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
