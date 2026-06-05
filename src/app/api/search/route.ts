import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { deviceFromUserAgent } from "@/lib/analytics";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const query = String(body.query || "").trim().slice(0, 120);
    if (!query) return NextResponse.json({ ok: true });
    await prisma.searchLog.create({
      data: {
        query,
        results: Number(body.results || 0),
        device: deviceFromUserAgent(request.headers.get("user-agent") || ""),
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
