<?php
require_once __DIR__ . '/_helpers.php';
require_permission('users');
admin_header('Users');
ensure_admin_schema();

$permissionOptions = [
    'tools' => 'Manage tools',
    'categories' => 'Manage categories',
    'blog' => 'Write and publish blog posts',
    'pages' => 'Edit pages',
    'media' => 'Upload media',
    'settings' => 'Edit settings and ads',
    'users' => 'Manage users and permissions',
];
$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = (int)($_POST['id'] ?? 0);
    $email = post_value('email');
    $name = post_value('name');
    $role = post_value('role', 'editor');
    $status = post_value('status', 'active');
    $permissions = implode(',', array_keys($_POST['permissions'] ?? []));
    $password = $_POST['password'] ?? '';

    if ($id) {
        q('UPDATE users SET email=?, name=?, role=?, permissions=?, status=? WHERE id=?', [$email, $name, $role, $permissions, $status, $id]);
        if ($password !== '') {
            q('UPDATE users SET password_hash=? WHERE id=?', [password_hash($password, PASSWORD_DEFAULT), $id]);
        }
        $message = 'User updated.';
    } else {
        q('INSERT INTO users (email, name, password_hash, role, permissions, status) VALUES (?, ?, ?, ?, ?, ?)', [$email, $name, password_hash($password ?: bin2hex(random_bytes(8)), PASSWORD_DEFAULT), $role, $permissions, $status]);
        $message = 'User created.';
    }
}

if (isset($_GET['delete'])) {
    $id = (int)$_GET['delete'];
    if ($id !== (int)(admin_user()['id'] ?? 0)) {
        q('DELETE FROM users WHERE id = ?', [$id]);
    }
    header('Location: /admin/users.php');
    exit;
}

$edit = isset($_GET['edit']) ? q('SELECT * FROM users WHERE id = ?', [(int)$_GET['edit']])->fetch() : null;
$users = q('SELECT * FROM users ORDER BY created_at DESC, id DESC')->fetchAll();
$selected = array_filter(array_map('trim', explode(',', $edit['permissions'] ?? '')));
?>
<main class="container section">
  <p class="eyebrow">User access</p>
  <h1><?= $edit ? 'Edit user' : 'Add admin user' ?></h1>
  <?php if ($message): ?><p class="result-box"><?= e($message) ?></p><?php endif; ?>
  <form class="card" method="post">
    <input type="hidden" name="id" value="<?= e((string)($edit['id'] ?? '')) ?>">
    <div class="grid-auto">
      <label class="label">Name<input class="input" name="name" value="<?= e($edit['name'] ?? '') ?>" required></label>
      <label class="label">Email<input class="input" type="email" name="email" value="<?= e($edit['email'] ?? '') ?>" required></label>
      <label class="label">Password <?= $edit ? '(leave blank to keep)' : '' ?><input class="input" type="password" name="password" <?= $edit ? '' : 'required' ?>></label>
      <label class="label">Role<select class="select" name="role"><option value="admin" <?= ($edit['role'] ?? '') === 'admin' ? 'selected' : '' ?>>Admin - all access</option><option value="editor" <?= ($edit['role'] ?? 'editor') === 'editor' ? 'selected' : '' ?>>Editor - selected access</option></select></label>
      <label class="label">Status<select class="select" name="status"><option value="active" <?= ($edit['status'] ?? 'active') === 'active' ? 'selected' : '' ?>>Active</option><option value="disabled" <?= ($edit['status'] ?? '') === 'disabled' ? 'selected' : '' ?>>Disabled</option></select></label>
    </div>
    <h2>Editor permissions</h2>
    <div class="permission-grid">
      <?php foreach ($permissionOptions as $key => $label): ?>
        <label><input type="checkbox" name="permissions[<?= e($key) ?>]" <?= in_array($key, $selected, true) ? 'checked' : '' ?>> <?= e($label) ?></label>
      <?php endforeach; ?>
    </div>
    <p><button class="btn-primary" type="submit">Save user</button> <a class="btn-secondary" href="/admin/users.php">Clear</a></p>
  </form>

  <section class="card section">
    <h2>Users</h2>
    <table class="table"><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr>
      <?php foreach ($users as $user): ?>
        <tr><td><?= e($user['name']) ?></td><td><?= e($user['email']) ?></td><td><?= e($user['role'] ?? 'admin') ?></td><td><?= e($user['status'] ?? 'active') ?></td><td><a href="?edit=<?= e((string)$user['id']) ?>">Edit</a><?php if ((int)$user['id'] !== (int)(admin_user()['id'] ?? 0)): ?> | <a href="?delete=<?= e((string)$user['id']) ?>" onclick="return confirm('Delete user?')">Delete</a><?php endif; ?></td></tr>
      <?php endforeach; ?>
    </table>
  </section>
</main>
<?php admin_footer(); ?>
