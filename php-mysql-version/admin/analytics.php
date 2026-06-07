<?php
require_once __DIR__ . '/_helpers.php';
require_permission('analytics');
ensure_analytics_schema();
admin_header('Analytics');

function metric_count(string $sql): int {
    return (int)(q($sql)->fetch()['c'] ?? 0);
}

$lastHour = metric_count("SELECT COUNT(*) c FROM analytics_events WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)");
$today = metric_count("SELECT COUNT(*) c FROM analytics_events WHERE DATE(created_at) = CURDATE()");
$week = metric_count("SELECT COUNT(*) c FROM analytics_events WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
$month = metric_count("SELECT COUNT(*) c FROM analytics_events WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)");
$thisMonth = metric_count("SELECT COUNT(*) c FROM analytics_events WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())");
$uniqueMonth = metric_count("SELECT COUNT(DISTINCT ip_hash) c FROM analytics_events WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND ip_hash IS NOT NULL AND ip_hash != ''");
$searches = metric_count("SELECT COUNT(*) c FROM search_logs WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)");

$countries = q("SELECT COALESCE(NULLIF(country,''),'Unknown') country, COUNT(*) views FROM analytics_events WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY COALESCE(NULLIF(country,''),'Unknown') ORDER BY views DESC LIMIT 10")->fetchAll();
$devices = q("SELECT device, COUNT(*) views FROM analytics_events WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY device ORDER BY views DESC")->fetchAll();
$pages = q("SELECT path, COUNT(*) views FROM analytics_events WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY path ORDER BY views DESC LIMIT 12")->fetchAll();
$recent = q("SELECT * FROM analytics_events ORDER BY created_at DESC LIMIT 25")->fetchAll();
$daily = q("SELECT DATE_FORMAT(created_at, '%d %b') day_label, COUNT(*) views FROM analytics_events WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 29 DAY) GROUP BY DATE(created_at) ORDER BY DATE(created_at) ASC")->fetchAll();
$hourly = q("SELECT DATE_FORMAT(created_at, '%H:00') start_label, DATE_FORMAT(DATE_ADD(created_at, INTERVAL 59 MINUTE), '%H:59') end_label, COUNT(*) views FROM analytics_events WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d %H') ORDER BY MIN(created_at) ASC")->fetchAll();

$hourMax = max(1, ...array_map(fn($r) => (int)$r['views'], $hourly ?: [['views' => 1]]));
$dayMax = max(1, ...array_map(fn($r) => (int)$r['views'], $daily ?: [['views' => 1]]));
?>
<main class="container section">
  <p class="eyebrow">Analytics</p>
  <h1>Traffic overview</h1>
  <p class="lead">Private first-party analytics stored in MySQL. Country uses server/CDN headers when available, otherwise it may show as Unknown.</p>

  <div class="grid-auto">
    <div class="card result-box"><p>Last 1 hour</p><strong><?= e((string)$lastHour) ?></strong></div>
    <div class="card result-box"><p>Today</p><strong><?= e((string)$today) ?></strong></div>
    <div class="card result-box"><p>Last 7 days</p><strong><?= e((string)$week) ?></strong></div>
    <div class="card result-box"><p>Last 30 days</p><strong><?= e((string)$month) ?></strong></div>
  </div>

  <section class="card section">
    <div class="section-head">
      <div><p class="eyebrow">Monthly report</p><h2>This month</h2></div>
    </div>
    <div class="grid-auto">
      <div class="result-box"><p>Views this month</p><strong><?= e((string)$thisMonth) ?></strong></div>
      <div class="result-box"><p>Unique visitors 30 days</p><strong><?= e((string)$uniqueMonth) ?></strong></div>
      <div class="result-box"><p>Searches 30 days</p><strong><?= e((string)$searches) ?></strong></div>
    </div>
    <div class="bar-chart labeled-chart">
      <?php foreach ($daily as $row): ?>
        <div class="bar-row daily-row"><span><?= e($row['day_label']) ?></span><strong style="width:<?= max(4, ((int)$row['views'] / $dayMax) * 100) ?>%"></strong><em><?= e((string)$row['views']) ?> views</em></div>
      <?php endforeach; ?>
      <?php if (!$daily): ?><p class="muted">No monthly data recorded yet.</p><?php endif; ?>
    </div>
  </section>

  <section class="card section">
    <div class="section-head">
      <div><p class="eyebrow">Hourly report</p><h2>Last 24 hours</h2></div>
    </div>
    <p class="muted">Each row shows one hour range and how many page views happened in that hour.</p>
    <div class="bar-chart labeled-chart">
      <?php foreach ($hourly as $row): ?>
        <div class="bar-row"><span><?= e($row['start_label']) ?> - <?= e($row['end_label']) ?></span><strong style="width:<?= max(4, ((int)$row['views'] / $hourMax) * 100) ?>%"></strong><em><?= e((string)$row['views']) ?> views</em></div>
      <?php endforeach; ?>
      <?php if (!$hourly): ?><p class="muted">No views recorded yet.</p><?php endif; ?>
    </div>
  </section>

  <div class="analytics-grid">
    <section class="card"><h2>Countries, 30 days</h2><table class="table"><tr><th>Country</th><th>Views</th></tr><?php foreach ($countries as $row): ?><tr><td><?= e($row['country']) ?></td><td><?= e((string)$row['views']) ?></td></tr><?php endforeach; ?></table></section>
    <section class="card"><h2>Devices, 30 days</h2><table class="table"><tr><th>Device</th><th>Views</th></tr><?php foreach ($devices as $row): ?><tr><td><?= e($row['device']) ?></td><td><?= e((string)$row['views']) ?></td></tr><?php endforeach; ?></table></section>
  </div>

  <section class="card section">
    <h2>Top pages, 30 days</h2>
    <table class="table"><tr><th>Page</th><th>Views</th></tr><?php foreach ($pages as $row): ?><tr><td><?= e($row['path']) ?></td><td><?= e((string)$row['views']) ?></td></tr><?php endforeach; ?></table>
  </section>

  <section class="card section">
    <h2>Recent visits</h2>
    <table class="table"><tr><th>Time</th><th>Path</th><th>Country</th><th>Device</th><th>Referrer</th></tr>
      <?php foreach ($recent as $row): ?><tr><td><?= e($row['created_at']) ?></td><td><?= e($row['path']) ?></td><td><?= e($row['country'] ?? 'Unknown') ?></td><td><?= e($row['device']) ?></td><td><?= e($row['referrer']) ?></td></tr><?php endforeach; ?>
    </table>
  </section>
</main>
<?php admin_footer(); ?>
