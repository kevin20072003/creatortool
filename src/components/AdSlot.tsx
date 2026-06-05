import { prisma } from "@/lib/db";

export async function AdSlot({ name, label }: { name: string; label?: string }) {
  let slot = null;
  try {
    slot = await prisma.adSlot.findUnique({ where: { name } });
  } catch {}

  if (slot?.enabled && slot.code) {
    return <div className="my-8" dangerouslySetInnerHTML={{ __html: slot.code }} />;
  }

  return <div className="ad-slot my-8">{label || `${name} ad placeholder`}</div>;
}
