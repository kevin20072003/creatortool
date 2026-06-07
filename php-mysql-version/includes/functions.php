<?php
require_once __DIR__ . '/db.php';

function e(?string $value): string {
    return htmlspecialchars($value ?? '', ENT_QUOTES, 'UTF-8');
}

function slugify(string $value): string {
    $value = strtolower(trim($value));
    $value = preg_replace('/[^a-z0-9]+/', '-', $value);
    return trim($value, '-');
}

function setting(string $key, string $fallback = ''): string {
    try {
        $row = q('SELECT value FROM settings WHERE name = ?', [$key])->fetch();
        return $row ? $row['value'] : $fallback;
    } catch (Throwable $e) {
        return $fallback;
    }
}

function markdown(string $text): string {
    $safe = e($text);
    $safe = preg_replace('/^### (.+)$/m', '<h3>$1</h3>', $safe);
    $safe = preg_replace('/^## (.+)$/m', '<h2>$1</h2>', $safe);
    $safe = preg_replace('/^# (.+)$/m', '<h1>$1</h1>', $safe);
    $parts = preg_split('/\n\s*\n/', $safe);
    return implode('', array_map(function ($part) {
        if (str_starts_with(trim($part), '<h')) return $part;
        return '<p>' . nl2br($part) . '</p>';
    }, $parts));
}

function page_title(string $title = ''): string {
    $siteName = setting('site_name', SITE_NAME);
    return $title ? $title . ' - ' . $siteName : $siteName . ' - Free Creator Tools';
}

function track_event(string $type, string $path, ?string $slug = null): void {
    try {
        $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $device = preg_match('/mobile|android|iphone/i', $ua) ? 'mobile' : (preg_match('/ipad|tablet/i', $ua) ? 'tablet' : 'desktop');
        q('INSERT INTO analytics_events (type, path, entity_slug, device, referrer, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [
            $type,
            $path,
            $slug,
            $device,
            $_SERVER['HTTP_REFERER'] ?? '',
        ]);
    } catch (Throwable $e) {}
}
