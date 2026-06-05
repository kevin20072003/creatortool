import { notFound } from "next/navigation";
import { ToolCard } from "@/components/ToolCard";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { createMetadata, jsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const [settings, category] = await Promise.all([getSettings(), prisma.category.findUnique({ where: { slug } })]);
  if (!category) return createMetadata({ settings });
  return createMetadata({ title: category.seoTitle || category.name, description: category.seoDescription || category.description, path: `/categories/${category.slug}`, settings });
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    include: { tools: { where: { status: "published" }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] } },
  });
  if (!category) notFound();

  return (
    <main className="container py-10">
      {jsonLd({ "@context": "https://schema.org", "@type": "CollectionPage", name: category.name, description: category.description })}
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-black uppercase tracking-wide text-[var(--accent)]">Category</p>
        <h1 className="mt-2 text-4xl font-black">{category.name}</h1>
        <p className="mt-4 text-lg leading-8 muted">{category.description}</p>
      </div>
      <div className="grid-auto">
        {category.tools.map((tool) => (
          <ToolCard key={tool.slug} name={tool.name} slug={tool.slug} description={tool.description} category={category.name} featured={tool.featured} popular={tool.popular} iconName={tool.iconName} />
        ))}
      </div>
    </main>
  );
}
