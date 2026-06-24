<?php
require_once __DIR__ . '/includes/layout.php';
$slug = $_GET['slug'] ?? '';
$tool = q('SELECT t.*, c.name category, c.slug category_slug FROM tools t LEFT JOIN categories c ON c.id = t.category_id WHERE t.slug = ? AND t.status = "published"', [$slug])->fetch();
if (!$tool) {
    http_response_code(404);
    render_header('Not found');
    echo '<main class="container section"><h1>Tool not found</h1><p><a class="btn-secondary" href="/tools">View all tools</a></p></main>';
    render_footer();
    exit;
}
track_event('page_view', tool_url($slug), $slug);
$relatedTools = q('SELECT t.*, c.name category FROM tools t LEFT JOIN categories c ON c.id = t.category_id WHERE t.status = "published" AND t.id != ? AND (t.category_id = ? OR t.popular = 1) ORDER BY (t.category_id = ?) DESC, t.popular DESC, t.sort_order ASC LIMIT 6', [$tool['id'], $tool['category_id'], $tool['category_id']])->fetchAll();
$relatedPosts = q('SELECT * FROM blog_posts WHERE status = "published" ORDER BY created_at DESC, id DESC LIMIT 3')->fetchAll();
$toolFaqs = q('SELECT * FROM faqs WHERE tool_id = ? ORDER BY sort_order', [$tool['id']])->fetchAll();
$isPromptTool = in_array($tool['template_type'], ['ai-image-prompt', 'image-to-prompt', 'prompt-improver'], true);
$isVideoTool = in_array($tool['template_type'], ['video-storage', 'video-file-size', 'bitrate', 'recording-time', 'streaming-bandwidth', 'export-helper'], true);
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
      'url' => rtrim(SITE_URL, '/') . tool_url($tool['slug']),
      'offers' => ['@type' => 'Offer', 'price' => '0', 'priceCurrency' => 'USD'],
  ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?>
  </script>
  <?php if ($toolFaqs): ?>
  <script type="application/ld+json">
  <?= json_encode([
      '@context' => 'https://schema.org',
      '@type' => 'FAQPage',
      'mainEntity' => array_map(fn($faq) => [
          '@type' => 'Question',
          'name' => $faq['question'],
          'acceptedAnswer' => ['@type' => 'Answer', 'text' => $faq['answer']],
      ], $toolFaqs),
  ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?>
  </script>
  <?php endif; ?>
  <p class="muted"><a href="/">Home</a> / <a href="/tools">Tools</a> / <a href="<?= e(category_url($tool['category_slug'])) ?>"><?= e($tool['category']) ?></a></p>
  <h1><?= e($tool['name']) ?></h1>
  <p class="lead"><?= e($tool['description']) ?></p>
  <?php ad_slot('header'); ?>
  <section class="tool-shell" data-tool="<?= e($tool['template_type']) ?>">
    <div class="tool-grid">
      <div class="card">
        <?php include __DIR__ . '/tool-form.php'; ?>
        <p class="actions">
          <button class="btn-primary" type="button" onclick="runTool()"><?= $isPromptTool ? 'Generate prompt' : 'Calculate' ?></button>
          <button class="btn-secondary" data-example type="button">Example</button>
          <button class="btn-secondary" data-copy type="button">Copy result</button>
          <button class="btn-secondary" data-reset type="button">Reset</button>
        </p>
        <div class="grid-auto">
          <div class="result-box"><p><?= $isPromptTool ? 'AI Tool' : 'Format' ?></p><strong data-summary></strong></div>
          <div class="result-box"><p><?= $isPromptTool ? 'Style' : 'Bitrate' ?></p><strong data-summary></strong></div>
          <div class="result-box"><p><?= $isPromptTool ? 'Ratio' : 'Storage' ?></p><strong data-summary></strong></div>
          <div class="result-box"><p><?= $isPromptTool ? 'Status' : 'Scan' ?></p><strong data-summary></strong></div>
        </div>
        <?php ad_slot('after-tool'); ?>
      </div>
      <aside class="card result-panel">
        <p class="eyebrow">Result summary</p>
        <pre data-result class="muted"></pre>
        <?php ad_slot('sidebar'); ?>
      </aside>
    </div>
    <?php if ($isPromptTool): ?>
    <div class="grid-auto">
      <div class="card"><h3>How prompt generation works</h3><p class="muted">The tool combines your idea with style, theme, lighting, composition, aspect ratio, and negative prompt details to create a structured prompt for AI image tools.</p></div>
      <div class="card"><h3>Where to use the prompt</h3><p class="muted">Copy the result into ChatGPT image generation, Gemini, Midjourney, Stable Diffusion, SDXL, Leonardo AI, Canva AI, or any tool that accepts text prompts.</p></div>
      <div class="card"><h3>Image upload note</h3><p class="muted">Reference image preview stays in your browser. This site does not send your image to an external AI backend or analyze pixels automatically.</p></div>
    </div>
    <?php elseif ($isVideoTool): ?>
    <div class="grid-auto">
      <div class="card"><h3>What is i and p?</h3><p class="muted">p means progressive scan: every frame is captured or drawn as a complete image. i means interlaced scan: each frame is split into odd and even fields. 1080p50 means 50 full frames per second. 1080i50 means 50 fields per second, usually 25 full frames per second. Progressive is generally better for YouTube, phones, computer screens, and web delivery.</p></div>
      <div class="card"><h3>How this is calculated</h3><p class="muted">Storage uses bitrate x duration. Interlaced bitrate is estimated from full frame rate plus a small interlace complexity factor, not blindly doubled by field rate.</p></div>
    </div>
    <?php endif; ?>
  </section>
  <?php ad_slot('in-content'); ?>
  <article class="card prose"><?= markdown($tool['content']) ?></article>
  <section class="grid-auto">
    <div class="card"><h2>Example workflow</h2><p class="muted"><?= $isPromptTool ? 'Start with a rough creative idea, choose the visual style and platform, generate the prompt, then paste it into your AI image tool and refine from the output.' : 'Use ' . e($tool['name']) . ' before recording, exporting, uploading, or publishing. Start with a realistic value, press calculate or generate, then copy the result into your production notes, upload checklist, or client estimate.' ?></p></div>
    <div class="card"><h2>Common use cases</h2><p class="muted"><?= $isPromptTool ? 'Creators use prompt tools for YouTube thumbnails, website images, product mockups, social posts, logos, characters, ad concepts, and fast creative direction.' : 'Creators use this tool for YouTube planning, short-form content, live production, editing handoff, thumbnail/caption preparation, storage estimates, and repeatable publishing workflows.' ?></p></div>
    <div class="card"><h2>Pro tip</h2><p class="muted"><?= $isPromptTool ? 'AI image models often struggle with exact text. Generate the visual background first, then add final readable text in Canva, Photoshop, Figma, or your editor.' : 'Treat every result as a planning estimate. Camera settings, platform compression, scene complexity, export presets, and network conditions can change the final result.' ?></p></div>
  </section>
  <section class="card"><h2>FAQ</h2><?php foreach ($toolFaqs as $faq): ?><details><summary><?= e($faq['question']) ?></summary><p class="muted"><?= e($faq['answer']) ?></p></details><?php endforeach; ?></section>
  <section class="section">
    <div class="section-head"><div><p class="eyebrow">Next steps</p><h2>Related tools</h2></div></div>
    <div class="grid-auto">
      <?php foreach ($relatedTools as $item): ?>
        <a class="card tool-card compact" href="<?= e(tool_url($item['slug'])) ?>">
          <span class="icon"><?= e($item['icon_name'] ?: substr($item['name'], 0, 2)) ?></span>
          <p class="eyebrow"><?= e($item['category']) ?></p>
          <h3><?= e($item['name']) ?></h3>
          <p class="muted"><?= e($item['description']) ?></p>
        </a>
      <?php endforeach; ?>
    </div>
  </section>
  <?php ad_slot('footer'); ?>
  <section class="section">
    <div class="section-head"><div><p class="eyebrow">Learn more</p><h2>Related guides</h2></div><a class="text-link" href="/blog">View blog</a></div>
    <div class="grid-auto">
      <?php foreach ($relatedPosts as $post): ?>
        <a class="card article-card" href="<?= e(blog_url($post['slug'])) ?>">
          <p class="eyebrow">Creator guide</p>
          <h3><?= e($post['title']) ?></h3>
          <p class="muted"><?= e($post['excerpt']) ?></p>
        </a>
      <?php endforeach; ?>
    </div>
  </section>
</main>
<?php render_footer(); ?>
