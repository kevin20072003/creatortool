import { DbPage } from "@/components/DbPage";
import { createMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
export const dynamic = "force-dynamic";
export async function generateMetadata() { return createMetadata({ title: "Privacy Policy - CreatorTools.in", path: "/privacy-policy", settings: await getSettings() }); }
export default function Page() { return <DbPage slug="privacy-policy" />; }
