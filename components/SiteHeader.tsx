"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Languages, Menu, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleDark() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch { /* noop */ }
  }

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/notices", label: "Notices" },
    { href: "/admin/login", label: "Admin Portal" },
  ];

  return (
    <div className="w-full flex flex-col no-print">
      {/* Government Utility Bar */}
      <div className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant/20 py-1.5 px-6 flex justify-between items-center text-[9px] tracking-widest font-label uppercase font-bold">
        <span>Government of Telangana</span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Languages className="size-3" />
            <span>English</span>
          </span>
          <button
            type="button"
            onClick={toggleDark}
            className="p-1 hover:text-primary transition-colors"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun className="size-3" /> : <Moon className="size-3" />}
          </button>
        </span>
      </div>

      {/* OU Header & Navigation — Dark Maroon */}
      <nav className="bg-primary w-full sticky top-0 z-50 flex flex-col shadow-md">
        <div className="max-w-[1200px] mx-auto w-full px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4">
            <img
              alt="Osmania University Logo"
              className="h-14 md:h-16 object-contain rounded-sm w-auto brightness-0 invert"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcR9wjRE7ojMDjJr8z8umN-5aphfNUzDJLCFDSKnQUDhPJxWePch5mRN_zK7Ad45A3s6qspmcaA2DQlR085iMML4ZOglsYMNfddovoNCBfbINH5ALgfWjtLiJGSJw2L_NZjZi0LxmPE-2aLAV0xR2t160c8kOFcsv9j6W1yDu4b9cpEZRdSymCmiEgm_nE9s2m5OCE-7BmaVu2ztk4PuQT1XPN0n0vF2Hgfdu7U35uxLasOzXMRjlJiDNecgvK4zeo7V4ZnIWY5Wdu"
            />
            <div className="hidden sm:block border-l border-white/20 pl-4">
              <div className="font-headline text-white text-lg leading-tight font-bold tracking-tight">
                Osmania University
              </div>
              <div className="text-white/70 text-[10px] uppercase tracking-widest font-label font-bold mt-0.5">
                Examination Branch Portal
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 font-label text-xs uppercase tracking-widest font-bold">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "pb-1 border-b-2 transition-all duration-150",
                    active
                      ? "text-white border-white"
                      : "text-white/70 border-transparent hover:text-white hover:border-white/40"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white hover:text-white/70 transition-colors"
            aria-label="Toggle Menu"
          >
            <Menu className="size-6" />
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-primary-container py-3 px-6 flex flex-col gap-2 font-label text-xs uppercase tracking-widest font-bold">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "py-2 px-3 rounded-lg transition-colors",
                    active
                      ? "bg-white/20 text-white"
                      : "text-white/80 hover:bg-white/10"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </nav>
    </div>
  );
}
