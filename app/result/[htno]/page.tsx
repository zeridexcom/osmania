import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { isApiConfigured } from "@/lib/data/env";
import { mockGetStudentByHtno } from "@/lib/data/mock-state";
import { serverGetPublicStudentResult } from "@/lib/data/server";
import type { PublicStudentResult } from "@/lib/types";
import { ResultCard } from "@/components/ResultCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

interface ResultDetailPageProps {
  params: Promise<{ htno: string }>;
  searchParams: Promise<{ examYear?: string }>;
}

export const dynamic = "force-dynamic";

export default async function ResultDetailPage({ params, searchParams }: ResultDetailPageProps) {
  const { htno } = await params;
  const { examYear } = await searchParams;

  if (!examYear) {
    notFound();
  }
  const examYearNum = Number(examYear);
  if (!Number.isFinite(examYearNum)) {
    notFound();
  }

  let student: PublicStudentResult | null = null;
  if (isApiConfigured()) {
    try {
      student = await serverGetPublicStudentResult(htno, examYearNum);
    } catch (err) {
      console.error("Failed to load student result from database:", err);
    }
  } else {
    student = mockGetStudentByHtno(htno, examYearNum);
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface font-body antialiased selection:bg-primary-container selection:text-on-primary-container">
      {/* Official Sticky Header */}
      <SiteHeader />

      {/* Main Body */}
      <main className="flex-grow flex flex-col items-center py-12 px-6 sm:px-8 max-w-[1200px] mx-auto w-full">
        {!student ? (
          <div className="max-w-md w-full bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-8 shadow-md flex flex-col items-center text-center gap-5 mt-10">
            <div className="size-16 rounded-full bg-error-container/30 text-error flex items-center justify-center">
              <AlertTriangle className="size-8" />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="font-headline text-2xl font-bold text-on-surface">No Result Found</h1>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                We could not locate a record for Hall Ticket{" "}
                <span className="font-mono font-bold text-on-surface">{htno}</span> for the exam year{" "}
                <span className="font-mono font-bold text-on-surface">{examYear}</span>.
              </p>
            </div>
            <Link
              href="/"
              className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-on-primary font-label text-xs font-bold uppercase tracking-widest hover:bg-primary-container hover:text-white transition-colors shadow-sm"
            >
              <ArrowLeft className="size-4" />
              <span>Back to Search</span>
            </Link>
          </div>
        ) : (
          <div className="w-full">
            <ResultCard student={student} />
          </div>
        )}
      </main>

      {/* Branded Footer */}
      <SiteFooter />
    </div>
  );
}
