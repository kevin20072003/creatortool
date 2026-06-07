<?php
require_once __DIR__ . '/functions.php';

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

function ensure_admin_schema(): void {
    static $done = false;
    if ($done) return;
    foreach ([
        "ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'admin'",
        "ALTER TABLE users ADD COLUMN permissions TEXT NULL",
        "ALTER TABLE users ADD COLUMN status VARCHAR(30) DEFAULT 'active'",
    ] as $sql) {
        try { q($sql); } catch (Throwable $e) {}
    }
    try { q("UPDATE users SET role = 'admin' WHERE role IS NULL OR role = ''"); } catch (Throwable $e) {}
    $done = true;
}

function admin_user(): ?array {
    ensure_admin_schema();
    if (empty($_SESSION['admin_id'])) return null;
    $user = q('SELECT * FROM users WHERE id = ? AND status = "active"', [$_SESSION['admin_id']])->fetch();
    return $user ?: null;
}

function require_admin(): void {
    if (!admin_user()) {
        header('Location: /admin/login.php');
        exit;
    }
}

function login_admin(string $email, string $password): bool {
    ensure_admin_schema();
    $user = q('SELECT * FROM users WHERE email = ? AND status = "active"', [$email])->fetch();
    if (!$user || !password_verify($password, $user['password_hash'])) return false;
    $_SESSION['admin_id'] = $user['id'];
    return true;
}

function logout_admin(): void {
    $_SESSION = [];
    session_destroy();
}

function can(string $permission): bool {
    $user = admin_user();
    if (!$user) return false;
    if (($user['role'] ?? 'admin') === 'admin') return true;
    $permissions = array_filter(array_map('trim', explode(',', $user['permissions'] ?? '')));
    return in_array($permission, $permissions, true);
}

function require_permission(string $permission): void {
    require_admin();
    if (!can($permission)) {
        http_response_code(403);
        echo '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Permission denied</title><link rel="stylesheet" href="/assets/css/style.css"></head><body><main class="container section"><div class="card"><h1>Permission denied</h1><p class="muted">Your admin account does not have access to this section.</p><p><a class="btn-secondary" href="/admin/index.php">Back to dashboard</a></p></div></main></body></html>';
        exit;
    }
}
