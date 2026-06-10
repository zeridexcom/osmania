import type {
  Grade,
  PublicStudentResult,
  ResultStatus,
  Student,
  Subject,
} from "./types";

const GRADE_BOUNDARIES: ReadonlyArray<readonly [number, Grade, number]> = [
  [90, "O", 10],
  [80, "A+", 9],
  [70, "A", 8],
  [60, "B+", 7],
  [50, "B", 6],
  [40, "C", 5],
  [36, "D", 4],
] as const;

export function computeGrade(percentage: number): Grade {
  if (percentage < 0 || percentage > 100) {
    throw new Error(`Invalid percentage: ${percentage}`);
  }
  for (const [min, grade] of GRADE_BOUNDARIES) {
    if (percentage >= min) {
      return grade;
    }
  }
  return "F";
}

export function gradePointsFor(grade: Grade): number {
  for (const [, g, points] of GRADE_BOUNDARIES) {
    if (g === grade) return points;
  }
  return 0;
}

export interface SubjectTotals {
  totalMax: number;
  totalObtained: number;
  grade: Grade;
  gradePoints: number;
}

export function computeSubjectTotals(
  sub: Pick<Subject, "internalObtained" | "externalObtained" | "internalMax" | "externalMax">
): SubjectTotals {
  const totalMax = sub.internalMax + sub.externalMax;
  const totalObtained = sub.internalObtained + sub.externalObtained;
  const percentage = totalMax === 0 ? 0 : (totalObtained / totalMax) * 100;
  const grade = computeGrade(percentage);
  return {
    totalMax,
    totalObtained,
    grade,
    gradePoints: gradePointsFor(grade),
  };
}

export function computeSgpa(subjects: ReadonlyArray<Subject>): number {
  let totalCredits = 0;
  let weightedPoints = 0;
  for (const s of subjects) {
    const credits = Number(s.credits) || 0;
    if (credits <= 0) continue;
    totalCredits += credits;
    weightedPoints += credits * (Number(s.gradePoints) || 0);
  }
  if (totalCredits === 0) return 0;
  return Math.round((weightedPoints / totalCredits) * 100) / 100;
}

export function computeResultStatus(
  subjects: ReadonlyArray<Subject>,
  sgpa: number
): ResultStatus {
  if (subjects.length === 0) return "PENDING";
  const anyFail = subjects.some((s) => s.grade === "F");
  if (anyFail) return "FAIL";
  if (sgpa < 5) return "FAIL";
  return "PASS";
}

export interface StudentSubjectInput {
  code: string;
  name: string;
  credits: number;
  internalMax: number;
  internalObtained: number;
  externalMax: number;
  externalObtained: number;
}

export function finalizeSubject(
  input: StudentSubjectInput
): Omit<Subject, "id"> {
  const totals = computeSubjectTotals(input);
  return {
    code: input.code,
    name: input.name,
    credits: input.credits,
    internalMax: input.internalMax,
    internalObtained: input.internalObtained,
    externalMax: input.externalMax,
    externalObtained: input.externalObtained,
    totalMax: totals.totalMax,
    totalObtained: totals.totalObtained,
    grade: totals.grade,
    gradePoints: totals.gradePoints,
  };
}

export function sanitizeForPublic(student: Student): PublicStudentResult {
  return {
    hallTicket: student.hallTicket,
    name: student.name,
    fatherName: student.fatherName,
    motherName: student.motherName,
    dob: student.dob,
    course: student.course,
    branch: student.branch,
    regulation: student.regulation,
    semester: student.semester,
    examMonth: student.examMonth,
    examYear: student.examYear,
    collegeCode: student.collegeCode,
    collegeName: student.collegeName,
    sgpa: student.sgpa,
    cgpa: student.cgpa,
    resultStatus: student.resultStatus,
    createdAt: student.createdAt,
    subjects: student.subjects.map((s) => ({
      id: s.id,
      code: s.code,
      name: s.name,
      credits: s.credits,
      internalMax: s.internalMax,
      internalObtained: s.internalObtained,
      externalMax: s.externalMax,
      externalObtained: s.externalObtained,
      totalMax: s.totalMax,
      totalObtained: s.totalObtained,
      grade: s.grade,
      gradePoints: s.gradePoints,
    })),
  };
}

export const GRADING_TABLE: ReadonlyArray<{
  range: string;
  grade: Grade;
  points: number;
}> = [
  { range: "90-100", grade: "O", points: 10 },
  { range: "80-89", grade: "A+", points: 9 },
  { range: "70-79", grade: "A", points: 8 },
  { range: "60-69", grade: "B+", points: 7 },
  { range: "50-59", grade: "B", points: 6 },
  { range: "40-49", grade: "C", points: 5 },
  { range: "36-39", grade: "D", points: 4 },
  { range: "<36", grade: "F", points: 0 },
];
