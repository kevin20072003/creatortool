<?php
require_once __DIR__ . '/functions.php';

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

function admin_user(): ?array {
    if (empty($_SESSION['admin_id'])) return null;
    $user = q('SELECT id, email, name FROM users WHERE id = ?', [$_SESSION['admin_id']])->fetch();
    return $user ?: null;
}

function require_admin(): void {
    if (!admin_user()) {
        header('Location: /admin/login.php');
        exit;
    }
}

function login_admin(string $email, string $password): bool {
    $user = q('SELECT * FROM users WHERE email = ?', [$email])->fetch();
    if (!$user || !password_verify($password, $user['password_hash'])) return false;
    $_SESSION['admin_id'] = $user['id'];
    return true;
}

function logout_admin(): void {
    $_SESSION = [];
    session_destroy();
}
