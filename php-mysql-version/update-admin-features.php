<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);
require_once __DIR__ . '/includes/auth.php';

try {
    foreach ([
        "ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'admin'",
        "ALTER TABLE users ADD COLUMN permissions TEXT NULL",
        "ALTER TABLE users ADD COLUMN status VARCHAR(30) DEFAULT 'active'",
    ] as $sql) {
        try { q($sql); } catch (Throwable $e) {}
    }
    try { q("UPDATE users SET role = 'admin' WHERE role IS NULL OR role = ''"); } catch (Throwable $e) {}
    foreach ([
        "ALTER TABLE analytics_events ADD COLUMN country VARCHAR(80) DEFAULT 'Unknown'",
        "ALTER TABLE analytics_events ADD COLUMN ip_hash VARCHAR(80) NULL",
        "ALTER TABLE analytics_events ADD COLUMN user_agent TEXT NULL",
    ] as $sql) {
        try { q($sql); } catch (Throwable $e) {}
    }

    $settings = [
        'site_name' => 'CreatorTool.in',
        'homeHeroTitle' => 'CreatorTool.in',
        'homeHeroSubtitle' => 'Fast tools for YouTubers, editors, videographers, streamers, and content creators.',
        'global_meta_description' => 'Free calculators and generators for YouTubers, editors, videographers, streamers, and content creators.',
        'footer_text' => 'Free creator tools for YouTubers, editors, videographers, and streamers.',
        'site_logo' => '',
        'site_favicon' => '',
        'youtube_url' => '',
        'instagram_url' => '',
        'x_url' => '',
        'google_analytics_code' => '',
        'search_console_code' => '',
        'custom_head_code' => '',
        'maintenance_message' => '',
    ];
    foreach ($settings as $name => $value) {
        q('INSERT INTO settings (name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)', [$name, $value]);
    }
    foreach (['header', 'in-content', 'sidebar', 'footer', 'after-tool', 'between-sections', 'tools-list'] as $slot) {
        q('INSERT INTO ad_slots (name, code, enabled) VALUES (?, "", 1) ON DUPLICATE KEY UPDATE name = VALUES(name)', [$slot]);
    }
    echo '<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/assets/css/style.css"><title>Update complete</title></head><body><main class="container section"><div class="card"><h1>Admin update complete</h1><p>New settings, logo/favicon fields, and user permission columns are ready.</p><p class="muted">Delete update-admin-features.php after running it once.</p><p><a class="btn-primary" href="/admin/index.php">Open admin</a></p></div></main></body></html>';
} catch (Throwable $e) {
    http_response_code(500);
    echo '<pre>' . htmlspecialchars($e->getMessage(), ENT_QUOTES, 'UTF-8') . '</pre>';
}
