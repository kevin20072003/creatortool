import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "@/app/admin/actions";

const nav = [
  ["Dashboard", "/admin/dashboard"],
  ["Tools", "/admin/tools"],
  ["Blog", "/admin/blog"],
  ["Categories", "/admin/categories"],
  ["Pages", "/admin/pages"],
  ["Adsense", "/admin/adsense"],
  ["SEO", "/admin/seo"],
  ["Media", "/admin/media"],
  ["Activity", "/admin/activity"],
  ["Settings", "/admin/settings"],
  ["Password", "/admin/change-password"],
];

export async function AdminShell({ title, children }: { title: string; children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <main className="container py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-[var(--accent)]">Admin panel</p>
          <h1 className="text-3xl font-black">{title}</h1>
          <p className="mt-1 text-sm muted">{user.email}</p>
        </div>
        <form action={logoutAction}>
          <button className="btn-secondary" type="submit">Logout</button>
        </form>
      </div>
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="card h-fit p-3">
          <nav className="grid gap-1 text-sm font-bold">
            {nav.map(([label, href]) => (
              <Link className="rounded-lg px-3 py-2 hover:bg-[var(--background)]" href={href} key={href}>
                {label}
              </Link>
            ))}
          </nav>
        </aside>
        <section className="min-w-0">{children}</section>
      </div>
    </main>
  );
}
