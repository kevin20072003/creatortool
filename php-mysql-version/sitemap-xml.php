<?php
require_once __DIR__ . '/includes/functions.php';
header('Content-Type: application/xml; charset=utf-8');
$base = rtrim(SITE_URL, '/');
$urls = [
    ['loc' => $base . '/', 'priority' => '1.0'],
    ['loc' => $base . '/tools', 'priority' => '0.9'],
    ['loc' => $base . '/blog', 'priority' => '0.7'],
];
foreach (q('SELECT slug FROM tools WHERE status = "published" ORDER BY sort_order, name')->fetchAll() as $row) {
    $urls[] = ['loc' => $base . tool_url($row['slug']), 'priority' => '0.9'];
}
foreach (q('SELECT slug FROM categories ORDER BY sort_order, name')->fetchAll() as $row) {
    $urls[] = ['loc' => $base . category_url($row['slug']), 'priority' => '0.8'];
}
foreach (q('SELECT slug FROM blog_posts WHERE status = "published" ORDER BY created_at DESC')->fetchAll() as $row) {
    $urls[] = ['loc' => $base . blog_url($row['slug']), 'priority' => '0.7'];
}
foreach (q('SELECT slug FROM pages ORDER BY title')->fetchAll() as $row) {
    $urls[] = ['loc' => $base . page_url($row['slug']), 'priority' => '0.5'];
}
echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<?php foreach ($urls as $url): ?>
  <url>
    <loc><?= e($url['loc']) ?></loc>
    <priority><?= e($url['priority']) ?></priority>
  </url>
<?php endforeach; ?>
</urlset>
