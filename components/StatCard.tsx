import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  detail?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  iconColor?: "maroon" | "gold" | "success" | "primary";
}

const colorMap = {
  maroon: "bg-heritage-maroon/10 text-heritage-maroon",
  gold: "bg-academic-gold/15 text-academic-gold-dark",
  success: "bg-success/10 text-success",
  primary: "bg-primary/10 text-primary",
};

export function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  trend,
  iconColor = "maroon",
}: StatCardProps) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-5 shadow-sm hover-lift">
      <div className="flex items-start justify-between mb-3">
        <div className={`size-11 rounded-lg flex items-center justify-center ${colorMap[iconColor]}`}>
          <Icon className="size-5" />
        </div>
        {trend && (
          <div
            className={`inline-flex items-center gap-1 font-label text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
              trend.positive
                ? "bg-success/10 text-success"
                : "bg-error/10 text-error"
            }`}
          >
            {trend.positive ? (
              <TrendingUp className="size-3" />
            ) : (
              <TrendingDown className="size-3" />
            )}
            {trend.value}
          </div>
        )}
      </div>
      <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
        {label}
      </p>
      <p className="font-headline text-2xl font-bold text-on-surface mt-1">
        {value}
      </p>
      {detail && (
        <p className="font-body text-xs text-on-surface-variant mt-1">{detail}</p>
      )}
    </div>
  );
}
