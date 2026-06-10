import { Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: number;
  label?: string;
  variant?: "spinner" | "skeleton";
}

export function Spinner({ size = 20, label, variant = "spinner" }: SpinnerProps) {
  if (variant === "skeleton") {
    return (
      <div className="flex flex-col gap-4 py-8 w-full max-w-2xl mx-auto">
        <div className="skeleton h-6 w-48 mb-2" />
        <div className="skeleton h-4 w-72 mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <div className="skeleton h-12" />
          <div className="skeleton h-12" />
          <div className="skeleton h-12" />
          <div className="skeleton h-12" />
        </div>
        <div className="skeleton h-40 w-full mt-2" />
        <div className="skeleton h-16 w-full mt-2" />
        {label && <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant text-center mt-2">{label}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8">
      <Loader2 className="animate-spin text-primary" style={{ width: size, height: size }} />
      {label && <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">{label}</p>}
    </div>
  );
}
