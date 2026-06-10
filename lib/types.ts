export type Grade = "O" | "A+" | "A" | "B+" | "B" | "C" | "D" | "F";

export type CourseCode =
  | "BA"
  | "BCOM"
  | "BSC"
  | "BBA"
  | "BCA"
  | "BE"
  | "BTECH"
  | "MA"
  | "MCOM"
  | "MSC"
  | "MBA"
  | "MCA";

export type Regulation = "CBCS" | "NON_CBCS" | "AICTE_MODEL";

export type ResultStatus = "PASS" | "FAIL" | "PENDING" | "WITH_HELD";

export interface Subject {
  id?: string;
  code: string;
  name: string;
  credits: number;
  internalMax: number;
  internalObtained: number;
  externalMax: number;
  externalObtained: number;
  totalMax: number;
  totalObtained: number;
  grade: Grade;
  gradePoints: number;
}

export interface Student {
  id: string;
  hallTicket: string;
  name: string;
  fatherName: string;
  motherName: string;
  dob: string; // ISO YYYY-MM-DD
  course: CourseCode;
  branch: string;
  regulation: Regulation;
  semester: number;
  examMonth: string; // e.g. "MAY"
  examYear: number;
  collegeCode: string;
  collegeName: string;
  sgpa: number;
  cgpa: number | null;
  resultStatus: ResultStatus;
  subjects: Subject[];
  createdAt: string;
  updatedAt: string;
}

export interface Notice {
  id: string;
  title: string;
  description: string;
  examLabel: string;
  releasedOn: string; // ISO date
  isPublished: boolean;
  createdAt: string;
}

export interface PublicLookupInput {
  hallTicket: string;
  examYear: number;
}

export interface PublicStudentResult {
  hallTicket: string;
  name: string;
  fatherName: string;
  motherName: string;
  dob: string;
  course: CourseCode;
  branch: string;
  regulation: Regulation;
  semester: number;
  examMonth: string;
  examYear: number;
  collegeCode: string;
  collegeName: string;
  sgpa: number;
  cgpa: number | null;
  resultStatus: ResultStatus;
  subjects: Subject[];
  createdAt: string;
  verificationHash?: string;
}

export interface DashboardRecentStudent {
  id: string;
  hallTicket: string;
  name: string;
  course: CourseCode;
  branch: string;
  createdAt: string;
  examYear: number;
}

export interface DashboardStats {
  totalStudents: number;
  addedThisMonth: number;
  passRate: number;
  latestExam: { label: string; detail: string };
  activeNotices: number;
  recentStudents: DashboardRecentStudent[];
}
