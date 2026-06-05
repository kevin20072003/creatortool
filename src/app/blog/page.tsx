import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { createMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/strings";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const settings = await getSettings();
  return createMetadata({ title: "Creator Blog - CreatorTools.in", description: "Useful video, YouTube, streaming, thumbnail, bitrate, storage, and creator workflow guides.", path: "/blog", settings, type: "article" });
}

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({ where: { status: "published" }, orderBy: { publishedAt: "desc" }, include: { category: true } });

  return (
    <main className="container py-10">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-black uppercase tracking-wide text-[var(--accent)]">Creator guides</p>
        <h1 className="mt-2 text-4xl font-black">Blog</h1>
        <p className="mt-4 text-lg leading-8 muted">Practical, SEO-friendly guides for creators who want better videos, cleaner workflows, and smarter publishing decisions.</p>
      </div>
      <div className="grid gap-5">
        {posts.map((post) => (
          <Link className="card grid gap-3 p-5 transition hover:border-[var(--primary)]" href={`/blog/${post.slug}`} key={post.slug}>
            <div className="flex flex-wrap gap-3 text-sm font-bold muted">
              <span>{post.category?.name || "Creator Guide"}</span>
              <span>{formatDate(post.publishedAt)}</span>
            </div>
            <h2 className="text-2xl font-black">{post.title}</h2>
            <p className="leading-7 muted">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
