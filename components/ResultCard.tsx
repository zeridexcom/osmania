"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Printer, QrCode } from "lucide-react";
import type { PublicStudentResult } from "@/lib/types";

interface ResultCardProps {
  student: PublicStudentResult;
}

function formatExamMonthYear(month: string, year: number): string {
  return `${month.toUpperCase()} ${year}`;
}

function romanize(num: number): string {
  const map: [number, string][] = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let out = "";
  let n = num;
  for (const [value, sym] of map) {
    while (n >= value) {
      out += sym;
      n -= value;
    }
  }
  return out || String(num);
}

export function ResultCard({ student }: ResultCardProps) {
  const isPass = student.resultStatus === "PASS";

  return (
    <div className="w-full flex flex-col gap-6 font-body">
      {/* Top Action Bar (hidden when printing) */}
      <div className="w-full flex justify-between items-center mb-2 no-print">
        <Link
          className="flex items-center gap-2 text-primary font-label text-sm font-bold uppercase tracking-wider hover:underline transition-all"
          href="/"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Home</span>
        </Link>
        <button
          type="button"
          className="flex items-center gap-2 bg-tertiary-container text-on-tertiary-container font-label text-xs uppercase tracking-widest font-bold py-2.5 px-6 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
          onClick={() => window.print()}
        >
          <Printer className="size-4" />
          <span>Print Statement</span>
        </button>
      </div>

      {/* Marks Memorandum Certificate Sheet */}
      <div
        className="w-full bg-gradient-to-b from-surface-container-lowest via-surface-container-lowest to-surface-container rounded-lg shadow-print p-8 sm:p-12 relative overflow-hidden print:border-none print:shadow-none print:p-0 border-2 border-primary/40"
        id="print-area"
      >
        {/* Subtle Watermark grid dots */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.02] print:hidden"
          style={{
            backgroundImage: "radial-gradient(circle at center, var(--color-on-surface) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        {/* Certificate border watermark */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03] print:hidden"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 100 100'%3E%3Ctext x='50' y='50' text-anchor='middle' dominant-baseline='central' font-size='30' font-family='Georgia,serif' fill='%23800000' opacity='0.06'%3EOU%3C/text%3E%3C/svg%3E\")",
            backgroundRepeat: "repeat",
            backgroundSize: "140px 140px",
          }}
        />

        {/* Certificate Header Section */}
        <div className="flex flex-col items-center text-center border-b border-outline-variant/50 pb-6 mb-8 relative">
          <img
            alt="Osmania University Logo"
            className="h-16 mb-4 object-contain"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIFWpd69E3mRuiFr2t-CDGPC-JTF3876QzFANePoU-jbmJR-ghnGDEPI98f4-OQkXhjzGkioGBV8nOR8VykEZE6IF7gB6-ZC4hxKyCviXVQaavx8lea5Xh3wE17eEAb7NcGJ_7Id9cWujHOn75EDFVH1SVuLOxUuGMVgvsTuXhXa36jMJCv0WDS3Hxv-g7IbG5VvDMh8eNLmPHuLSXNpykArQrvM_9b6XrWuFBe5MtJojQ9KMWICSJ8Z27YT4VLCd_dUXs5F46Ygm5"
          />
          <h1 className="font-headline text-3xl font-bold text-on-surface mb-1.5 tracking-tight">
            Osmania University
          </h1>
          <h2 className="font-label text-md text-on-surface-variant tracking-[0.2em] uppercase font-bold mb-1">
            Statement of Marks
          </h2>
          <p className="font-body text-xs text-on-surface-variant">
            Re-Accredited by NAAC with &apos;A+&apos; Grade
          </p>

          {/* Verification Badge */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-surface-container-low border border-outline-variant/50 flex items-center justify-center rounded-lg p-1.5 print:w-16 print:h-16">
            <div className="w-full h-full bg-surface-container-highest border border-outline border-dashed flex flex-col items-center justify-center text-on-surface-variant rounded">
              <QrCode className="size-8 text-on-surface-variant/80 print:size-6" />
              <span className="text-[7px] mt-0.5 font-label uppercase font-bold tracking-wider">Verify</span>
            </div>
          </div>
        </div>

        {/* Student Information Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 mb-8 text-sm">
          <div className="space-y-3">
            <div className="flex items-baseline justify-between border-b border-outline-variant/15 pb-1 gap-2">
              <span className="font-label text-xs uppercase tracking-wider text-on-surface-variant font-bold w-1/3">
                Hall Ticket No
              </span>
              <span className="font-body font-bold text-on-surface flex-1 text-right font-mono">
                {student.hallTicket}
              </span>
            </div>
            <div className="flex items-baseline justify-between border-b border-outline-variant/15 pb-1 gap-2">
              <span className="font-label text-xs uppercase tracking-wider text-on-surface-variant font-bold w-1/3">
                Name
              </span>
              <span className="font-body font-bold text-on-surface flex-1 text-right uppercase">
                {student.name}
              </span>
            </div>

          </div>

          <div className="space-y-3">
            <div className="flex items-baseline justify-between border-b border-outline-variant/15 pb-1 gap-2">
              <span className="font-label text-xs uppercase tracking-wider text-on-surface-variant font-bold w-1/3">
                Course
              </span>
              <span className="font-body font-semibold text-on-surface flex-1 text-right uppercase">
                {student.course}
              </span>
            </div>
            <div className="flex items-baseline justify-between border-b border-outline-variant/15 pb-1 gap-2">
              <span className="font-label text-xs uppercase tracking-wider text-on-surface-variant font-bold w-1/3">
                Branch
              </span>
              <span className="font-body font-semibold text-on-surface flex-1 text-right uppercase">
                {student.branch}
              </span>
            </div>
            <div className="flex items-baseline justify-between border-b border-outline-variant/15 pb-1 gap-2">
              <span className="font-label text-xs uppercase tracking-wider text-on-surface-variant font-bold w-1/3">
                Semester
              </span>
              <span className="font-body font-semibold text-on-surface flex-1 text-right uppercase">
                {romanize(student.semester)} ({formatExamMonthYear(student.examMonth, student.examYear)})
              </span>
            </div>
            <div className="flex items-baseline justify-between border-b border-outline-variant/15 pb-1 gap-2">
              <span className="font-label text-xs uppercase tracking-wider text-on-surface-variant font-bold w-1/3">
                College
              </span>
              <span
                className="font-body font-semibold text-on-surface flex-1 text-right truncate uppercase"
                title={student.collegeName}
              >
                {student.collegeName}
              </span>
            </div>
          </div>
        </div>

        {/* Subjects & Marks Table */}
        <div className="mb-8 overflow-x-auto rounded-lg border border-outline-variant/50">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/30 text-xs uppercase tracking-widest font-label font-bold text-on-surface">
                <th className="py-3.5 px-4">Subject Code</th>
                <th className="py-3.5 px-4">Subject Name</th>
                <th className="py-3.5 px-4 text-center">Grade</th>
                <th className="py-3.5 px-4 text-center">Credits</th>
              </tr>
            </thead>
            <tbody className="font-body text-sm divide-y divide-outline-variant/15 text-on-surface">
              {student.subjects.map((sub, i) => (
                <tr
                  key={i}
                  className="hover:bg-surface-container-low/30 transition-colors"
                >
                  <td className="py-3 px-4 font-mono text-xs text-on-surface-variant font-semibold">
                    {sub.code}
                  </td>
                  <td className="py-3 px-4 font-medium">{sub.name}</td>
                  <td className="py-3 px-4 text-center font-headline font-bold text-primary">
                    {sub.grade}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-on-surface-variant">
                    {sub.credits}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Results Banner Box */}
          <div className="flex flex-col md:flex-row justify-between items-center bg-surface-container p-6 rounded-xl border border-outline-variant/30 mb-8 gap-6 md:gap-0">
            <div className="flex gap-12">
              <div className="flex flex-col items-center">
                <span className="font-label text-xs text-on-surface-variant mb-1 uppercase tracking-wider font-bold">
                  SGPA
                </span>
                <span className="font-headline text-4xl font-bold text-on-surface">
                  {student.sgpa.toFixed(2)}
                </span>
              </div>
              {student.cgpa !== null && (
                <>
                  <div className="w-px bg-outline-variant/50 h-14" />
                  <div className="flex flex-col items-center">
                    <span className="font-label text-xs text-on-surface-variant mb-1 uppercase tracking-wider font-bold">
                      CGPA
                    </span>
                    <span className="font-headline text-4xl font-bold text-on-surface">
                      {student.cgpa.toFixed(2)}
                    </span>
                  </div>
                </>
              )}
            </div>

          {/* Stamp */}
          <div
            className={cn(
              "px-10 py-3.5 rounded-full border-2 shadow-sm transform -rotate-2 font-headline text-2xl font-bold tracking-[0.2em]",
              isPass
                ? "bg-[#1b4332] text-white border-[#2d6a4f]"
                : "bg-error text-on-error border-error-container"
            )}
          >
            {student.resultStatus}
          </div>
        </div>

        {/* Certificate Footer Stamp & Signature */}
        <div className="flex flex-col sm:flex-row justify-between items-end border-t border-outline-variant/50 pt-6 mt-8">
          <div className="text-left">
            <p className="font-label text-xs text-on-surface-variant mb-1">
              Date of Publication:{" "}
              <strong>
                {student.createdAt
                  ? new Date(student.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "N/A"}
              </strong>
            </p>
            <p className="font-label text-[10px] text-outline italic">
              This is a computer-generated statement and does not require a physical signature.
            </p>
          </div>
          <div className="text-center sm:text-right mt-6 sm:mt-0">
            <img
              alt="Controller of Examinations"
              className="h-28 object-contain mx-auto sm:mr-0"
              src="/controller-signature.png"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
