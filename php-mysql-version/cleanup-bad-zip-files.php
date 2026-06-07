<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);

$root = __DIR__;
$deleted = [];
$failed = [];
$iterator = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS),
    RecursiveIteratorIterator::CHILD_FIRST
);

foreach ($iterator as $file) {
    if (!$file->isFile()) continue;
    $name = $file->getFilename();
    if (strpos($name, '\\') === false) continue;
    $path = $file->getPathname();
    if (@unlink($path)) {
        $deleted[] = str_replace($root . DIRECTORY_SEPARATOR, '', $path);
    } else {
        $failed[] = str_replace($root . DIRECTORY_SEPARATOR, '', $path);
    }
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Cleanup complete</title>
  <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
  <main class="container section">
    <div class="card">
      <h1>Cleanup complete</h1>
      <p>Removed wrong extracted files that had backslashes in their names.</p>
      <h2>Deleted</h2>
      <pre class="result-box"><?= htmlspecialchars($deleted ? implode("\n", $deleted) : 'None found', ENT_QUOTES, 'UTF-8') ?></pre>
      <?php if ($failed): ?>
        <h2>Could not delete</h2>
        <pre class="alert"><?= htmlspecialchars(implode("\n", $failed), ENT_QUOTES, 'UTF-8') ?></pre>
      <?php endif; ?>
      <p class="muted">Delete cleanup-bad-zip-files.php after running it once.</p>
      <p><a class="btn-primary" href="/">Open website</a></p>
    </div>
  </main>
</body>
</html>
