<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);
require_once __DIR__ . '/includes/functions.php';

try {
    q('INSERT INTO settings (name, value) VALUES ("ads_enabled", "0") ON DUPLICATE KEY UPDATE value = VALUES(value)');
    q('INSERT INTO settings (name, value) VALUES ("show_ad_placeholders", "0") ON DUPLICATE KEY UPDATE value = VALUES(value)');
    q('UPDATE tools SET seo_title = REPLACE(seo_title, "CreatorTools.in", "CreatorTool.in") WHERE seo_title LIKE "%CreatorTools.in%"');
    q('UPDATE blog_posts SET seo_title = REPLACE(seo_title, "CreatorTools.in", "CreatorTool.in") WHERE seo_title LIKE "%CreatorTools.in%"');
    q('UPDATE pages SET seo_title = REPLACE(seo_title, "CreatorTools.in", "CreatorTool.in") WHERE seo_title LIKE "%CreatorTools.in%"');

    $pages = [
        'about' => [
            'About CreatorTool.in',
            "# About CreatorTool.in\n\nCreatorTool.in is a free creator tools website built for YouTubers, video editors, videographers, livestreamers, photographers, and social media creators.\n\nOur goal is to make everyday creator planning easier with practical calculators, generators, checklists, and educational guides. The tools help estimate video storage, bitrate, upload time, recording time, subtitle formatting, thumbnail text, YouTube metadata, and other creator workflows.\n\nThe results provided by calculators are estimates. Real-world output can change based on camera model, codec, bitrate mode, scene complexity, platform processing, internet speed, and editing workflow.\n\nCreatorTool.in is maintained as an independent creator resource. We continue improving the tools and guides based on practical creator needs."
        ],
        'contact' => [
            'Contact',
            "# Contact\n\nIf you have questions, feedback, corrections, partnership requests, or tool suggestions, you can contact the CreatorTool.in team by email.\n\nEmail: kevinrajvnr@gmail.com\n\nPlease include the page URL and a short explanation when reporting a calculator issue or suggesting a new tool. We try to improve the site with practical feedback from creators, editors, and livestreamers."
        ],
        'privacy-policy' => [
            'Privacy Policy',
            "# Privacy Policy\n\nCreatorTool.in respects visitor privacy. This website stores basic first-party analytics in our MySQL database to understand page views, device type, referrer, search queries, and general usage patterns. This helps us improve tools, content, navigation, and performance.\n\nWe do not sell personal information. Some technical information, such as browser details, device type, referrer, and anonymized IP hash, may be stored for analytics and security purposes.\n\nCreatorTool.in may use Google AdSense or other Google advertising products in the future. Google and its partners may use cookies, web beacons, IP addresses, and similar technologies to serve ads, measure performance, and personalize advertising where applicable. Users can manage ad personalization through their Google ad settings.\n\nThis website may contain links to external websites. We are not responsible for the privacy practices or content of external sites.\n\nBy using CreatorTool.in, you agree to this privacy policy. This page may be updated as the website grows or advertising features are added."
        ],
        'terms-and-conditions' => [
            'Terms and Conditions',
            "# Terms and Conditions\n\nBy using CreatorTool.in, you agree to use the website for informational and educational purposes. The tools, calculators, generators, guides, and examples are provided to help creators plan workflows more easily.\n\nCalculator results are estimates only. Actual results may vary depending on camera settings, codec profiles, export presets, platform processing, storage devices, internet speed, audio format, and other real-world conditions.\n\nYou are responsible for checking important numbers before making production, financial, or technical decisions. CreatorTool.in is not responsible for losses, damages, or issues caused by relying only on estimated results.\n\nYou may not misuse the website, attempt unauthorized access, interfere with site operation, copy the site as a competing clone, or use the tools for illegal purposes.\n\nWe may update, remove, or improve tools and content at any time."
        ],
        'disclaimer' => [
            'Disclaimer',
            "# Disclaimer\n\nCreatorTool.in provides free tools and educational content for creators, editors, videographers, livestreamers, photographers, and social media users.\n\nAll calculator outputs and generated text are approximate planning aids. They should not be treated as guaranteed technical specifications. Real file sizes, bitrates, upload times, recording times, and platform behavior can vary depending on hardware, software, codec, compression, network conditions, platform processing, and manufacturer implementation.\n\nAlways verify important production settings with your camera, editing software, streaming platform, or technical documentation before final delivery."
        ],
    ];

    foreach ($pages as $slug => [$title, $content]) {
        q('INSERT INTO pages (title, slug, content, seo_title, seo_description) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE title = VALUES(title), content = VALUES(content), seo_title = VALUES(seo_title), seo_description = VALUES(seo_description)', [
            $title,
            $slug,
            $content,
            $title . ' - CreatorTool.in',
            $title . ' for CreatorTool.in visitors.',
        ]);
    }

    echo '<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/assets/css/style.css?v=20260607-dark-analytics"><title>AdSense readiness updated</title></head><body><main class="container section"><div class="card"><h1>AdSense readiness update complete</h1><p>Trust pages were improved, old brand names were corrected, and ad placeholders were turned off.</p><p class="muted">Delete adsense-readiness-update.php after running it once.</p><p><a class="btn-primary" href="/">Open website</a> <a class="btn-secondary" href="/pages/privacy-policy">Privacy page</a></p></div></main></body></html>';
} catch (Throwable $e) {
    http_response_code(500);
    echo '<pre>' . htmlspecialchars($e->getMessage(), ENT_QUOTES, 'UTF-8') . '</pre>';
}
