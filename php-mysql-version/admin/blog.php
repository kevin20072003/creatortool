<?php
require_once __DIR__ . '/_helpers.php';
admin_header('Blog');
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = (int)($_POST['id'] ?? 0);
    $data = [post_value('title'), slugify(post_value('slug', post_value('title'))), post_value('excerpt'), post_value('content'), post_value('status', 'published'), post_value('seo_title'), post_value('seo_description'), post_value('tags')];
    if ($id) q('UPDATE blog_posts SET title=?, slug=?, excerpt=?, content=?, status=?, seo_title=?, seo_description=?, tags=? WHERE id=?', [...$data, $id]);
    else q('INSERT INTO blog_posts (title, slug, excerpt, content, status, seo_title, seo_description, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', $data);
    header('Location: /admin/blog.php');
    exit;
}
if (isset($_GET['delete'])) {
    q('DELETE FROM blog_posts WHERE id = ?', [(int)$_GET['delete']]);
    header('Location: /admin/blog.php');
    exit;
}
$edit = isset($_GET['edit']) ? q('SELECT * FROM blog_posts WHERE id = ?', [(int)$_GET['edit']])->fetch() : null;
$posts = q('SELECT * FROM blog_posts ORDER BY created_at DESC, id DESC')->fetchAll();
?>
<main class="container section">
  <p class="eyebrow">Blog manager</p>
  <h1><?= $edit ? 'Edit post' : 'Add post' ?></h1>
  <form class="card" method="post">
    <input type="hidden" name="id" value="<?= e((string)($edit['id'] ?? '')) ?>">
    <div class="grid-auto">
      <label class="label">Title<input class="input" name="title" value="<?= e($edit['title'] ?? '') ?>" required></label>
      <label class="label">Slug<input class="input" name="slug" value="<?= e($edit['slug'] ?? '') ?>"></label>
      <label class="label">Status<select class="select" name="status"><option>published</option><option <?= ($edit['status'] ?? '') === 'draft' ? 'selected' : '' ?>>draft</option></select></label>
      <label class="label">Tags<input class="input" name="tags" value="<?= e($edit['tags'] ?? '') ?>"></label>
      <label class="label">SEO title<input class="input" name="seo_title" value="<?= e($edit['seo_title'] ?? '') ?>"></label>
      <label class="label">SEO description<input class="input" name="seo_description" value="<?= e($edit['seo_description'] ?? '') ?>"></label>
    </div>
    <label class="label">Excerpt<textarea class="textarea" name="excerpt"><?= e($edit['excerpt'] ?? '') ?></textarea></label>
    <label class="label">Content<textarea class="textarea" name="content"><?= e($edit['content'] ?? '') ?></textarea></label>
    <p><button class="btn-primary" type="submit">Save post</button> <a class="btn-secondary" href="/admin/blog.php">Clear</a></p>
  </form>
  <section class="card section"><h2>Posts</h2><table class="table"><tr><th>Title</th><th>Status</th><th>Actions</th></tr><?php foreach ($posts as $post): ?><tr><td><?= e($post['title']) ?></td><td><?= e($post['status']) ?></td><td><a href="/blog-post.php?slug=<?= e($post['slug']) ?>">Preview</a> | <a href="?edit=<?= e((string)$post['id']) ?>">Edit</a> | <a href="?delete=<?= e((string)$post['id']) ?>" onclick="return confirm('Delete post?')">Delete</a></td></tr><?php endforeach; ?></table></section>
</main>
<?php admin_footer(); ?>
