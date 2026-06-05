import { AdminShell } from "@/components/AdminShell";
import { getSettings, setting } from "@/lib/settings";
import { saveSettingsAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <AdminShell title="Settings">
      <form action={saveSettingsAction} className="card grid gap-4 p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="label">Site name<input className="input" name="siteName" defaultValue={setting(settings, "siteName")} /></label>
          <label className="label">Admin email<input className="input" name="adminEmail" defaultValue={setting(settings, "adminEmail")} /></label>
          <label className="label">Site logo URL<input className="input" name="siteLogo" defaultValue={setting(settings, "siteLogo")} /></label>
          <label className="label">Site favicon URL<input className="input" name="siteFavicon" defaultValue={setting(settings, "siteFavicon")} /></label>
          <label className="label md:col-span-2">Homepage hero title<input className="input" name="homeHeroTitle" defaultValue={setting(settings, "homeHeroTitle")} /></label>
          <label className="label md:col-span-2">Homepage hero subtitle<textarea className="textarea" name="homeHeroSubtitle" defaultValue={setting(settings, "homeHeroSubtitle")} /></label>
          <label className="label md:col-span-2">Social links<input className="input" name="socialLinks" defaultValue={setting(settings, "socialLinks")} /></label>
          <label className="label md:col-span-2">Footer text<textarea className="textarea" name="footerText" defaultValue={setting(settings, "footerText")} /></label>
          <label className="label">Maintenance mode<select className="select" name="maintenanceMode" defaultValue={setting(settings, "maintenanceMode", "false")}><option value="false">false</option><option value="true">true</option></select></label>
          <label className="label">Dark mode default<select className="select" name="darkModeDefault" defaultValue={setting(settings, "darkModeDefault", "false")}><option value="false">false</option><option value="true">true</option></select></label>
        </div>
        <button className="btn-primary w-fit" type="submit">Save settings</button>
      </form>
    </AdminShell>
  );
}
