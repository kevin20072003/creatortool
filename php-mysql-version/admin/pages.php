<?php
require_once __DIR__ . '/_helpers.php';
require_permission('pages');
admin_header('Pages');
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    q('UPDATE pages SET title=?, content=?, seo_title=?, seo_description=? WHERE id=?', [post_value('title'), post_value('content'), post_value('seo_title'), post_value('seo_description'), (int)$_POST['id']]);
    header('Location: /admin/pages.php?edit=' . (int)$_POST['id']);
    exit;
}
$edit = isset($_GET['edit']) ? q('SELECT * FROM pages WHERE id = ?', [(int)$_GET['edit']])->fetch() : null;
$pages = q('SELECT * FROM pages ORDER BY title')->fetchAll();
?>
<main class="container section">
  <p class="eyebrow">Page manager</p>
  <h1>Pages</h1>
  <div class="grid-auto">
    <section class="card"><h2>Editable pages</h2><?php foreach ($pages as $page): ?><p><a href="?edit=<?= e((string)$page['id']) ?>"><?= e($page['title']) ?></a></p><?php endforeach; ?></section>
    <?php if ($edit): ?>
      <form class="card" method="post">
        <input type="hidden" name="id" value="<?= e((string)$edit['id']) ?>">
        <label class="label">Title<input class="input" name="title" value="<?= e($edit['title']) ?>"></label>
        <label class="label">SEO title<input class="input" name="seo_title" value="<?= e($edit['seo_title']) ?>"></label>
        <label class="label">SEO description<input class="input" name="seo_description" value="<?= e($edit['seo_description']) ?>"></label>
        <label class="label">Content<textarea class="textarea" name="content"><?= e($edit['content']) ?></textarea></label>
        <p><button class="btn-primary" type="submit">Save page</button> <a class="btn-secondary" href="<?= e(page_url($edit['slug'])) ?>">Preview</a></p>
      </form>
    <?php endif; ?>
  </div>
</main>
<?php admin_footer(); ?>
