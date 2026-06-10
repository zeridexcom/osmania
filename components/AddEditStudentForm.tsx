"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Save,
  CheckCircle,
  X,
  Info,
  PersonStanding,
  School,
  FolderOpen,
  BadgeCheck,
  CalendarDays,
  Mail,
  Phone,
  MapPin,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SubjectRowForm,
  emptySubjectRow,
  rowsToSubjects,
  type SubjectRow,
} from "@/components/SubjectRowForm";
import {
  clientCreateAdminStudent,
  clientUpdateAdminStudent,
} from "@/lib/data/client";
import { finalizeSubject, computeResultStatus, computeSgpa } from "@/lib/grading";
import type {
  CourseCode,
  Regulation,
  ResultStatus,
  Student,
} from "@/lib/types";
import type { StudentInput } from "@/lib/validators";

const ROMAN: Record<number, string> = {
  1: "I", 2: "II", 3: "III", 4: "IV", 5: "V", 6: "VI", 7: "VII", 8: "VIII",
};

type TabKey = "personal" | "academic" | "docs";

const COURSE_OPTIONS: { value: CourseCode; label: string }[] = [
  { value: "BA", label: "B.A." },
  { value: "BCOM", label: "B.Com." },
  { value: "BSC", label: "B.Sc." },
  { value: "BBA", label: "B.B.A." },
  { value: "BCA", label: "B.C.A." },
  { value: "BE", label: "B.E." },
  { value: "BTECH", label: "B.Tech" },
  { value: "MA", label: "M.A." },
  { value: "MCOM", label: "M.Com." },
  { value: "MSC", label: "M.Sc." },
  { value: "MBA", label: "M.B.A." },
  { value: "MCA", label: "M.C.A." },
];

const REGULATION_OPTIONS: { value: Regulation; label: string }[] = [
  { value: "CBCS", label: "CBCS" },
  { value: "NON_CBCS", label: "Non-CBCS" },
  { value: "AICTE_MODEL", label: "AICTE Model" },
];

const SEMESTER_OPTIONS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

const SEMESTER_MAP: Record<string, number> = {
  I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8,
};

const SEMESTER_FROM_NUM = (n: number): string => ROMAN[n] ?? "I";

const GENDER_OPTIONS = ["Male", "Female", "Other"];

export interface AddEditStudentFormProps {
  mode: "create" | "edit";
  initial?: Student | null;
  onDone?: () => void;
  onSaveAndAddAnother?: () => void;
}

export function AddEditStudentForm({
  mode,
  initial,
  onDone,
}: AddEditStudentFormProps) {
  const [tab, setTab] = useState<TabKey>("personal");

  const [htno, setHtno] = useState(initial?.hallTicket ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [fatherName] = useState(initial?.fatherName ?? "");
  const [motherName] = useState(initial?.motherName ?? "");
  const [dob, setDob] = useState(initial?.dob ?? "");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const [course, setCourse] = useState<CourseCode>(initial?.course ?? "BTECH");
  const [branch, setBranch] = useState(initial?.branch ?? "Computer Science and Engineering");
  const [regulation, setRegulation] = useState<Regulation>(initial?.regulation ?? "CBCS");
  const [semester, setSemester] = useState<string>(
    initial ? SEMESTER_FROM_NUM(initial.semester) : "VIII"
  );
  const [examMonth, setExamMonth] = useState<"JAN" | "MAY" | "JUL" | "DEC">(
    (initial?.examMonth as "JAN" | "MAY" | "JUL" | "DEC" | undefined) ?? "MAY"
  );
  const [examYear, setExamYear] = useState(initial?.examYear ?? 2024);
  const [collegeCode, setCollegeCode] = useState(initial?.collegeCode ?? "1005");
  const [collegeName, setCollegeName] = useState(
    initial?.collegeName ?? "University College of Engineering"
  );
  const [cgpa, setCgpa] = useState<number | "">(initial?.cgpa ?? "");

  const [rows, setRows] = useState<SubjectRow[]>(
    initial
      ? initial.subjects.map((s, i) => ({
          id: `row_init_${i}`,
          code: s.code,
          name: s.name,
          credits: s.credits,
          internalMax: s.internalMax,
          internalObtained: s.internalObtained,
          externalMax: s.externalMax,
          externalObtained: s.externalObtained,
        }))
      : [emptySubjectRow(0)]
  );
  const [totals, setTotals] = useState({ credits: 0, marks: 0, sgpa: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!saved || !onDone) return;
    const t = setTimeout(onDone, 600);
    return () => clearTimeout(t);
  }, [saved, onDone]);

  async function persist(): Promise<{ ok: boolean; err?: string }> {
    if (!name.trim() || !htno.trim() || !dob) {
      return { ok: false, err: "Hall Ticket, Full Name, and Date of Birth are required." };
    }
    if (rows.length === 0) {
      return { ok: false, err: "Add at least one subject before saving." };
    }
    const finalSubjects = rowsToSubjects(rows).map(finalizeSubject);
    const sgpa = computeSgpa(finalSubjects);
    const resultStatus: ResultStatus = computeResultStatus(finalSubjects, sgpa);
    const payload: StudentInput = {
      hallTicket: htno.trim(),
      name: name.trim(),
      fatherName: fatherName.trim(),
      motherName: motherName.trim(),
      dob,
      course,
      branch: branch.trim(),
      regulation,
      semester: SEMESTER_MAP[semester] ?? 1,
      examMonth,
      examYear,
      collegeCode: collegeCode.trim(),
      collegeName: collegeName.trim(),
      cgpa: cgpa === "" ? null : Number(cgpa),
      resultStatus,
      subjects: finalSubjects.map((s) => ({
        code: s.code,
        name: s.name,
        credits: s.credits,
        internalMax: s.internalMax,
        internalObtained: s.internalObtained,
        externalMax: s.externalMax,
        externalObtained: s.externalObtained,
      })),
    };
    try {
      if (mode === "create") { await clientCreateAdminStudent(payload); }
      else if (initial) { await clientUpdateAdminStudent(initial.id, payload); }
      return { ok: true };
    } catch (err) {
      return { ok: false, err: (err as Error).message };
    }
  }

  async function onSave(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await persist();
    setSubmitting(false);
    if (!res.ok) { setError(res.err ?? "Save failed"); return; }
    setSaved(true);
  }

  const tabs: { key: TabKey; label: string; icon: typeof PersonStanding }[] = [
    { key: "personal", label: "Personal Information", icon: PersonStanding },
    { key: "academic", label: "Academic Enrollment", icon: School },
    { key: "docs", label: "Documentation", icon: FolderOpen },
  ];

  return (
    <div className="admin-card">
      {/* Header */}
      <div className="px-6 py-4 border-b border-outline-variant/40 flex items-center justify-between">
        <div>
          <h2 className="font-headline text-xl font-bold text-on-surface tracking-tight">
            {mode === "create" ? "Add New Student" : "Edit Student"}
          </h2>
          <p className="font-body text-xs text-on-surface-variant mt-0.5">
            {mode === "create" ? "Create a new academic record" : "Update existing student record"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {onDone ? (
            <button type="button" onClick={onDone} className="px-4 py-2 font-label text-sm text-on-surface-variant hover:text-primary transition-colors">Cancel</button>
          ) : (
            <Link href="/admin/students" className="px-4 py-2 font-label text-sm text-on-surface-variant hover:text-primary transition-colors">Cancel</Link>
          )}
          <button type="button" onClick={() => onSave()} disabled={submitting} className="px-5 py-2.5 bg-primary text-on-primary rounded-lg font-label text-xs font-bold hover:bg-primary-container hover:text-white transition-colors shadow-sm flex items-center gap-2 disabled:opacity-60">
            {saved ? <CheckCircle className="size-4" /> : <Save className="size-4" />}
            {saved ? "Saved" : submitting ? "Saving..." : "Save Record"}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-error-container text-on-error-container px-6 py-3 flex items-center justify-between border-b border-error/30">
          <p className="font-body text-sm">{error}</p>
          <button type="button" onClick={() => setError(null)} className="hover:opacity-70" aria-label="Dismiss"><X className="size-4" /></button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-outline-variant/40 bg-surface-container-low px-6">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.key} type="button" onClick={() => setTab(t.key)} className={cn(
              "flex items-center gap-2 px-5 py-3 font-label text-sm transition-all border-b-2",
              tab === t.key ? "text-primary border-primary font-semibold" : "text-on-surface-variant border-transparent hover:text-primary"
            )}>
              <Icon className="size-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Form Body */}
      <form onSubmit={onSave}>
        <div className="p-6">
          {tab === "personal" && (
            <div className="space-y-8 max-w-3xl">
              <div>
                <h3 className="font-headline text-base font-bold text-on-surface flex items-center gap-2 mb-5">
                  <BadgeCheck className="size-4 text-primary" />
                  Basic Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Full Name (as per SSC)" icon={PersonStanding}>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full legal name" className="input-field" />
                  </Field>
                  <Field label="Date of Birth" icon={CalendarDays}>
                    <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="input-field" />
                  </Field>
                  <Field label="Gender" icon={PersonStanding}>
                    <select value={gender} onChange={(e) => setGender(e.target.value)} className="input-field">
                      <option value="">Select Gender</option>
                      {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </Field>
                  <Field label="Primary Email" icon={Mail}>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" className="input-field" />
                  </Field>
                  <Field label="Mobile Number" icon={Phone}>
                    <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Enter mobile number" className="input-field" />
                  </Field>
                  <Field label="Aadhaar / National ID" icon={BadgeCheck}>
                    <input type="text" value={aadhaar} onChange={(e) => setAadhaar(e.target.value)} placeholder="Enter Aadhaar number" className="input-field" />
                  </Field>
                </div>
                <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-surface-container border border-outline-variant/50">
                  <Info className="size-4 text-primary shrink-0 mt-0.5" />
                  <p className="font-body text-xs text-on-surface-variant">Must match government issued identification exactly.</p>
                </div>
              </div>

              <div>
                <h3 className="font-headline text-base font-bold text-on-surface flex items-center gap-2 mb-5">
                  <MapPin className="size-4 text-primary" />
                  Address Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <Field label="Permanent Address" icon={Home}>
                      <textarea value={permanentAddress} onChange={(e) => setPermanentAddress(e.target.value)} placeholder="Enter full address" rows={3} className="input-field resize-none" />
                    </Field>
                  </div>
                  <Field label="City" icon={MapPin}>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="input-field" />
                  </Field>
                  <Field label="State" icon={MapPin}>
                    <input type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="State" className="input-field" />
                  </Field>
                  <Field label="Pincode" icon={MapPin}>
                    <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="Pincode" className="input-field" />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {tab === "academic" && (
            <div className="space-y-8 max-w-3xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Hall Ticket No." icon={BadgeCheck}>
                  <input type="text" value={htno} onChange={(e) => setHtno(e.target.value.toUpperCase())} placeholder="e.g. 1005-20-733-001" className="input-field uppercase font-mono" />
                </Field>
                <Field label="Course" icon={School}>
                  <select value={course} onChange={(e) => setCourse(e.target.value as CourseCode)} className="input-field">
                    <option value="">Select Course</option>
                    {COURSE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </Field>
                <Field label="Branch/Specialization" icon={School}>
                  <select value={branch} onChange={(e) => setBranch(e.target.value)} className="input-field">
                    <option value="">Select Branch</option>
                    <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                    <option value="Electronics and Communication Engg.">Electronics and Communication Engg.</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                  </select>
                </Field>
                <Field label="Regulation" icon={School}>
                  <select value={regulation} onChange={(e) => setRegulation(e.target.value as Regulation)} className="input-field">
                    {REGULATION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </Field>
                <Field label="Semester" icon={School}>
                  <select value={semester} onChange={(e) => setSemester(e.target.value)} className="input-field">
                    {SEMESTER_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Exam Period" icon={CalendarDays}>
                  <div className="flex gap-3">
                    <select value={examMonth} onChange={(e) => { const v = e.target.value; if (v === "JAN" || v === "MAY" || v === "JUL" || v === "DEC") setExamMonth(v); }} className="input-field flex-1">
                      <option value="JAN">JAN</option>
                      <option value="MAY">MAY</option>
                      <option value="JUL">JUL</option>
                      <option value="DEC">DEC</option>
                    </select>
                    <input type="number" value={examYear} onChange={(e) => setExamYear(Number(e.target.value) || 2024)} className="input-field w-24" />
                  </div>
                </Field>
                <Field label="College Code" icon={School}>
                  <input type="text" value={collegeCode} onChange={(e) => setCollegeCode(e.target.value)} placeholder="e.g. 1005" className="input-field" />
                </Field>
                <Field label="College Name" icon={School}>
                  <input type="text" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} placeholder="College Name" className="input-field" />
                </Field>
                <Field label="CGPA (optional)" icon={School}>
                  <input type="number" step="0.01" value={cgpa === "" ? "" : cgpa} onChange={(e) => setCgpa(e.target.value === "" ? "" : Number(e.target.value))} placeholder="e.g. 8.42" className="input-field" />
                </Field>
                <Field label="Total Credits" icon={School}>
                  <input type="text" value={totals.credits} readOnly className="input-field bg-surface-container font-label" />
                </Field>
              </div>

              <div className="border-t border-outline-variant pt-8">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-surface-container border border-outline-variant/50 mb-6">
                  <Info className="size-4 text-primary shrink-0" />
                  <p className="font-body text-xs text-on-surface-variant">
                    <strong>Grading Convention:</strong> Total marks, grade and SGPA are computed automatically using NAAC grading (O, A+, A, B+, B, C, D, F).
                  </p>
                </div>
                <SubjectRowForm rows={rows} course={course} onChange={setRows} onTotalsChange={setTotals} />
              </div>
            </div>
          )}

          {tab === "docs" && (
            <div className="max-w-3xl text-center py-16">
              <div className="size-16 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="size-8" />
              </div>
              <h3 className="font-headline text-lg font-bold text-on-surface mb-2">Documentation</h3>
              <p className="font-body text-sm text-on-surface-variant">Document upload functionality will be available in a future update.</p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 font-label text-xs uppercase tracking-wider text-on-surface-variant">
        {Icon && <Icon className="size-3.5" />}
        {label}
      </label>
      {children}
    </div>
  );
}
