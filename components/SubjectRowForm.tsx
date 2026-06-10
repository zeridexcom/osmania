"use client";

import { Trash2, Plus, Info } from "lucide-react";
import type { CourseCode, Subject } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface SubjectRow {
  id: string;
  code: string;
  name: string;
  credits: number;
  internalMax: number;
  internalObtained: number;
  externalMax: number;
  externalObtained: number;
}

export function emptySubjectRow(index: number): SubjectRow {
  return {
    id: `row_${Date.now()}_${index}`,
    code: "",
    name: "",
    credits: 3,
    internalMax: 30,
    internalObtained: 0,
    externalMax: 70,
    externalObtained: 0,
  };
}

const PRESETS: Record<CourseCode, { code: string; name: string; credits: number }[]> = {
  BTECH: [
    { code: "CS801PC", name: "Machine Learning", credits: 3 },
    { code: "CS802PC", name: "Compiler Design", credits: 4 },
    { code: "CS803PC", name: "Project Stage - II", credits: 7 },
  ],
  BE: [
    { code: "EE401", name: "Power Systems", credits: 4 },
    { code: "EE402", name: "Control Systems", credits: 4 },
  ],
  BA: [
    { code: "EN301", name: "English Literature", credits: 4 },
    { code: "HS301", name: "Indian History", credits: 4 },
  ],
  BSC: [{ code: "PH301", name: "Physics", credits: 4 }],
  BCOM: [{ code: "BC301", name: "Corporate Accounting", credits: 4 }],
  BBA: [{ code: "BA301", name: "Principles of Management", credits: 4 }],
  BCA: [{ code: "CA301", name: "Data Structures", credits: 4 }],
  MBA: [
    { code: "MB401", name: "Strategic Management", credits: 4 },
    { code: "MB402", name: "Corporate Finance", credits: 4 },
  ],
  MCA: [{ code: "MC401", name: "Advanced Databases", credits: 4 }],
  MSC: [{ code: "MS401", name: "Research Methodology", credits: 4 }],
  MA: [{ code: "AR401", name: "Advanced Literature", credits: 4 }],
  MCOM: [{ code: "MC401", name: "Advanced Accounting", credits: 4 }],
};

interface SubjectRowFormProps {
  rows: SubjectRow[];
  course: CourseCode;
  onChange: (rows: SubjectRow[]) => void;
  onTotalsChange?: (totals: { credits: number; marks: number; sgpa: number }) => void;
}

function gradeFromPercent(p: number): { grade: Subject["grade"]; gradePoints: number } {
  if (p >= 90) return { grade: "O", gradePoints: 10 };
  if (p >= 80) return { grade: "A+", gradePoints: 9 };
  if (p >= 70) return { grade: "A", gradePoints: 8 };
  if (p >= 60) return { grade: "B+", gradePoints: 7 };
  if (p >= 50) return { grade: "B", gradePoints: 6 };
  if (p >= 40) return { grade: "C", gradePoints: 5 };
  if (p >= 36) return { grade: "D", gradePoints: 4 };
  return { grade: "F", gradePoints: 0 };
}

export function SubjectRowForm({ rows, course, onChange, onTotalsChange }: SubjectRowFormProps) {
  function update(id: string, patch: Partial<SubjectRow>) {
    onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function remove(id: string) {
    onChange(rows.filter((r) => r.id !== id));
  }

  function add() {
    const presets = PRESETS[course] ?? [];
    const idx = rows.length;
    const seed = presets[idx % Math.max(presets.length, 1)] ?? {
      code: "",
      name: "",
      credits: 3,
    };
    onChange([
      ...rows,
      emptySubjectRow(idx).code === ""
        ? {
            ...emptySubjectRow(idx),
            code: seed.code,
            name: seed.name,
            credits: seed.credits,
          }
        : { ...emptySubjectRow(idx) },
    ]);
  }

  let totCr = 0;
  let totMarks = 0;
  let totPoints = 0;
  for (const r of rows) {
    totCr += r.credits;
    const total = r.internalObtained + r.externalObtained;
    const pct = r.internalMax + r.externalMax === 0 ? 0 : (total / (r.internalMax + r.externalMax)) * 100;
    const { gradePoints } = gradeFromPercent(pct);
    totMarks += total;
    totPoints += r.credits * gradePoints;
  }
  const sgpa = totCr > 0 ? Math.round((totPoints / totCr) * 100) / 100 : 0;
  onTotalsChange?.({ credits: totCr, marks: totMarks, sgpa });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="font-headline text-lg text-primary">Academic Record</h3>
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-2 text-primary font-label text-sm hover:bg-surface-container-high px-3 py-1.5 rounded transition-colors"
        >
          <Plus className="size-4" />
          Add Subject
        </button>
      </div>
      <div className="overflow-x-auto ghost-border rounded-DEFAULT bg-surface-container-lowest">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low font-label text-xs text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/30">
              <th className="p-3 w-24">Sub Code</th>
              <th className="p-3">Subject Name</th>
              <th className="p-3 w-20 text-center">Cr.</th>
              <th className="p-3 w-32 text-center" colSpan={2}>
                Internal
                <br />
                <span className="text-[10px] font-normal">Max / Obt</span>
              </th>
              <th className="p-3 w-32 text-center" colSpan={2}>
                External
                <br />
                <span className="text-[10px] font-normal">Max / Obt</span>
              </th>
              <th className="p-3 w-16 text-center">Total</th>
              <th className="p-3 w-16 text-center">GR</th>
              <th className="p-3 w-16 text-center">GP</th>
              <th className="p-3 w-12 text-center"></th>
            </tr>
          </thead>
          <tbody className="font-body text-sm divide-y divide-outline-variant/20">
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={11}
                  className="p-6 text-center text-on-surface-variant font-body text-sm italic"
                >
                  No subjects yet. Click &ldquo;Add Subject&rdquo; to begin.
                </td>
              </tr>
            )}
            {rows.map((r) => {
              const total = r.internalObtained + r.externalObtained;
              const totalMax = r.internalMax + r.externalMax;
              const pct = totalMax === 0 ? 0 : (total / totalMax) * 100;
              const { grade, gradePoints } = gradeFromPercent(pct);
              return (
                <tr key={r.id} className="hover:bg-surface-bright transition-colors">
                  <td className="p-2">
                    <input
                      type="text"
                      value={r.code}
                      onChange={(e) => update(r.id, { code: e.target.value.toUpperCase() })}
                      placeholder="Code"
                      className="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary outline-none text-xs px-1 font-mono"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={r.name}
                      onChange={(e) => update(r.id, { name: e.target.value })}
                      placeholder="Subject Title"
                      className="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary outline-none text-xs px-1"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      min={0}
                      value={r.credits}
                      onChange={(e) => update(r.id, { credits: Number(e.target.value) || 0 })}
                      className="w-full text-center bg-transparent border-b border-outline-variant/30 focus:border-primary outline-none text-xs px-1"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      min={0}
                      value={r.internalMax}
                      tabIndex={-1}
                      onChange={(e) => update(r.id, { internalMax: Number(e.target.value) || 0 })}
                      className="w-full text-center bg-transparent border-b border-outline-variant/30 focus:border-primary outline-none text-xs px-1 text-on-surface-variant"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      min={0}
                      value={r.internalObtained}
                      onChange={(e) =>
                        update(r.id, { internalObtained: Number(e.target.value) || 0 })
                      }
                      placeholder="0"
                      className="w-full text-center bg-transparent border-b border-outline-variant/30 focus:border-primary outline-none text-xs px-1"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      min={0}
                      value={r.externalMax}
                      tabIndex={-1}
                      onChange={(e) => update(r.id, { externalMax: Number(e.target.value) || 0 })}
                      className="w-full text-center bg-transparent border-b border-outline-variant/30 focus:border-primary outline-none text-xs px-1 text-on-surface-variant"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      min={0}
                      value={r.externalObtained}
                      onChange={(e) =>
                        update(r.id, { externalObtained: Number(e.target.value) || 0 })
                      }
                      placeholder="0"
                      className="w-full text-center bg-transparent border-b border-outline-variant/30 focus:border-primary outline-none text-xs px-1"
                    />
                  </td>
                  <td className="p-2 text-center font-semibold">{total}</td>
                  <td
                    className={cn(
                      "p-2 text-center font-bold",
                      grade === "F" ? "text-error" : "text-tertiary"
                    )}
                  >
                    {grade}
                  </td>
                  <td className="p-2 text-center font-semibold">{gradePoints}</td>
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() => remove(r.id)}
                      className="text-outline hover:text-error transition-colors p-1"
                      aria-label="Remove subject"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-surface-container font-label text-sm border-t-2 border-outline-variant/50">
            <tr>
              <td className="p-3 text-right font-semibold" colSpan={2}>
                Running Totals:
              </td>
              <td className="p-3 text-center font-bold text-primary">{totCr}</td>
              <td colSpan={4}></td>
              <td className="p-3 text-center font-bold text-primary">{totMarks}</td>
              <td className="p-3 text-right font-semibold" colSpan={2}>
                SGPA: <span className="text-primary ml-2 font-bold">{sgpa.toFixed(2)}</span>
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="text-xs text-on-surface-variant font-label flex gap-2 items-center bg-surface-container-low p-3 rounded">
        <Info className="size-4 text-tertiary shrink-0" />
        Total marks, grade and SGPA are computed automatically based on NAAC grading conventions.
      </div>
    </div>
  );
}

export function rowsToSubjects(rows: SubjectRow[]): Subject[] {
  return rows.map((r) => {
    const totalMax = r.internalMax + r.externalMax;
    const totalObtained = r.internalObtained + r.externalObtained;
    const percent = totalMax === 0 ? 0 : (totalObtained / totalMax) * 100;
    const { grade, gradePoints } = gradeFromPercent(percent);
    return {
      code: r.code,
      name: r.name,
      credits: r.credits,
      internalMax: r.internalMax,
      internalObtained: r.internalObtained,
      externalMax: r.externalMax,
      externalObtained: r.externalObtained,
      totalMax,
      totalObtained,
      grade,
      gradePoints,
    };
  });
}
