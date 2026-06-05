import * as Icons from "lucide-react";
import type { ComponentType } from "react";

type IconName = keyof typeof Icons;

export function IconBadge({ name, label, className = "" }: { name?: string | null; label?: string; className?: string }) {
  const Icon = ((name && Icons[name as IconName]) || Icons.WandSparkles) as ComponentType<{ size?: number; strokeWidth?: number }>;
  return (
    <span className={`grid size-11 shrink-0 place-items-center rounded-lg bg-[var(--background)] text-[var(--primary)] ${className}`} title={label || name || "Tool icon"}>
      <Icon size={22} strokeWidth={2.2} />
    </span>
  );
}
