import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { NoticeCard } from "@/components/NoticeCard";
import { isApiConfigured } from "@/lib/data/env";
import { mockGetAllNotices } from "@/lib/data/mock-state";
import { serverGetPublicNotices } from "@/lib/data/server";
import type { Notice } from "@/lib/types";

export const metadata = {
  title: "Notices & Circulars — Osmania University Portal",
};

export default async function NoticesPage() {
  let notices: Notice[] = [];
  if (isApiConfigured()) {
    try {
      notices = await serverGetPublicNotices();
    } catch (err) {
      console.error("Failed to load notices from Supabase:", err);
      notices = mockGetAllNotices();
    }
  } else {
    notices = mockGetAllNotices();
  }

  const sorted = [...notices]
    .filter((n) => n.isPublished)
    .sort((a, b) => new Date(b.releasedOn).getTime() - new Date(a.releasedOn).getTime());

  return (
    <div className="min-h-screen flex flex-col bg-surface font-body antialiased selection:bg-primary-container selection:text-on-primary-container">
      {/* Site Header */}
      <SiteHeader />

      {/* Main Container */}
      <main className="flex-1 max-w-[1200px] mx-auto w-full px-6 md:px-8 py-12">
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-label text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary mb-4 font-bold"
          >
            <ArrowLeft className="size-4" />
            <span>Back to Home</span>
          </Link>
          <p className="font-label text-[10px] uppercase tracking-[0.25em] text-secondary font-bold">
            Examination Branch
          </p>
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-on-surface mt-1">
            📢 Notices & Circulars
          </h1>
          <p className="font-body text-md text-on-surface-variant mt-2 max-w-2xl leading-relaxed">
            All official communications, result publications, and academic notices issued by the Controller of Examinations.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Notices List */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {sorted.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-12 text-center text-on-surface-variant italic text-sm">
                No active announcements or notices currently available.
              </div>
            ) : (
              sorted.map((n) => (
                <NoticeCard key={n.id} notice={n} />
              ))
            )}
          </div>

          {/* Sidebar / Subscription widget */}
          <aside className="lg:sticky lg:top-24 self-start bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 flex flex-col gap-5">
            <div className="flex items-center gap-2 text-primary">
              <Mail className="size-5" />
              <h2 className="font-headline text-lg font-bold text-on-surface">
                📬 Alert Subscriptions
              </h2>
            </div>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed">
              Subscribe to receive real-time email notifications whenever a new circular or exam result notice is published.
            </p>
            <form
              className="flex flex-col gap-3 font-label"
              action="/api/subscribe"
              method="POST"
            >
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/50 bg-surface-container-lowest font-body text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-lg bg-primary text-on-primary text-xs uppercase tracking-widest font-bold hover:bg-primary-container transition-colors shadow-sm"
              >
                Subscribe
              </button>
            </form>

            <hr className="border-outline-variant/30 my-1" />

            <h3 className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
              Quick Resources
            </h3>
            <ul className="flex flex-col gap-2 font-body text-sm">
              <li>
                <Link href="/" className="text-primary hover:underline font-semibold flex items-center gap-1">
                  <span>Result Query Form</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-primary hover:underline font-semibold flex items-center gap-1">
                  <span>Admin Console</span>
                </Link>
              </li>
            </ul>
          </aside>
        </div>
      </main>

      {/* Site Footer */}
      <SiteFooter />
    </div>
  );
}
