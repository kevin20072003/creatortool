<?php
require_once __DIR__ . '/includes/layout.php';
$categories = q('SELECT c.*, COUNT(t.id) tool_count FROM categories c LEFT JOIN tools t ON t.category_id = c.id AND t.status = "published" GROUP BY c.id ORDER BY c.sort_order, c.name LIMIT 10')->fetchAll();
$promptTools = q('SELECT t.*, c.name category FROM tools t LEFT JOIN categories c ON c.id = t.category_id WHERE t.status = "published" AND c.slug = "ai-prompt-tools" ORDER BY t.featured DESC, t.popular DESC, t.sort_order, t.name LIMIT 8')->fetchAll();
$mainPromptTool = $promptTools[0] ?? q('SELECT t.*, c.name category FROM tools t LEFT JOIN categories c ON c.id = t.category_id WHERE t.status = "published" AND t.slug = "ai-image-prompt-generator" LIMIT 1')->fetch();
$featured = q('SELECT t.*, c.name category FROM tools t LEFT JOIN categories c ON c.id = t.category_id WHERE t.status = "published" AND t.featured = 1 ORDER BY t.sort_order, t.name LIMIT 6')->fetchAll();
$popular = q('SELECT t.*, c.name category FROM tools t LEFT JOIN categories c ON c.id = t.category_id WHERE t.status = "published" AND t.popular = 1 ORDER BY t.sort_order, t.name LIMIT 6')->fetchAll();
$interest = q('SELECT t.*, c.name category, COUNT(a.id) views FROM tools t LEFT JOIN categories c ON c.id = t.category_id LEFT JOIN analytics_events a ON a.entity_slug = t.slug AND a.type = "page_view" WHERE t.status = "published" GROUP BY t.id ORDER BY views DESC, t.popular DESC, t.sort_order ASC LIMIT 6')->fetchAll();
$posts = q('SELECT * FROM blog_posts WHERE status = "published" ORDER BY created_at DESC, id DESC LIMIT 3')->fetchAll();
render_header('AI Prompt Generator and Creator Tools', setting('global_meta_description', 'Free AI prompt generators plus creator tools for images, thumbnails, YouTube, video editing, streaming, and social media.'));
?>
<main>
  <section class="hero">
    <div class="container hero-grid">
      <div class="hero-copy">
        <p class="eyebrow">AI prompt tools for creators</p>
        <h1 class="h1"><?= e(setting('homeHeroTitle', 'AI Prompt Generator for ChatGPT, Gemini and Creators')) ?></h1>
        <p class="lead"><?= e(setting('homeHeroSubtitle', 'Create better prompts for AI images, thumbnails, product photos, logos, characters, social posts, and creator content.')) ?></p>
        <div class="button-row">
          <a class="btn-primary" href="<?= e($mainPromptTool ? tool_url($mainPromptTool['slug']) : '/tools') ?>">Generate prompt</a>
          <a class="btn-secondary" href="/categories/ai-prompt-tools">Browse prompt tools</a>
        </div>
      </div>
      <div class="card hero-search prompt-hero-card">
        <p class="eyebrow">Prompt Lab</p>
        <div class="prompt-window">
          <div><strong>Idea</strong><span>Premium YouTube thumbnail background for an AI tools video</span></div>
          <div><strong>Style</strong><span>Cinematic realistic, dark futuristic, clean negative space</span></div>
          <div><strong>Output</strong><span>Ready-to-copy prompt for Gemini, ChatGPT, Midjourney or SDXL</span></div>
        </div>
        <label class="label">
          Quick tool search
          <input class="input search-input" placeholder="Try image prompt, thumbnail prompt, logo prompt..." onkeydown="if(event.key==='Enter') location.href='/tools?q='+encodeURIComponent(this.value)">
        </label>
        <div class="mini-grid">
          <?php foreach (array_slice($promptTools ?: $popular, 0, 4) as $tool): ?>
            <a class="mini-tool" href="<?= e(tool_url($tool['slug'])) ?>"><?= e($tool['name']) ?></a>
          <?php endforeach; ?>
        </div>
      </div>
    </div>
  </section>

  <div class="container"><?php ad_slot('header'); ?></div>

  <?php if ($promptTools): ?>
  <section class="container section">
    <div class="section-head">
      <div>
        <p class="eyebrow">Main category</p>
        <h2>AI prompt generators</h2>
      </div>
      <a class="text-link" href="/categories/ai-prompt-tools">View all prompt tools</a>
    </div>
    <div class="grid-auto">
      <?php foreach ($promptTools as $tool): ?>
        <a class="card tool-card ai-tool-card" href="<?= e(tool_url($tool['slug'])) ?>">
          <span class="icon"><?= e($tool['icon_name'] ?: 'AI') ?></span>
          <p class="eyebrow"><?= e($tool['category']) ?></p>
          <h3><?= e($tool['name']) ?></h3>
          <p class="muted"><?= e($tool['description']) ?></p>
        </a>
      <?php endforeach; ?>
    </div>
  </section>
  <?php endif; ?>

  <section class="container section">
    <div class="section-head">
      <div>
        <p class="eyebrow">For your interest</p>
        <h2>Tools creators are using now</h2>
      </div>
    </div>
    <div class="grid-auto">
      <?php foreach ($interest as $tool): ?>
        <a class="card tool-card compact" href="<?= e(tool_url($tool['slug'])) ?>">
          <span class="icon"><?= e($tool['icon_name'] ?: substr($tool['name'], 0, 2)) ?></span>
          <p class="eyebrow"><?= e($tool['category']) ?></p>
          <h3><?= e($tool['name']) ?></h3>
          <p class="muted"><?= e($tool['description']) ?></p>
        </a>
      <?php endforeach; ?>
    </div>
  </section>

  <div class="container"><?php ad_slot('between-sections'); ?></div>

  <section class="container section">
    <div class="section-head">
      <div>
        <p class="eyebrow">Browse by category</p>
        <h2>Tool categories</h2>
      </div>
      <a class="text-link" href="/tools">View all</a>
    </div>
    <div class="grid-auto">
      <?php foreach ($categories as $category): ?>
        <a class="card category-card" href="<?= e(category_url($category['slug'])) ?>">
          <span class="icon"><?= e($category['icon'] ?: 'CT') ?></span>
          <h3><?= e($category['name']) ?></h3>
          <p class="muted"><?= e($category['description']) ?></p>
          <strong><?= e((string)$category['tool_count']) ?> tools</strong>
        </a>
      <?php endforeach; ?>
    </div>
  </section>

  <div class="container"><?php ad_slot('tools-list'); ?></div>

  <section class="container section">
    <div class="section-head">
      <div>
        <p class="eyebrow">Built for creators</p>
        <h2>Tools by workflow</h2>
      </div>
    </div>
    <div class="grid-auto">
      <a class="card workflow-card ai-tool-card" href="/categories/ai-prompt-tools"><h3>For AI Prompt Creators</h3><p class="muted">Image prompts, prompt improvers, thumbnail prompts, product photos, logos, characters, and social content ideas.</p><span>Open workflow</span></a>
      <a class="card workflow-card" href="/categories/youtube-tools"><h3>For YouTubers</h3><p class="muted">Titles, descriptions, hashtags, upload checklists, thumbnails, and storage planning for every upload.</p><span>Open workflow</span></a>
      <a class="card workflow-card" href="/categories/video-calculators"><h3>For Editors</h3><p class="muted">Bitrate, file size, export settings, frame rate conversion, subtitles, and drive planning.</p><span>Open workflow</span></a>
      <a class="card workflow-card" href="/categories/live-streaming-tools"><h3>For Live Streamers</h3><p class="muted">OBS bitrate, upload speed, platform settings, audio delay, and stream recording storage.</p><span>Open workflow</span></a>
      <a class="card workflow-card" href="/categories/camera-tools"><h3>For Photographers</h3><p class="muted">Crop factor, SD card planning, daily shoot storage, and multi-camera coverage estimates.</p><span>Open workflow</span></a>
    </div>
  </section>

  <section class="container section">
    <div class="section-head">
      <div>
        <p class="eyebrow">Featured</p>
        <h2>Creator tools people need daily</h2>
      </div>
    </div>
    <div class="grid-auto">
      <?php foreach ($featured as $tool): ?>
        <a class="card tool-card" href="<?= e(tool_url($tool['slug'])) ?>">
          <span class="icon"><?= e($tool['icon_name'] ?: substr($tool['name'], 0, 2)) ?></span>
          <p class="eyebrow"><?= e($tool['category']) ?></p>
          <h3><?= e($tool['name']) ?></h3>
          <p class="muted"><?= e($tool['description']) ?></p>
        </a>
      <?php endforeach; ?>
    </div>
  </section>

  <section class="container section">
    <?php ad_slot('in-content'); ?>
    <div class="section-head">
      <div>
        <p class="eyebrow">Popular</p>
        <h2>Popular tools</h2>
      </div>
    </div>
    <div class="grid-auto">
      <?php foreach ($popular as $tool): ?>
        <a class="card tool-card" href="<?= e(tool_url($tool['slug'])) ?>">
          <span class="icon"><?= e($tool['icon_name'] ?: substr($tool['name'], 0, 2)) ?></span>
          <p class="eyebrow"><?= e($tool['category']) ?></p>
          <h3><?= e($tool['name']) ?></h3>
          <p class="muted"><?= e($tool['description']) ?></p>
        </a>
      <?php endforeach; ?>
    </div>
  </section>

  <section class="container section">
    <div class="card trust-card">
      <div><h3>Free tools</h3><p class="muted">Use calculators and generators without paying or installing anything.</p></div>
      <div><h3>No signup</h3><p class="muted">Open a tool and get an answer immediately.</p></div>
      <div><h3>Fast on mobile</h3><p class="muted">Forms, results, and copy buttons are designed for phones too.</p></div>
      <div><h3>Creator-focused</h3><p class="muted">Every tool includes examples, formulas, FAQs, and practical use cases.</p></div>
    </div>
  </section>

  <section class="container section">
    <div class="section-head">
      <div>
        <p class="eyebrow">Guides</p>
        <h2>Latest creator articles</h2>
      </div>
      <a class="text-link" href="/blog">View blog</a>
    </div>
    <div class="grid-auto">
      <?php foreach ($posts as $post): ?>
        <a class="card article-card" href="<?= e(blog_url($post['slug'])) ?>">
          <p class="eyebrow">Creator guide</p>
          <h3><?= e($post['title']) ?></h3>
          <p class="muted"><?= e($post['excerpt']) ?></p>
        </a>
      <?php endforeach; ?>
    </div>
  </section>

  <section class="container section">
    <div class="card faq-card">
      <h2>FAQ</h2>
      <div class="faq-grid">
        <details><summary>Is CreatorTool.in free?</summary><p class="muted">Yes. The calculators and generators are free and run without an external backend.</p></details>
        <details><summary>Can I add more tools later?</summary><p class="muted">Yes. The admin panel supports content tools and tools attached to existing calculator or generator templates.</p></details>
        <details><summary>Does it support Adsense?</summary><p class="muted">Yes. You can paste ad slot code from the admin settings page. Empty slots show placeholders.</p></details>
        <details><summary>Where is data stored?</summary><p class="muted">Tools, posts, pages, settings, media records, and analytics are stored in your Hostinger MySQL database.</p></details>
      </div>
    </div>
  </section>
</main>
<?php render_footer(); ?>
