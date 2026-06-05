import { AdminShell } from "@/components/AdminShell";
import { prisma } from "@/lib/db";
import { statuses, toolTemplates } from "@/lib/constants";
import { bulkToolAction, deleteToolAction, saveToolAction } from "../actions";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ edit?: string; q?: string; status?: string }> };

export default async function AdminToolsPage({ searchParams }: Props) {
  const params = await searchParams;
  const editId = Number(params.edit || 0);
  const q = params.q || "";
  const status = params.status || "";
  const [tools, categories, editTool, recentLogs] = await Promise.all([
    prisma.tool.findMany({
      where: {
        status: status || undefined,
        OR: q ? [{ name: { contains: q } }, { slug: { contains: q } }, { description: { contains: q } }] : undefined,
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { category: true },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    editId ? prisma.tool.findUnique({ where: { id: editId }, include: { faqs: { orderBy: { sortOrder: "asc" } }, relatedFrom: true } }) : null,
    prisma.adminLog.findMany({ where: { entity: "Tool" }, orderBy: { createdAt: "desc" }, take: 5 }).catch(() => []),
  ]);

  return (
    <AdminShell title="Tool Manager">
      <div className="grid gap-6">
        <form action={saveToolAction} className="card grid gap-4 p-5">
          <h2 className="text-xl font-black">{editTool ? "Edit tool" : "Add tool"}</h2>
          <input type="hidden" name="id" value={editTool?.id || ""} />
          <div className="grid gap-4 md:grid-cols-2">
            <label className="label">Tool name<input className="input" name="name" defaultValue={editTool?.name} required /></label>
            <label className="label">Slug<input className="input" name="slug" defaultValue={editTool?.slug} placeholder="auto-from-name" /></label>
            <label className="label md:col-span-2">Short description<textarea className="textarea" name="description" defaultValue={editTool?.description} required /></label>
            <label className="label">Category<select className="select" name="categoryId" defaultValue={editTool?.categoryId || ""}><option value="">No category</option>{categories.map((c) => <option value={c.id} key={c.id}>{c.name}</option>)}</select></label>
            <label className="label">Calculator template<select className="select" name="templateType" defaultValue={editTool?.templateType || "content-only"}>{toolTemplates.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="label">Status<select className="select" name="status" defaultValue={editTool?.status || "draft"}>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="label">Order<input className="input" name="sortOrder" defaultValue={editTool?.sortOrder || 0} inputMode="numeric" /></label>
            <label className="label">Icon name<input className="input" name="iconName" defaultValue={editTool?.iconName || ""} placeholder="Camera, HardDrive, Sparkles" /></label>
            <label className="label">Featured image URL<input className="input" name="featuredImage" defaultValue={editTool?.featuredImage || ""} /></label>
            <label className="label">Related tool IDs<input className="input" name="relatedTools" defaultValue={editTool?.relatedFrom.map((r) => r.relatedToolId).join(", ") || ""} placeholder="1, 2, 3" /></label>
            <label className="label">Default video format preset<input className="input" name="videoFormatPreset" defaultValue={editTool?.videoFormatPreset || ""} placeholder="1080p-50, 1080i-50, 2160p-60" /></label>
            <label className="label">Default scan type<select className="select" name="scanType" defaultValue={editTool?.scanType || ""}><option value="">Use template default</option><option value="progressive">progressive</option><option value="interlaced">interlaced</option><option value="psf">psf</option></select></label>
            <label className="label">Default frame rate<input className="input" name="frameRate" defaultValue={editTool?.frameRate || ""} inputMode="decimal" placeholder="25, 29.97, 50" /></label>
            <label className="label">Default field rate<input className="input" name="fieldRate" defaultValue={editTool?.fieldRate || ""} inputMode="decimal" placeholder="50, 59.94" /></label>
            <label className="label md:col-span-2">Full SEO content<textarea className="textarea min-h-72" name="content" defaultValue={editTool?.content} /></label>
            <label className="label md:col-span-2">FAQs, one per line: question | answer<textarea className="textarea" name="faqs" defaultValue={editTool?.faqs.map((f) => `${f.question} | ${f.answer}`).join("\n") || ""} /></label>
            <label className="label">SEO title<input className="input" name="seoTitle" defaultValue={editTool?.seoTitle || ""} /></label>
            <label className="label">SEO description<input className="input" name="seoDescription" defaultValue={editTool?.seoDescription || ""} /></label>
            <label className="label md:col-span-2">SEO keywords<input className="input" name="keywords" defaultValue={editTool?.keywords || ""} /></label>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 font-bold"><input type="checkbox" name="featured" defaultChecked={editTool?.featured} /> Featured</label>
            <label className="flex items-center gap-2 font-bold"><input type="checkbox" name="popular" defaultChecked={editTool?.popular} /> Popular</label>
            <label className="flex items-center gap-2 font-bold"><input type="checkbox" name="customAds" defaultChecked={editTool?.customAds} /> Custom Adsense placement</label>
            <label className="flex items-center gap-2 font-bold"><input type="checkbox" name="interlaceWarnings" defaultChecked={editTool?.interlaceWarnings ?? true} /> Interlace warnings</label>
            <label className="flex items-center gap-2 font-bold"><input type="checkbox" name="onlineDeliveryRecommendation" defaultChecked={editTool?.onlineDeliveryRecommendation ?? true} /> Online delivery recommendation</label>
          </div>
          <button className="btn-primary w-fit" type="submit">{editTool ? "Save tool" : "Create tool"}</button>
        </form>

        <div className="card overflow-hidden">
          <div className="grid gap-4 border-b border-[var(--border)] p-5 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <h2 className="text-xl font-black">Existing tools</h2>
              <p className="mt-1 text-sm muted">Search, filter, preview, and bulk manage published or draft tools.</p>
            </div>
            <form className="flex flex-wrap gap-2">
              <input className="input !w-56" name="q" defaultValue={q} placeholder="Search tools..." />
              <select className="select !w-36" name="status" defaultValue={status}><option value="">All</option><option>draft</option><option>published</option></select>
              <button className="btn-secondary" type="submit">Filter</button>
            </form>
          </div>
          <form id="bulk-tools" action={bulkToolAction} />
          <div>
            <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] p-4">
              <select className="select !w-44" name="bulkAction" defaultValue="publish" form="bulk-tools"><option value="publish">Publish</option><option value="unpublish">Unpublish</option><option value="delete">Delete</option></select>
              <button className="btn-secondary" type="submit" form="bulk-tools">Apply to selected</button>
            </div>
            <div className="grid">
              {tools.length ? tools.map((tool) => (
                <div className="grid gap-3 border-b border-[var(--border)] p-4 md:grid-cols-[32px_1fr_auto] md:items-center" key={tool.id}>
                  <input type="checkbox" name="toolIds" value={tool.id} form="bulk-tools" aria-label={`Select ${tool.name}`} />
                  <div>
                    <p className="font-black">{tool.name} <span className="muted text-sm">#{tool.id}</span></p>
                    <p className="text-sm muted">{tool.status} · {tool.category?.name || "No category"} · {tool.templateType} · {tool.iconName || "no icon"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a className="btn-secondary !min-h-10" href={`/tools/${tool.slug}`} target="_blank">Preview</a>
                    <a className="btn-secondary !min-h-10" href={`/admin/tools?edit=${tool.id}`}>Edit</a>
                    <form action={deleteToolAction}><input type="hidden" name="id" value={tool.id} /><button className="btn-danger !min-h-10" type="submit">Delete</button></form>
                  </div>
                </div>
              )) : <p className="p-6 text-center muted">No tools match this filter.</p>}
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-xl font-black">Recent edits</h2>
          <div className="mt-4 grid gap-2 text-sm muted">
            {recentLogs.length ? recentLogs.map((log) => <p className="rounded-lg bg-[var(--background)] p-3" key={log.id}>{log.message || log.action}</p>) : <p>No recent tool edits yet.</p>}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
