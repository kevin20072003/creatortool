import { AdminShell } from "@/components/AdminShell";
import { prisma } from "@/lib/db";
import { deleteBlogAction, saveBlogAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const params = await searchParams;
  const editId = Number(params.edit || 0);
  const [posts, categories, editPost] = await Promise.all([
    prisma.blogPost.findMany({ orderBy: { createdAt: "desc" }, include: { category: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    editId ? prisma.blogPost.findUnique({ where: { id: editId } }) : null,
  ]);
  return (
    <AdminShell title="Blog Manager">
      <div className="grid gap-6">
        <form action={saveBlogAction} className="card grid gap-4 p-5">
          <h2 className="text-xl font-black">{editPost ? "Edit post" : "Add post"}</h2>
          <input type="hidden" name="id" value={editPost?.id || ""} />
          <div className="grid gap-4 md:grid-cols-2">
            <label className="label">Title<input className="input" name="title" defaultValue={editPost?.title} required /></label>
            <label className="label">Slug<input className="input" name="slug" defaultValue={editPost?.slug} /></label>
            <label className="label">Status<select className="select" name="status" defaultValue={editPost?.status || "draft"}><option>draft</option><option>published</option></select></label>
            <label className="label">Blog category<select className="select" name="categoryId" defaultValue={editPost?.categoryId || ""}><option value="">No category</option>{categories.map((c) => <option value={c.id} key={c.id}>{c.name}</option>)}</select></label>
            <label className="label md:col-span-2">Excerpt<textarea className="textarea" name="excerpt" defaultValue={editPost?.excerpt} required /></label>
            <label className="label md:col-span-2">Markdown content<textarea className="textarea min-h-96" name="content" defaultValue={editPost?.content} required /></label>
            <label className="label">Featured image URL<input className="input" name="featuredImage" defaultValue={editPost?.featuredImage || ""} /></label>
            <label className="label">Tags<input className="input" name="tags" defaultValue={editPost?.tags || ""} /></label>
            <label className="label">SEO title<input className="input" name="seoTitle" defaultValue={editPost?.seoTitle || ""} /></label>
            <label className="label">SEO description<input className="input" name="seoDescription" defaultValue={editPost?.seoDescription || ""} /></label>
          </div>
          <button className="btn-primary w-fit" type="submit">{editPost ? "Save post" : "Create post"}</button>
        </form>
        <List items={posts} />
      </div>
    </AdminShell>
  );
}

function List({ items }: { items: Awaited<ReturnType<typeof prisma.blogPost.findMany>> }) {
  return (
    <div className="card overflow-hidden">
      <div className="border-b border-[var(--border)] p-5"><h2 className="text-xl font-black">Posts</h2></div>
      {items.map((post) => (
        <div className="grid gap-3 border-b border-[var(--border)] p-4 md:grid-cols-[1fr_auto] md:items-center" key={post.id}>
          <div><p className="font-black">{post.title}</p><p className="text-sm muted">{post.status}</p></div>
          <div className="flex gap-2">
            <a className="btn-secondary !min-h-10" href={`/admin/blog?edit=${post.id}`}>Edit</a>
            <form action={deleteBlogAction}><input type="hidden" name="id" value={post.id} /><button className="btn-danger !min-h-10" type="submit">Delete</button></form>
          </div>
        </div>
      ))}
    </div>
  );
}
