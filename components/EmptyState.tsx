import Link from "next/link";
import { FileSearch, type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  icon: Icon = FileSearch,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-surface-container-low border border-outline-variant/30 rounded-xl">
      <div className="size-16 rounded-full bg-surface-container-high flex items-center justify-center mb-4 text-on-surface-variant">
        <Icon className="size-7" />
      </div>
      <h3 className="font-headline text-lg font-bold text-on-surface">{title}</h3>
      {description && (
        <p className="font-body text-sm text-on-surface-variant mt-1 max-w-md">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-4 inline-flex items-center px-4 py-2 rounded-lg bg-primary text-on-primary font-label text-xs uppercase tracking-widest"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
