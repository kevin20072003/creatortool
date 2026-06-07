<?php
require_once __DIR__ . '/_helpers.php';
require_permission('analytics');
ensure_analytics_schema();
admin_header('Analytics');

$lastHour = q("SELECT COUNT(*) c FROM analytics_events WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)")->fetch()['c'] ?? 0;
$today = q("SELECT COUNT(*) c FROM analytics_events WHERE DATE(created_at) = CURDATE()")->fetch()['c'] ?? 0;
$week = q("SELECT COUNT(*) c FROM analytics_events WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)")->fetch()['c'] ?? 0;
$searches = q("SELECT COUNT(*) c FROM search_logs WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)")->fetch()['c'] ?? 0;
$countries = q("SELECT COALESCE(NULLIF(country,''),'Unknown') country, COUNT(*) views FROM analytics_events GROUP BY COALESCE(NULLIF(country,''),'Unknown') ORDER BY views DESC LIMIT 10")->fetchAll();
$devices = q("SELECT device, COUNT(*) views FROM analytics_events GROUP BY device ORDER BY views DESC")->fetchAll();
$pages = q("SELECT path, COUNT(*) views FROM analytics_events GROUP BY path ORDER BY views DESC LIMIT 12")->fetchAll();
$recent = q("SELECT * FROM analytics_events ORDER BY created_at DESC LIMIT 25")->fetchAll();
$hourly = q("SELECT DATE_FORMAT(created_at, '%H:00') hour_label, COUNT(*) views FROM analytics_events WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d %H') ORDER BY MIN(created_at) ASC")->fetchAll();
?>
<main class="container section">
  <p class="eyebrow">Analytics</p>
  <h1>Traffic overview</h1>
  <p class="lead">Private first-party analytics stored in your MySQL database. Country depends on server/CDN headers, so some visits may show as Unknown.</p>

  <div class="grid-auto">
    <div class="card result-box"><p>Last 1 hour</p><strong><?= e((string)$lastHour) ?></strong></div>
    <div class="card result-box"><p>Today</p><strong><?= e((string)$today) ?></strong></div>
    <div class="card result-box"><p>Last 7 days</p><strong><?= e((string)$week) ?></strong></div>
    <div class="card result-box"><p>Searches 7 days</p><strong><?= e((string)$searches) ?></strong></div>
  </div>

  <section class="card section">
    <h2>Last 24 hours</h2>
    <div class="bar-chart">
      <?php $max = max(1, ...array_map(fn($r) => (int)$r['views'], $hourly ?: [['views' => 1]])); ?>
      <?php foreach ($hourly as $row): ?>
        <div class="bar-row"><span><?= e($row['hour_label']) ?></span><strong style="width:<?= max(4, ((int)$row['views'] / $max) * 100) ?>%"></strong><em><?= e((string)$row['views']) ?></em></div>
      <?php endforeach; ?>
      <?php if (!$hourly): ?><p class="muted">No views recorded yet.</p><?php endif; ?>
    </div>
  </section>

  <div class="analytics-grid">
    <section class="card"><h2>Countries</h2><table class="table"><tr><th>Country</th><th>Views</th></tr><?php foreach ($countries as $row): ?><tr><td><?= e($row['country']) ?></td><td><?= e((string)$row['views']) ?></td></tr><?php endforeach; ?></table></section>
    <section class="card"><h2>Devices</h2><table class="table"><tr><th>Device</th><th>Views</th></tr><?php foreach ($devices as $row): ?><tr><td><?= e($row['device']) ?></td><td><?= e((string)$row['views']) ?></td></tr><?php endforeach; ?></table></section>
  </div>

  <section class="card section">
    <h2>Top pages</h2>
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
