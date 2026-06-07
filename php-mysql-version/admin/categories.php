<?php
require_once __DIR__ . '/_helpers.php';
require_permission('categories');
admin_header('Categories');
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = (int)($_POST['id'] ?? 0);
    $data = [post_value('name'), slugify(post_value('slug', post_value('name'))), post_value('description'), post_value('icon'), post_value('seo_title'), post_value('seo_description'), (int)($_POST['sort_order'] ?? 0)];
    if ($id) q('UPDATE categories SET name=?, slug=?, description=?, icon=?, seo_title=?, seo_description=?, sort_order=? WHERE id=?', [...$data, $id]);
    else q('INSERT INTO categories (name, slug, description, icon, seo_title, seo_description, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)', $data);
    header('Location: /admin/categories.php');
    exit;
}
if (isset($_GET['delete'])) {
    q('DELETE FROM categories WHERE id = ?', [(int)$_GET['delete']]);
    header('Location: /admin/categories.php');
    exit;
}
$edit = isset($_GET['edit']) ? q('SELECT * FROM categories WHERE id = ?', [(int)$_GET['edit']])->fetch() : null;
$categories = q('SELECT * FROM categories ORDER BY sort_order, name')->fetchAll();
?>
<main class="container section">
  <p class="eyebrow">Category manager</p>
  <h1><?= $edit ? 'Edit category' : 'Add category' ?></h1>
  <form class="card" method="post">
    <input type="hidden" name="id" value="<?= e((string)($edit['id'] ?? '')) ?>">
    <div class="grid-auto">
      <label class="label">Name<input class="input" name="name" value="<?= e($edit['name'] ?? '') ?>" required></label>
      <label class="label">Slug<input class="input" name="slug" value="<?= e($edit['slug'] ?? '') ?>"></label>
      <label class="label">Icon text<input class="input" name="icon" value="<?= e($edit['icon'] ?? '') ?>"></label>
      <label class="label">Sort order<input class="input" name="sort_order" value="<?= e((string)($edit['sort_order'] ?? 0)) ?>"></label>
      <label class="label">SEO title<input class="input" name="seo_title" value="<?= e($edit['seo_title'] ?? '') ?>"></label>
      <label class="label">SEO description<input class="input" name="seo_description" value="<?= e($edit['seo_description'] ?? '') ?>"></label>
    </div>
    <label class="label">Description<textarea class="textarea" name="description"><?= e($edit['description'] ?? '') ?></textarea></label>
    <p><button class="btn-primary" type="submit">Save category</button> <a class="btn-secondary" href="/admin/categories.php">Clear</a></p>
  </form>
  <section class="card section"><h2>Categories</h2><table class="table"><tr><th>Name</th><th>Slug</th><th>Actions</th></tr><?php foreach ($categories as $cat): ?><tr><td><?= e($cat['name']) ?></td><td><?= e($cat['slug']) ?></td><td><a href="<?= e(category_url($cat['slug'])) ?>">Preview</a> | <a href="?edit=<?= e((string)$cat['id']) ?>">Edit</a> | <a href="?delete=<?= e((string)$cat['id']) ?>" onclick="return confirm('Delete category? Tools in this category may need reassignment.')">Delete</a></td></tr><?php endforeach; ?></table></section>
</main>
<?php admin_footer(); ?>
