"use client";

import { Search } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

interface AdminSearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  defaultValue?: string;
}

export function AdminSearch({
  placeholder = "Search students, notices…",
  onSearch,
  defaultValue = "",
}: AdminSearchProps) {
  const [value, setValue] = useState(defaultValue);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const t = setTimeout(() => {
      startTransition(() => {
        onSearch?.(value);
      });
    }, 200);
    return () => clearTimeout(t);
  }, [value, onSearch]);

  return (
    <div className="relative w-full md:w-80">
      <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 rounded-lg border border-outline-variant/50 bg-surface-container-lowest font-body text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
      />
      {isPending && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 size-2 rounded-full bg-primary animate-pulse" />
      )}
    </div>
  );
}
