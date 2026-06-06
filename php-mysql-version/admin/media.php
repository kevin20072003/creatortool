<?php
require_once __DIR__ . '/_helpers.php';
admin_header('Media');
$message = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['image'])) {
    $file = $_FILES['image'];
    if ($file['error'] === UPLOAD_ERR_OK) {
        $allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
        $mime = mime_content_type($file['tmp_name']);
        if (isset($allowed[$mime])) {
            $name = date('YmdHis') . '-' . preg_replace('/[^a-zA-Z0-9.-]/', '-', $file['name']);
            $target = __DIR__ . '/../uploads/' . $name;
            if (move_uploaded_file($file['tmp_name'], $target)) {
                q('INSERT INTO media (filename, url, mime_type, size) VALUES (?, ?, ?, ?)', [$name, '/uploads/' . $name, $mime, (int)$file['size']]);
                $message = 'Image uploaded.';
            }
        } else {
            $message = 'Only JPG, PNG, WebP, and GIF images are allowed.';
        }
    }
}
if (isset($_GET['delete'])) {
    $media = q('SELECT * FROM media WHERE id = ?', [(int)$_GET['delete']])->fetch();
    if ($media) {
        $path = __DIR__ . '/../uploads/' . basename($media['filename']);
        if (is_file($path)) unlink($path);
        q('DELETE FROM media WHERE id = ?', [(int)$_GET['delete']]);
    }
    header('Location: /admin/media.php');
    exit;
}
$items = q('SELECT * FROM media ORDER BY created_at DESC, id DESC')->fetchAll();
?>
<main class="container section">
  <p class="eyebrow">Media manager</p>
  <h1>Uploads</h1>
  <?php if ($message): ?><p class="alert"><?= e($message) ?></p><?php endif; ?>
  <form class="card" method="post" enctype="multipart/form-data">
    <label class="label">Upload image<input class="input" type="file" name="image" accept="image/*" required></label>
    <p><button class="btn-primary" type="submit">Upload</button></p>
  </form>
  <div class="grid-auto section">
    <?php foreach ($items as $item): ?>
      <div class="card">
        <img src="<?= e($item['url']) ?>" alt="" style="max-width:100%;border-radius:8px">
        <p><input class="input" readonly value="<?= e($item['url']) ?>"></p>
        <p><a class="btn-danger" href="?delete=<?= e((string)$item['id']) ?>" onclick="return confirm('Delete image?')">Delete</a></p>
      </div>
    <?php endforeach; ?>
  </div>
</main>
<?php admin_footer(); ?>
