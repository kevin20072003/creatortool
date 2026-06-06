# CreatorTools.in PHP + MySQL Version

This folder is a Hostinger-friendly PHP/MySQL version of CreatorTools.in. Use this when you do not want the Next.js Node.js deployment.

## What To Choose In Hostinger

Choose:

**Add website -> Custom PHP/HTML website**

Do not choose WordPress, Website Builder, or Node.js Web App for this version.

## Upload Steps

1. Open Hostinger hPanel.
2. Go to **Websites -> Manage -> Databases -> MySQL Databases**.
3. Create a database, username, and password.
4. Open **File Manager -> public_html**.
5. Upload the contents inside `php-mysql-version` into `public_html`.
6. Edit `includes/config.php`.
7. Add your MySQL details:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_database_name');
define('DB_USER', 'your_database_user');
define('DB_PASS', 'your_database_password');
define('SITE_URL', 'https://creatortools.in');
define('ADMIN_EMAIL', 'your-email@example.com');
define('ADMIN_PASSWORD', 'your-strong-password');
```

8. Open this URL once:

```text
https://creatortools.in/install.php
```

9. After install completes, login here:

```text
https://creatortools.in/admin/login.php
```

10. Delete or rename `install.php` after setup.

## Admin Features

- Dashboard with tools, posts, views, and recent activity
- Tool add/edit/delete
- Category add/edit/delete
- Blog add/edit/delete
- Static page editor
- Adsense code manager
- Image upload manager
- Basic analytics stored in MySQL

## Tool Templates

When adding tools in admin, choose a template:

- `video-storage`
- `bitrate`
- `recording-time`
- `streaming-bandwidth`
- `aspect-ratio`
- `crop-factor`
- `generator`
- `description-generator`
- `hashtag-generator`
- `thumbnail-text-generator`
- `srt-formatter`
- `line-break`
- `upload-time`
- `export-helper`
- `content-only`

The frontend calculator logic is in:

```text
assets/js/tools.js
```

The shared tool form is in:

```text
tool-form.php
```

## Notes

- No Node.js is required.
- No Prisma is required.
- No external backend is required.
- MySQL is used only on your Hostinger hosting.
- Calculators run in browser JavaScript for fast loading.
