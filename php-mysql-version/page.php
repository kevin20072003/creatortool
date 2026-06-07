<?php
require_once __DIR__ . '/includes/layout.php';
$slug = $_GET['slug'] ?? 'about';
$page = q('SELECT * FROM pages WHERE slug = ?', [$slug])->fetch();
if (!$page) {
    http_response_code(404);
    render_header('Page not found');
    echo '<main class="container section"><h1>Page not found</h1></main>';
    render_footer();
    exit;
}
render_header($page['seo_title'] ?: $page['title'], $page['seo_description'] ?: '');
?>
<main class="container section">
  <article class="card prose">
    <?= markdown($page['content']) ?>
  </article>
  <?php ad_slot('footer'); ?>
</main>
<?php render_footer(); ?>
