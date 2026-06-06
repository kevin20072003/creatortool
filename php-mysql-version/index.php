<?php require_once __DIR__ . '/includes/layout.php'; render_header('Free Tools for Creators'); ?>
<main>
  <section class="hero"><div class="container hero-grid">
    <div><p class="eyebrow">Free creator calculators and generators</p><h1 class="h1">CreatorTools.in</h1><p class="lead">Fast tools for YouTubers, editors, videographers, live streamers, photographers, and social creators. No signup. Mobile friendly.</p><p><a class="btn-primary" href="/tools.php">Explore tools</a> <a class="btn-secondary" href="/blog.php">Read guides</a></p></div>
    <div class="card"><h2>Quick search</h2><input class="input" placeholder="Search storage, bitrate, subtitles..." oninput="location.href='/tools.php?q='+encodeURIComponent(this.value)"><p class="muted">Popular: storage calculator, bitrate calculator, title generator, SRT formatter.</p></div>
  </div></section>
  <section class="container section">
    <p class="eyebrow">Featured tools</p><h2>Creator tools people need daily</h2>
    <div class="grid-auto">
    <?php foreach(q('SELECT t.*, c.name category FROM tools t LEFT JOIN categories c ON c.id=t.category_id WHERE t.status="published" AND t.featured=1 ORDER BY t.sort_order LIMIT 8')->fetchAll() as $tool): ?>
      <a class="card tool-card" href="/tool.php?slug=<?= e($tool['slug']) ?>"><span class="icon"><?= e(substr($tool['name'],0,2)) ?></span><p class="eyebrow"><?= e($tool['category']) ?></p><h3><?= e($tool['name']) ?></h3><p class="muted"><?= e($tool['description']) ?></p></a>
    <?php endforeach; ?>
    </div>
  </section>
  <section class="container section"><div class="grid-auto">
    <div class="card"><h3>Free tools</h3><p class="muted">Use calculators and generators without signup.</p></div>
    <div class="card"><h3>Fast on mobile</h3><p class="muted">Forms and results work cleanly on phones.</p></div>
    <div class="card"><h3>Professional estimates</h3><p class="muted">Includes progressive/interlaced scan logic for video workflows.</p></div>
  </div></section>
</main>
<?php render_footer(); ?>
