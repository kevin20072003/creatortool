import { notFound } from "next/navigation";
import { Markdown } from "@/lib/markdown";
import { prisma } from "@/lib/db";

export async function DbPage({ slug }: { slug: string }) {
  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page) notFound();
  return (
    <main className="container py-10">
      <article className="card mx-auto max-w-3xl p-6 md:p-8">
        <Markdown content={page.content} />
      </article>
    </main>
  );
}
