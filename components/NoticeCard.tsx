import { CalendarDays, Megaphone } from "lucide-react";
import type { Notice } from "@/lib/types";

interface NoticeCardProps {
  notice: Notice;
  variant?: "default" | "compact";
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function NoticeCard({ notice, variant = "default" }: NoticeCardProps) {
  if (variant === "compact") {
    return (
      <article className="flex items-start gap-3 py-3 border-b border-outline-variant/30 last:border-b-0">
        <Megaphone className="size-4 mt-0.5 text-secondary shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-headline text-sm font-bold text-on-surface line-clamp-1">
            {notice.title}
          </h3>
          <p className="font-body text-xs text-on-surface-variant mt-0.5">
            <span className="font-semibold text-primary">{notice.examLabel}</span> · {formatDate(notice.releasedOn)}
          </p>
        </div>
      </article>
    );
  }

  return (
    <article className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm hover-card">
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/20 text-secondary font-label text-[10px] uppercase tracking-widest font-bold border border-secondary/15">
          <Megaphone className="size-3" />
          <span>{notice.examLabel}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-medium">
          <CalendarDays className="size-3" />
          <span>{formatDate(notice.releasedOn)}</span>
        </span>
      </div>
      <h3 className="font-headline text-lg md:text-xl font-bold text-on-surface leading-snug mb-2">
        {notice.title}
      </h3>
      <p className="font-body text-sm text-on-surface-variant leading-relaxed">
        {notice.description}
      </p>
    </article>
  );
}
