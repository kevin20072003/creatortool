import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { deviceFromUserAgent } from "@/lib/analytics";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userAgent = request.headers.get("user-agent") || "";
    await prisma.analyticsEvent.create({
      data: {
        type: String(body.type || "page_view").slice(0, 50),
        path: String(body.path || "/").slice(0, 255),
        entitySlug: body.entitySlug ? String(body.entitySlug).slice(0, 120) : null,
        device: deviceFromUserAgent(userAgent),
        referrer: String(body.referrer || request.headers.get("referer") || "").slice(0, 500),
        metadata: body.metadata ? JSON.stringify(body.metadata).slice(0, 2000) : null,
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
