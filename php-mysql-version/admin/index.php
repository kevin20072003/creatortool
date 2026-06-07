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
  <h1>CreatorTool admin</h1>
  <div class="grid-auto">
    <div class="card result-box"><p>Total tools</p><strong><?= e((string)$totalTools) ?></strong></div>
    <div class="card result-box"><p>Published</p><strong><?= e((string)$publishedTools) ?></strong></div>
    <div class="card result-box"><p>Drafts</p><strong><?= e((string)$draftTools) ?></strong></div>
    <div class="card result-box"><p>Blog posts</p><strong><?= e((string)$posts) ?></strong></div>
    <div class="card result-box"><p>Page views</p><strong><?= e((string)$views) ?></strong></div>
  </div>
  <section class="section">
    <div class="grid-auto">
      <?php if (can('tools')): ?><a class="card workflow-card" href="/admin/tools.php"><h3>Manage tools</h3><p class="muted">Add calculators, generators, SEO content, featured/popular flags, and publishing status.</p><span>Open tools</span></a><?php endif; ?>
      <?php if (can('blog')): ?><a class="card workflow-card" href="/admin/blog.php"><h3>Upload posts</h3><p class="muted">Create blog posts, drafts, SEO titles, descriptions, and tags.</p><span>Open blog</span></a><?php endif; ?>
      <?php if (can('settings')): ?><a class="card workflow-card" href="/admin/settings.php"><h3>Brand and SEO</h3><p class="muted">Change logo, favicon, homepage text, social links, Adsense, and SEO snippets.</p><span>Open settings</span></a><?php endif; ?>
      <?php if (can('analytics')): ?><a class="card workflow-card" href="/admin/analytics.php"><h3>Analytics</h3><p class="muted">See last-hour views, top pages, countries, devices, referrers, and recent visits.</p><span>Open analytics</span></a><?php endif; ?>
      <?php if (can('users')): ?><a class="card workflow-card" href="/admin/users.php"><h3>User permissions</h3><p class="muted">Add editors and give access only to posts, media, tools, pages, or settings.</p><span>Open users</span></a><?php endif; ?>
    </div>
  </section>
  <section class="card section">
    <h2>Recent activity</h2>
    <table class="table"><tr><th>Type</th><th>Path</th><th>Device</th><th>Date</th></tr>
      <?php foreach ($recent as $row): ?><tr><td><?= e($row['type']) ?></td><td><?= e($row['path']) ?></td><td><?= e($row['device']) ?></td><td><?= e($row['created_at']) ?></td></tr><?php endforeach; ?>
    </table>
  </section>
</main>
<?php admin_footer(); ?>
