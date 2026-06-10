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
import { createWorker } from "tesseract.js";
import { cn } from "@/lib/utils";
import {
  clientCreateAdminStudent,
  clientUpdateAdminStudent,
} from "@/lib/data/client";
import { computeResultStatus, computeSgpa } from "@/lib/grading";
import type {
  CourseCode,
  ResultStatus,
  Student,
  Grade,
} from "@/lib/types";
import type { StudentInput } from "@/lib/validators";

interface SubjectEntry {
  id: string;
  name: string;
  credits: number;
  grade: Grade | "";
  points: number;
  marksAwarded: number;
  maximumMarks: number;
}

function emptySubject(assessment: "marks" | "credits"): SubjectEntry {
  return {
    id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: "",
    credits: assessment === "credits" ? 3 : 0,
    grade: "",
    points: 0,
    marksAwarded: 0,
    maximumMarks: 100,
  };
}

const GRADE_MAP: Record<string, number> = {
  O: 10, "A+": 9, A: 8, "B+": 7, B: 6, C: 5, F: 0, Ab: 0,
};

const GRADE_OPTIONS = ["O", "A+", "A", "B+", "B", "C", "F", "Ab"];

interface CourseOption {
  course: CourseCode;
  branch: string;
  label: string;
  yearSemOptions: string[];
  semesterMap: Record<string, number>;
}

const COURSE_OPTIONS: CourseOption[] = [
  { course: "BA", branch: "Arts", label: "B.A - Arts", yearSemOptions: ["FIRST YEAR", "SECOND YEAR", "THIRD YEAR"], semesterMap: { "FIRST YEAR": 1, "SECOND YEAR": 3, "THIRD YEAR": 5 } },
  { course: "BSC", branch: "Physics", label: "B.Sc - Physics", yearSemOptions: ["FIRST YEAR", "SECOND YEAR", "THIRD YEAR"], semesterMap: { "FIRST YEAR": 1, "SECOND YEAR": 3, "THIRD YEAR": 5 } },
  { course: "BSC", branch: "Chemistry", label: "B.Sc - Chemistry", yearSemOptions: ["FIRST YEAR", "SECOND YEAR", "THIRD YEAR"], semesterMap: { "FIRST YEAR": 1, "SECOND YEAR": 3, "THIRD YEAR": 5 } },
  { course: "BSC", branch: "Mathematics", label: "B.Sc - Mathematics", yearSemOptions: ["FIRST YEAR", "SECOND YEAR", "THIRD YEAR"], semesterMap: { "FIRST YEAR": 1, "SECOND YEAR": 3, "THIRD YEAR": 5 } },
  { course: "BSC", branch: "Computer Science", label: "B.Sc - Computer Science", yearSemOptions: ["FIRST YEAR", "SECOND YEAR", "THIRD YEAR"], semesterMap: { "FIRST YEAR": 1, "SECOND YEAR": 3, "THIRD YEAR": 5 } },
  { course: "BSC", branch: "Biotechnology", label: "B.Sc - Biotechnology", yearSemOptions: ["FIRST YEAR", "SECOND YEAR", "THIRD YEAR"], semesterMap: { "FIRST YEAR": 1, "SECOND YEAR": 3, "THIRD YEAR": 5 } },
  { course: "BCOM", branch: "General", label: "B.Com - General", yearSemOptions: ["FIRST YEAR", "SECOND YEAR", "THIRD YEAR"], semesterMap: { "FIRST YEAR": 1, "SECOND YEAR": 3, "THIRD YEAR": 5 } },
  { course: "BCOM", branch: "Computers", label: "B.Com - Computers", yearSemOptions: ["FIRST YEAR", "SECOND YEAR", "THIRD YEAR"], semesterMap: { "FIRST YEAR": 1, "SECOND YEAR": 3, "THIRD YEAR": 5 } },
  { course: "BBA", branch: "General", label: "B.B.A - General", yearSemOptions: ["FIRST YEAR", "SECOND YEAR", "THIRD YEAR"], semesterMap: { "FIRST YEAR": 1, "SECOND YEAR": 3, "THIRD YEAR": 5 } },
  { course: "BCA", branch: "Computer Applications", label: "B.C.A - Computer Applications", yearSemOptions: ["FIRST YEAR", "SECOND YEAR", "THIRD YEAR"], semesterMap: { "FIRST YEAR": 1, "SECOND YEAR": 3, "THIRD YEAR": 5 } },
  { course: "BTECH", branch: "Computer Science Engineering", label: "B.Tech - Computer Science Engineering", yearSemOptions: ["FIRST YEAR", "SECOND YEAR", "THIRD YEAR", "FOURTH YEAR"], semesterMap: { "FIRST YEAR": 1, "SECOND YEAR": 3, "THIRD YEAR": 5, "FOURTH YEAR": 7 } },
  { course: "BTECH", branch: "Electronics & Communication Engineering", label: "B.Tech - ECE", yearSemOptions: ["FIRST YEAR", "SECOND YEAR", "THIRD YEAR", "FOURTH YEAR"], semesterMap: { "FIRST YEAR": 1, "SECOND YEAR": 3, "THIRD YEAR": 5, "FOURTH YEAR": 7 } },
  { course: "BTECH", branch: "Mechanical Engineering", label: "B.Tech - Mechanical", yearSemOptions: ["FIRST YEAR", "SECOND YEAR", "THIRD YEAR", "FOURTH YEAR"], semesterMap: { "FIRST YEAR": 1, "SECOND YEAR": 3, "THIRD YEAR": 5, "FOURTH YEAR": 7 } },
  { course: "BTECH", branch: "Civil Engineering", label: "B.Tech - Civil", yearSemOptions: ["FIRST YEAR", "SECOND YEAR", "THIRD YEAR", "FOURTH YEAR"], semesterMap: { "FIRST YEAR": 1, "SECOND YEAR": 3, "THIRD YEAR": 5, "FOURTH YEAR": 7 } },
  { course: "BTECH", branch: "Information Technology", label: "B.Tech - IT", yearSemOptions: ["FIRST YEAR", "SECOND YEAR", "THIRD YEAR", "FOURTH YEAR"], semesterMap: { "FIRST YEAR": 1, "SECOND YEAR": 3, "THIRD YEAR": 5, "FOURTH YEAR": 7 } },
  { course: "MA", branch: "Telugu", label: "M.A - Telugu", yearSemOptions: ["FIRST YEAR", "SECOND YEAR"], semesterMap: { "FIRST YEAR": 1, "SECOND YEAR": 3 } },
  { course: "MA", branch: "English", label: "M.A - English", yearSemOptions: ["FIRST YEAR", "SECOND YEAR"], semesterMap: { "FIRST YEAR": 1, "SECOND YEAR": 3 } },
  { course: "MA", branch: "History", label: "M.A - History", yearSemOptions: ["FIRST YEAR", "SECOND YEAR"], semesterMap: { "FIRST YEAR": 1, "SECOND YEAR": 3 } },
  { course: "MA", branch: "Economics", label: "M.A - Economics", yearSemOptions: ["FIRST YEAR", "SECOND YEAR"], semesterMap: { "FIRST YEAR": 1, "SECOND YEAR": 3 } },
  { course: "MSC", branch: "Physics", label: "M.Sc - Physics", yearSemOptions: ["FIRST YEAR", "SECOND YEAR"], semesterMap: { "FIRST YEAR": 1, "SECOND YEAR": 3 } },
  { course: "MSC", branch: "Chemistry", label: "M.Sc - Chemistry", yearSemOptions: ["FIRST YEAR", "SECOND YEAR"], semesterMap: { "FIRST YEAR": 1, "SECOND YEAR": 3 } },
  { course: "MSC", branch: "Mathematics", label: "M.Sc - Mathematics", yearSemOptions: ["FIRST YEAR", "SECOND YEAR"], semesterMap: { "FIRST YEAR": 1, "SECOND YEAR": 3 } },
  { course: "MSC", branch: "Computer Science", label: "M.Sc - Computer Science", yearSemOptions: ["FIRST YEAR", "SECOND YEAR"], semesterMap: { "FIRST YEAR": 1, "SECOND YEAR": 3 } },
  { course: "MSC", branch: "Data Science", label: "M.Sc - Data Science", yearSemOptions: ["FIRST YEAR", "SECOND YEAR"], semesterMap: { "FIRST YEAR": 1, "SECOND YEAR": 3 } },
  { course: "MCOM", branch: "General", label: "M.Com - General", yearSemOptions: ["FIRST YEAR", "SECOND YEAR"], semesterMap: { "FIRST YEAR": 1, "SECOND YEAR": 3 } },
  { course: "MBA", branch: "General", label: "M.B.A - General", yearSemOptions: ["FIRST YEAR", "SECOND YEAR"], semesterMap: { "FIRST YEAR": 1, "SECOND YEAR": 3 } },
  { course: "MBA", branch: "Finance", label: "M.B.A - Finance", yearSemOptions: ["FIRST YEAR", "SECOND YEAR"], semesterMap: { "FIRST YEAR": 1, "SECOND YEAR": 3 } },
  { course: "MBA", branch: "Marketing", label: "M.B.A - Marketing", yearSemOptions: ["FIRST YEAR", "SECOND YEAR"], semesterMap: { "FIRST YEAR": 1, "SECOND YEAR": 3 } },
  { course: "MCA", branch: "Computer Applications", label: "M.C.A - Computer Applications", yearSemOptions: ["FIRST YEAR", "SECOND YEAR", "THIRD YEAR"], semesterMap: { "FIRST YEAR": 1, "SECOND YEAR": 3, "THIRD YEAR": 5 } },
  { course: "BE", branch: "Engineering", label: "B.E - Engineering", yearSemOptions: ["FIRST YEAR", "SECOND YEAR", "THIRD YEAR", "FOURTH YEAR"], semesterMap: { "FIRST YEAR": 1, "SECOND YEAR": 3, "THIRD YEAR": 5, "FOURTH YEAR": 7 } },
];

const SEMESTER_BY_YEAR: Record<string, string[]> = {
  "FIRST YEAR": ["SEM 1", "SEM 2"],
  "SECOND YEAR": ["SEM 3", "SEM 4"],
  "THIRD YEAR": ["SEM 5", "SEM 6"],
  "FOURTH YEAR": ["SEM 7", "SEM 8"],
  "FIFTH YEAR": ["SEM 9", "SEM 10"],
};

const SEM_NUMBER: Record<string, number> = {
  "SEM 1": 1, "SEM 2": 2, "SEM 3": 3, "SEM 4": 4,
  "SEM 5": 5, "SEM 6": 6, "SEM 7": 7, "SEM 8": 8,
  "SEM 9": 9, "SEM 10": 10,
};

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

  const [name, setName] = useState(initial?.name ?? "");
  const [rollNo, setRollNo] = useState(initial?.hallTicket ?? "");
  const [yearPassout, setYearPassout] = useState(initial?.examYear ?? 2026);
  const [courseIdx, setCourseIdx] = useState<number | "">("");
  const [yearSem, setYearSem] = useState("");
  const [semester, setSemester] = useState("");
  const [assessmentType, setAssessmentType] = useState<"marks" | "credits">("marks");
  const [sgpa, setSgpa] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [subjects, setSubjects] = useState<SubjectEntry[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingFile, setProcessingFile] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);

  useEffect(() => {
    if (!saved || !onDone) return;
    const t = setTimeout(onDone, 600);
    return () => clearTimeout(t);
  }, [saved, onDone]);

  const selectedCourse = courseIdx !== "" ? COURSE_OPTIONS[courseIdx] : null;
  const yearSemOptions = selectedCourse?.yearSemOptions ?? [];
  const semesterOptions = yearSem ? SEMESTER_BY_YEAR[yearSem] ?? [] : [];

  function addSubject() {
    setSubjects((prev) => [...prev, emptySubject(assessmentType)]);
  }

  function updateSubject(id: string, patch: Partial<SubjectEntry>) {
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const updated = { ...s, ...patch };
        if ("grade" in patch && patch.grade) {
          updated.points = GRADE_MAP[patch.grade] ?? 0;
        }
        return updated;
      })
    );
  }

  function removeSubject(id: string) {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  }

  async function processOCR(file: File) {
    setProcessingFile(true);
    setOcrProgress(0);
    setError(null);
    try {
      const worker = await createWorker("eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setOcrProgress(Math.round(m.progress * 100));
          }
        },
      });
      const { data } = await worker.recognize(file);
      await worker.terminate();
      setOcrProgress(100);

      const text = data.text;
      console.log("OCR extracted text:", text);

      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

      let extractedName = "";
      let extractedRoll = "";

      for (const line of lines) {
        if (!extractedRoll && /[A-Z0-9]{6,20}/.test(line)) {
          const m = line.match(/[A-Z0-9]{6,20}/);
          if (m) extractedRoll = m[0];
        }
      }

      const nameLine = lines.find(
        (l) =>
          !/[A-Z0-9]{6,}/.test(l) &&
          l.length > 5 &&
          l.length < 100
      );
      if (nameLine) extractedName = nameLine;

      if (extractedName) setName(extractedName);
      if (extractedRoll) setRollNo(extractedRoll.toUpperCase());

      const subjectLines = lines.filter(
        (l) =>
          !l.includes("NAME") &&
          !l.includes("ROLL") &&
          !l.includes("UNIVERSITY") &&
          !l.includes("EXAM") &&
          l.length > 3 &&
          l.length < 80
      ).slice(0, 10);

      if (subjectLines.length > 0) {
        const parsed = subjectLines.map((sl) => {
          const parts = sl.split(/\s{2,}|\t|  +/);
          const s = emptySubject(assessmentType);
          if (parts.length >= 2) {
            const marks = parseInt(parts[parts.length - 1].replace(/[^0-9]/g, ""), 10);
            if (!isNaN(marks)) {
              s.name = parts.slice(0, -1).join(" ");
              s.marksAwarded = marks;
            } else {
              s.name = sl;
            }
          } else {
            s.name = sl;
          }
          return s;
        });
        setSubjects(parsed);
      }

      if (!extractedName && !extractedRoll) {
        setError("Could not auto-extract data. Please enter manually.");
      }
    } catch (err) {
      console.error("OCR Error:", err);
      setError("OCR processing failed. Please enter data manually.");
    } finally {
      setProcessingFile(false);
    }
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processOCR(file);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processOCR(file);
  }

  const finalSubjects = subjects.map((s) => {
    if (assessmentType === "credits") {
      const gp = s.grade ? (GRADE_MAP[s.grade] ?? 0) : 0;
      return {
        code: "",
        name: s.name,
        credits: s.credits || 0,
        internalMax: 0,
        internalObtained: 0,
        externalMax: 0,
        externalObtained: 0,
        totalMax: 0,
        totalObtained: 0,
        grade: (s.grade || "F") as Grade,
        gradePoints: gp,
      };
    }
    return {
      code: "",
      name: s.name,
      credits: 0,
      internalMax: s.maximumMarks,
      internalObtained: s.marksAwarded,
      externalMax: 0,
      externalObtained: 0,
      totalMax: s.maximumMarks,
      totalObtained: s.marksAwarded,
      grade: "F" as Grade,
      gradePoints: 0,
    };
  });

  const computedSgpa = computeSgpa(finalSubjects);
  const resultStatus: ResultStatus = computeResultStatus(finalSubjects, computedSgpa);

  const totalCredits = subjects.reduce((a, s) => a + (s.credits || 0), 0);
  const totalMarks = subjects.reduce((a, s) => a + (s.marksAwarded || 0), 0);
  const totalGradePoints = subjects.reduce((a, s) => {
    return a + (s.grade ? ((GRADE_MAP[s.grade] ?? 0) * (s.credits || 0)) : 0);
  }, 0);

  async function onSave(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);

    if (!name.trim()) { setError("Name is required."); return; }
    if (!rollNo.trim()) { setError("Roll No is required."); return; }
    if (courseIdx === "") { setError("Please select a course."); return; }
    if (!yearSem) { setError("Please select Year/Sem."); return; }
    if (!semester) { setError("Please select Semester."); return; }
    if (subjects.length === 0 || subjects.every((s) => !s.name.trim())) {
      setError("Add at least one subject.");
      return;
    }

    setSubmitting(true);
    try {
      const now = new Date();
      const payload: StudentInput = {
        hallTicket: rollNo.trim().toUpperCase(),
        name: name.trim(),
        fatherName: "-",
        motherName: "-",
        dob: now.toISOString().split("T")[0],
        course: selectedCourse!.course,
        branch: selectedCourse!.branch,
        regulation: "CBCS",
        semester: SEM_NUMBER[semester] ?? 1,
        examMonth: "MAY",
        examYear: yearPassout,
        collegeCode: "1005",
        collegeName: "Osmania University",
        cgpa: cgpa === "" ? null : Number(cgpa),
        resultStatus,
        subjects: subjects.map((s) => {
          const code = s.name.trim().slice(0, 40) || "-";
          if (assessmentType === "credits") {
            return {
              code,
              name: s.name,
              credits: Math.max(1, Number(s.credits) || 1),
              internalMax: 0,
              internalObtained: 0,
              externalMax: 0,
              externalObtained: 0,
            };
          }
          return {
            code,
            name: s.name,
            credits: 1,
            internalMax: s.maximumMarks,
            internalObtained: s.marksAwarded,
            externalMax: 0,
            externalObtained: 0,
          };
        }),
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
      <div className="px-6 py-4 border-b border-outline-variant/40 flex items-center justify-between">
        <div>
          <h2 className="font-headline text-xl font-bold text-on-surface tracking-tight">
            {mode === "create" ? "Add New Result" : "Edit Result"}
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

      <form onSubmit={onSave}>
        <div className="p-6 space-y-8">
          {/* File Upload */}
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
                {processingFile && (
                  <div className="mt-2 flex items-center gap-2 justify-center">
                    <div className="w-32 h-1.5 bg-outline-variant/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${ocrProgress}%` }}
                      />
                    </div>
                    <span className="text-xs text-on-surface-variant">{ocrProgress}%</span>
                  </div>
                )}
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

          {/* Fields Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Name">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Student name"
                className="input-field"
                required
              />
            </Field>
            <Field label="Roll No">
              <input
                type="text"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value.toUpperCase())}
                placeholder="Roll number"
                className="input-field uppercase font-mono"
                required
              />
            </Field>
            <Field label="Year of Passout">
              <input
                type="number"
                value={yearPassout}
                onChange={(e) => setYearPassout(Number(e.target.value) || 2026)}
                className="input-field"
                required
              />
            </Field>
            <Field label="Course">
              <div className="relative">
                <select
                  value={courseIdx}
                  onChange={(e) => {
                    setCourseIdx(e.target.value ? Number(e.target.value) : "");
                    setYearSem("");
                    setSemester("");
                  }}
                  className="input-field appearance-none pr-8"
                  required
                >
                  <option value="">Select Course</option>
                  {COURSE_OPTIONS.map((opt, i) => (
                    <option key={i} value={i}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant size-4" />
              </div>
            </Field>
            <Field label="Year/Sem">
              <div className="relative">
                <select
                  value={yearSem}
                  onChange={(e) => { setYearSem(e.target.value); setSemester(""); }}
                  className="input-field appearance-none pr-8"
                  disabled={!selectedCourse}
                  required
                >
                  <option value="">Select Year</option>
                  {yearSemOptions.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant size-4" />
              </div>
            </Field>
            <Field label="Semester">
              <div className="relative">
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="input-field appearance-none pr-8"
                  disabled={!yearSem}
                  required
                >
                  <option value="">Select Semester</option>
                  {semesterOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant size-4" />
              </div>
            </Field>
          </div>

          {/* Assessment Type */}
          <div className="flex items-center gap-4">
            <span className="font-label text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
              Assessment Type:
            </span>
            <div className="relative">
              <select
                value={assessmentType}
                onChange={(e) => {
                  const at = e.target.value as "marks" | "credits";
                  setAssessmentType(at);
                  setSubjects([]);
                }}
                className="input-field appearance-none pr-8 w-48"
              >
                <option value="marks">Marks Based</option>
                <option value="credits">Credit Based (CGPA)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant size-4" />
            </div>
          </div>

          {/* SGPA / CGPA (Credit mode only) */}
          {assessmentType === "credits" && (
            <div className="grid grid-cols-2 gap-4 max-w-md">
              <Field label="SGPA (Current Semester)">
                <input
                  type="text"
                  value={sgpa}
                  onChange={(e) => setSgpa(e.target.value)}
                  placeholder="e.g. 8.5"
                  className="input-field"
                />
              </Field>
              <Field label="CGPA (Overall)">
                <input
                  type="text"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  placeholder="e.g. 8.7"
                  className="input-field"
                />
              </Field>
            </div>
          )}

          {/* Subjects */}
          <div className="border border-outline-variant/40 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-headline text-base font-bold text-on-surface">
                Subjects
              </span>
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
                {assessmentType === "credits" ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="font-label text-xs text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/30">
                        <th className="pb-2 pr-2 w-full">Subject</th>
                        <th className="pb-2 pr-2 w-20 text-center">Credits</th>
                        <th className="pb-2 pr-2 w-20 text-center">Grade</th>
                        <th className="pb-2 pr-2 w-16 text-center">Points</th>
                        <th className="pb-2 pr-2 w-20 text-center">Total GP</th>
                        <th className="pb-2 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                      {subjects.map((s) => {
                        const gp = s.grade ? (GRADE_MAP[s.grade] ?? 0) : 0;
                        const totalGp = gp * (s.credits || 0);
                        return (
                          <tr key={s.id} className="hover:bg-surface-container-low transition-colors">
                            <td className="py-2 pr-2">
                              <input
                                type="text"
                                value={s.name}
                                onChange={(e) => updateSubject(s.id, { name: e.target.value })}
                                placeholder="Subject Name"
                                className="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary outline-none text-xs py-1"
                              />
                            </td>
                            <td className="py-2 pr-2 text-center">
                              <input
                                type="number"
                                min={0}
                                value={s.credits}
                                onChange={(e) => updateSubject(s.id, { credits: Number(e.target.value) || 0 })}
                                className="w-16 text-center bg-transparent border-b border-outline-variant/30 focus:border-primary outline-none text-xs py-1"
                              />
                            </td>
                            <td className="py-2 pr-2 text-center">
                              <div className="relative inline-block">
                                <select
                                  value={s.grade}
                                  onChange={(e) => updateSubject(s.id, { grade: e.target.value as Grade })}
                                  className="bg-transparent border-b border-outline-variant/30 focus:border-primary outline-none text-xs py-1 appearance-none pr-5 text-center"
                                >
                                  <option value="">-</option>
                                  {GRADE_OPTIONS.map((g) => (
                                    <option key={g} value={g}>{g}</option>
                                  ))}
                                </select>
                              </div>
                            </td>
                            <td className="py-2 pr-2 text-center font-semibold text-sm">
                              {gp}
                            </td>
                            <td className="py-2 pr-2 text-center font-semibold text-sm">
                              {totalGp}
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
                        <td className="pt-3 pr-2 text-right font-semibold text-on-surface-variant">Total:</td>
                        <td className="pt-3 pr-2 text-center font-bold text-primary">{totalCredits}</td>
                        <td colSpan={3}></td>
                        <td></td>
                      </tr>
                      <tr className="font-label text-sm">
                        <td colSpan={5} className="pb-2 pr-2 text-right font-semibold text-on-surface-variant">
                          Total Grade Points: <span className="text-primary font-bold">{totalGradePoints}</span>
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="font-label text-xs text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/30">
                        <th className="pb-2 pr-2 w-full">Subject</th>
                        <th className="pb-2 pr-2 w-20 text-center">Marks</th>
                        <th className="pb-2 pr-2 w-20 text-center">Max</th>
                        <th className="pb-2 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                      {subjects.map((s) => (
                        <tr key={s.id} className="hover:bg-surface-container-low transition-colors">
                          <td className="py-2 pr-2">
                            <input
                              type="text"
                              value={s.name}
                              onChange={(e) => updateSubject(s.id, { name: e.target.value })}
                              placeholder="Subject"
                              className="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary outline-none text-xs py-1"
                            />
                          </td>
                          <td className="py-2 pr-2 text-center">
                            <input
                              type="number"
                              min={0}
                              value={s.marksAwarded}
                              onChange={(e) => updateSubject(s.id, { marksAwarded: Number(e.target.value) || 0 })}
                              className="w-16 text-center bg-transparent border-b border-outline-variant/30 focus:border-primary outline-none text-xs py-1"
                              placeholder="Marks"
                            />
                          </td>
                          <td className="py-2 pr-2 text-center">
                            <input
                              type="number"
                              min={1}
                              value={s.maximumMarks}
                              onChange={(e) => updateSubject(s.id, { maximumMarks: Number(e.target.value) || 100 })}
                              className="w-16 text-center bg-transparent border-b border-outline-variant/30 focus:border-primary outline-none text-xs py-1"
                              placeholder="Max"
                            />
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
                      ))}
                    </tbody>
                    <tfoot className="border-t-2 border-outline-variant/40">
                      <tr className="font-label text-sm">
                        <td className="pt-3 pr-2 text-right font-semibold text-on-surface-variant">Total Marks:</td>
                        <td className="pt-3 pr-2 text-center font-bold text-primary">{totalMarks}</td>
                        <td></td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onDone}
              className="px-5 py-2.5 border border-outline-variant rounded-lg font-label text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || saved}
              className="px-5 py-2.5 bg-primary text-on-primary rounded-lg font-label text-xs font-bold hover:bg-primary-container hover:text-white transition-colors shadow-sm flex items-center gap-2 disabled:opacity-60"
            >
              {saved ? <CheckCircle className="size-4" /> : <Save className="size-4" />}
              {saved ? "Saved" : submitting ? "Saving..." : "Save Result"}
            </button>
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
