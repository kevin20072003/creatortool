import Link from "next/link";
import { IconBadge } from "./ui/IconBadge";

type ToolCardProps = {
  name: string;
  slug: string;
  description: string;
  category?: string | null;
  featured?: boolean;
  popular?: boolean;
  iconName?: string | null;
};

export function ToolCard({ name, slug, description, category, featured, popular, iconName }: ToolCardProps) {
  return (
    <Link href={`/tools/${slug}`} className="card group grid min-h-52 gap-4 p-5 transition hover:-translate-y-0.5 hover:border-[var(--primary)]">
      <div className="flex items-start justify-between gap-3">
        <IconBadge name={iconName} label={name} />
        <div className="flex flex-wrap justify-end gap-2 text-xs font-bold">
          {featured ? <span className="rounded-full bg-blue-100 px-2 py-1 text-blue-700 dark:bg-blue-950 dark:text-blue-200">Featured</span> : null}
          {popular ? <span className="rounded-full bg-teal-100 px-2 py-1 text-teal-700 dark:bg-teal-950 dark:text-teal-200">Popular</span> : null}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-black uppercase tracking-wide text-[var(--accent)]">{category || "Creator Tool"}</p>
        <h3 className="text-lg font-black group-hover:text-[var(--primary)]">{name}</h3>
        <p className="mt-2 text-sm leading-6 muted">{description}</p>
      </div>
      <span className="mt-auto text-sm font-black text-[var(--primary)]">Open tool →</span>
    </Link>
  );
}
