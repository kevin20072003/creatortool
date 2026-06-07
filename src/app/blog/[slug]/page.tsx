import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { TrackEvent } from "@/components/TrackEvent";
import { Markdown } from "@/lib/markdown";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { createMetadata, jsonLd } from "@/lib/seo";
import { formatDate } from "@/lib/strings";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const [settings, post] = await Promise.all([getSettings(), prisma.blogPost.findUnique({ where: { slug } })]);
  if (!post) return createMetadata({ settings });
  return createMetadata({ title: post.seoTitle || post.title, description: post.seoDescription || post.excerpt, path: `/blog/${post.slug}`, image: post.featuredImage, settings, type: "article" });
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await prisma.blogPost.findFirst({ where: { slug, status: "published" }, include: { category: true } });
  if (!post) notFound();

  return (
    <main className="container py-10">
      <TrackEvent type="blog_view" path={`/blog/${post.slug}`} entitySlug={post.slug} />
      {jsonLd({ "@context": "https://schema.org", "@type": "Article", headline: post.title, description: post.excerpt, datePublished: post.publishedAt, author: { "@type": "Organization", name: "CreatorTool.in" } })}
      <article className="mx-auto max-w-3xl">
        <Link className="text-sm font-black text-[var(--primary)]" href="/blog">Back to blog</Link>
        <p className="mt-6 text-sm font-black uppercase tracking-wide text-[var(--accent)]">{post.category?.name || "Creator Guide"} · {formatDate(post.publishedAt)}</p>
        <h1 className="mt-3 text-4xl font-black leading-tight md:text-5xl">{post.title}</h1>
        <p className="mt-4 text-lg leading-8 muted">{post.excerpt}</p>
        <AdSlot name="header" label="Blog header ad placeholder" />
        <div className="card p-6">
          <Markdown content={post.content} />
        </div>
        <AdSlot name="in-content" label="Blog in-content ad placeholder" />
      </article>
    </main>
  );
}
