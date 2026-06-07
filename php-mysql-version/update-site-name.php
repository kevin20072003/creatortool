<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);
require_once __DIR__ . '/includes/functions.php';

try {
    foreach ([
        'site_name' => 'CreatorTool.in',
        'homeHeroTitle' => 'CreatorTool.in',
    ] as $name => $value) {
        q('INSERT INTO settings (name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)', [$name, $value]);
    }
    echo '<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/assets/css/style.css"><title>Site name updated</title></head><body><main class="container section"><div class="card"><h1>Site name updated</h1><p>Branding is now CreatorTool.in.</p><p class="muted">Delete update-site-name.php after running it once.</p><p><a class="btn-primary" href="/">Open website</a> <a class="btn-secondary" href="/admin/settings.php">Open settings</a></p></div></main></body></html>';
} catch (Throwable $e) {
    http_response_code(500);
    echo '<pre>' . htmlspecialchars($e->getMessage(), ENT_QUOTES, 'UTF-8') . '</pre>';
}
