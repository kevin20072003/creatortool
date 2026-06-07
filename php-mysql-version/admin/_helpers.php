<?php
require_once __DIR__ . '/../includes/auth.php';

function admin_header(string $title): void {
    require_admin();
    $siteName = setting('site_name', SITE_NAME);
    $logo = setting('site_logo', '');
    ?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= e($title) ?> - Admin</title>
  <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
  <header class="site-header">
    <div class="container nav">
      <a class="brand" href="/admin/index.php"><?php if ($logo): ?><img src="<?= e($logo) ?>" alt="<?= e($siteName) ?>"><?php else: ?><span>CT</span><?php endif; ?>Admin</a>
      <button class="menu-btn" type="button" data-menu>Menu</button>
      <nav class="nav-links" data-nav>
        <a href="/admin/index.php">Dashboard</a>
        <?php if (can('tools')): ?><a href="/admin/tools.php">Tools</a><?php endif; ?>
        <?php if (can('categories')): ?><a href="/admin/categories.php">Categories</a><?php endif; ?>
        <?php if (can('blog')): ?><a href="/admin/blog.php">Blog</a><?php endif; ?>
        <?php if (can('pages')): ?><a href="/admin/pages.php">Pages</a><?php endif; ?>
        <?php if (can('media')): ?><a href="/admin/media.php">Media</a><?php endif; ?>
        <?php if (can('settings')): ?><a href="/admin/settings.php">Settings</a><?php endif; ?>
        <?php if (can('users')): ?><a href="/admin/users.php">Users</a><?php endif; ?>
        <a href="/admin/logout.php">Logout</a>
      </nav>
    </div>
  </header>
<?php }

function admin_footer(): void {
    echo '</body></html>';
}

function post_value(string $key, string $fallback = ''): string {
    return trim($_POST[$key] ?? $fallback);
}

function checked_value(string $key): int {
    return isset($_POST[$key]) ? 1 : 0;
}

function upload_admin_image(string $field): string {
    if (empty($_FILES[$field]) || $_FILES[$field]['error'] !== UPLOAD_ERR_OK) return '';
    $allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif', 'image/x-icon' => 'ico'];
    $mime = mime_content_type($_FILES[$field]['tmp_name']);
    if (!isset($allowed[$mime])) return '';
    $name = date('YmdHis') . '-' . preg_replace('/[^a-zA-Z0-9.-]/', '-', $_FILES[$field]['name']);
    $target = __DIR__ . '/../uploads/' . $name;
    if (!move_uploaded_file($_FILES[$field]['tmp_name'], $target)) return '';
    q('INSERT INTO media (filename, url, mime_type, size) VALUES (?, ?, ?, ?)', [$name, '/uploads/' . $name, $mime, (int)$_FILES[$field]['size']]);
    return '/uploads/' . $name;
}
