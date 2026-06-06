<?php
require_once __DIR__ . '/_helpers.php';
admin_header('Tools');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = (int)($_POST['id'] ?? 0);
    $name = post_value('name');
    $slug = slugify(post_value('slug', $name));
    $categoryId = (int)($_POST['category_id'] ?? 0);
    $data = [
        $name,
        $slug,
        $categoryId ?: null,
        post_value('description'),
        post_value('content'),
        post_value('template_type', 'content-only'),
        post_value('icon_name'),
        post_value('status', 'published'),
        checked_value('featured'),
        checked_value('popular'),
        post_value('seo_title'),
        post_value('seo_description'),
        post_value('keywords'),
        (int)($_POST['sort_order'] ?? 0),
    ];
    if ($id) {
        q('UPDATE tools SET name=?, slug=?, category_id=?, description=?, content=?, template_type=?, icon_name=?, status=?, featured=?, popular=?, seo_title=?, seo_description=?, keywords=?, sort_order=? WHERE id=?', [...$data, $id]);
    } else {
        q('INSERT INTO tools (name, slug, category_id, description, content, template_type, icon_name, status, featured, popular, seo_title, seo_description, keywords, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', $data);
    }
    header('Location: /admin/tools.php');
    exit;
}

if (isset($_GET['delete'])) {
    q('DELETE FROM tools WHERE id = ?', [(int)$_GET['delete']]);
    header('Location: /admin/tools.php');
    exit;
}

$edit = isset($_GET['edit']) ? q('SELECT * FROM tools WHERE id = ?', [(int)$_GET['edit']])->fetch() : null;
$categories = q('SELECT * FROM categories ORDER BY sort_order, name')->fetchAll();
$tools = q('SELECT t.*, c.name category FROM tools t LEFT JOIN categories c ON c.id = t.category_id ORDER BY t.sort_order, t.name')->fetchAll();
?>
<main class="container section">
  <p class="eyebrow">Tool manager</p>
  <h1><?= $edit ? 'Edit tool' : 'Add tool' ?></h1>
  <form class="card" method="post">
    <input type="hidden" name="id" value="<?= e((string)($edit['id'] ?? '')) ?>">
    <div class="grid-auto">
      <label class="label">Tool name<input class="input" name="name" value="<?= e($edit['name'] ?? '') ?>" required></label>
      <label class="label">Slug<input class="input" name="slug" value="<?= e($edit['slug'] ?? '') ?>"></label>
      <label class="label">Category<select class="select" name="category_id"><?php foreach ($categories as $cat): ?><option value="<?= e((string)$cat['id']) ?>" <?= ($edit['category_id'] ?? '') == $cat['id'] ? 'selected' : '' ?>><?= e($cat['name']) ?></option><?php endforeach; ?></select></label>
      <label class="label">Tool type<select class="select" name="template_type"><?php foreach (['content-only','video-storage','bitrate','recording-time','streaming-bandwidth','aspect-ratio','crop-factor','generator','description-generator','hashtag-generator','thumbnail-text-generator','srt-formatter','line-break','upload-time','export-helper'] as $type): ?><option <?= ($edit['template_type'] ?? '') === $type ? 'selected' : '' ?>><?= e($type) ?></option><?php endforeach; ?></select></label>
      <label class="label">Status<select class="select" name="status"><option>published</option><option <?= ($edit['status'] ?? '') === 'draft' ? 'selected' : '' ?>>draft</option></select></label>
      <label class="label">Icon name<input class="input" name="icon_name" value="<?= e($edit['icon_name'] ?? '') ?>"></label>
      <label class="label">Sort order<input class="input" name="sort_order" value="<?= e((string)($edit['sort_order'] ?? 0)) ?>"></label>
      <label class="label">SEO title<input class="input" name="seo_title" value="<?= e($edit['seo_title'] ?? '') ?>"></label>
      <label class="label">SEO description<input class="input" name="seo_description" value="<?= e($edit['seo_description'] ?? '') ?>"></label>
      <label class="label">Keywords<input class="input" name="keywords" value="<?= e($edit['keywords'] ?? '') ?>"></label>
    </div>
    <label class="label">Short description<textarea class="textarea" name="description" required><?= e($edit['description'] ?? '') ?></textarea></label>
    <label class="label">Full SEO content / guide<textarea class="textarea" name="content"><?= e($edit['content'] ?? '') ?></textarea></label>
    <p><label><input type="checkbox" name="featured" <?= !empty($edit['featured']) ? 'checked' : '' ?>> Featured</label> <label><input type="checkbox" name="popular" <?= !empty($edit['popular']) ? 'checked' : '' ?>> Popular</label></p>
    <p><button class="btn-primary" type="submit">Save tool</button> <a class="btn-secondary" href="/admin/tools.php">Clear</a></p>
  </form>
  <section class="card section">
    <h2>Tools</h2>
    <table class="table"><tr><th>Name</th><th>Category</th><th>Status</th><th>Actions</th></tr>
      <?php foreach ($tools as $tool): ?><tr><td><?= e($tool['name']) ?></td><td><?= e($tool['category']) ?></td><td><?= e($tool['status']) ?></td><td><a href="/tool.php?slug=<?= e($tool['slug']) ?>">Preview</a> | <a href="?edit=<?= e((string)$tool['id']) ?>">Edit</a> | <a href="?delete=<?= e((string)$tool['id']) ?>" onclick="return confirm('Delete this tool?')">Delete</a></td></tr><?php endforeach; ?>
    </table>
  </section>
</main>
<?php admin_footer(); ?>
