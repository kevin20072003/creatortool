<?php
require_once __DIR__ . '/../includes/auth.php';
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (login_admin($_POST['email'] ?? '', $_POST['password'] ?? '')) {
        header('Location: /admin/index.php');
        exit;
    }
    $error = 'Invalid email or password.';
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Admin Login - CreatorTools.in</title>
  <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
  <main class="container section">
    <form class="card" method="post" style="max-width:460px;margin:auto">
      <p class="eyebrow">Admin panel</p>
      <h1>Login</h1>
      <?php if ($error): ?><p class="alert"><?= e($error) ?></p><?php endif; ?>
      <label class="label">Email<input class="input" type="email" name="email" value="<?= e(ADMIN_EMAIL) ?>" required></label>
      <label class="label">Password<input class="input" type="password" name="password" required></label>
      <p><button class="btn-primary" type="submit">Login</button></p>
      <p class="muted">Run install.php first so the admin user exists.</p>
    </form>
  </main>
</body>
</html>
