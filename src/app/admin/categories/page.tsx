import { AdminShell } from "@/components/AdminShell";
import { prisma } from "@/lib/db";
import { deleteCategoryAction, saveCategoryAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const params = await searchParams;
  const editId = Number(params.edit || 0);
  const [categories, editCategory] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], include: { _count: { select: { tools: true } } } }),
    editId ? prisma.category.findUnique({ where: { id: editId } }) : null,
  ]);
  return (
    <AdminShell title="Category Manager">
      <div className="grid gap-6">
        <form action={saveCategoryAction} className="card grid gap-4 p-5">
          <h2 className="text-xl font-black">{editCategory ? "Edit category" : "Add category"}</h2>
          <input type="hidden" name="id" value={editCategory?.id || ""} />
          <div className="grid gap-4 md:grid-cols-2">
            <label className="label">Name<input className="input" name="name" defaultValue={editCategory?.name} required /></label>
            <label className="label">Slug<input className="input" name="slug" defaultValue={editCategory?.slug} /></label>
            <label className="label">Icon text<input className="input" name="icon" defaultValue={editCategory?.icon || ""} /></label>
            <label className="label">Order<input className="input" name="sortOrder" defaultValue={editCategory?.sortOrder || 0} /></label>
            <label className="label md:col-span-2">Description<textarea className="textarea" name="description" defaultValue={editCategory?.description || ""} /></label>
            <label className="label">SEO title<input className="input" name="seoTitle" defaultValue={editCategory?.seoTitle || ""} /></label>
            <label className="label">SEO description<input className="input" name="seoDescription" defaultValue={editCategory?.seoDescription || ""} /></label>
          </div>
          <button className="btn-primary w-fit" type="submit">Save category</button>
        </form>
        <div className="card overflow-hidden">
          {categories.map((category) => (
            <div className="grid gap-3 border-b border-[var(--border)] p-4 md:grid-cols-[1fr_auto] md:items-center" key={category.id}>
              <div><p className="font-black">{category.name}</p><p className="text-sm muted">{category._count.tools} tools</p></div>
              <div className="flex gap-2">
                <a className="btn-secondary !min-h-10" href={`/admin/categories?edit=${category.id}`}>Edit</a>
                <form action={deleteCategoryAction}><input type="hidden" name="id" value={category.id} /><button className="btn-danger !min-h-10" type="submit">Delete</button></form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
