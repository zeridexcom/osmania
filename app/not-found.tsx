import Link from "next/link";
import { Home, RefreshCw, ArrowRight, BookOpen } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = {
  title: "404 — Osmania University Portal",
};

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface font-body antialiased selection:bg-primary-container selection:text-on-primary-container">
      {/* Site Header bar */}
      <SiteHeader />

      {/* Main Canvas with watermark background seal */}
      <main className="flex-grow flex flex-col justify-center items-center relative overflow-hidden px-6 py-20 min-h-[500px]">
        {/* Absolute Background Seal Watermark */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04] bg-center bg-no-repeat bg-contain"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBYs8qbP0j3n8Z8ROzRHwLu9lCl2S6xhfEj0AeIIIJZSRp7LpWXdgMUGp2kogt8cMPTU3KU-Hp89gFPq3E0NVL6xdCrLQfAHQfSFh6im2spbV0502X3-i277_PkFJNWM0lw1S3oEPnMqiKZehhLQLk9hVYdKKY3OLUqtHlcpZ_Kj1F49D5vD2plZqgr4qXqMTP9POSoAC5qSokGc7z4iVAVYScdJO5JZfj-tryw9lcY4f4tURPSrstjgSm9KC6GVNz_yTmjiWz-mqS1')",
            width: "80%",
            height: "80%",
            left: "10%",
            top: "10%",
          }}
        />

        <div className="relative z-10 max-w-3xl w-full text-center flex flex-col items-center">
          <h1 className="font-headline font-black text-9xl md:text-[11rem] leading-none text-primary opacity-90 mb-4 tracking-tighter select-none">
            404
          </h1>
          <h2 className="font-headline font-bold text-2xl md:text-4xl text-on-surface mb-4 leading-tight">
            The requested manuscript could not be located.
          </h2>
          <p className="font-body text-base md:text-lg text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed">
            Either the page you seek has been archived, or there is an error in the citation. If you are searching for a specific result, verify your Hall Ticket number and try again.
          </p>

          {/* Action Links */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center font-label">
            <Link
              href="/"
              className="group relative px-6 py-3.5 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-xs uppercase tracking-widest rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md flex items-center gap-2"
            >
              <Home className="size-4" />
              <span>Return to Archives</span>
            </Link>
            <Link
              href="/"
              className="px-6 py-3.5 bg-surface-container-high text-primary font-bold text-xs uppercase tracking-widest rounded-lg transition-colors duration-300 hover:bg-surface-dim flex items-center gap-2 border border-outline-variant/20"
            >
              <RefreshCw className="size-4" />
              <span>Try Again</span>
            </Link>
            <Link
              href="/notices"
              className="px-5 py-3.5 text-primary font-bold text-xs uppercase tracking-widest hover:underline transition-all duration-300 flex items-center gap-1.5"
            >
              <span>View Notices</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>

          {/* Divider with History Icon */}
          <div className="mt-16 flex items-center gap-4 text-outline-variant justify-center opacity-40">
            <span className="h-[1px] w-12 bg-outline-variant"></span>
            <BookOpen className="size-4 text-on-surface-variant" />
            <span className="h-[1px] w-12 bg-outline-variant"></span>
          </div>
        </div>
      </main>

      {/* Footer bar */}
      <SiteFooter />
    </div>
  );
}
