"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Filter,
  Loader2,
} from "lucide-react";
import type { Student, ResultStatus } from "@/lib/types";
import { clientGetAdminStudents, clientDeleteAdminStudent } from "@/lib/data/client";

function examLabel(s: Student): string {
  const month = s.examMonth ? s.examMonth.charAt(0) + s.examMonth.slice(1).toLowerCase() : "";
  return `${month} ${s.examYear}`;
}

function statusPill(status: ResultStatus) {
  if (status === "PASS") return "admin-badge-pass";
  if (status === "FAIL") return "admin-badge-fail";
  if (status === "PENDING" || status === "WITH_HELD")
    return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-container-high text-on-surface-variant";
  return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-container text-on-surface-variant";
}

const PAGE_SIZE_OPTIONS = [10, 25, 50];

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("ALL");
  const [semesterFilter, setSemesterFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      setLoading(true);
    }, 0);
    clientGetAdminStudents({ pageSize: 200 })
      .then((res) => {
        if (cancelled) return;
        setStudents(res.items);
        setTotal(res.total);
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; clearTimeout(t); };
  }, []);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      if (courseFilter !== "ALL" && s.course !== courseFilter) return false;
      if (semesterFilter !== "ALL" && String(s.semester) !== semesterFilter) return false;
      if (!q.trim()) return true;
      const needle = q.toLowerCase();
      return s.hallTicket.toLowerCase().includes(needle) || s.name.toLowerCase().includes(needle);
    });
  }, [students, q, courseFilter, semesterFilter]);

  const totalPages = Math.ceil(total / pageSize);
  const currentPage = Math.min(page, totalPages || 1);
  const from = (currentPage - 1) * pageSize;
  const to = Math.min(from + pageSize, total);
  const pageItems = filtered.slice(0, pageSize);

  const courseOptions = useMemo(() => Array.from(new Set(students.map((s) => s.course))).sort(), [students]);
  const semesterOptions = useMemo(() => Array.from(new Set(students.map((s) => s.semester))).sort((a, b) => a - b), [students]);

  async function confirmDelete() {
    if (!deleteId) return;
    const id = deleteId;
    setDeleteId(null);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    try { await clientDeleteAdminStudent(id); } catch {}
  }

  return (
    <main className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-headline text-xl font-bold text-on-surface tracking-tight">Student Registry</h1>
            <p className="font-body text-sm text-on-surface-variant mt-0.5">Manage and view detailed records for all registered candidates across faculties.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg font-label text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors">
              <Download className="size-4" />
              Export CSV
            </button>
            <Link href="/admin/students/new" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-label text-xs font-bold hover:bg-primary-container hover:text-white transition-colors shadow-sm">
              <Plus className="size-4" />
              Add Student
            </Link>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white border border-outline-variant/40 rounded-xl shadow-sm overflow-hidden">
          {/* Search/Filters Bar */}
          <div className="bg-white border-b border-outline-variant/40 px-5 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none size-4" />
                  <input
                    type="text"
                    placeholder="Search HT Number"
                    value={q}
                    onChange={(e) => { setQ(e.target.value); setPage(1); }}
                    className="w-full bg-white border border-outline-variant rounded-lg py-2.5 pl-9 pr-4 font-body text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
              <div className="relative">
                <select
                  value={courseFilter}
                  onChange={(e) => { setCourseFilter(e.target.value); setPage(1); }}
                  className="appearance-none bg-white border border-outline-variant rounded-lg py-2.5 pl-4 pr-9 font-body text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
                >
                  <option value="ALL">All Courses</option>
                  {courseOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant size-4" />
              </div>
              <div className="relative">
                <select
                  value={semesterFilter}
                  onChange={(e) => { setSemesterFilter(e.target.value); setPage(1); }}
                  className="appearance-none bg-white border border-outline-variant rounded-lg py-2.5 pl-4 pr-9 font-body text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
                >
                  <option value="ALL">All Semesters</option>
                  {semesterOptions.map((n) => <option key={n} value={n}>Sem {n}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant size-4" />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 font-label text-xs text-on-surface-variant hover:text-primary transition-colors border border-outline-variant rounded-lg"
              >
                <Filter className="size-4" />
                More Filters
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="admin-table-header border-b border-outline-variant/40">
                  <th className="py-4 px-6 font-semibold">HT No</th>
                  <th className="py-4 px-6 font-semibold">Candidate Name</th>
                  <th className="py-4 px-6 font-semibold">Course</th>
                  <th className="py-4 px-6 font-semibold">Sem</th>
                  <th className="py-4 px-6 font-semibold">Exam Yr</th>
                  <th className="py-4 px-6 font-semibold">Status</th>
                  <th className="py-4 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {pageItems.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/50 transition-colors">
                    <td className="py-4 px-6 font-mono text-sm text-on-surface-variant">{s.hallTicket}</td>
                    <td className="py-4 px-6 font-body text-sm font-medium text-on-surface">{s.name}</td>
                    <td className="py-4 px-6 font-body text-sm text-on-surface-variant">{s.course}</td>
                    <td className="py-4 px-6 font-body text-sm text-on-surface-variant">{s.semester}</td>
                    <td className="py-4 px-6 font-body text-sm text-on-surface-variant">{examLabel(s)}</td>
                    <td className="py-4 px-6"><span className={statusPill(s.resultStatus)}>{s.resultStatus}</span></td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/students/${s.id}/edit`} className="p-1.5 text-on-surface-variant hover:text-primary transition-colors" title="View"><Eye className="size-4" /></Link>
                        <Link href={`/admin/students/${s.id}/edit`} className="p-1.5 text-on-surface-variant hover:text-primary transition-colors" title="Edit"><Edit className="size-4" /></Link>
                        <button type="button" onClick={() => setDeleteId(s.id)} className="p-1.5 text-on-surface-variant hover:text-error transition-colors" title="Delete" aria-label={`Delete ${s.name}`}><Trash2 className="size-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {loading ? (
                  <tr><td colSpan={7} className="py-16 text-center text-on-surface-variant font-body text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="size-5 animate-spin" />
                      Loading students...
                    </div>
                  </td></tr>
                ) : pageItems.length === 0 ? (
                  <tr><td colSpan={7} className="py-16 text-center text-on-surface-variant font-body text-sm">No students match your filters.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          <div className="bg-muted/30 border-t border-outline-variant/40 px-5 py-3 flex items-center justify-between">
            <div className="font-body text-sm text-on-surface-variant">
              Showing <span className="font-semibold text-on-surface">{from + 1}-{to}</span> of <span className="font-semibold text-on-surface">{total.toLocaleString("en-IN")}</span> results
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-body text-xs text-on-surface-variant">Rows:</span>
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="bg-transparent border-none text-sm font-body text-on-surface focus:ring-0 cursor-pointer">
                  {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded hover:bg-surface-variant transition-colors text-on-surface-variant disabled:opacity-50" aria-label="Previous">
                  <ChevronLeft className="size-4" />
                </button>
                {buildPageNumbers(currentPage, totalPages).map((p, i) =>
                  p === "…" ? (
                    <span key={`e-${i}`} className="px-1 text-on-surface-variant text-sm">…</span>
                  ) : (
                    <button key={p} type="button" onClick={() => setPage(p)} className={`w-8 h-8 rounded-md flex items-center justify-center text-sm transition-colors ${p === currentPage ? "bg-primary text-on-primary font-bold" : "hover:bg-surface-variant text-on-surface-variant"}`}>{p}</button>
                  )
                )}
                <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded hover:bg-surface-variant transition-colors text-on-surface-variant disabled:opacity-50" aria-label="Next">
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-on-surface/50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="admin-card p-6 max-w-md w-full">
            <h2 className="font-headline text-lg font-bold text-on-surface mb-2">Delete student?</h2>
            <p className="font-body text-sm text-on-surface-variant mb-5">This action cannot be undone. The student record will be removed permanently.</p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface font-label text-xs font-semibold hover:bg-surface-container">Cancel</button>
              <button type="button" onClick={confirmDelete} className="px-4 py-2 rounded-lg bg-error text-on-error font-label text-xs font-bold hover:opacity-90">Delete</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function buildPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}
