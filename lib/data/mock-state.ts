import { finalizeSubject, computeSgpa, computeResultStatus } from "@/lib/grading";
import type { Notice, PublicStudentResult, Student } from "@/lib/types";
import type { StudentInput, NoticeInput } from "@/lib/validators";
import {
  mockDashboardStats,
  mockNotices,
  mockStudents,
} from "@/lib/mock-data";

declare global {
  var __osmaniaMockState: {
    students: Student[];
    notices: Notice[];
  } | undefined;
}

function getState(): { students: Student[]; notices: Notice[] } {
  if (!globalThis.__osmaniaMockState) {
    globalThis.__osmaniaMockState = {
      students: mockStudents.map((s) => ({ ...s, subjects: [...s.subjects] })),
      notices: mockNotices.map((n) => ({ ...n })),
    };
  }
  return globalThis.__osmaniaMockState;
}

export function mockGetStudentByHtno(
  htno: string,
  examYear: number
): PublicStudentResult | null {
  const student = getState().students.find(
    (s) =>
      s.hallTicket.toLowerCase() === htno.toLowerCase() &&
      s.examYear === examYear
  );
  if (!student) return null;
  const { id: _id, updatedAt: _u, ...rest } = student;
  void _id;
  void _u;
  return rest as PublicStudentResult;
}

export function mockGetStudentById(id: string): Student | null {
  return getState().students.find((s) => s.id === id) ?? null;
}

export function mockGetAllStudents(): Student[] {
  return getState().students.map((s) => ({ ...s, subjects: [...s.subjects] }));
}

export function mockGetAllNotices(): Notice[] {
  return getState().notices.map((n) => ({ ...n }));
}

export function mockCreateStudent(input: StudentInput): Student {
  const state = getState();
  const finalSubjects = input.subjects.map(finalizeSubject);
  const sgpa = computeSgpa(finalSubjects);
  const resultStatus = input.resultStatus ?? computeResultStatus(finalSubjects, sgpa);
  const now = new Date().toISOString();
  const student: Student = {
    id: `stu_${Date.now()}`,
    hallTicket: input.hallTicket,
    name: input.name,
    fatherName: input.fatherName,
    motherName: input.motherName,
    dob: input.dob,
    course: input.course,
    branch: input.branch,
    regulation: input.regulation,
    semester: input.semester,
    examMonth: input.examMonth,
    examYear: input.examYear,
    collegeCode: input.collegeCode,
    collegeName: input.collegeName,
    sgpa,
    cgpa: input.cgpa ?? null,
    resultStatus,
    subjects: finalSubjects,
    createdAt: now,
    updatedAt: now,
  };
  state.students = [student, ...state.students];
  return student;
}

export function mockUpdateStudent(
  id: string,
  input: Partial<StudentInput>
): Student | null {
  const state = getState();
  const idx = state.students.findIndex((s) => s.id === id);
  if (idx < 0) return null;
  const existing = state.students[idx];
  let subjects = existing.subjects;
  if (input.subjects !== undefined) {
    subjects = input.subjects.map(finalizeSubject);
  }
  const sgpa = computeSgpa(subjects);
  const resultStatus =
    input.resultStatus ?? computeResultStatus(subjects, sgpa);
  const updated: Student = {
    ...existing,
    hallTicket: input.hallTicket ?? existing.hallTicket,
    name: input.name ?? existing.name,
    fatherName: input.fatherName ?? existing.fatherName,
    motherName: input.motherName ?? existing.motherName,
    dob: input.dob ?? existing.dob,
    course: input.course ?? existing.course,
    branch: input.branch ?? existing.branch,
    regulation: input.regulation ?? existing.regulation,
    semester: input.semester ?? existing.semester,
    examMonth: input.examMonth ?? existing.examMonth,
    examYear: input.examYear ?? existing.examYear,
    collegeCode: input.collegeCode ?? existing.collegeCode,
    collegeName: input.collegeName ?? existing.collegeName,
    cgpa: input.cgpa !== undefined ? input.cgpa : existing.cgpa,
    subjects,
    sgpa,
    resultStatus,
    updatedAt: new Date().toISOString(),
  };
  state.students[idx] = updated;
  return updated;
}

export function mockDeleteStudent(id: string): void {
  const state = getState();
  state.students = state.students.filter((s) => s.id !== id);
}

export function mockCreateNotice(input: NoticeInput): Notice {
  const state = getState();
  const notice: Notice = {
    id: `ntc_${Date.now()}`,
    title: input.title,
    description: input.description,
    examLabel: input.examLabel,
    releasedOn: input.releasedOn,
    isPublished: input.isPublished ?? true,
    createdAt: new Date().toISOString(),
  };
  state.notices = [notice, ...state.notices];
  return notice;
}

export function mockUpdateNotice(
  id: string,
  input: Partial<NoticeInput>
): Notice | null {
  const state = getState();
  const idx = state.notices.findIndex((n) => n.id === id);
  if (idx < 0) return null;
  const existing = state.notices[idx];
  const updated: Notice = {
    ...existing,
    title: input.title ?? existing.title,
    description: input.description ?? existing.description,
    examLabel: input.examLabel ?? existing.examLabel,
    releasedOn: input.releasedOn ?? existing.releasedOn,
    isPublished: input.isPublished ?? existing.isPublished,
  };
  state.notices[idx] = updated;
  return updated;
}

export function mockDeleteNotice(id: string): void {
  const state = getState();
  state.notices = state.notices.filter((n) => n.id !== id);
}

export function mockGetDashboardStats(): typeof mockDashboardStats {
  const state = getState();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const addedThisMonth = state.students.filter(
    (s) => new Date(s.createdAt).getTime() >= startOfMonth.getTime()
  ).length;
  const sortedRecent = [...state.students]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((s) => ({
      id: s.id,
      hallTicket: s.hallTicket,
      name: s.name,
      course: s.course,
      branch: s.branch,
      createdAt: s.createdAt,
    }));
  return {
    totalStudents: state.students.length,
    addedThisMonth,
    latestExam: mockDashboardStats.latestExam,
    activeNotices: state.notices.filter((n) => n.isPublished).length,
    recentStudents: sortedRecent,
  };
}
