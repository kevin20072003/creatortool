import { AdminShell } from "@/components/AdminShell";
import { getSettings, setting } from "@/lib/settings";
import { saveSeoAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function SeoPage() {
  const settings = await getSettings();
  return (
    <AdminShell title="SEO Manager">
      <form action={saveSeoAction} className="card grid gap-4 p-5">
        <label className="label">Global site title<input className="input" name="globalTitle" defaultValue={setting(settings, "globalTitle")} /></label>
        <label className="label">Global meta description<textarea className="textarea" name="globalDescription" defaultValue={setting(settings, "globalDescription")} /></label>
        <label className="label">Open Graph image URL<input className="input" name="ogImage" defaultValue={setting(settings, "ogImage")} /></label>
        <label className="label">Robots settings<input className="input" name="robots" defaultValue={setting(settings, "robots", "index,follow")} /></label>
        <label className="label">Google Analytics code<textarea className="textarea font-mono text-sm" name="googleAnalytics" defaultValue={setting(settings, "googleAnalytics")} /></label>
        <label className="label">Google Search Console verification code<textarea className="textarea font-mono text-sm" name="searchConsole" defaultValue={setting(settings, "searchConsole")} /></label>
        <p className="rounded-lg bg-[var(--background)] p-3 text-sm muted">Sitemap and robots files are generated automatically from published tools, categories, blog posts, and public pages.</p>
        <button className="btn-primary w-fit" type="submit">Save SEO settings</button>
      </form>
    </AdminShell>
  );
}
