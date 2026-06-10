"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import { Shield, Lock, Loader2, AlertCircle, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { clientAdminLogin } from "@/lib/data/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const result = await clientAdminLogin(username, password);
    if (!result.ok) {
      setError(result.error ?? "Sign in failed");
      return;
    }
    startTransition(() => {
      router.push("/admin");
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative">
      {/* Watermark */}
      <div className="admin-watermark" aria-hidden="true" />
      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="admin-card p-8 lg:p-10">
          <div className="text-center mb-8">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <Shield className="size-8 text-primary" />
            </div>
            <h1 className="font-headline text-2xl font-bold text-on-surface tracking-tight">
              Admin Portal
            </h1>
            <p className="font-body text-sm text-on-surface-variant mt-1.5">
              Enter your credentials to access the administrative panel.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 bg-error-container text-on-error-container p-4 rounded-lg flex items-center gap-3" role="alert">
              <AlertCircle className="size-5 shrink-0" />
              <p className="font-body text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="username" className="font-label text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
                Admin ID / Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="Enter administrator ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 border border-outline-variant rounded-lg bg-white font-body text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="font-label text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter secure passcode"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 pr-12 py-2.5 border border-outline-variant rounded-lg bg-white font-body text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 bg-primary text-on-primary font-label font-bold text-sm uppercase tracking-wider rounded-lg shadow-sm hover:bg-primary-container hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
              Secure Login
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 font-label text-sm text-on-surface-variant hover:text-primary transition-colors">
            <ArrowLeft className="size-4" />
            Back to Portal
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 admin-gradient text-on-primary py-4 px-6 text-center z-10">
        <p className="font-body text-sm opacity-80">Osmania University &copy; 2026. Administrative Portal.</p>
      </footer>
    </div>
  );
}
