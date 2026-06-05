import { AdminShell } from "@/components/AdminShell";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/strings";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const [events, searches, devices] = await Promise.all([
    prisma.analyticsEvent.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.searchLog.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.analyticsEvent.groupBy({ by: ["device"], _count: true, orderBy: { _count: { device: "desc" } } }),
  ]);
  return (
    <AdminShell title="User Activity Analytics">
      <div className="grid gap-6">
        <div className="grid-auto">
          {devices.map((item) => <div className="card p-5" key={item.device || "unknown"}><p className="text-sm font-black uppercase text-[var(--accent)]">{item.device || "unknown"}</p><p className="mt-2 text-3xl font-black">{item._count}</p></div>)}
        </div>
        <section className="card overflow-hidden">
          <div className="border-b border-[var(--border)] p-5"><h2 className="text-xl font-black">Recent events</h2></div>
          {events.map((event) => (
            <div className="grid gap-1 border-b border-[var(--border)] p-4 text-sm" key={event.id}>
              <p className="font-black">{event.type} · {event.path}</p>
              <p className="muted">{event.device} · {event.referrer || "direct"} · {formatDate(event.createdAt)}</p>
            </div>
          ))}
        </section>
        <section className="card overflow-hidden">
          <div className="border-b border-[var(--border)] p-5"><h2 className="text-xl font-black">Search logs</h2></div>
          {searches.map((search) => (
            <div className="grid gap-1 border-b border-[var(--border)] p-4 text-sm" key={search.id}>
              <p className="font-black">{search.query}</p>
              <p className="muted">{search.results} results · {search.device} · {formatDate(search.createdAt)}</p>
            </div>
          ))}
        </section>
      </div>
    </AdminShell>
  );
}
