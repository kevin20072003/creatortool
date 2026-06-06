<?php
require_once __DIR__ . '/_helpers.php';
admin_header('Settings');
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    foreach ($_POST['settings'] ?? [] as $name => $value) {
        q('INSERT INTO settings (name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)', [$name, trim($value)]);
    }
    foreach ($_POST['ads'] ?? [] as $name => $code) {
        q('INSERT INTO ad_slots (name, code, enabled) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE code = VALUES(code)', [$name, trim($code)]);
    }
    header('Location: /admin/settings.php');
    exit;
}
$settings = q('SELECT * FROM settings ORDER BY name')->fetchAll();
$ads = q('SELECT * FROM ad_slots ORDER BY name')->fetchAll();
?>
<main class="container section">
  <p class="eyebrow">Settings</p>
  <h1>Site settings and Adsense</h1>
  <form class="card" method="post">
    <h2>Settings</h2>
    <?php foreach ($settings as $row): ?><label class="label"><?= e($row['name']) ?><textarea class="textarea" name="settings[<?= e($row['name']) ?>]"><?= e($row['value']) ?></textarea></label><?php endforeach; ?>
    <h2>Ad slots</h2>
    <?php foreach ($ads as $row): ?><label class="label"><?= e($row['name']) ?> ad code<textarea class="textarea" name="ads[<?= e($row['name']) ?>]"><?= e($row['code']) ?></textarea></label><?php endforeach; ?>
    <p><button class="btn-primary" type="submit">Save settings</button></p>
  </form>
</main>
<?php admin_footer(); ?>
