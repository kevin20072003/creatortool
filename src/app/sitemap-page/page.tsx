import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return createMetadata({ title: "Sitemap - CreatorTool.in", path: "/sitemap-page", settings: await getSettings() });
}

export default async function SitemapPage() {
  const [tools, categories, posts] = await Promise.all([
    prisma.tool.findMany({ where: { status: "published" }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.blogPost.findMany({ where: { status: "published" }, orderBy: { title: "asc" } }),
  ]);
  const staticPages = [
    ["Home", "/"],
    ["All Tools", "/tools"],
    ["Blog", "/blog"],
    ["About", "/about"],
    ["Contact", "/contact"],
    ["Privacy Policy", "/privacy-policy"],
    ["Terms and Conditions", "/terms-and-conditions"],
    ["Disclaimer", "/disclaimer"],
  ];

  return (
    <main className="container py-10">
      <h1 className="mb-8 text-4xl font-black">Sitemap</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <LinkList title="Pages" items={staticPages} />
        <LinkList title="Categories" items={categories.map((item) => [item.name, `/categories/${item.slug}`])} />
        <LinkList title="Tools" items={tools.map((item) => [item.name, `/tools/${item.slug}`])} />
        <LinkList title="Blog posts" items={posts.map((item) => [item.title, `/blog/${item.slug}`])} />
      </div>
    </main>
  );
}

function LinkList({ title, items }: { title: string; items: string[][] }) {
  return (
    <section className="card p-5">
      <h2 className="mb-4 text-xl font-black">{title}</h2>
      <div className="grid gap-2 text-sm muted">
        {items.map(([label, href]) => <Link className="hover:text-[var(--primary)]" href={href} key={href}>{label}</Link>)}
      </div>
    </section>
  );
}
