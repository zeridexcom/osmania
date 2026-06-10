import Link from "next/link";
import { Info, Bell, CalendarDays, CheckCircle2, Megaphone } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SearchForm } from "@/components/SearchForm";
import { AnimateIn } from "@/components/AnimateIn";
import { isApiConfigured } from "@/lib/data/env";
import { mockGetAllNotices } from "@/lib/data/mock-state";
import { serverGetPublicNotices } from "@/lib/data/server";
import type { Notice } from "@/lib/types";

export const metadata = {
  title: "Osmania University — Examination Branch",
  description: "Official Examination Results Portal of Osmania University.",
};

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return isoString.toUpperCase();
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).toUpperCase();
}

export default async function LandingPage() {
  let notices: Notice[] = [];
  if (isApiConfigured()) {
    try {
      notices = await serverGetPublicNotices();
    } catch (err) {
      console.error("Failed to load notices from database:", err);
      notices = mockGetAllNotices();
    }
  } else {
    notices = mockGetAllNotices();
  }

  const latestNotices = notices
    .filter((n) => n.isPublished)
    .sort((a, b) => new Date(b.releasedOn).getTime() - new Date(a.releasedOn).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-background font-body antialiased selection:bg-primary-container selection:text-on-primary-container">
      {/* Site Header bar */}
      <SiteHeader />

      {/* Main Content Area */}
      <main className="w-full flex flex-col items-center">
        {/* Marquee: Latest Announcement */}
        {latestNotices.length > 0 && (
          <div className="w-full bg-gradient-to-r from-secondary-container/20 via-secondary-container/10 to-transparent border-b border-secondary/20 marquee-root">
            <div className="max-w-[1200px] mx-auto px-6 py-2 marquee-track">
              <span className="marquee-label bg-secondary text-on-secondary font-label text-[10px] uppercase tracking-widest font-bold">
                <Megaphone className="size-3" />
                <span>Latest</span>
              </span>
              <div className="marquee-scroll">
                <div className="marquee-scroll-inner font-body text-sm text-on-surface/80">
                  {[...latestNotices, ...latestNotices].map((n, i) => (
                    <span key={`${n.id}-${i}`} className="marquee-item">
                      <span className="font-semibold text-primary">{n.examLabel}</span>
                      <span>— {n.title}</span>
                      <span className="marquee-sep text-secondary">◆</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 1: Examination Lookup Form */}
        <AnimateIn>
        <section className="w-full bg-surface-container-lowest border-b border-outline-variant/30 py-28 md:py-36 px-6">
          <div className="max-w-[1200px] mx-auto flex flex-col items-center text-center gap-10 md:gap-12">
            <div className="flex flex-col gap-4 max-w-4xl">
              <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl text-primary font-bold tracking-normal leading-tight">
                Examination Result Lookup
              </h1>
              <p className="font-body text-lg md:text-xl text-on-surface-variant">
                Enter your details below to securely access your academic results.
              </p>
            </div>
            <div className="w-full max-w-3xl bg-surface rounded-2xl shadow-lg border border-outline-variant/40 overflow-hidden text-left transition-shadow duration-300 hover:shadow-xl">
              <SearchForm />
            </div>
          </div>
        </section>
        </AnimateIn>

        {/* Section 2: Instructions for Students */}
        <AnimateIn delay={100}>
        <section className="w-full bg-surface-container-low py-16 px-6">
          <div className="max-w-[1200px] mx-auto">
            <div className="max-w-[840px] mx-auto border border-outline-variant/40 rounded-2xl p-8 sm:p-10 bg-surface-container-lowest shadow-md">
              <h3 className="font-headline text-headline-md text-on-surface border-b border-outline-variant/30 pb-5 mb-6 flex items-center gap-3">
                <Info className="text-primary size-7 shrink-0" />
                <span>📋 Instructions for Students</span>
              </h3>
              <ul className="list-none font-body text-body-lg text-on-surface-variant space-y-4">
                <li className="flex gap-4 items-start">
                  <CheckCircle2 className="text-primary mt-1 size-5 shrink-0" />
                  <span className="leading-relaxed">
                    Enter your Hall Ticket / Register Number accurately as printed on your memo.
                  </span>
                </li>
                <li className="flex gap-4 items-start">
                  <CheckCircle2 className="text-primary mt-1 size-5 shrink-0" />
                  <span className="leading-relaxed">
                    The CAPTCHA code is case-sensitive. Please ensure caps lock is used correctly.
                  </span>
                </li>
                <li className="flex gap-4 items-start">
                  <CheckCircle2 className="text-primary mt-1 size-5 shrink-0" />
                  <span className="leading-relaxed">
                    Results published online are for immediate information only. Original mark sheets will be issued separately through college principals.
                  </span>
                </li>
                <li className="flex gap-4 items-start">
                  <CheckCircle2 className="text-primary mt-1 size-5 shrink-0" />
                  <span className="leading-relaxed">
                    In case of discrepancies, contact the Controller of Examinations within 15 days of result publication.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>
        </AnimateIn>

        {/* Section 3: Notices & Calendar Grid */}
        <AnimateIn delay={200}>
        <section className="max-w-[1200px] mx-auto w-full px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Official Notices Panel */}
          <div className="border border-outline-variant/30 rounded-2xl bg-surface-container-lowest shadow-md overflow-hidden flex flex-col h-full transition-shadow duration-300 hover:shadow-lg">
            <div className="bg-surface border-b border-outline-variant/30 px-8 py-6 flex justify-between items-center">
              <h3 className="font-headline text-headline-md text-on-surface font-bold">
                📢 Official Notices
              </h3>
              <Bell className="size-7 text-primary" />
            </div>
            <div className="flex flex-col divide-y divide-outline-variant/20 flex-grow">
              {latestNotices.length === 0 ? (
                <div className="p-8 text-center italic text-on-surface-variant text-sm">
                  No active notices published.
                </div>
              ) : (
                latestNotices.map((n, idx) => (
                  <Link
                    key={n.id}
                    className="p-8 hover:bg-surface-container-low transition-colors duration-200 group block"
                    href="/notices"
                  >
                    <div className="font-label text-[10px] text-on-surface-variant mb-2 tracking-wider flex items-center gap-2">
                      {idx === 0 && (
                        <span className="bg-primary text-on-primary px-1.5 py-0.5 rounded text-[8px] font-bold">
                          NEW
                        </span>
                      )}
                      <span>{formatDate(n.releasedOn)}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
                      <span className="uppercase text-[9px] font-bold text-primary tracking-wide">
                        {n.examLabel}
                      </span>
                    </div>
                    <p className="font-headline text-lg leading-snug text-on-surface group-hover:text-primary transition-colors">
                      {n.title}
                    </p>
                  </Link>
                ))
              )}
            </div>
            <Link
              className="p-5 text-center bg-surface hover:bg-surface-container-low transition-colors duration-200 block border-t border-outline-variant/30 mt-auto font-label text-xs tracking-widest text-primary font-bold"
              href="/notices"
            >
              VIEW ALL NOTICES
            </Link>
          </div>

          {/* Academic Calendar Panel */}
          <div className="border border-outline-variant/30 rounded-2xl bg-surface-container-lowest shadow-md overflow-hidden flex flex-col h-full transition-shadow duration-300 hover:shadow-lg">
            <div className="bg-surface border-b border-outline-variant/30 px-8 py-6 flex justify-between items-center">
              <h3 className="font-headline text-headline-md text-on-surface font-bold">
                Academic Calendar
              </h3>
              <CalendarDays className="size-7 text-primary" />
            </div>
            <div className="p-8 space-y-6 flex-grow">
              <div className="flex gap-6 items-center border border-outline-variant/30 p-5 rounded-xl bg-surface shadow-sm">
                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-3 text-center min-w-[80px] shadow-sm flex flex-col items-center justify-center">
                  <div className="font-label text-[10px] text-primary tracking-wider font-bold">NOV</div>
                  <div className="font-headline text-3xl text-on-surface mt-0.5 leading-none font-bold">15</div>
                </div>
                <div>
                  <p className="font-headline text-lg font-bold text-on-surface mb-1">Last Date for Exam Fee</p>
                  <p className="font-body text-sm text-on-surface-variant">Without late fee for UG Sem III</p>
                </div>
              </div>
              <div className="flex gap-6 items-center border border-outline-variant/30 p-5 rounded-xl bg-surface shadow-sm">
                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-3 text-center min-w-[80px] shadow-sm flex flex-col items-center justify-center">
                  <div className="font-label text-[10px] text-primary tracking-wider font-bold">NOV</div>
                  <div className="font-headline text-3xl text-on-surface mt-0.5 leading-none font-bold">22</div>
                </div>
                <div>
                  <p className="font-headline text-lg font-bold text-on-surface mb-1">Fee with Late Fine</p>
                  <p className="font-body text-sm text-on-surface-variant">Fine of Rs. 500/- applicable</p>
                </div>
              </div>
            </div>
            <Link
              className="p-5 text-center bg-surface hover:bg-surface-container-low transition-colors duration-200 block border-t border-outline-variant/30 mt-auto font-label text-xs tracking-widest text-primary font-bold"
              href="#"
            >
              VIEW FULL CALENDAR
            </Link>
          </div>
        </section>
        </AnimateIn>
      </main>

      {/* Site Footer */}
      <SiteFooter />
    </div>
  );
}
