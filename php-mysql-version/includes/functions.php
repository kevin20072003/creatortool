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

function analytics_country(): string {
    foreach (['HTTP_CF_IPCOUNTRY', 'HTTP_X_COUNTRY_CODE', 'GEOIP_COUNTRY_CODE', 'HTTP_X_APPENGINE_COUNTRY'] as $key) {
        $value = strtoupper(trim($_SERVER[$key] ?? ''));
        if ($value && strlen($value) <= 3 && $value !== 'ZZ') return $value;
    }
    $lang = $_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? '';
    if (preg_match('/[-_]([A-Z]{2})\b/i', $lang, $matches)) return strtoupper($matches[1]);
    return 'Unknown';
}

function ensure_analytics_schema(): void {
    static $done = false;
    if ($done) return;
    foreach ([
        "ALTER TABLE analytics_events ADD COLUMN country VARCHAR(80) DEFAULT 'Unknown'",
        "ALTER TABLE analytics_events ADD COLUMN ip_hash VARCHAR(80) NULL",
        "ALTER TABLE analytics_events ADD COLUMN user_agent TEXT NULL",
    ] as $sql) {
        try { q($sql); } catch (Throwable $e) {}
    }
    $done = true;
}

function track_event(string $type, string $path, ?string $slug = null): void {
    try {
        ensure_analytics_schema();
        $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $device = preg_match('/mobile|android|iphone/i', $ua) ? 'mobile' : (preg_match('/ipad|tablet/i', $ua) ? 'tablet' : 'desktop');
        $ip = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '';
        $ip = trim(explode(',', $ip)[0]);
        q('INSERT INTO analytics_events (type, path, entity_slug, device, referrer, country, ip_hash, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())', [
            $type,
            $path,
            $slug,
            $device,
            $_SERVER['HTTP_REFERER'] ?? '',
            analytics_country(),
            $ip ? hash('sha256', $ip . APP_SECRET) : '',
            substr($ua, 0, 500),
        ]);
    } catch (Throwable $e) {}
}
