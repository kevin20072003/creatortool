<?php
require_once __DIR__ . '/includes/layout.php';
$slug = $_GET['slug'] ?? '';
$tool = q('SELECT t.*, c.name category, c.slug category_slug FROM tools t LEFT JOIN categories c ON c.id = t.category_id WHERE t.slug = ? AND t.status = "published"', [$slug])->fetch();
if (!$tool) {
    http_response_code(404);
    render_header('Not found');
    echo '<main class="container section"><h1>Tool not found</h1><p><a class="btn-secondary" href="/tools.php">View all tools</a></p></main>';
    render_footer();
    exit;
}
track_event('page_view', '/tool.php?slug=' . $slug, $slug);
render_header($tool['seo_title'] ?: $tool['name'], $tool['seo_description'] ?: $tool['description']);
?>
<main class="container section">
  <script type="application/ld+json">
  <?= json_encode([
      '@context' => 'https://schema.org',
      '@type' => 'SoftwareApplication',
      'name' => $tool['name'],
      'applicationCategory' => 'CreatorTool',
      'operatingSystem' => 'Web',
      'description' => $tool['description'],
      'url' => rtrim(SITE_URL, '/') . '/tool.php?slug=' . $tool['slug'],
      'offers' => ['@type' => 'Offer', 'price' => '0', 'priceCurrency' => 'USD'],
  ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?>
  </script>
  <p class="muted"><a href="/">Home</a> / <a href="/tools.php">Tools</a> / <a href="/category.php?slug=<?= e($tool['category_slug']) ?>"><?= e($tool['category']) ?></a></p>
  <h1><?= e($tool['name']) ?></h1>
  <p class="lead"><?= e($tool['description']) ?></p>
  <?php ad_slot('header'); ?>
  <section class="tool-shell" data-tool="<?= e($tool['template_type']) ?>">
    <div class="tool-grid">
      <div class="card">
        <?php include __DIR__ . '/tool-form.php'; ?>
        <p class="actions">
          <button class="btn-primary" type="button" onclick="runTool()">Calculate</button>
          <button class="btn-secondary" data-example type="button">Example</button>
          <button class="btn-secondary" data-copy type="button">Copy result</button>
          <button class="btn-secondary" data-reset type="button">Reset</button>
        </p>
        <div class="grid-auto">
          <div class="result-box"><p>Format</p><strong data-summary></strong></div>
          <div class="result-box"><p>Bitrate</p><strong data-summary></strong></div>
          <div class="result-box"><p>Storage</p><strong data-summary></strong></div>
          <div class="result-box"><p>Scan</p><strong data-summary></strong></div>
        </div>
      </div>
      <aside class="card result-panel">
        <p class="eyebrow">Result summary</p>
        <pre data-result class="muted"></pre>
      </aside>
    </div>
    <div class="grid-auto">
      <div class="card"><h3>What is i and p?</h3><p class="muted">p means progressive scan: every frame is captured or drawn as a complete image. i means interlaced scan: each frame is split into odd and even fields. 1080p50 means 50 full frames per second. 1080i50 means 50 fields per second, usually 25 full frames per second. Progressive is generally better for YouTube, phones, computer screens, and web delivery.</p></div>
      <div class="card"><h3>How this is calculated</h3><p class="muted">Storage uses bitrate x duration. Interlaced bitrate is estimated from full frame rate plus a small interlace complexity factor, not blindly doubled by field rate.</p></div>
    </div>
  </section>
  <?php ad_slot('in-content'); ?>
  <article class="card prose"><?= markdown($tool['content']) ?></article>
  <section class="card"><h2>FAQ</h2><?php foreach (q('SELECT * FROM faqs WHERE tool_id = ? ORDER BY sort_order', [$tool['id']])->fetchAll() as $faq): ?><details><summary><?= e($faq['question']) ?></summary><p class="muted"><?= e($faq['answer']) ?></p></details><?php endforeach; ?></section>
</main>
<?php render_footer(); ?>
