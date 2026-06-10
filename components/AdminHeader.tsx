"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function AdminHeader() {
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    } catch (err) {
      console.error("Logout request failed:", err);
    }
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="admin-gradient text-white px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-4">
        <img
          alt="Osmania University"
          className="h-12 w-auto brightness-0 invert"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCNt_DRYf2D5mklGFC7L-mYNkiyPxThr8UrCZt9wHVOMNZ5Tdl3Y-GVmjYQ7h24fyRLgDTyMWjEcWYUj2xfSmhvrqo1IoNog1pDQdoC4rajtNj69QvSd0ruOYAVSMhGsVeJ-k-J_gNL5ouNwuClPMjLVTHWsqB4I_tv1N6GHjcfvisnC90WGEfN8uzzWRpL1Em6PHBi_j5OYshGJ0C5pRxAM5aQor21IEHNDZXaQQAc61r6s_a89RJ4wdL2BRCDDepP8lM8Z6fgNqR"
        />
        <div className="hidden sm:block">
          <h1 className="font-headline text-lg font-bold leading-tight">Osmania University</h1>
          <p className="font-label text-[10px] uppercase tracking-widest text-white/70">Administrative Portal</p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors font-label text-xs uppercase tracking-wider font-semibold"
      >
        <LogOut className="size-4" />
        Logout
      </button>
    </header>
  );
}
