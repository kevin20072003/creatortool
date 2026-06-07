<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);

$status = 'Not checked';
$detail = '';
$ok = false;

try {
    require_once __DIR__ . '/includes/db.php';

    if (DB_NAME === 'creatortools_db' || DB_USER === 'creatortools_user' || DB_PASS === 'change-this-password') {
        $status = 'Config still has default sample values';
        $detail = 'Edit includes/config.php and add the real Hostinger MySQL database name, username, and password.';
    } else {
        $row = q('SELECT VERSION() version')->fetch();
        $tables = q('SHOW TABLES')->fetchAll();
        $status = 'Database connected successfully';
        $detail = 'MySQL version: ' . ($row['version'] ?? 'unknown') . "\nTables found: " . count($tables);
        $ok = true;
    }
} catch (Throwable $e) {
    $status = 'Database check failed';
    $detail = $e->getMessage();
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CreatorTools DB Check</title>
  <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
  <main class="container section">
    <div class="card">
      <p class="eyebrow">Database check</p>
      <h1><?= htmlspecialchars($status, ENT_QUOTES, 'UTF-8') ?></h1>
      <pre class="<?= $ok ? 'result-box' : 'alert' ?>"><?= htmlspecialchars($detail, ENT_QUOTES, 'UTF-8') ?></pre>
      <p>
        <a class="btn-primary" href="/install.php">Run installer</a>
        <a class="btn-secondary" href="/">Open website</a>
      </p>
      <p class="muted">Delete <code>db-check.php</code> and <code>install.php</code> after setup is complete.</p>
    </div>
  </main>
</body>
</html>
