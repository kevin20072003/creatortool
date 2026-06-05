import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { siteUrl } from "@/lib/settings";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const routes: MetadataRoute.Sitemap = [
    { url: siteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: siteUrl("/tools"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: siteUrl("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: siteUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: siteUrl("/contact"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: siteUrl("/privacy-policy"), lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: siteUrl("/terms-and-conditions"), lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: siteUrl("/disclaimer"), lastModified: now, changeFrequency: "yearly", priority: 0.4 },
  ];

  try {
    const [tools, categories, posts] = await Promise.all([
      prisma.tool.findMany({ where: { status: "published" }, select: { slug: true, updatedAt: true } }),
      prisma.category.findMany({ select: { slug: true, updatedAt: true } }),
      prisma.blogPost.findMany({ where: { status: "published" }, select: { slug: true, updatedAt: true } }),
    ]);
    routes.push(...tools.map((tool) => ({ url: siteUrl(`/tools/${tool.slug}`), lastModified: tool.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })));
    routes.push(...categories.map((category) => ({ url: siteUrl(`/categories/${category.slug}`), lastModified: category.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })));
    routes.push(...posts.map((post) => ({ url: siteUrl(`/blog/${post.slug}`), lastModified: post.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })));
  } catch {}

  return routes;
}
