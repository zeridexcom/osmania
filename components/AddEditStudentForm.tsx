"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Save,
  CheckCircle,
  X,
  Upload,
  FileText,
  Plus,
  Trash2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  clientCreateAdminStudent,
  clientUpdateAdminStudent,
} from "@/lib/data/client";
import { computeResultStatus, computeSgpa, computeSubjectTotals } from "@/lib/grading";
import type {
  CourseCode,
  Regulation,
  ResultStatus,
  Student,
} from "@/lib/types";
import type { StudentInput } from "@/lib/validators";

interface SubjectEntry {
  id: string;
  code: string;
  name: string;
  credits: number;
  internalMax: number;
  internalObtained: number;
  externalMax: number;
  externalObtained: number;
}

function emptySubject(): SubjectEntry {
  return {
    id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    code: "",
    name: "",
    credits: 3,
    internalMax: 30,
    internalObtained: 0,
    externalMax: 70,
    externalObtained: 0,
  };
}

interface CourseOption {
  course: CourseCode;
  branch: string;
  semesters: number;
}

const COURSE_OPTIONS: CourseOption[] = [
  { course: "BA", branch: "Arts", semesters: 6 },
  { course: "BCOM", branch: "Commerce", semesters: 6 },
  { course: "BSC", branch: "Science", semesters: 6 },
  { course: "BBA", branch: "Business Administration", semesters: 6 },
  { course: "BCA", branch: "Computer Applications", semesters: 6 },
  { course: "BE", branch: "Engineering", semesters: 8 },
  { course: "BTECH", branch: "Computer Science and Engineering", semesters: 8 },
  { course: "BTECH", branch: "Electronics and Communication Engg.", semesters: 8 },
  { course: "BTECH", branch: "Mechanical Engineering", semesters: 8 },
  { course: "BTECH", branch: "Civil Engineering", semesters: 8 },
  { course: "BTECH", branch: "Information Technology", semesters: 8 },
  { course: "MA", branch: "Arts (PG)", semesters: 4 },
  { course: "MCOM", branch: "Commerce (PG)", semesters: 4 },
  { course: "MSC", branch: "Science (PG)", semesters: 4 },
  { course: "MBA", branch: "Business Administration (PG)", semesters: 4 },
  { course: "MCA", branch: "Computer Applications (PG)", semesters: 6 },
];

const REGULATION_OPTIONS: { value: Regulation; label: string }[] = [
  { value: "CBCS", label: "CBCS" },
  { value: "NON_CBCS", label: "Non-CBCS" },
  { value: "AICTE_MODEL", label: "AICTE Model" },
];

export interface AddEditStudentFormProps {
  mode: "create" | "edit";
  initial?: Student | null;
  onDone?: () => void;
}

export function AddEditStudentForm({
  mode,
  initial,
  onDone,
}: AddEditStudentFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const [htno, setHtno] = useState(initial?.hallTicket ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [fatherName, setFatherName] = useState(initial?.fatherName ?? "");
  const [motherName, setMotherName] = useState(initial?.motherName ?? "");
  const [dob, setDob] = useState(initial?.dob ?? "");
  const [course, setCourse] = useState<CourseCode>(initial?.course ?? "BTECH");
  const [branch, setBranch] = useState(initial?.branch ?? "Computer Science and Engineering");
  const [regulation, setRegulation] = useState<Regulation>(initial?.regulation ?? "CBCS");
  const [semester, setSemester] = useState(initial?.semester ?? 8);
  const [examMonth, setExamMonth] = useState(initial?.examMonth ?? "MAY");
  const [examYear, setExamYear] = useState(initial?.examYear ?? 2026);
  const [collegeCode, setCollegeCode] = useState(initial?.collegeCode ?? "1005");
  const [collegeName, setCollegeName] = useState(initial?.collegeName ?? "University College of Engineering");
  const [cgpa, setCgpa] = useState<number | "">(initial?.cgpa ?? "");

  const [subjects, setSubjects] = useState<SubjectEntry[]>(
    initial
      ? initial.subjects.map((s) => ({
          id: `init_${s.code}`,
          code: s.code,
          name: s.name,
          credits: s.credits,
          internalMax: s.internalMax,
          internalObtained: s.internalObtained,
          externalMax: s.externalMax,
          externalObtained: s.externalObtained,
        }))
      : [emptySubject()]
  );
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingFile, setProcessingFile] = useState(false);

  useEffect(() => {
    if (!saved || !onDone) return;
    const t = setTimeout(onDone, 600);
    return () => clearTimeout(t);
  }, [saved, onDone]);

  const selectedCourse = COURSE_OPTIONS.find((c) => c.course === course && c.branch === branch);
  const maxSem = selectedCourse?.semesters ?? 8;

  function handleCourseChange(value: string) {
    const idx = parseInt(value, 10);
    if (!isNaN(idx) && COURSE_OPTIONS[idx]) {
      const opt = COURSE_OPTIONS[idx];
      setCourse(opt.course);
      setBranch(opt.branch);
      if (semester > opt.semesters) setSemester(opt.semesters);
    }
  }

  const courseIndex = COURSE_OPTIONS.findIndex(
    (c) => c.course === course && c.branch === branch
  );

  function updateSubject(id: string, patch: Partial<SubjectEntry>) {
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
  }

  function removeSubject(id: string) {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  }

  function addSubject() {
    setSubjects((prev) => [...prev, emptySubject()]);
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile();
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile();
  }

  async function processFile() {
    setProcessingFile(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 500));
      setError("OCR auto-extraction is not available in this environment. Please enter data manually.");
    } catch {
      setError("Failed to process file");
    } finally {
      setProcessingFile(false);
    }
  }

  const totalCredits = subjects.reduce((a, s) => a + s.credits, 0);

  const finalSubjects = subjects.map((s) => {
    const totals = computeSubjectTotals(s);
    return {
      code: s.code,
      name: s.name,
      credits: s.credits,
      internalMax: s.internalMax,
      internalObtained: s.internalObtained,
      externalMax: s.externalMax,
      externalObtained: s.externalObtained,
      totalMax: totals.totalMax,
      totalObtained: totals.totalObtained,
      grade: totals.grade,
      gradePoints: totals.gradePoints,
    };
  });
  const sgpa = computeSgpa(finalSubjects);
  const resultStatus: ResultStatus = computeResultStatus(finalSubjects, sgpa);

  async function onSave(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);

    if (!name.trim() || !htno.trim() || !dob) {
      setError("Hall Ticket, Full Name, and Date of Birth are required.");
      return;
    }
    if (subjects.length === 0 || subjects.every((s) => !s.name.trim())) {
      setError("Add at least one subject with a name.");
      return;
    }

    setSubmitting(true);
    try {
      const payload: StudentInput = {
        hallTicket: htno.trim().toUpperCase(),
        name: name.trim(),
        fatherName: fatherName.trim(),
        motherName: motherName.trim(),
        dob,
        course,
        branch: branch.trim(),
        regulation,
        semester,
        examMonth,
        examYear,
        collegeCode: collegeCode.trim(),
        collegeName: collegeName.trim(),
        cgpa: cgpa === "" ? null : Number(cgpa),
        resultStatus,
        subjects: subjects.map((s) => ({
          code: s.code,
          name: s.name,
          credits: s.credits,
          internalMax: s.internalMax,
          internalObtained: s.internalObtained,
          externalMax: s.externalMax,
          externalObtained: s.externalObtained,
        })),
      };

      if (mode === "create") {
        await clientCreateAdminStudent(payload);
      } else if (initial) {
        await clientUpdateAdminStudent(initial.id, payload);
      }
      setSaved(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-card">
      {/* Header */}
      <div className="px-6 py-4 border-b border-outline-variant/40 flex items-center justify-between">
        <div>
          <h2 className="font-headline text-xl font-bold text-on-surface tracking-tight">
            {mode === "create" ? "Add New Student Result" : "Edit Student Result"}
          </h2>
          <p className="font-body text-xs text-on-surface-variant mt-0.5">
            {mode === "create"
              ? "Enter student details and academic record"
              : "Update existing student record"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {onDone ? (
            <button type="button" onClick={onDone} className="px-4 py-2 font-label text-sm text-on-surface-variant hover:text-primary transition-colors">
              Cancel
            </button>
          ) : (
            <Link href="/admin/students" className="px-4 py-2 font-label text-sm text-on-surface-variant hover:text-primary transition-colors">
              Cancel
            </Link>
          )}
          <button
            type="button"
            onClick={() => onSave()}
            disabled={submitting || saved}
            className="px-5 py-2.5 bg-primary text-on-primary rounded-lg font-label text-xs font-bold hover:bg-primary-container hover:text-white transition-colors shadow-sm flex items-center gap-2 disabled:opacity-60"
          >
            {saved ? <CheckCircle className="size-4" /> : <Save className="size-4" />}
            {saved ? "Saved" : submitting ? "Saving..." : "Save Result"}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-error-container text-on-error-container px-6 py-3 flex items-center justify-between border-b border-error/30">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <p className="font-body text-sm">{error}</p>
          </div>
          <button type="button" onClick={() => setError(null)} className="hover:opacity-70" aria-label="Dismiss">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Form Body */}
      <form onSubmit={onSave}>
        <div className="p-6 space-y-8">
          {/* --- File Upload --- */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
              dragOver
                ? "border-primary bg-primary/5"
                : "border-outline-variant/60 bg-surface-container-lowest hover:border-primary/40"
            )}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={handleFileSelect}
            />
            <div className="flex flex-col items-center gap-3">
              <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                {processingFile ? (
                  <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="size-6" />
                )}
              </div>
              <div>
                <p className="text-base font-semibold text-primary">
                  Upload & Drop File Here
                </p>
                <p className="text-sm text-on-surface-variant mt-1">
                  PDF, PNG, JPG (Max 10MB)
                </p>
              </div>
              <button
                type="button"
                disabled={processingFile}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant bg-white text-on-surface font-label text-xs font-semibold hover:bg-surface-container transition-colors disabled:opacity-60"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              >
                {processingFile ? (
                  <>
                    <div className="size-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FileText className="size-3.5" />
                    Select File to Auto-Extract Data
                  </>
                )}
              </button>
            </div>
          </div>

          {/* --- Student Details --- */}
          <div>
            <h3 className="font-headline text-base font-bold text-on-surface mb-5 flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              Student Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Hall Ticket No.">
                <input
                  type="text"
                  value={htno}
                  onChange={(e) => setHtno(e.target.value.toUpperCase())}
                  placeholder="e.g. 1005-20-733-001"
                  className="input-field uppercase font-mono"
                />
              </Field>
              <Field label="Full Name">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full legal name"
                  className="input-field"
                />
              </Field>
              <Field label="Date of Birth">
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="input-field"
                />
              </Field>
              <Field label="Course & Branch">
                <div className="relative">
                  <select
                    value={courseIndex >= 0 ? courseIndex : ""}
                    onChange={(e) => handleCourseChange(e.target.value)}
                    className="input-field appearance-none pr-8"
                  >
                    <option value="">Select Course</option>
                    {COURSE_OPTIONS.map((opt, i) => (
                      <option key={i} value={i}>
                        {opt.course} - {opt.branch}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant size-4" />
                </div>
              </Field>
              <Field label="Semester">
                <div className="relative">
                  <select
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="input-field appearance-none pr-8"
                  >
                    {Array.from({ length: maxSem }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        Semester {i + 1}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant size-4" />
                </div>
              </Field>
              <Field label="Exam Period">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <select
                      value={examMonth}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (["JAN", "MAY", "JUL", "DEC"].includes(v)) setExamMonth(v);
                      }}
                      className="input-field appearance-none pr-8"
                    >
                      <option value="JAN">JAN</option>
                      <option value="MAY">MAY</option>
                      <option value="JUL">JUL</option>
                      <option value="DEC">DEC</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant size-3.5" />
                  </div>
                  <input
                    type="number"
                    value={examYear}
                    onChange={(e) => setExamYear(Number(e.target.value) || 2026)}
                    className="input-field w-24"
                  />
                </div>
              </Field>
              <Field label="Regulation">
                <div className="relative">
                  <select
                    value={regulation}
                    onChange={(e) => setRegulation(e.target.value as Regulation)}
                    className="input-field appearance-none pr-8"
                  >
                    {REGULATION_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant size-4" />
                </div>
              </Field>
              <Field label="College Code">
                <input
                  type="text"
                  value={collegeCode}
                  onChange={(e) => setCollegeCode(e.target.value)}
                  placeholder="e.g. 1005"
                  className="input-field"
                />
              </Field>
              <Field label="College Name">
                <input
                  type="text"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="College name"
                  className="input-field"
                />
              </Field>
              <Field label="CGPA (Overall)">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={cgpa === "" ? "" : cgpa}
                  onChange={(e) => setCgpa(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 8.42"
                  className="input-field"
                />
              </Field>
              <Field label="Father Name">
                <input
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="Father's name"
                  className="input-field"
                />
              </Field>
              <Field label="Mother Name">
                <input
                  type="text"
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  placeholder="Mother's name"
                  className="input-field"
                />
              </Field>
            </div>
          </div>

          {/* --- Subjects --- */}
          <div className="border border-outline-variant/40 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline text-base font-bold text-on-surface">
                  Subjects
                </h3>
                <p className="font-body text-xs text-on-surface-variant mt-0.5">
                  Add the subjects for this semester
                </p>
              </div>
              <button
                type="button"
                onClick={addSubject}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-outline-variant rounded-lg font-label text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors"
              >
                <Plus className="size-3.5" />
                Add Subject
              </button>
            </div>

            {subjects.length === 0 ? (
              <div className="py-8 text-center text-on-surface-variant font-body text-sm italic">
                No subjects yet. Click &quot;Add Subject&quot; to begin.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="font-label text-xs text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/30">
                      <th className="pb-2 pr-2 w-24">Code</th>
                      <th className="pb-2 pr-2">Subject Name</th>
                      <th className="pb-2 pr-2 w-16 text-center">Cr.</th>
                      <th className="pb-2 pr-2 w-20 text-center" colSpan={2}>Internal (Max/Obt)</th>
                      <th className="pb-2 pr-2 w-20 text-center" colSpan={2}>External (Max/Obt)</th>
                      <th className="pb-2 pr-2 w-14 text-center">Total</th>
                      <th className="pb-2 pr-2 w-12 text-center">Grade</th>
                      <th className="pb-2 pr-2 w-12 text-center">GP</th>
                      <th className="pb-2 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {subjects.map((s) => {
                      const totals = computeSubjectTotals(s);
                      return (
                        <tr key={s.id} className="hover:bg-surface-container-low transition-colors">
                          <td className="py-2 pr-2">
                            <input
                              type="text"
                              value={s.code}
                              onChange={(e) => updateSubject(s.id, { code: e.target.value.toUpperCase() })}
                              placeholder="Code"
                              className="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary outline-none text-xs px-1 py-1 font-mono"
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <input
                              type="text"
                              value={s.name}
                              onChange={(e) => updateSubject(s.id, { name: e.target.value })}
                              placeholder="Subject name"
                              className="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary outline-none text-xs px-1 py-1"
                            />
                          </td>
                          <td className="py-2 pr-2 text-center">
                            <input
                              type="number"
                              min={0}
                              max={20}
                              value={s.credits}
                              onChange={(e) => updateSubject(s.id, { credits: Number(e.target.value) || 0 })}
                              className="w-14 text-center bg-transparent border-b border-outline-variant/30 focus:border-primary outline-none text-xs py-1"
                            />
                          </td>
                          <td className="py-2 pr-1 text-center">
                            <input
                              type="number"
                              min={0}
                              value={s.internalMax}
                              tabIndex={-1}
                              onChange={(e) => updateSubject(s.id, { internalMax: Number(e.target.value) || 0 })}
                              className="w-12 text-center bg-transparent border-b border-outline-variant/30 focus:border-primary outline-none text-xs py-1 text-on-surface-variant"
                              title="Internal Max"
                            />
                          </td>
                          <td className="py-2 pr-2 text-center">
                            <input
                              type="number"
                              min={0}
                              value={s.internalObtained}
                              onChange={(e) => updateSubject(s.id, { internalObtained: Number(e.target.value) || 0 })}
                              className="w-12 text-center bg-transparent border-b border-outline-variant/30 focus:border-primary outline-none text-xs py-1"
                              title="Internal Obtained"
                            />
                          </td>
                          <td className="py-2 pr-1 text-center">
                            <input
                              type="number"
                              min={0}
                              value={s.externalMax}
                              tabIndex={-1}
                              onChange={(e) => updateSubject(s.id, { externalMax: Number(e.target.value) || 0 })}
                              className="w-12 text-center bg-transparent border-b border-outline-variant/30 focus:border-primary outline-none text-xs py-1 text-on-surface-variant"
                              title="External Max"
                            />
                          </td>
                          <td className="py-2 pr-2 text-center">
                            <input
                              type="number"
                              min={0}
                              value={s.externalObtained}
                              onChange={(e) => updateSubject(s.id, { externalObtained: Number(e.target.value) || 0 })}
                              className="w-12 text-center bg-transparent border-b border-outline-variant/30 focus:border-primary outline-none text-xs py-1"
                              title="External Obtained"
                            />
                          </td>
                          <td className="py-2 pr-2 text-center font-semibold text-sm">
                            {totals.totalObtained}
                          </td>
                          <td
                            className={cn(
                              "py-2 pr-2 text-center font-bold text-sm",
                              totals.grade === "F" ? "text-error" : "text-tertiary"
                            )}
                          >
                            {totals.grade}
                          </td>
                          <td className="py-2 pr-2 text-center font-semibold text-sm">
                            {totals.gradePoints}
                          </td>
                          <td className="py-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeSubject(s.id)}
                              className="text-outline hover:text-error transition-colors p-1"
                              aria-label="Remove subject"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="border-t-2 border-outline-variant/40">
                    <tr className="font-label text-sm">
                      <td colSpan={2} className="pt-3 pr-2 text-right font-semibold text-on-surface-variant">
                        Totals:
                      </td>
                      <td className="pt-3 pr-2 text-center font-bold text-primary">{totalCredits}</td>
                      <td colSpan={5} className="pt-3 pr-2"></td>
                      <td className="pt-3 pr-2 text-right font-semibold text-on-surface-variant text-xs whitespace-nowrap">
                        SGPA:
                      </td>
                      <td className="pt-3 text-center font-bold text-primary">{sgpa.toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            <div className="flex items-start gap-2 p-3 rounded-lg bg-surface-container border border-outline-variant/50">
              <AlertCircle className="size-4 text-tertiary shrink-0 mt-0.5" />
              <p className="font-body text-xs text-on-surface-variant">
                Marks, grade, and SGPA are computed automatically using OU CBCS grading conventions (O: 90-100, A+: 80-89, A: 70-79, B+: 60-69, B: 50-59, C: 40-49, D: 36-39, F: &lt;36).
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant">
        {label}
      </label>
      {children}
    </div>
  );
}
