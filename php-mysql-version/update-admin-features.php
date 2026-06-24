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
        'footer_image' => '',
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
    q('INSERT INTO settings (name, value) VALUES ("homeHeroTitle", "AI Prompt Generator for ChatGPT, Gemini and Creators") ON DUPLICATE KEY UPDATE value = VALUES(value)');
    q('INSERT INTO settings (name, value) VALUES ("homeHeroSubtitle", "Create better prompts for AI images, thumbnails, product photos, logos, characters, social posts, and creator content.") ON DUPLICATE KEY UPDATE value = VALUES(value)');
    q('INSERT INTO settings (name, value) VALUES ("global_meta_description", "Free AI prompt generators plus creator tools for images, thumbnails, YouTube, video editing, streaming, and social media.") ON DUPLICATE KEY UPDATE value = VALUES(value)');
    q('INSERT INTO settings (name, value) VALUES ("footer_text", "AI prompt generators and free creator tools for YouTubers, editors, designers, streamers, and content creators.") ON DUPLICATE KEY UPDATE value = VALUES(value)');
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
    $promptCategory = q('SELECT id FROM categories WHERE slug = "ai-prompt-tools"')->fetch();
    if (!$promptCategory) {
        q('INSERT INTO categories (name, slug, description, icon, sort_order, seo_title, seo_description) VALUES ("AI Prompt Tools", "ai-prompt-tools", "Prompt generators for AI images, thumbnails, products, logos, characters, social media, ChatGPT, Gemini, Midjourney, and SDXL.", "AI", -10, "AI Prompt Tools - CreatorTool.in", "Free AI prompt generators for creators, designers, YouTubers, and social media workflows.")');
        $promptCategory = q('SELECT id FROM categories WHERE slug = "ai-prompt-tools"')->fetch();
    } else {
        q('UPDATE categories SET name = "AI Prompt Tools", description = "Prompt generators for AI images, thumbnails, products, logos, characters, social media, ChatGPT, Gemini, Midjourney, and SDXL.", icon = "AI", sort_order = -10, seo_title = "AI Prompt Tools - CreatorTool.in", seo_description = "Free AI prompt generators for creators, designers, YouTubers, and social media workflows." WHERE id = ?', [$promptCategory['id']]);
    }
    $promptTools = [
        ['AI Image Prompt Generator', 'ai-image-prompt-generator', 'ai-image-prompt', 'Turn a rough idea into a polished AI image prompt for ChatGPT, Gemini, Midjourney, SDXL, Leonardo AI, and Canva AI.', 'AI', 1, 1],
        ['Image-to-Prompt Helper', 'image-to-prompt-helper', 'image-to-prompt', 'Upload a reference image preview, describe what you see, and generate a clean prompt for recreating a similar style.', 'IP', 1, 1],
        ['Text-to-Image Prompt Generator', 'text-to-image-prompt-generator', 'ai-image-prompt', 'Convert a simple text idea into a detailed image generation prompt with style, mood, lighting, and composition.', 'TI', 1, 1],
        ['Prompt Improver', 'prompt-improver', 'prompt-improver', 'Rewrite a short or weak AI prompt into a clearer prompt with structure, details, and negative prompt guidance.', 'PI', 1, 1],
        ['Product Photo Prompt Generator', 'product-photo-prompt-generator', 'ai-image-prompt', 'Generate premium product photography prompts for ecommerce, ads, social posts, and creator portfolios.', 'PR', 0, 1],
        ['YouTube Thumbnail Prompt Generator', 'youtube-thumbnail-prompt-generator', 'ai-image-prompt', 'Create AI background and thumbnail prompt ideas for YouTube videos while leaving room for final text.', 'YT', 1, 1],
        ['Logo Prompt Generator', 'logo-prompt-generator', 'ai-image-prompt', 'Generate logo concept prompts for brands, channels, startups, apps, and creator projects.', 'LG', 0, 1],
        ['Character Prompt Generator', 'character-prompt-generator', 'ai-image-prompt', 'Create detailed character prompts with style, clothing, mood, background, and visual direction.', 'CH', 0, 0],
        ['Interior Design Prompt Generator', 'interior-design-prompt-generator', 'ai-image-prompt', 'Generate room, studio, office, and interior design prompts with lighting and decor direction.', 'IN', 0, 0],
        ['Social Media Post Prompt Generator', 'social-media-post-prompt-generator', 'ai-image-prompt', 'Create polished visual prompts for Instagram posts, Reels covers, ads, and campaign creatives.', 'SM', 0, 1],
    ];
    foreach ($promptTools as $index => $item) {
        $content = "# {$item[0]}\n\n## What is this tool?\n{$item[3]}\n\n## How to use\nEnter your idea, choose an AI tool, select a style, theme, lighting, composition, and aspect ratio, then copy the generated prompt into ChatGPT, Gemini, Midjourney, SDXL, Leonardo AI, or Canva AI.\n\n## Example\nIdea: premium creator desk setup for an AI tools website. Style: cinematic realistic. Theme: dark futuristic. The tool turns this into a clear prompt with composition, lighting, quality details, and a negative prompt.\n\n## Best use cases\nUse it for YouTube thumbnails, AI art, product photos, channel branding, social posts, blog images, website hero images, character concepts, and creative direction.\n\n## Important note\nThis tool does not call an external AI service. It formats your input into a stronger prompt that you can paste into your preferred AI image generator.";
        q('INSERT INTO tools (name, slug, category_id, description, content, template_type, icon_name, status, featured, popular, seo_title, seo_description, keywords, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, "published", ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE category_id = VALUES(category_id), description = VALUES(description), content = VALUES(content), template_type = VALUES(template_type), icon_name = VALUES(icon_name), status = "published", featured = VALUES(featured), popular = VALUES(popular), seo_title = VALUES(seo_title), seo_description = VALUES(seo_description), keywords = VALUES(keywords), sort_order = VALUES(sort_order)', [
            $item[0],
            $item[1],
            $promptCategory['id'],
            $item[3],
            $content,
            $item[2],
            $item[4],
            $item[5],
            $item[6],
            $item[0] . ' - Free AI Prompt Tool - CreatorTool.in',
            $item[3],
            'ai prompt generator, image prompt, chatgpt image prompt, gemini image prompt, midjourney prompt, creator tools',
            -100 + $index,
        ]);
        $tool = q('SELECT id FROM tools WHERE slug = ?', [$item[1]])->fetch();
        if ($tool && !(int)q('SELECT COUNT(*) c FROM faqs WHERE tool_id = ?', [$tool['id']])->fetch()['c']) {
            q('INSERT INTO faqs (tool_id, question, answer, sort_order) VALUES (?, "Does this tool generate images?", "No. It generates a polished prompt that you can paste into ChatGPT, Gemini, Midjourney, SDXL, Leonardo AI, Canva AI, or another image generator.", 0)', [$tool['id']]);
            q('INSERT INTO faqs (tool_id, question, answer, sort_order) VALUES (?, "Can it analyze my uploaded image automatically?", "The image upload is a local preview helper. Describe the image details in the form so the tool can format a better prompt without using an external AI backend.", 1)', [$tool['id']]);
            q('INSERT INTO faqs (tool_id, question, answer, sort_order) VALUES (?, "Which AI tools can use these prompts?", "The prompt is written for ChatGPT, Gemini, Midjourney, Stable Diffusion, SDXL, Leonardo AI, Canva AI, and most modern image generators.", 2)', [$tool['id']]);
        }
    }
    echo '<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/assets/css/style.css"><title>Update complete</title></head><body><main class="container section"><div class="card"><h1>AI prompt update complete</h1><p>AI Prompt Tools category, prompt generator templates, homepage copy, settings, logo/favicon fields, and user permission columns are ready.</p><p class="muted">Delete update-admin-features.php after running it once.</p><p><a class="btn-primary" href="/admin/index.php">Open admin</a> <a class="btn-secondary" href="/tools/ai-image-prompt-generator">Open AI prompt generator</a></p></div></main></body></html>';
} catch (Throwable $e) {
    http_response_code(500);
    echo '<pre>' . htmlspecialchars($e->getMessage(), ENT_QUOTES, 'UTF-8') . '</pre>';
}
