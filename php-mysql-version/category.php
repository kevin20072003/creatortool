<?php
require_once __DIR__ . '/includes/layout.php';
$slug = $_GET['slug'] ?? '';
$category = q('SELECT * FROM categories WHERE slug = ?', [$slug])->fetch();
if (!$category) {
    http_response_code(404);
    render_header('Category not found');
    echo '<main class="container section"><h1>Category not found</h1><p><a class="btn-secondary" href="/tools.php">View all tools</a></p></main>';
    render_footer();
    exit;
}
$tools = q('SELECT * FROM tools WHERE category_id = ? AND status = "published" ORDER BY sort_order, name', [$category['id']])->fetchAll();
render_header($category['seo_title'] ?: $category['name'], $category['seo_description'] ?: $category['description']);
?>
<main class="container section">
  <p class="muted"><a href="/">Home</a> / <a href="/tools.php">Tools</a></p>
  <p class="eyebrow"><?= e($category['icon']) ?> category</p>
  <h1><?= e($category['name']) ?></h1>
  <p class="lead"><?= e($category['description']) ?></p>
  <?php ad_slot('header'); ?>
  <div class="grid-auto">
    <?php foreach ($tools as $index => $tool): ?>
      <a class="card tool-card" href="/tool.php?slug=<?= e($tool['slug']) ?>">
        <span class="icon"><?= e(substr($tool['name'], 0, 2)) ?></span>
        <h3><?= e($tool['name']) ?></h3>
        <p class="muted"><?= e($tool['description']) ?></p>
      </a>
      <?php if ($index === 5): ?><div class="wide"><?php ad_slot('tools-list'); ?></div><?php endif; ?>
    <?php endforeach; ?>
  </div>
  <?php ad_slot('in-content'); ?>
</main>
<?php render_footer(); ?>
