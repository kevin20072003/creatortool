import { DbPage } from "@/components/DbPage";
import { createMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
export const dynamic = "force-dynamic";
export async function generateMetadata() { return createMetadata({ title: "Terms and Conditions - CreatorTools.in", path: "/terms-and-conditions", settings: await getSettings() }); }
export default function Page() { return <DbPage slug="terms-and-conditions" />; }
