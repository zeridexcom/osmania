import type { Notice, PublicStudentResult, ResultStatus, Student, Subject } from "./types";

const baseDate = "2024-05-15";

function buildSubject(
  code: string,
  name: string,
  credits: number,
  internalMax: number,
  internalObtained: number,
  externalMax: number,
  externalObtained: number
): Subject {
  const totalMax = internalMax + externalMax;
  const totalObtained = internalObtained + externalObtained;
  const percent = (totalObtained / totalMax) * 100;
  let grade: Subject["grade"] = "F";
  let gradePoints = 0;
  if (percent >= 90) {
    grade = "O";
    gradePoints = 10;
  } else if (percent >= 80) {
    grade = "A+";
    gradePoints = 9;
  } else if (percent >= 70) {
    grade = "A";
    gradePoints = 8;
  } else if (percent >= 60) {
    grade = "B+";
    gradePoints = 7;
  } else if (percent >= 50) {
    grade = "B";
    gradePoints = 6;
  } else if (percent >= 40) {
    grade = "C";
    gradePoints = 5;
  } else if (percent >= 36) {
    grade = "D";
    gradePoints = 4;
  }
  return {
    code,
    name,
    credits,
    internalMax,
    internalObtained,
    externalMax,
    externalObtained,
    totalMax,
    totalObtained,
    grade,
    gradePoints,
  };
}

const btechSubjects: Subject[] = [
  buildSubject("CS801PC", "Machine Learning", 3, 30, 25, 70, 65),
  buildSubject("CS802PC", "Compiler Design", 4, 30, 22, 70, 58),
  buildSubject("CS811PE", "Cloud Computing (PE-V)", 3, 30, 24, 70, 60),
  buildSubject("CS822PE", "Blockchain Technology (PE-VI)", 3, 30, 21, 70, 55),
  buildSubject("CS803PC", "Project Stage - II", 7, 50, 45, 150, 140),
];

const baSubjects: Subject[] = [
  buildSubject("EN301", "English Literature", 4, 30, 24, 70, 52),
  buildSubject("HS301", "Indian History", 4, 30, 22, 70, 48),
  buildSubject("PS301", "Political Science", 4, 30, 26, 70, 60),
  buildSubject("SO301", "Sociology", 4, 30, 20, 70, 44),
];

const mbaSubjects: Subject[] = [
  buildSubject("MB401", "Strategic Management", 4, 30, 27, 70, 64),
  buildSubject("MB402", "Corporate Finance", 4, 30, 24, 70, 60),
  buildSubject("MB403", "Marketing Analytics", 4, 30, 25, 70, 58),
  buildSubject("MB404", "Operations Research", 4, 30, 22, 70, 56),
  buildSubject("MB405", "Business Ethics", 3, 30, 28, 70, 66),
];

function calcSgpa(subjects: Subject[]): number {
  const totalCredits = subjects.reduce((s, x) => s + x.credits, 0);
  if (totalCredits === 0) return 0;
  const points = subjects.reduce((s, x) => s + x.credits * x.gradePoints, 0);
  return Math.round((points / totalCredits) * 100) / 100;
}

function calcResultStatus(subjects: Subject[], sgpa: number): ResultStatus {
  if (subjects.some((s) => s.gradePoints < 4)) return "FAIL";
  if (sgpa < 5) return "FAIL";
  return "PASS";
}

function buildStudent(args: {
  id: string;
  hallTicket: string;
  name: string;
  fatherName: string;
  motherName: string;
  dob: string;
  course: Student["course"];
  branch: string;
  regulation: Student["regulation"];
  semester: number;
  examMonth: string;
  examYear: number;
  collegeCode: string;
  collegeName: string;
  cgpa: number | null;
  subjects: Subject[];
  resultStatusOverride?: ResultStatus;
  createdAt: string;
}): Student {
  const sgpa = calcSgpa(args.subjects);
  const resultStatus = args.resultStatusOverride ?? calcResultStatus(args.subjects, sgpa);
  return {
    id: args.id,
    hallTicket: args.hallTicket,
    name: args.name,
    fatherName: args.fatherName,
    motherName: args.motherName,
    dob: args.dob,
    course: args.course,
    branch: args.branch,
    regulation: args.regulation,
    semester: args.semester,
    examMonth: args.examMonth,
    examYear: args.examYear,
    collegeCode: args.collegeCode,
    collegeName: args.collegeName,
    sgpa,
    cgpa: args.cgpa,
    resultStatus,
    subjects: args.subjects,
    createdAt: args.createdAt,
    updatedAt: args.createdAt,
  };
}

export const mockStudents: Student[] = [
  buildStudent({
    id: "stu_001",
    hallTicket: "160123733001",
    name: "Rahul Sharma",
    fatherName: "Ramesh Sharma",
    motherName: "Sarojini Sharma",
    dob: "2001-08-15",
    course: "BTECH",
    branch: "Computer Science and Engineering",
    regulation: "CBCS",
    semester: 8,
    examMonth: "MAY",
    examYear: 2024,
    collegeCode: "1005",
    collegeName: "University College of Engineering",
    cgpa: 8.2,
    subjects: btechSubjects,
    createdAt: "2024-06-24T09:42:00Z",
  }),
  buildStudent({
    id: "stu_002",
    hallTicket: "160124722045",
    name: "Anjali Patel",
    fatherName: "Mahesh Patel",
    motherName: "Lakshmi Patel",
    dob: "2002-03-21",
    course: "BTECH",
    branch: "Electronics and Communication Engineering",
    regulation: "CBCS",
    semester: 6,
    examMonth: "MAY",
    examYear: 2024,
    collegeCode: "1005",
    collegeName: "University College of Engineering",
    cgpa: 7.85,
    subjects: btechSubjects.map((s) => ({
      ...s,
      internalObtained: Math.max(15, s.internalObtained - 3),
      externalObtained: Math.max(20, s.externalObtained - 5),
    })),
    createdAt: "2024-06-23T14:15:00Z",
  }),
  buildStudent({
    id: "stu_003",
    hallTicket: "160123712014",
    name: "Meghana Reddy",
    fatherName: "Venkat Reddy",
    motherName: "Padma Reddy",
    dob: "2001-12-04",
    course: "BA",
    branch: "History, Economics, Political Science",
    regulation: "CBCS",
    semester: 4,
    examMonth: "MAY",
    examYear: 2024,
    collegeCode: "1018",
    collegeName: "University College of Arts and Social Sciences",
    cgpa: 7.42,
    subjects: baSubjects,
    createdAt: "2024-06-22T11:00:00Z",
  }),
  buildStudent({
    id: "stu_004",
    hallTicket: "160124820088",
    name: "Vikram Joshi",
    fatherName: "Anand Joshi",
    motherName: "Kavita Joshi",
    dob: "1998-07-19",
    course: "MBA",
    branch: "Finance and Marketing",
    regulation: "AICTE_MODEL",
    semester: 4,
    examMonth: "MAY",
    examYear: 2024,
    collegeCode: "1042",
    collegeName: "Osmania University Business School",
    cgpa: 8.74,
    subjects: mbaSubjects,
    createdAt: "2024-06-22T09:30:00Z",
  }),
  buildStudent({
    id: "stu_005",
    hallTicket: "160124705004",
    name: "Rohan Gupta",
    fatherName: "Suresh Gupta",
    motherName: "Anita Gupta",
    dob: "2004-01-10",
    course: "BA",
    branch: "Economics",
    regulation: "NON_CBCS",
    semester: 1,
    examMonth: "DEC",
    examYear: 2023,
    collegeCode: "1018",
    collegeName: "University College of Arts and Social Sciences",
    cgpa: null,
    subjects: baSubjects.map((s) => ({ ...s, internalObtained: 0, externalObtained: 0, totalObtained: 0, grade: "F", gradePoints: 0 })),
    resultStatusOverride: "PENDING",
    createdAt: "2024-01-12T08:00:00Z",
  }),
];

export const mockNotices: Notice[] = [
  {
    id: "ntc_001",
    title: "Winter 2024 Results Published for B.E. / B.Tech V Semester",
    description:
      "The results for the B.E. / B.Tech V Semester examinations held in November 2024 have been published. Students may check their results using the hall ticket number and date of birth.",
    examLabel: "B.E. / B.Tech V Semester",
    releasedOn: "2024-10-24",
    isPublished: true,
    createdAt: "2024-10-24T10:00:00Z",
  },
  {
    id: "ntc_002",
    title: "Notification for Revaluation / Photocopy of Answer Scripts",
    description:
      "Applications for revaluation and photocopy of answer scripts for the May 2024 examinations are invited. Last date for submission is 15th November 2024.",
    examLabel: "All Courses — May 2024",
    releasedOn: "2024-10-15",
    isPublished: true,
    createdAt: "2024-10-15T09:00:00Z",
  },
  {
    id: "ntc_003",
    title: "Revised Almanacs for PG Courses (M.A / M.Sc / M.Com) 2024-25",
    description:
      "The revised academic almanacs for postgraduate courses have been released. Refer to the university website for the full schedule of classes, internal assessments, and semester-end examinations.",
    examLabel: "PG — 2024-25",
    releasedOn: "2024-09-30",
    isPublished: true,
    createdAt: "2024-09-30T12:00:00Z",
  },
  {
    id: "ntc_004",
    title: "Hall Ticket Download Open for May 2024 B.Tech VIII Semester",
    description:
      "Hall tickets for the upcoming B.Tech VIII semester examinations are available for download. Students are advised to verify their personal details before the examination.",
    examLabel: "B.Tech VIII Semester",
    releasedOn: "2024-04-12",
    isPublished: true,
    createdAt: "2024-04-12T11:00:00Z",
  },
  {
    id: "ntc_005",
    title: "Circular — Malpractice Cases Registered in Dec 2023 Exams",
    description:
      "A list of candidates reported for malpractice during the December 2023 examinations has been published. Affected students may appeal within 14 days.",
    examLabel: "All Courses — Dec 2023",
    releasedOn: "2024-02-05",
    isPublished: true,
    createdAt: "2024-02-05T15:00:00Z",
  },
];

export const mockDashboardStats = {
  totalStudents: 12450,
  addedThisMonth: 342,
  latestExam: {
    label: "May 2024",
    detail: "Semester Finals",
  },
  activeNotices: mockNotices.filter((n) => n.isPublished).length,
  recentStudents: mockStudents.slice(0, 5).map((s) => ({
    id: s.id,
    hallTicket: s.hallTicket,
    name: s.name,
    course: s.course,
    branch: s.branch,
    createdAt: s.createdAt,
  })),
};

export function getMockStudentByHtno(htno: string, dob: string): PublicStudentResult | null {
  const student = mockStudents.find(
    (s) => s.hallTicket.toLowerCase() === htno.toLowerCase() && s.dob === dob
  );
  if (!student) return null;
  const { id: _id, updatedAt: _u, ...rest } = student;
  void _id;
  void _u;
  return rest as PublicStudentResult;
}

export function getMockStudentById(id: string): Student | null {
  return mockStudents.find((s) => s.id === id) ?? null;
}

export function getAllMockStudents(): Student[] {
  return mockStudents;
}

export function getAllMockNotices(): Notice[] {
  return mockNotices;
}

export { baseDate };
