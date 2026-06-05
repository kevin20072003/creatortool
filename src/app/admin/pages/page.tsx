import { AdminShell } from "@/components/AdminShell";
import { prisma } from "@/lib/db";
import { deletePageAction, savePageAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const params = await searchParams;
  const editId = Number(params.edit || 0);
  const [pages, editPage] = await Promise.all([
    prisma.page.findMany({ orderBy: { title: "asc" } }),
    editId ? prisma.page.findUnique({ where: { id: editId } }) : null,
  ]);
  return (
    <AdminShell title="Page Manager">
      <div className="grid gap-6">
        <form action={savePageAction} className="card grid gap-4 p-5">
          <h2 className="text-xl font-black">{editPage ? "Edit page" : "Add page"}</h2>
          <input type="hidden" name="id" value={editPage?.id || ""} />
          <div className="grid gap-4 md:grid-cols-2">
            <label className="label">Title<input className="input" name="title" defaultValue={editPage?.title} required /></label>
            <label className="label">Slug<input className="input" name="slug" defaultValue={editPage?.slug} /></label>
            <label className="label md:col-span-2">Content<textarea className="textarea min-h-96" name="content" defaultValue={editPage?.content} required /></label>
            <label className="label">SEO title<input className="input" name="seoTitle" defaultValue={editPage?.seoTitle || ""} /></label>
            <label className="label">SEO description<input className="input" name="seoDescription" defaultValue={editPage?.seoDescription || ""} /></label>
          </div>
          <button className="btn-primary w-fit" type="submit">Save page</button>
        </form>
        <div className="card overflow-hidden">
          {pages.map((page) => (
            <div className="grid gap-3 border-b border-[var(--border)] p-4 md:grid-cols-[1fr_auto] md:items-center" key={page.id}>
              <div><p className="font-black">{page.title}</p><p className="text-sm muted">/{page.slug}</p></div>
              <div className="flex gap-2">
                <a className="btn-secondary !min-h-10" href={`/admin/pages?edit=${page.id}`}>Edit</a>
                <form action={deletePageAction}><input type="hidden" name="id" value={page.id} /><button className="btn-danger !min-h-10" type="submit">Delete</button></form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
