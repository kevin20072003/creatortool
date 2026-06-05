import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [totalTools, publishedTools, draftTools, totalPosts, totalViews, popularTools, recentActivity, lastSearches, daily] = await Promise.all([
    prisma.tool.count(),
    prisma.tool.count({ where: { status: "published" } }),
    prisma.tool.count({ where: { status: "draft" } }),
    prisma.blogPost.count(),
    prisma.analyticsEvent.count({ where: { type: "page_view" } }),
    prisma.analyticsEvent.groupBy({ by: ["entitySlug"], where: { type: "tool_usage", entitySlug: { not: null } }, _count: true, orderBy: { _count: { entitySlug: "desc" } }, take: 6 }),
    prisma.analyticsEvent.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.searchLog.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.analyticsEvent.findMany({ where: { type: "page_view" }, orderBy: { createdAt: "desc" }, take: 80 }),
  ]);

  const byDay = new Map<string, number>();
  for (const event of daily) {
    const key = event.createdAt.toISOString().slice(5, 10);
    byDay.set(key, (byDay.get(key) || 0) + 1);
  }
  const max = Math.max(1, ...byDay.values());

  return (
    <AdminShell title="Dashboard">
      <div className="grid gap-6">
        <div className="grid-auto">
          <Stat label="Total tools" value={totalTools} />
          <Stat label="Published tools" value={publishedTools} />
          <Stat label="Draft tools" value={draftTools} />
          <Stat label="Blog posts" value={totalPosts} />
          <Stat label="Page views" value={totalViews} />
        </div>
        <div className="card p-5">
          <h2 className="mb-4 text-xl font-black">Basic traffic chart</h2>
          <div className="flex h-44 items-end gap-2 border-b border-[var(--border)]">
            {[...byDay.entries()].reverse().map(([day, count]) => (
              <div className="grid flex-1 gap-2 text-center text-xs muted" key={day}>
                <div className="rounded-t bg-[var(--primary)]" style={{ height: `${Math.max(8, (count / max) * 150)}px` }} />
                {day}
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="Popular tools">
            {popularTools.map((item) => <p key={item.entitySlug} className="rounded-lg bg-[var(--background)] p-3">{item.entitySlug}: {item._count}</p>)}
          </Panel>
          <Panel title="Recent activity">
            {recentActivity.map((item) => <p key={item.id} className="rounded-lg bg-[var(--background)] p-3">{item.type} on {item.path}</p>)}
          </Panel>
          <Panel title="Search queries">
            {lastSearches.map((item) => <p key={item.id} className="rounded-lg bg-[var(--background)] p-3">{item.query} ({item.results})</p>)}
          </Panel>
        </div>
        <Link className="btn-primary w-fit" href="/admin/tools">Manage tools</Link>
      </div>
    </AdminShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="card p-5"><p className="text-sm font-black uppercase tracking-wide text-[var(--accent)]">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="card grid gap-3 p-5"><h2 className="text-xl font-black">{title}</h2><div className="grid gap-2 text-sm">{children}</div></section>;
}
