"use client";

import { Printer, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface PrintBarProps {
  backHref: string;
  backLabel?: string;
}

export function PrintBar({ backHref, backLabel = "Back" }: PrintBarProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between gap-4">
      <button
        type="button"
        onClick={() => router.push(backHref)}
        className="inline-flex items-center gap-2 font-label text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
      >
        <ArrowLeft className="size-4" />
        {backLabel}
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant/50 text-on-surface hover:bg-surface-container-low transition-colors font-label text-xs uppercase tracking-widest"
      >
        <Printer className="size-4" />
        Print Statement
      </button>
    </div>
  );
}
