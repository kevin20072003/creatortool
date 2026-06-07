import Link from "next/link";
import type { SettingMap } from "@/lib/settings";
import { setting } from "@/lib/settings";

export function Footer({ settings }: { settings: SettingMap }) {
  return (
    <footer className="mt-16 border-t border-[var(--border)] bg-[var(--card)]">
      <div className="container grid gap-8 py-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="mb-3 flex items-center gap-2 font-black">
            <span className="grid size-9 place-items-center rounded-lg bg-[var(--primary)] text-sm text-white">CT</span>
            {setting(settings, "siteName", "CreatorTool.in")}
          </div>
          <p className="muted max-w-sm text-sm">{setting(settings, "footerText", "Free creator tools for video creators.")}</p>
        </div>
        <div>
          <h3 className="mb-3 font-black">Tools</h3>
          <div className="grid gap-2 text-sm muted">
            <Link href="/tools">All Tools</Link>
            <Link href="/categories/youtube-tools">YouTube Tools</Link>
            <Link href="/categories/video-calculators">Video Calculators</Link>
            <Link href="/categories/subtitle-tools">Subtitle Tools</Link>
          </div>
        </div>
        <div>
          <h3 className="mb-3 font-black">Content</h3>
          <div className="grid gap-2 text-sm muted">
            <Link href="/blog">Blog</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/sitemap-page">Sitemap</Link>
          </div>
        </div>
        <div>
          <h3 className="mb-3 font-black">Legal</h3>
          <div className="grid gap-2 text-sm muted">
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms-and-conditions">Terms</Link>
            <Link href="/disclaimer">Disclaimer</Link>
            <Link href="/admin">Admin</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--border)] py-4 text-center text-sm muted">
        © {new Date().getFullYear()} CreatorTool.in. Built for fast creator workflows.
      </div>
    </footer>
  );
}
