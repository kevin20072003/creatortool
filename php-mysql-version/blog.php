<?php
require_once __DIR__ . '/includes/layout.php';
$posts = q('SELECT * FROM blog_posts WHERE status = "published" ORDER BY created_at DESC, id DESC')->fetchAll();
render_header('Creator Blog', 'Guides for YouTubers, editors, videographers, live streamers, and content creators.');
?>
<main class="container section">
  <p class="eyebrow">Creator guides</p>
  <h1>Latest blog posts</h1>
  <p class="lead">Practical guides for planning, recording, editing, streaming, and uploading better content.</p>
  <?php ad_slot('header'); ?>
  <div class="grid-auto">
    <?php foreach ($posts as $post): ?>
      <a class="card tool-card" href="/blog-post.php?slug=<?= e($post['slug']) ?>">
        <p class="eyebrow">Guide</p>
        <h3><?= e($post['title']) ?></h3>
        <p class="muted"><?= e($post['excerpt']) ?></p>
      </a>
    <?php endforeach; ?>
  </div>
  <?php ad_slot('footer'); ?>
</main>
<?php render_footer(); ?>
