import Image from "next/image";
import { AdminShell } from "@/components/AdminShell";
import { prisma } from "@/lib/db";
import { deleteMediaAction, uploadMediaAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const media = await prisma.media.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <AdminShell title="Media Manager">
      <div className="grid gap-6">
        <form action={uploadMediaAction} className="card grid gap-4 p-5" encType="multipart/form-data">
          <h2 className="text-xl font-black">Upload image</h2>
          <label className="label">Image file<input className="input" type="file" name="file" accept="image/*" required /></label>
          <label className="label">Alt text<input className="input" name="alt" /></label>
          <button className="btn-primary w-fit" type="submit">Upload</button>
        </form>
        <div className="grid-auto">
          {media.map((item) => (
            <div className="card grid gap-3 p-4" key={item.id}>
              <div className="relative aspect-video overflow-hidden rounded-lg bg-[var(--background)]">
                <Image src={item.url} alt={item.alt || item.filename} fill sizes="260px" className="object-cover" />
              </div>
              <input className="input text-sm" readOnly value={item.url} />
              <p className="text-sm muted">{Math.round(item.size / 1024)} KB</p>
              <form action={deleteMediaAction}><input type="hidden" name="id" value={item.id} /><button className="btn-danger w-full" type="submit">Delete</button></form>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
