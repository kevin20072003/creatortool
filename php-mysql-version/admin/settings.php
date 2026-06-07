<?php
require_once __DIR__ . '/_helpers.php';
require_permission('settings');
admin_header('Settings');

$message = '';
$fields = [
    'site_name' => 'Site name',
    'homeHeroTitle' => 'Homepage hero title',
    'homeHeroSubtitle' => 'Homepage hero subtitle',
    'global_meta_description' => 'Global meta description',
    'footer_text' => 'Footer text',
    'youtube_url' => 'YouTube URL',
    'instagram_url' => 'Instagram URL',
    'x_url' => 'X / Twitter URL',
    'google_analytics_code' => 'Google Analytics code',
    'search_console_code' => 'Google Search Console verification',
    'custom_head_code' => 'Custom head code',
    'maintenance_message' => 'Maintenance message',
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    foreach ($_POST['settings'] ?? [] as $name => $value) {
        q('INSERT INTO settings (name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)', [$name, trim($value)]);
    }
    $logo = upload_admin_image('site_logo_file');
    if ($logo) q('INSERT INTO settings (name, value) VALUES ("site_logo", ?) ON DUPLICATE KEY UPDATE value = VALUES(value)', [$logo]);
    $favicon = upload_admin_image('site_favicon_file');
    if ($favicon) q('INSERT INTO settings (name, value) VALUES ("site_favicon", ?) ON DUPLICATE KEY UPDATE value = VALUES(value)', [$favicon]);
    foreach ($_POST['ads'] ?? [] as $name => $code) {
        q('INSERT INTO ad_slots (name, code, enabled) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE code = VALUES(code)', [$name, trim($code)]);
    }
    $message = 'Settings saved.';
}

$ads = q('SELECT * FROM ad_slots ORDER BY name')->fetchAll();
?>
<main class="container section">
  <p class="eyebrow">Settings</p>
  <h1>Site control panel</h1>
  <?php if ($message): ?><p class="result-box"><?= e($message) ?></p><?php endif; ?>
  <form class="card" method="post" enctype="multipart/form-data">
    <h2>Brand</h2>
    <div class="grid-auto">
      <label class="label">Logo image<input class="input" type="file" name="site_logo_file" accept="image/*"></label>
      <label class="label">Favicon image<input class="input" type="file" name="site_favicon_file" accept="image/*,.ico"></label>
      <label class="label">Current logo URL<input class="input" name="settings[site_logo]" value="<?= e(setting('site_logo')) ?>"></label>
      <label class="label">Current favicon URL<input class="input" name="settings[site_favicon]" value="<?= e(setting('site_favicon')) ?>"></label>
    </div>

    <h2>Content and SEO</h2>
    <div class="grid-auto">
      <?php foreach ($fields as $key => $label): ?>
        <label class="label <?= in_array($key, ['global_meta_description','footer_text','google_analytics_code','search_console_code','custom_head_code','maintenance_message'], true) ? 'wide' : '' ?>">
          <?= e($label) ?>
          <textarea class="textarea" name="settings[<?= e($key) ?>]"><?= e(setting($key, $key === 'site_name' ? SITE_NAME : '')) ?></textarea>
        </label>
      <?php endforeach; ?>
    </div>

    <h2>Adsense slots</h2>
    <div class="grid-auto">
      <?php foreach ($ads as $row): ?>
        <label class="label wide"><?= e($row['name']) ?> ad code<textarea class="textarea" name="ads[<?= e($row['name']) ?>]"><?= e($row['code']) ?></textarea></label>
      <?php endforeach; ?>
    </div>

    <p><button class="btn-primary" type="submit">Save settings</button></p>
  </form>
</main>
<?php admin_footer(); ?>
