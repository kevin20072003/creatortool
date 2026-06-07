import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import { loginAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await getAdminUser();
  if (user) redirect("/admin/dashboard");
  const params = await searchParams;

  return (
    <main className="container grid min-h-[70vh] place-items-center py-10">
      <form action={loginAction} className="card grid w-full max-w-md gap-4 p-6">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-[var(--accent)]">CreatorTool.in</p>
          <h1 className="mt-2 text-3xl font-black">Admin login</h1>
          <p className="mt-2 text-sm muted">Sign in to manage tools, posts, SEO, media, ads, settings, and analytics.</p>
        </div>
        {params.error ? <p className="rounded-lg bg-red-100 p-3 text-sm font-bold text-red-700">{params.error}</p> : null}
        <label className="label">Email<input className="input" name="email" type="email" required /></label>
        <label className="label">Password<input className="input" name="password" type="password" required /></label>
        <button className="btn-primary" type="submit">Login</button>
      </form>
    </main>
  );
}
