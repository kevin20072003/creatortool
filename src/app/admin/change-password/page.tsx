import { AdminShell } from "@/components/AdminShell";
import { changePasswordAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function ChangePasswordPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const params = await searchParams;
  return (
    <AdminShell title="Change Password">
      <form action={changePasswordAction} className="card grid max-w-xl gap-4 p-5">
        {params.error ? <p className="rounded-lg bg-red-100 p-3 text-sm font-bold text-red-700">{params.error}</p> : null}
        {params.success ? <p className="rounded-lg bg-green-100 p-3 text-sm font-bold text-green-700">{params.success}</p> : null}
        <label className="label">New password<input className="input" type="password" name="password" minLength={8} required /></label>
        <button className="btn-primary w-fit" type="submit">Update password</button>
      </form>
    </AdminShell>
  );
}
