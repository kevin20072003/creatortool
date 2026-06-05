import { prisma } from "./db";

export type SettingMap = Record<string, string>;

export async function getSettings(): Promise<SettingMap> {
  try {
    const rows = await prisma.siteSetting.findMany();
    return Object.fromEntries(rows.map((row) => [row.key, row.value]));
  } catch {
    return {};
  }
}

export function setting(settings: SettingMap, key: string, fallback = "") {
  return settings[key] || fallback;
}

export function siteUrl(path = "") {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://creatortools.in").replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
