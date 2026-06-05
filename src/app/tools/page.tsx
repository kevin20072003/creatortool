import { SearchTools } from "@/components/SearchTools";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const settings = await getSettings();
  return createMetadata({ title: "All Creator Tools - CreatorTools.in", description: "Browse free YouTube, video, thumbnail, subtitle, streaming, camera, audio, SEO, and creator planning tools.", path: "/tools", settings });
}

export default async function ToolsPage() {
  const tools = await prisma.tool.findMany({ where: { status: "published" }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }], include: { category: true } });

  return (
    <main className="container py-10">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-black uppercase tracking-wide text-[var(--accent)]">All tools</p>
        <h1 className="mt-2 text-4xl font-black">Find the right creator tool</h1>
        <p className="mt-4 text-lg leading-8 muted">Search calculators and generators for video planning, YouTube publishing, subtitles, thumbnails, livestreaming, camera settings, and creator SEO.</p>
      </div>
      <SearchTools tools={tools.map((tool) => ({ name: tool.name, slug: tool.slug, description: tool.description, category: tool.category?.name, featured: tool.featured, popular: tool.popular, iconName: tool.iconName }))} />
    </main>
  );
}
