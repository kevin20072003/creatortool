<?php
require_once __DIR__ . '/_helpers.php';
admin_header('Dashboard');
$totalTools = q('SELECT COUNT(*) c FROM tools')->fetch()['c'];
$publishedTools = q('SELECT COUNT(*) c FROM tools WHERE status = "published"')->fetch()['c'];
$draftTools = q('SELECT COUNT(*) c FROM tools WHERE status != "published"')->fetch()['c'];
$posts = q('SELECT COUNT(*) c FROM blog_posts')->fetch()['c'];
$views = q('SELECT COUNT(*) c FROM analytics_events')->fetch()['c'];
$recent = q('SELECT * FROM analytics_events ORDER BY created_at DESC LIMIT 10')->fetchAll();
?>
<main class="container section">
  <p class="eyebrow">Dashboard</p>
  <h1>CreatorTools admin</h1>
  <div class="grid-auto">
    <div class="card result-box"><p>Total tools</p><strong><?= e((string)$totalTools) ?></strong></div>
    <div class="card result-box"><p>Published</p><strong><?= e((string)$publishedTools) ?></strong></div>
    <div class="card result-box"><p>Drafts</p><strong><?= e((string)$draftTools) ?></strong></div>
    <div class="card result-box"><p>Blog posts</p><strong><?= e((string)$posts) ?></strong></div>
    <div class="card result-box"><p>Page views</p><strong><?= e((string)$views) ?></strong></div>
  </div>
  <section class="card section">
    <h2>Recent activity</h2>
    <table class="table"><tr><th>Type</th><th>Path</th><th>Device</th><th>Date</th></tr>
      <?php foreach ($recent as $row): ?><tr><td><?= e($row['type']) ?></td><td><?= e($row['path']) ?></td><td><?= e($row['device']) ?></td><td><?= e($row['created_at']) ?></td></tr><?php endforeach; ?>
    </table>
  </section>
</main>
<?php admin_footer(); ?>
