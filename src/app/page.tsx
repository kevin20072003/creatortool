import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { ToolCard } from "@/components/ToolCard";
import { prisma } from "@/lib/db";
import { getSettings, setting } from "@/lib/settings";
import { createMetadata, jsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const settings = await getSettings();
  return createMetadata({ settings, path: "/" });
}

export default async function Home() {
  const settings = await getSettings();
  const [categories, featuredTools, popularTools, posts] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { tools: true } } } }),
    prisma.tool.findMany({ where: { status: "published", featured: true }, orderBy: { sortOrder: "asc" }, take: 6, include: { category: true } }),
    prisma.tool.findMany({ where: { status: "published", popular: true }, orderBy: { sortOrder: "asc" }, take: 6, include: { category: true } }),
    prisma.blogPost.findMany({ where: { status: "published" }, orderBy: { publishedAt: "desc" }, take: 3 }),
  ]);

  return (
    <main>
      {jsonLd({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "CreatorTool.in",
        url: process.env.NEXT_PUBLIC_SITE_URL || "https://CreatorTool.in",
        potentialAction: {
          "@type": "SearchAction",
          target: `${process.env.NEXT_PUBLIC_SITE_URL || "https://CreatorTool.in"}/tools?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      })}
      <section className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="container grid gap-8 py-12 md:grid-cols-[1.1fr_0.9fr] md:py-16">
          <div className="flex flex-col justify-center">
            <p className="mb-4 text-sm font-black uppercase tracking-wide text-[var(--accent)]">Free creator calculators and generators</p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-6xl">{setting(settings, "homeHeroTitle", "CreatorTool.in")}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 muted">{setting(settings, "homeHeroSubtitle", "Fast tools for YouTubers, editors, videographers, streamers, and content creators.")}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link className="btn-primary" href="/tools">Explore all tools</Link>
              <Link className="btn-secondary" href="/blog">Read creator guides</Link>
            </div>
          </div>
          <div className="card grid gap-4 p-5">
            <label className="label">
              Quick search
              <input className="input" placeholder="Try bitrate, thumbnail, subtitle..." />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              {popularTools.slice(0, 4).map((tool) => (
                <Link className="rounded-lg border border-[var(--border)] p-4 font-bold hover:border-[var(--primary)]" href={`/tools/${tool.slug}`} key={tool.slug}>
                  {tool.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <AdSlot name="header" label="Header ad placeholder" />
      </div>

      <section className="container py-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-[var(--accent)]">Browse by category</p>
            <h2 className="mt-2 text-3xl font-black">Tool categories</h2>
          </div>
          <Link className="hidden font-black text-[var(--primary)] sm:block" href="/tools">View all</Link>
        </div>
        <div className="grid-auto">
          {categories.map((category) => (
            <Link className="card p-5 transition hover:border-[var(--primary)]" href={`/categories/${category.slug}`} key={category.slug}>
              <div className="mb-4 grid size-11 place-items-center rounded-lg bg-[var(--background)] font-black text-[var(--primary)]">{category.icon || "CT"}</div>
              <h3 className="text-lg font-black">{category.name}</h3>
              <p className="mt-2 text-sm leading-6 muted">{category.description}</p>
              <p className="mt-4 text-sm font-black text-[var(--primary)]">{category._count.tools} tools</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="container py-8">
        <div className="mb-6">
          <p className="text-sm font-black uppercase tracking-wide text-[var(--accent)]">Built for creators</p>
          <h2 className="mt-2 text-3xl font-black">Tools by workflow</h2>
        </div>
        <div className="grid-auto">
          {[
            ["For YouTubers", "Titles, descriptions, hashtags, upload checklists, thumbnails, and storage planning for every upload.", "/categories/youtube-tools"],
            ["For Editors", "Bitrate, file size, export settings, frame rate conversion, subtitles, and drive planning.", "/categories/video-calculators"],
            ["For Live Streamers", "OBS bitrate, upload speed, platform settings, audio delay, and stream recording storage.", "/categories/live-streaming-tools"],
            ["For Photographers", "Crop factor, SD card planning, daily shoot storage, and multi-camera coverage estimates.", "/categories/camera-tools"],
          ].map(([title, copy, href]) => (
            <Link className="card p-5 transition hover:-translate-y-0.5 hover:border-[var(--primary)]" href={href} key={title}>
              <h3 className="text-xl font-black">{title}</h3>
              <p className="mt-3 text-sm leading-6 muted">{copy}</p>
              <span className="mt-5 inline-block text-sm font-black text-[var(--primary)]">Open workflow →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container py-8">
        <div className="mb-6">
          <p className="text-sm font-black uppercase tracking-wide text-[var(--accent)]">Featured</p>
          <h2 className="mt-2 text-3xl font-black">Creator tools people need daily</h2>
        </div>
        <div className="grid-auto">
          {featuredTools.map((tool) => (
            <ToolCard key={tool.slug} name={tool.name} slug={tool.slug} description={tool.description} category={tool.category?.name} featured={tool.featured} popular={tool.popular} iconName={tool.iconName} />
          ))}
        </div>
      </section>

      <section className="container py-8">
        <AdSlot name="in-content" label="In-content ad placeholder" />
        <div className="mb-6">
          <p className="text-sm font-black uppercase tracking-wide text-[var(--accent)]">Popular</p>
          <h2 className="mt-2 text-3xl font-black">Popular tools</h2>
        </div>
        <div className="grid-auto">
          {popularTools.map((tool) => (
            <ToolCard key={tool.slug} name={tool.name} slug={tool.slug} description={tool.description} category={tool.category?.name} featured={tool.featured} popular={tool.popular} iconName={tool.iconName} />
          ))}
        </div>
      </section>

      <section className="container py-8">
        <div className="card grid gap-5 p-6 md:grid-cols-4">
          {[
            ["Free tools", "Use calculators and generators without paying or installing anything."],
            ["No signup", "Open a tool and get an answer immediately."],
            ["Fast on mobile", "Forms, results, and copy buttons are designed for phones too."],
            ["Creator-focused", "Every tool includes examples, formulas, FAQs, and practical use cases."],
          ].map(([title, copy]) => (
            <div key={title}>
              <h3 className="font-black">{title}</h3>
              <p className="mt-2 text-sm leading-6 muted">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container py-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-[var(--accent)]">Guides</p>
            <h2 className="mt-2 text-3xl font-black">Latest creator articles</h2>
          </div>
          <Link className="hidden font-black text-[var(--primary)] sm:block" href="/blog">View blog</Link>
        </div>
        <div className="grid-auto">
          {posts.map((post) => (
            <Link className="card p-5 transition hover:border-[var(--primary)]" href={`/blog/${post.slug}`} key={post.slug}>
              <p className="text-sm font-black text-[var(--accent)]">Creator guide</p>
              <h3 className="mt-3 text-xl font-black">{post.title}</h3>
              <p className="mt-3 text-sm leading-6 muted">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="container py-8">
        <div className="card p-6">
          <h2 className="text-2xl font-black">FAQ</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[
              ["Is CreatorTool.in free?", "Yes. The initial calculators and generators are free and run without an external backend."],
              ["Can I add more tools later?", "Yes. The admin panel supports content-only tools and tools attached to existing calculator or generator templates."],
              ["Does it support Adsense?", "Yes. You can paste ad slot code from the admin panel. Empty slots show placeholders."],
              ["Where is data stored?", "Tools, posts, pages, settings, users, media records, and analytics are stored in local SQLite."],
            ].map(([q, a]) => (
              <details className="rounded-lg border border-[var(--border)] p-4" key={q}>
                <summary className="cursor-pointer font-black">{q}</summary>
                <p className="mt-3 text-sm leading-6 muted">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
