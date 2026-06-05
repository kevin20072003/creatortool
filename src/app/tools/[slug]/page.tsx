import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { ToolRunner } from "@/components/ToolRunner";
import { TrackEvent } from "@/components/TrackEvent";
import { ToolCard } from "@/components/ToolCard";
import { IconBadge } from "@/components/ui/IconBadge";
import { Markdown } from "@/lib/markdown";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { createMetadata, jsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const [settings, tool] = await Promise.all([getSettings(), prisma.tool.findUnique({ where: { slug } })]);
  if (!tool) return createMetadata({ settings });
  return createMetadata({ title: tool.seoTitle || tool.name, description: tool.seoDescription || tool.description, path: `/tools/${tool.slug}`, image: tool.featuredImage, settings });
}

export default async function ToolDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const tool = await prisma.tool.findFirst({
    where: { slug, status: "published" },
    include: {
      category: true,
      faqs: { orderBy: { sortOrder: "asc" } },
      relatedFrom: { include: { relatedTool: { include: { category: true } } }, take: 6 },
    },
  });

  if (!tool) notFound();
  const related = tool.relatedFrom.map((item) => item.relatedTool).filter((item) => item.status === "published");

  return (
    <main className="container py-10">
      <TrackEvent type="page_view" path={`/tools/${tool.slug}`} entitySlug={tool.slug} />
      {jsonLd({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: tool.name,
        applicationCategory: "CreatorTool",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
      })}
      <div className="mb-8 card hero-tool p-5 md:p-7">
        <div className="mb-5 flex flex-wrap items-center gap-2 text-sm font-bold muted">
          <Link className="hover:text-[var(--primary)]" href="/">Home</Link>
          <span>/</span>
          <Link className="hover:text-[var(--primary)]" href="/tools">Tools</Link>
          <span>/</span>
          {tool.category ? <Link className="hover:text-[var(--primary)]" href={`/categories/${tool.category.slug}`}>{tool.category.name}</Link> : <span>Creator Tool</span>}
        </div>
        <div className="flex flex-col gap-5 md:flex-row md:items-start">
          <IconBadge name={tool.iconName} label={tool.name} className="!size-14" />
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-[var(--accent)]">{tool.category?.name || "Creator Tool"}</p>
            <h1 className="mt-2 max-w-4xl text-4xl font-black leading-tight md:text-5xl">{tool.name}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 muted">{tool.description}</p>
          </div>
        </div>
      </div>
      <AdSlot name="header" label="Tool header ad placeholder" />
      <section className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="grid gap-8">
          <ToolRunner templateType={tool.templateType} toolName={tool.name} />
          <AdSlot name="in-content" label="Tool in-content ad placeholder" />
          <div className="card p-6">
            <Markdown content={tool.content} />
          </div>
          <div className="card p-6">
            <h2 className="text-2xl font-black">FAQ</h2>
            <div className="mt-4 grid gap-3">
              {tool.faqs.map((faq) => (
                <details className="rounded-lg border border-[var(--border)] p-4" key={faq.id}>
                  <summary className="cursor-pointer font-black">{faq.question}</summary>
                  <p className="mt-3 text-sm leading-6 muted">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
        <aside>
          <AdSlot name="sidebar" label="Sidebar ad placeholder" />
          <div className="card mt-6 p-5">
            <h2 className="text-xl font-black">Related tools</h2>
            <div className="mt-4 grid gap-3">
              {related.map((item) => (
                <Link className="rounded-lg border border-[var(--border)] p-3 font-bold hover:border-[var(--primary)]" href={`/tools/${item.slug}`} key={item.id}>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </section>
      {related.length ? (
        <section className="mt-10">
          <h2 className="mb-5 text-2xl font-black">More creator tools</h2>
          <div className="grid-auto">
            {related.slice(0, 3).map((item) => (
              <ToolCard key={item.slug} name={item.name} slug={item.slug} description={item.description} category={item.category?.name} featured={item.featured} popular={item.popular} iconName={item.iconName} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
