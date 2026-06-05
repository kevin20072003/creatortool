# CreatorTools.in

Production-ready Next.js creator tools website for Hostinger Business Hosting.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS
- Prisma ORM with SQLite
- Custom cookie-based admin authentication
- Local uploads in `public/uploads`
- No Vercel, Firebase, Supabase, external CMS, external database, or paid backend

## Local Setup

```bash
npm install
npm run db:push
npm run db:seed
npm run build
npm start
```

Admin login after seed:

- Email: value of `ADMIN_EMAIL`
- Password: value of `ADMIN_PASSWORD`

## Environment

Create `.env` on Hostinger from `.env.example`:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="use-a-long-random-secret"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="change-this-password"
NEXT_PUBLIC_SITE_URL="https://creatortools.in"
```

Change `NEXTAUTH_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` before first seed.

## Hostinger Business Plan Deployment

1. Upload the project files to your Hostinger Node.js app directory.
2. In Hostinger, create a Node.js app pointing to this folder.
3. Set the Node.js version to a modern supported version, ideally Node 20+.
4. Add the environment variables from `.env.example`.
5. Run:

```bash
npm install
npm run db:push
npm run db:seed
npm run build
```

6. Set the start command:

```bash
npm start
```

7. Open `/admin`, log in, then immediately use `/admin/change-password`.

## SQLite Notes

The SQLite database is stored at `prisma/dev.db` when using `DATABASE_URL="file:./dev.db"`. Keep this file backed up. On Hostinger, do not delete it during updates.

For a first deployment, `npm run db:push` creates the SQLite schema. `npm run db:seed` creates the first admin user, categories, tools, posts, pages, ad slots, and site settings.

## Admin Features

- Dashboard stats, popular tools, recent activity, traffic chart
- Tool manager with categories, FAQs, SEO, template type, related tools, publish/draft, featured/popular, order
- Blog manager with markdown content, tags, SEO, category, featured image, publish/draft
- Category manager with SEO and icon text
- Page manager for about, contact, privacy, terms, disclaimer, and custom pages
- Adsense manager for header, in-content, sidebar, and footer code
- SEO manager for global metadata, OG image, robots, Analytics, Search Console
- Media manager with local uploads to `public/uploads`
- Activity analytics for page views, tool usage, blog views, device type, referrer, and search logs
- Settings for logo, favicon, site name, footer, social links, maintenance flag, and dark mode default

## Public Pages

- Home
- All Tools
- Tool Detail
- Category Detail
- Blog List
- Blog Detail
- About
- Contact
- Privacy Policy
- Terms and Conditions
- Disclaimer
- Sitemap page
- `sitemap.xml`
- `robots.txt`

## Adding New Tools

Use `/admin/tools`. For basic informational tools, choose `content-only`. For working tools, choose an existing calculator or generator template.

Developer workflow for new built-in tools:

1. Add the tool to `src/data/toolDefinitions.ts`.
2. If it needs a custom calculator, add logic in `src/components/ToolRunner.tsx`.
3. Run:

```bash
npm run db:push
npm run db:seed
npm run build
```

The seed script reads `src/data/toolDefinitions.ts`, so new catalog tools are added to SQLite without editing a second list.

## Updating On Hostinger

For an existing deployment, upload the changed files, keep the existing SQLite database file, then run:

```bash
npm install
npm run db:push
npm run db:seed
npm run build
npm start
```

`npm run db:push` applies the safe SQLite schema initialization and additive migration script. It does not delete existing tools, blog posts, pages, settings, analytics, or uploaded media.

## Current Upgrade Notes

- Added advanced professional video storage, bitrate, recording time, streaming bandwidth, aspect ratio, and camera crop factor calculators.
- Added reusable creator tool shell with result copy, reset, example values, formula notes, common use cases, and sticky result panels.
- Expanded the tool catalog for video, YouTube, live streaming, thumbnail, subtitle, audio, social media, and planning workflows.
- Added tool icon support, custom Adsense toggle, admin recent edit log, tool search/filter, preview links, and bulk publish/unpublish/delete.

## Video Scan Format Presets

Progressive/interlaced/PsF video standards live in:

```txt
src/lib/video/videoFormats.ts
src/lib/video/bitratePresets.ts
src/lib/video/videoCalculations.ts
```

To add another format such as `1080i 60`, add it to `videoFormatPresets` with width, height, scan type, frame rate, field rate, and effective motion rate. Interlaced formats should use true frame rate for storage estimates and field rate only for motion/field reporting.
