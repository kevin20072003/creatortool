import type { Metadata } from "next";
import { PublicHeader } from "@/components/PublicHeader";
import { Footer } from "@/components/Footer";
import { getSettings, setting } from "@/lib/settings";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://CreatorTool.in"),
  title: "CreatorTool.in - Free Tools for Video Creators",
  description: "Fast calculators and generators for YouTubers, editors, videographers, live streamers, and content creators.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettings();
  const darkDefault = setting(settings, "darkModeDefault", "false") === "true";

  return (
    <html lang="en" className={darkDefault ? "dark" : ""} suppressHydrationWarning>
      <body>
        {setting(settings, "googleAnalytics") ? <div dangerouslySetInnerHTML={{ __html: setting(settings, "googleAnalytics") }} /> : null}
        {setting(settings, "searchConsole") ? <div dangerouslySetInnerHTML={{ __html: setting(settings, "searchConsole") }} /> : null}
        <PublicHeader siteName={setting(settings, "siteName", "CreatorTool.in")} />
        {children}
        <Footer settings={settings} />
      </body>
    </html>
  );
}
