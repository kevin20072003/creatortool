import { AdminShell } from "@/components/AdminShell";
import { prisma } from "@/lib/db";
import { saveAdsAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdsensePage() {
  const slots = await prisma.adSlot.findMany();
  const byName = Object.fromEntries(slots.map((slot) => [slot.name, slot]));
  return (
    <AdminShell title="Adsense Manager">
      <form action={saveAdsAction} className="card grid gap-5 p-5">
        {["header", "in-content", "sidebar", "footer"].map((name) => (
          <div className="grid gap-3" key={name}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-black capitalize">{name} ad code</h2>
              <label className="flex items-center gap-2 font-bold"><input type="checkbox" name={`${name}-enabled`} defaultChecked={byName[name]?.enabled ?? true} /> Enabled</label>
            </div>
            <textarea className="textarea font-mono text-sm" name={name} defaultValue={byName[name]?.code || ""} placeholder="Paste Adsense code later" />
          </div>
        ))}
        <button className="btn-primary w-fit" type="submit">Save ad slots</button>
      </form>
    </AdminShell>
  );
}
