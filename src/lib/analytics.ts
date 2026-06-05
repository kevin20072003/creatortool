import { headers } from "next/headers";
import { prisma } from "./db";

export function deviceFromUserAgent(userAgent = "") {
  const value = userAgent.toLowerCase();
  if (/ipad|tablet/.test(value)) return "tablet";
  if (/mobile|android|iphone/.test(value)) return "mobile";
  return "desktop";
}

export async function trackServerEvent(type: string, path: string, entitySlug?: string, metadata?: Record<string, unknown>) {
  try {
    const h = await headers();
    await prisma.analyticsEvent.create({
      data: {
        type,
        path,
        entitySlug,
        device: deviceFromUserAgent(h.get("user-agent") || ""),
        referrer: h.get("referer") || "",
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch {
    // Analytics should never break public pages.
  }
}
