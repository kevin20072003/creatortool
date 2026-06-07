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
    foreach ([
        'ads_enabled' => '0',
        'show_ad_placeholders' => '0',
    ] as $name => $value) {
        q('INSERT INTO settings (name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)', [$name, $value]);
    }

    $seoCategory = q('SELECT id FROM categories WHERE slug = "seo-tools"')->fetch();
    if (!$seoCategory) {
        q('INSERT INTO categories (name, slug, description, icon, sort_order) VALUES ("SEO Tools", "seo-tools", "SEO checklists and metadata helpers for creators.", "SE", 8)');
        $seoCategory = q('SELECT id FROM categories WHERE slug = "seo-tools"')->fetch();
    }
    $seoTools = [
        ['Video SEO Title Checker', 'video-seo-title-checker', 'description-generator', 'Check whether a video title is clear, searchable, and clickable for YouTube and Google.'],
        ['Meta Description Generator', 'meta-description-generator', 'description-generator', 'Create concise SEO descriptions for tool pages, blog posts, and creator guides.'],
        ['YouTube Keyword Idea Generator', 'youtube-keyword-idea-generator', 'generator', 'Generate keyword ideas for YouTube videos, tutorials, reviews, and creator workflows.'],
        ['Content Brief Generator', 'content-brief-generator', 'description-generator', 'Create a simple SEO content brief with angle, keywords, sections, and FAQs.'],
        ['FAQ Schema Idea Generator', 'faq-schema-idea-generator', 'generator', 'Generate useful FAQ ideas for tool pages and blog posts.'],
    ];
    foreach ($seoTools as $index => $item) {
        $content = "# {$item[0]}\n\n## What is this tool?\n{$item[3]}\n\n## Example\nUse it before publishing a tool page, YouTube guide, tutorial, or blog post so the page has a focused search angle.\n\n## Use cases\nImprove page titles, generate FAQ ideas, plan keywords, and write better descriptions for creator-focused pages.\n\n## SEO note\nSearch rankings are not guaranteed, but clear titles, useful content, internal links, and schema help search engines understand the page.";
        q('INSERT INTO tools (name, slug, category_id, description, content, template_type, status, featured, popular, seo_title, seo_description, sort_order) VALUES (?, ?, ?, ?, ?, ?, "published", 0, 1, ?, ?, ?) ON DUPLICATE KEY UPDATE category_id = VALUES(category_id), description = VALUES(description), content = VALUES(content), template_type = VALUES(template_type), status = "published", popular = 1, seo_title = VALUES(seo_title), seo_description = VALUES(seo_description)', [
            $item[0],
            $item[1],
            $seoCategory['id'],
            $item[3],
            $content,
            $item[2],
            $item[0] . ' - CreatorTool.in',
            $item[3],
            900 + $index,
        ]);
        $tool = q('SELECT id FROM tools WHERE slug = ?', [$item[1]])->fetch();
        if ($tool && !(int)q('SELECT COUNT(*) c FROM faqs WHERE tool_id = ?', [$tool['id']])->fetch()['c']) {
            q('INSERT INTO faqs (tool_id, question, answer, sort_order) VALUES (?, "Is this SEO tool free?", "Yes. It is free and works directly in your browser.", 0)', [$tool['id']]);
            q('INSERT INTO faqs (tool_id, question, answer, sort_order) VALUES (?, "Will this guarantee Google ranking?", "No tool can guarantee ranking. Use it to improve clarity, usefulness, structure, and search intent.", 1)', [$tool['id']]);
        }
    }
    echo '<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/assets/css/style.css"><title>Update complete</title></head><body><main class="container section"><div class="card"><h1>Admin update complete</h1><p>New settings, logo/favicon fields, and user permission columns are ready.</p><p class="muted">Delete update-admin-features.php after running it once.</p><p><a class="btn-primary" href="/admin/index.php">Open admin</a></p></div></main></body></html>';
} catch (Throwable $e) {
    http_response_code(500);
    echo '<pre>' . htmlspecialchars($e->getMessage(), ENT_QUOTES, 'UTF-8') . '</pre>';
}
