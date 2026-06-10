import { CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import type { PublicStudentResult } from "@/lib/types";

interface ResultPreviewCardProps {
  student: PublicStudentResult;
}

function statusBadge(status: PublicStudentResult["resultStatus"]) {
  if (status === "PASS") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success font-label text-xs uppercase tracking-widest font-bold">
        <CheckCircle className="size-3.5" />
        Pass
      </span>
    );
  }
  if (status === "FAIL") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-error/10 text-error font-label text-xs uppercase tracking-widest font-bold">
        <XCircle className="size-3.5" />
        Fail
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-academic-gold/20 text-academic-gold-dark font-label text-xs uppercase tracking-widest font-bold">
      <Clock className="size-3.5" />
      Pending
    </span>
  );
}

export function ResultPreviewCard({ student }: ResultPreviewCardProps) {
  return (
    <article className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-heritage-maroon to-heritage-maroon-dark text-academic-gold px-5 py-4 flex items-center gap-3">
        <div className="size-10 rounded-full bg-academic-gold/15 border border-academic-gold/40 flex items-center justify-center font-headline font-bold">
          OU
        </div>
        <div className="leading-tight">
          <h3 className="font-headline text-base font-bold">Statement Preview</h3>
          <p className="font-label text-[10px] uppercase tracking-widest text-academic-gold/80">
            {student.examMonth} {student.examYear} · Semester {student.semester}
          </p>
        </div>
      </div>

      <div className="px-5 py-4 space-y-2.5">
        <Row label="Name" value={student.name} />
        <Row label="Hall Ticket" value={student.hallTicket} mono />
        <Row label="Course" value={`${student.course} · ${student.branch}`} />
        <Row label="College" value={`${student.collegeName} (${student.collegeCode})`} />
        <Row label="SGPA" value={student.sgpa.toFixed(2)} bold />
        {student.cgpa !== null && <Row label="CGPA" value={student.cgpa.toFixed(2)} bold />}
        <div className="pt-2">{statusBadge(student.resultStatus)}</div>
      </div>

      <div className="px-5 py-3 border-t border-outline-variant/30 flex items-center justify-between text-xs text-on-surface-variant">
        <Link
          href={`/result/${student.hallTicket}?dob=${student.dob}`}
          target="_blank"
          className="font-label text-[10px] uppercase tracking-widest text-primary hover:underline inline-flex items-center gap-1"
        >
          Open full statement
        </Link>
        <span className="font-mono text-[10px]">v1.0</span>
      </div>
    </article>
  );
}

function Row({
  label,
  value,
  mono,
  bold,
}: {
  label: string;
  value: string;
  mono?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant min-w-20">
        {label}
      </span>
      <span
        className={
          (mono ? "font-mono " : "font-body ") +
          (bold ? "font-bold text-base text-on-surface" : "text-sm text-on-surface")
        }
      >
        {value}
      </span>
    </div>
  );
}
