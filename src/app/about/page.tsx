import { DbPage } from "@/components/DbPage";
import { createMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
export const dynamic = "force-dynamic";
export async function generateMetadata() { return createMetadata({ title: "About - CreatorTool.in", path: "/about", settings: await getSettings() }); }
export default function Page() { return <DbPage slug="about" />; }
