import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  await requireAdmin();
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || !file.size) {
    return NextResponse.json({ ok: false, error: "No file uploaded" }, { status: 400 });
  }
  const ext = path.extname(file.name).toLowerCase() || ".jpg";
  const filename = `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));
  const media = await prisma.media.create({
    data: { filename, url: `/uploads/${filename}`, mimeType: file.type, size: file.size },
  });
  return NextResponse.json({ ok: true, media });
}
