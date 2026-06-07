<?php
require_once __DIR__ . '/includes/layout.php';
$tools = q('SELECT name, slug FROM tools WHERE status = "published" ORDER BY name')->fetchAll();
$categories = q('SELECT name, slug FROM categories ORDER BY sort_order, name')->fetchAll();
$posts = q('SELECT title, slug FROM blog_posts WHERE status = "published" ORDER BY title')->fetchAll();
$pages = q('SELECT title, slug FROM pages ORDER BY title')->fetchAll();
render_header('Sitemap', 'All pages, tools, categories, and blog posts on CreatorTool.in.');
?>
<main class="container section">
  <h1>Sitemap</h1>
  <div class="grid-auto">
    <section class="card"><h2>Tools</h2><?php foreach ($tools as $row): ?><a href="<?= e(tool_url($row['slug'])) ?>"><?= e($row['name']) ?></a><?php endforeach; ?></section>
    <section class="card"><h2>Categories</h2><?php foreach ($categories as $row): ?><a href="<?= e(category_url($row['slug'])) ?>"><?= e($row['name']) ?></a><?php endforeach; ?></section>
    <section class="card"><h2>Blog</h2><?php foreach ($posts as $row): ?><a href="<?= e(blog_url($row['slug'])) ?>"><?= e($row['title']) ?></a><?php endforeach; ?></section>
    <section class="card"><h2>Pages</h2><?php foreach ($pages as $row): ?><a href="<?= e(page_url($row['slug'])) ?>"><?= e($row['title']) ?></a><?php endforeach; ?></section>
  </div>
</main>
<?php render_footer(); ?>
