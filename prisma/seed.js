const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

const categories = [
  ["YouTube Tools", "youtube-tools", "Tools for planning, optimizing, and publishing YouTube videos.", "YT"],
  ["Video Calculators", "video-calculators", "Storage, bitrate, and recording calculators for creators.", "VC"],
  ["Thumbnail Tools", "thumbnail-tools", "Simple helpers for better thumbnail ideas and copy.", "TH"],
  ["Subtitle Tools", "subtitle-tools", "Format captions, clean text, and prepare readable subtitles.", "ST"],
  ["Live Streaming Tools", "live-streaming-tools", "Bandwidth and stream planning tools for OBS and live platforms.", "LS"],
  ["Camera Tools", "camera-tools", "Camera planning calculators for lenses, crop factors, and field use.", "CA"],
  ["Audio Tools", "audio-tools", "Audio helpers for video, podcasting, and streaming workflows.", "AU"],
  ["Social Media Tools", "social-media-tools", "Reusable tools for posts, hashtags, and creator promotion.", "SM"],
  ["SEO Tools", "seo-tools", "Search and metadata utilities for better discoverability.", "SE"],
  ["Content Planning Tools", "content-planning-tools", "Planning helpers for scripts, titles, briefs, and uploads.", "CP"],
];

function loadToolDefinitions() {
  const file = fs.readFileSync(path.join(process.cwd(), "src", "data", "toolDefinitions.ts"), "utf8");
  const rows = [];
  const regex = /t\("([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)"(?:,\s*(true|false))?(?:,\s*(true|false))?\)/g;
  let match;
  while ((match = regex.exec(file))) {
    rows.push({
      name: match[1],
      slug: match[2],
      categorySlug: match[3],
      templateType: match[4],
      iconName: match[5],
      description: match[6],
      featured: match[7] === "true",
      popular: match[8] === "true",
    });
  }
  return rows;
}

const tools = loadToolDefinitions();

const blogTitles = [
  "How to Calculate Video File Size",
  "Best Bitrate Settings for YouTube Videos",
  "How Much Storage Do You Need for 4K Video",
  "Best Free Tools for YouTubers",
  "How to Write Better YouTube Titles",
  "How to Create Better YouTube Thumbnails",
  "Best OBS Settings for Live Streaming",
  "How to Plan a YouTube Video Script",
  "Best Tools for Video Editors",
  "How to Choose SD Card Storage for Video Recording",
];

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function article(title) {
  return `# ${title}

Creators make better decisions when the numbers are simple. This guide explains the practical basics, common mistakes, and a creator-friendly workflow you can use before recording, editing, or uploading your next video.

## Why it matters

Good planning saves storage space, upload time, and rework. Whether you shoot YouTube videos, livestream, edit client projects, or prepare social clips, knowing the right settings helps your video look clean without wasting resources.

## Practical workflow

Start with the platform or delivery goal, then choose resolution, frame rate, bitrate, storage, and export format. Use the calculators on CreatorTools.in to check the numbers before you record or publish.

## Quick example

If a creator records long 4K footage at a high bitrate, storage fills quickly. Reducing bitrate slightly or choosing a more efficient codec can save many gigabytes while keeping visible quality high.

## Final tip

Keep a simple checklist for every project: resolution, frame rate, bitrate, audio, storage, backup, thumbnail, title, description, and tags.`;
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "change-this-password";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: { email: adminEmail, name: "CreatorTools Admin", passwordHash },
  });

  for (let i = 0; i < categories.length; i++) {
    const [name, slug, description, icon] = categories[i];
    await prisma.category.upsert({
      where: { slug },
      update: { name, description, icon, sortOrder: i },
      create: {
        name,
        slug,
        description,
        icon,
        sortOrder: i,
        seoTitle: `${name} - CreatorTools.in`,
        seoDescription: description,
      },
    });
  }

  for (let i = 0; i < tools.length; i++) {
    const { name, slug, categorySlug, description, templateType, featured, popular, iconName } = tools[i];
    const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
    const content = `## What is this tool?

${description} It is built for YouTubers, editors, videographers, live streamers, and creators who need fast answers without opening a spreadsheet.

## How to use

Enter your values, check the result, and use the explanation on the page to adjust your recording, editing, or publishing workflow.

## Example

Use this tool before a shoot, stream, or upload to avoid storage surprises and choose settings with more confidence.`;

    const tool = await prisma.tool.upsert({
      where: { slug },
      update: {
        name,
        description,
        content,
        templateType,
        status: "published",
        featured,
        popular,
        iconName,
        sortOrder: i,
        categoryId: category ? category.id : null,
        seoTitle: `${name} - Free Creator Tool`,
        seoDescription: description,
        keywords: `${name}, YouTube tool, creator tool, video tool`,
      },
      create: {
        name,
        slug,
        description,
        content,
        templateType,
        status: "published",
        featured,
        popular,
        iconName,
        sortOrder: i,
        categoryId: category ? category.id : null,
        seoTitle: `${name} - Free Creator Tool`,
        seoDescription: description,
        keywords: `${name}, YouTube tool, creator tool, video tool`,
      },
    });

    await prisma.fAQ.deleteMany({ where: { toolId: tool.id } });
    await prisma.fAQ.createMany({
      data: [
        { toolId: tool.id, question: `Is the ${name} free?`, answer: "Yes. The tool is free to use and runs in your browser.", sortOrder: 0 },
        { toolId: tool.id, question: "Can I use this on mobile?", answer: "Yes. The interface is responsive and works on phones, tablets, and desktop screens.", sortOrder: 1 },
        { toolId: tool.id, question: "Are the results exact?", answer: "The calculators use standard formulas. Real-world results may vary based on codec, container, compression, and platform settings.", sortOrder: 2 },
      ],
    });
  }

  const seededTools = await prisma.tool.findMany({ orderBy: { sortOrder: "asc" } });
  for (const tool of seededTools) {
    const related = seededTools.filter((item) => item.id !== tool.id).slice(0, 3);
    for (const item of related) {
      await prisma.toolRelation.upsert({
        where: { sourceToolId_relatedToolId: { sourceToolId: tool.id, relatedToolId: item.id } },
        update: {},
        create: { sourceToolId: tool.id, relatedToolId: item.id },
      });
    }
  }

  const blogCategory = await prisma.category.findUnique({ where: { slug: "youtube-tools" } });
  for (const title of blogTitles) {
    const slug = slugify(title);
    await prisma.blogPost.upsert({
      where: { slug },
      update: {
        title,
        excerpt: `${title} with practical settings, examples, and creator-friendly tips.`,
        content: article(title),
        status: "published",
        publishedAt: new Date(),
        categoryId: blogCategory ? blogCategory.id : null,
        seoTitle: `${title} - CreatorTools.in`,
        seoDescription: `${title} explained with simple examples for creators.`,
        tags: "YouTube, video, creator tools",
      },
      create: {
        title,
        slug,
        excerpt: `${title} with practical settings, examples, and creator-friendly tips.`,
        content: article(title),
        status: "published",
        publishedAt: new Date(),
        categoryId: blogCategory ? blogCategory.id : null,
        seoTitle: `${title} - CreatorTools.in`,
        seoDescription: `${title} explained with simple examples for creators.`,
        tags: "YouTube, video, creator tools",
      },
    });
  }

  const pages = [
    ["About", "about", "# About CreatorTools.in\n\nCreatorTools.in helps YouTubers, editors, videographers, streamers, and creators solve everyday production problems quickly. The site focuses on useful calculators, generators, and guides that make video planning easier."],
    ["Contact", "contact", "# Contact\n\nFor support, partnerships, or tool suggestions, email the CreatorTools.in team. You can update this contact content from the admin Page Manager."],
    ["Privacy Policy", "privacy-policy", "# Privacy Policy\n\nCreatorTools.in stores basic analytics such as page views, tool usage, search queries, referrers, and device type to improve the website. No third-party analytics service is required by default."],
    ["Terms and Conditions", "terms-and-conditions", "# Terms and Conditions\n\nUse CreatorTools.in for planning and educational purposes. Results are estimates and should be checked against your camera, editing software, and platform settings."],
    ["Disclaimer", "disclaimer", "# Disclaimer\n\nCalculator results are based on standard formulas and common assumptions. Actual file size, bitrate, bandwidth, and recording time can vary by codec, container, device, and platform."],
  ];

  for (const [title, slug, content] of pages) {
    await prisma.page.upsert({
      where: { slug },
      update: { title, content, seoTitle: `${title} - CreatorTools.in`, seoDescription: `${title} for CreatorTools.in.` },
      create: { title, slug, content, seoTitle: `${title} - CreatorTools.in`, seoDescription: `${title} for CreatorTools.in.` },
    });
  }

  const settings = {
    siteName: "CreatorTools.in",
    siteLogo: "",
    siteFavicon: "",
    adminEmail,
    footerText: "Free creator tools for YouTubers, editors, videographers, and streamers.",
    socialLinks: "https://youtube.com/, https://instagram.com/, https://x.com/",
    maintenanceMode: "false",
    darkModeDefault: "false",
    globalTitle: "CreatorTools.in - Free Tools for YouTubers and Video Creators",
    globalDescription: "Fast creator tools for YouTubers, editors, videographers, streamers, and content creators.",
    ogImage: "",
    robots: "index,follow",
    googleAnalytics: "",
    searchConsole: "",
    homeHeroTitle: "CreatorTools.in",
    homeHeroSubtitle: "Fast calculators and generators for YouTubers, editors, videographers, live streamers, and content creators.",
  };

  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value, group: ["globalTitle", "globalDescription", "ogImage", "robots", "googleAnalytics", "searchConsole"].includes(key) ? "seo" : "general" },
    });
  }

  for (const name of ["header", "in-content", "sidebar", "footer"]) {
    await prisma.adSlot.upsert({
      where: { name },
      update: {},
      create: { name, code: "", enabled: true },
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
