<?php
require_once __DIR__ . '/includes/layout.php';
$qstr = trim($_GET['q'] ?? '');
$categorySlug = trim($_GET['category'] ?? '');
$categories = q('SELECT * FROM categories ORDER BY sort_order, name')->fetchAll();
$params = ["%$qstr%", "%$qstr%"];
$where = 't.status = "published" AND (t.name LIKE ? OR t.description LIKE ?)';
if ($categorySlug) {
    $where .= ' AND c.slug = ?';
    $params[] = $categorySlug;
}
$tools = q("SELECT t.*, c.name category, c.slug category_slug FROM tools t LEFT JOIN categories c ON c.id = t.category_id WHERE $where ORDER BY t.popular DESC, t.sort_order, t.name", $params)->fetchAll();
if ($qstr) {
    try { q('INSERT INTO search_logs (query, results, device, created_at) VALUES (?, ?, ?, NOW())', [$qstr, count($tools), preg_match('/mobile|android|iphone/i', $_SERVER['HTTP_USER_AGENT'] ?? '') ? 'mobile' : 'desktop']); } catch (Throwable $e) {}
}
render_header('All Tools', 'Browse free creator calculators and generators for YouTube, video editing, streaming, thumbnails, subtitles, audio, and social media.');
?>
<main class="container section">
  <p class="eyebrow">All tools</p>
  <h1>Find the right creator tool</h1>
  <p class="lead">Search by workflow or pick a category. Each tool includes examples, result copy, FAQs, and practical creator guidance.</p>
  <?php ad_slot('header'); ?>
  <form class="card tools-filter" method="get">
    <label class="label">Search tools<input class="input" name="q" value="<?= e($qstr) ?>" placeholder="Search storage, bitrate, thumbnail, subtitle..."></label>
    <label class="label">Category<select class="select" name="category"><option value="">All categories</option><?php foreach ($categories as $cat): ?><option value="<?= e($cat['slug']) ?>" <?= $categorySlug === $cat['slug'] ? 'selected' : '' ?>><?= e($cat['name']) ?></option><?php endforeach; ?></select></label>
    <button class="btn-primary" type="submit">Search</button>
  </form>
  <div class="tool-list-layout">
    <aside class="card desktop-only">
      <p class="eyebrow">Categories</p>
      <?php foreach ($categories as $cat): ?><a class="filter-link" href="/tools.php?category=<?= e($cat['slug']) ?>"><?= e($cat['name']) ?></a><?php endforeach; ?>
      <?php ad_slot('sidebar'); ?>
    </aside>
    <section>
      <div class="result-count"><?= e((string)count($tools)) ?> tools found</div>
      <div class="grid-auto">
        <?php foreach ($tools as $index => $tool): ?>
          <a class="card tool-card" href="/tool.php?slug=<?= e($tool['slug']) ?>">
            <span class="icon"><?= e($tool['icon_name'] ?: substr($tool['name'], 0, 2)) ?></span>
            <p class="eyebrow"><?= e($tool['category']) ?></p>
            <h3><?= e($tool['name']) ?></h3>
            <p class="muted"><?= e($tool['description']) ?></p>
          </a>
          <?php if ($index === 5): ?><div class="wide"><?php ad_slot('tools-list'); ?></div><?php endif; ?>
        <?php endforeach; ?>
      </div>
      <?php ad_slot('in-content'); ?>
    </section>
  </div>
</main>
<?php render_footer(); ?>
