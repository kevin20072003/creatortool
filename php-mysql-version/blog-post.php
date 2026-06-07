<?php
require_once __DIR__ . '/includes/layout.php';
$slug = $_GET['slug'] ?? '';
$post = q('SELECT * FROM blog_posts WHERE slug = ? AND status = "published"', [$slug])->fetch();
if (!$post) {
    http_response_code(404);
    render_header('Post not found');
    echo '<main class="container section"><h1>Post not found</h1><p><a class="btn-secondary" href="/blog.php">Back to blog</a></p></main>';
    render_footer();
    exit;
}
track_event('blog_view', '/blog-post.php?slug=' . $slug, $slug);
render_header($post['seo_title'] ?: $post['title'], $post['seo_description'] ?: $post['excerpt']);
?>
<main class="container section">
  <p class="muted"><a href="/">Home</a> / <a href="/blog.php">Blog</a></p>
  <article class="card prose">
    <h1><?= e($post['title']) ?></h1>
    <p class="muted"><?= e($post['excerpt']) ?></p>
    <?php ad_slot('in-content'); ?>
    <?= markdown($post['content']) ?>
  </article>
  <?php ad_slot('footer'); ?>
</main>
<?php render_footer(); ?>
