<?php
require_once __DIR__ . '/../includes/auth.php';

function admin_header(string $title): void {
    require_admin();
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
      <a class="brand" href="/admin/index.php"><span>CT</span>Admin</a>
      <nav class="nav-links open">
        <a href="/admin/index.php">Dashboard</a>
        <a href="/admin/tools.php">Tools</a>
        <a href="/admin/categories.php">Categories</a>
        <a href="/admin/blog.php">Blog</a>
        <a href="/admin/pages.php">Pages</a>
        <a href="/admin/media.php">Media</a>
        <a href="/admin/settings.php">Settings</a>
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
