import "server-only";
import { createHash } from "node:crypto";

import { getAdminSession } from "@/lib/auth";
import { sanitizeForPublic } from "@/lib/grading";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import type { StudentRow, SubjectRow, NoticeRow } from "@/lib/supabase/types";
import {
  computeResultStatus,
  computeSgpa,
  finalizeSubject,
} from "@/lib/grading";
import type {
  DashboardStats,
  Notice,
  PublicStudentResult,
  Student,
  Subject,
} from "@/lib/types";
import { mapStudentRow } from "./map";
import { createTtlCache } from "@/lib/cache";

const SALT = process.env.VERIFICATION_SALT || "ou-results-portal-secret-salt-2026";

export function generateVerificationHash(
  registerNumber: string,
  examYear: number
): string {
  const input = `${registerNumber.toUpperCase()}:${examYear}:${SALT}`;
  return createHash("sha256").update(input).digest("hex");
}

const noticeCache = createTtlCache<Notice[]>(60_000);
const resultCache = createTtlCache<PublicStudentResult | null>(300_000);

function mapSubject(row: SubjectRow): Subject {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    credits: Number(row.credits),
    internalMax: row.internal_max,
    internalObtained: row.internal_obtained,
    externalMax: row.external_max,
    externalObtained: row.external_obtained,
    totalMax: row.total_max,
    totalObtained: row.total_obtained,
    grade: row.grade,
    gradePoints: Number(row.grade_points),
  };
}

function mapNotice(row: NoticeRow): Notice {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    examLabel: row.exam_label,
    releasedOn: row.released_on,
    isPublished: row.is_published,
    createdAt: row.created_at,
  };
}

export async function serverGetPublicStudentResult(
  hallTicket: string,
  examYear: number
): Promise<PublicStudentResult | null> {
  const cacheKey = `result:${hallTicket.toUpperCase()}:${examYear}`;
  const cached = resultCache.get(cacheKey);
  if (cached !== undefined) return cached;

  const supabase = await getSupabaseServerClient();
  const { data: student, error: studentErr } = await supabase
    .from("students")
    .select("*")
    .eq("hall_ticket", hallTicket)
    .maybeSingle<StudentRow>();
  if (studentErr) throw new Error(studentErr.message);
  if (!student) {
    resultCache.set(cacheKey, null);
    return null;
  }
  if (student.exam_year !== examYear) {
    resultCache.set(cacheKey, null);
    return null;
  }
  const { data: subjects, error: subjectsErr } = await supabase
    .from("subjects")
    .select("*")
    .eq("student_id", student.id)
    .order("sort_order", { ascending: true })
    .returns<SubjectRow[]>();
  if (subjectsErr) throw new Error(subjectsErr.message);
  const mapped: Student = {
    id: student.id,
    hallTicket: student.hall_ticket,
    name: student.name,
    fatherName: student.father_name,
    motherName: student.mother_name,
    dob: student.dob,
    course: student.course,
    branch: student.branch,
    regulation: student.regulation,
    semester: student.semester,
    examMonth: student.exam_month,
    examYear: student.exam_year,
    collegeCode: student.college_code,
    collegeName: student.college_name,
    sgpa: Number(student.sgpa),
    cgpa: student.cgpa === null ? null : Number(student.cgpa),
    resultStatus: student.result_status,
    subjects: (subjects ?? []).map(mapSubject),
    createdAt: student.created_at,
    updatedAt: student.updated_at,
  };
  const result = sanitizeForPublic(mapped);
  result.verificationHash = generateVerificationHash(hallTicket, examYear);
  resultCache.set(cacheKey, result);
  return result;
}

export async function serverGetPublicNotices(): Promise<Notice[]> {
  const cached = noticeCache.get("all");
  if (cached !== undefined) return cached;

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("notices")
    .select("*")
    .eq("is_published", true)
    .order("released_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(20)
    .returns<NoticeRow[]>();
  if (error) throw new Error(error.message);
  const notices = (data ?? []).map(mapNotice);
  noticeCache.set("all", notices);
  return notices;
}

export interface AdminStudentFilters {
  course?: string;
  semester?: number;
  examYear?: number;
  q?: string;
  page?: number;
  pageSize?: number;
}

export async function serverGetAdminStudents(
  filters: AdminStudentFilters = {}
): Promise<{ items: Student[]; total: number; page: number; pageSize: number }> {
  const session = await getAdminSession();
  if (!session) throw new Error("unauthorized");
  const supabase = getSupabaseServiceClient();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  let query = supabase
    .from("students")
    .select("*", { count: "exact" })
    .order("exam_year", { ascending: false })
    .order("hall_ticket", { ascending: true });
  if (filters.course) query = query.eq("course", filters.course as never);
  if (filters.semester) query = query.eq("semester", filters.semester);
  if (filters.examYear) query = query.eq("exam_year", filters.examYear);
  if (filters.q) {
    query = query.or(
      `name.ilike.%${filters.q}%,hall_ticket.ilike.%${filters.q}%,college_name.ilike.%${filters.q}%`
    );
  }
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);
  const { data, error, count } = await query.returns<StudentRow[]>();
  if (error) throw new Error(error.message);
  return {
    items: (data ?? []).map((r) => mapStudentRow(r, [])),
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function serverGetAdminStudent(id: string): Promise<Student | null> {
  const session = await getAdminSession();
  if (!session) throw new Error("unauthorized");
  const supabase = getSupabaseServiceClient();
  const { data: student, error: studentErr } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .maybeSingle<StudentRow>();
  if (studentErr) throw new Error(studentErr.message);
  if (!student) return null;
  const { data: subjects, error: subjectsErr } = await supabase
    .from("subjects")
    .select("*")
    .eq("student_id", id)
    .order("sort_order", { ascending: true })
    .returns<SubjectRow[]>();
  if (subjectsErr) throw new Error(subjectsErr.message);
  return mapStudentRow(student, subjects ?? []);
}

export async function serverCreateAdminStudent(
  input: import("@/lib/validators").StudentInput
): Promise<Student> {
  const session = await getAdminSession();
  if (!session) throw new Error("unauthorized");
  const supabase = getSupabaseServiceClient();
  const finalSubjects = input.subjects.map(finalizeSubject);
  const computedSgpa = computeSgpa(finalSubjects);
  const sgpa = input.sgpa ?? computedSgpa;
  const resultStatus = input.resultStatus ?? computeResultStatus(finalSubjects, sgpa);
  const { data: student, error: studentErr } = await supabase
    .from("students")
    .insert({
      hall_ticket: input.hallTicket,
      name: input.name,
      father_name: input.fatherName,
      mother_name: input.motherName,
      dob: input.dob,
      course: input.course,
      branch: input.branch,
      regulation: input.regulation,
      semester: input.semester,
      exam_month: input.examMonth,
      exam_year: input.examYear,
      college_code: input.collegeCode,
      college_name: input.collegeName,
      sgpa,
      cgpa: input.cgpa ?? null,
      result_status: resultStatus,
    })
    .select("*")
    .single<StudentRow>();
  if (studentErr || !student) {
    if (studentErr?.code === "23505") {
      const err = new Error("duplicate_hall_ticket");
      (err as Error & { code?: string }).code = "duplicate_hall_ticket";
      throw err;
    }
    throw new Error(studentErr?.message ?? "insert_failed");
  }
  const subjectRows = finalSubjects.map((s, idx) => ({
    student_id: student.id,
    code: s.code,
    name: s.name,
    credits: s.credits,
    internal_max: s.internalMax,
    internal_obtained: s.internalObtained,
    external_max: s.externalMax,
    external_obtained: s.externalObtained,
    total_max: s.totalMax,
    total_obtained: s.totalObtained,
    grade: s.grade,
    grade_points: s.gradePoints,
    sort_order: idx,
  }));
  const { error: subjectsErr } = await supabase.from("subjects").insert(subjectRows);
  if (subjectsErr) {
    await supabase.from("students").delete().eq("id", student.id);
    throw new Error(subjectsErr.message);
  }
  return mapStudentRow(student, subjectRows.map((r, i) => ({
    ...r,
    id: `${student.id}_${i}`,
  })));
}

export async function serverUpdateAdminStudent(
  id: string,
  input: Partial<import("@/lib/validators").StudentInput>
): Promise<Student> {
  const session = await getAdminSession();
  if (!session) throw new Error("unauthorized");
  const supabase = getSupabaseServiceClient();
  const updates: Record<string, unknown> = {};
  if (input.hallTicket !== undefined) updates.hall_ticket = input.hallTicket;
  if (input.name !== undefined) updates.name = input.name;
  if (input.fatherName !== undefined) updates.father_name = input.fatherName;
  if (input.motherName !== undefined) updates.mother_name = input.motherName;
  if (input.dob !== undefined) updates.dob = input.dob;
  if (input.course !== undefined) updates.course = input.course;
  if (input.branch !== undefined) updates.branch = input.branch;
  if (input.regulation !== undefined) updates.regulation = input.regulation;
  if (input.semester !== undefined) updates.semester = input.semester;
  if (input.examMonth !== undefined) updates.exam_month = input.examMonth;
  if (input.examYear !== undefined) updates.exam_year = input.examYear;
  if (input.collegeCode !== undefined) updates.college_code = input.collegeCode;
  if (input.collegeName !== undefined) updates.college_name = input.collegeName;
  if (input.sgpa !== undefined) updates.sgpa = input.sgpa;
  if (input.cgpa !== undefined) updates.cgpa = input.cgpa;

  if (input.subjects !== undefined) {
    const finalSubjects = input.subjects.map(finalizeSubject);
    const computedSgpa = computeSgpa(finalSubjects);
    if (input.sgpa === undefined) updates.sgpa = computedSgpa;
    updates.result_status =
      input.resultStatus ?? computeResultStatus(finalSubjects, updates.sgpa as number);
    const { error: delErr } = await supabase
      .from("subjects")
      .delete()
      .eq("student_id", id);
    if (delErr) throw new Error(delErr.message);
    const subjectRows = finalSubjects.map((s, idx) => ({
      student_id: id,
      code: s.code,
      name: s.name,
      credits: s.credits,
      internal_max: s.internalMax,
      internal_obtained: s.internalObtained,
      external_max: s.externalMax,
      external_obtained: s.externalObtained,
      total_max: s.totalMax,
      total_obtained: s.totalObtained,
      grade: s.grade,
      grade_points: s.gradePoints,
      sort_order: idx,
    }));
    const { error: insErr } = await supabase.from("subjects").insert(subjectRows);
    if (insErr) throw new Error(insErr.message);
  } else if (input.resultStatus !== undefined) {
    updates.result_status = input.resultStatus;
  }

  if (Object.keys(updates).length === 0) {
    throw new Error("no_changes");
  }
  const { data, error } = await supabase
    .from("students")
    .update(updates)
    .eq("id", id)
    .select("*")
    .maybeSingle<StudentRow>();
  if (error) {
    if (error.code === "23505") {
      const err = new Error("duplicate_hall_ticket");
      (err as Error & { code?: string }).code = "duplicate_hall_ticket";
      throw err;
    }
    throw new Error(error.message);
  }
  if (!data) throw new Error("not_found");
  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .eq("student_id", id)
    .order("sort_order", { ascending: true })
    .returns<SubjectRow[]>();
  return mapStudentRow(data, subjects ?? []);
}

export async function serverDeleteAdminStudent(id: string): Promise<void> {
  const session = await getAdminSession();
  if (!session) throw new Error("unauthorized");
  const supabase = getSupabaseServiceClient();
  const { error } = await supabase.from("students").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function serverGetAdminNotices(
  includeUnpublished: boolean = true
): Promise<Notice[]> {
  const session = await getAdminSession();
  if (!session) throw new Error("unauthorized");
  const supabase = getSupabaseServiceClient();
  let query = supabase
    .from("notices")
    .select("*")
    .order("released_on", { ascending: false })
    .order("created_at", { ascending: false });
  if (!includeUnpublished) {
    query = query.eq("is_published", true);
  }
  const { data, error } = await query.returns<NoticeRow[]>();
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapNotice);
}

export async function serverCreateAdminNotice(
  input: import("@/lib/validators").NoticeInput
): Promise<Notice> {
  const session = await getAdminSession();
  if (!session) throw new Error("unauthorized");
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("notices")
    .insert({
      title: input.title,
      description: input.description,
      exam_label: input.examLabel,
      released_on: input.releasedOn,
      is_published: input.isPublished ?? true,
    })
    .select("*")
    .single<NoticeRow>();
  if (error || !data) {
    throw new Error(error?.message ?? "insert_failed");
  }
  return mapNotice(data);
}

export async function serverUpdateAdminNotice(
  id: string,
  input: Partial<import("@/lib/validators").NoticeInput>
): Promise<Notice> {
  const session = await getAdminSession();
  if (!session) throw new Error("unauthorized");
  const supabase = getSupabaseServiceClient();
  const updates: Record<string, unknown> = {};
  if (input.title !== undefined) updates.title = input.title;
  if (input.description !== undefined) updates.description = input.description;
  if (input.examLabel !== undefined) updates.exam_label = input.examLabel;
  if (input.releasedOn !== undefined) updates.released_on = input.releasedOn;
  if (input.isPublished !== undefined) updates.is_published = input.isPublished;
  if (Object.keys(updates).length === 0) {
    throw new Error("no_changes");
  }
  const { data, error } = await supabase
    .from("notices")
    .update(updates)
    .eq("id", id)
    .select("*")
    .maybeSingle<NoticeRow>();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("not_found");
  return mapNotice(data);
}

export async function serverDeleteAdminNotice(id: string): Promise<void> {
  const session = await getAdminSession();
  if (!session) throw new Error("unauthorized");
  const supabase = getSupabaseServiceClient();
  const { error } = await supabase.from("notices").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function serverGetAdminDashboard(): Promise<DashboardStats> {
  const session = await getAdminSession();
  if (!session) throw new Error("unauthorized");
  const supabase = getSupabaseServiceClient();
  const { count: totalStudents } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true });
  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);
  const isoStart = startOfMonth.toISOString();
  const { count: addedThisMonth } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .gte("created_at", isoStart);
  const { data: latestRow } = await supabase
    .from("students")
    .select("exam_year, exam_month, semester")
    .order("exam_year", { ascending: false })
    .order("exam_month", { ascending: false })
    .limit(1)
    .maybeSingle<Pick<StudentRow, "exam_year" | "exam_month" | "semester">>();
  const { count: totalWithResult } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .in("result_status", ["PASS", "FAIL"]);
  const { count: passedCount } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("result_status", "PASS");
  const passRate = totalWithResult && totalWithResult > 0
    ? Math.round((passedCount! / totalWithResult) * 100)
    : 0;
  const { count: activeNotices } = await supabase
    .from("notices")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true);
  interface RecentRow {
    id: string;
    hall_ticket: string;
    name: string;
    course: import("@/lib/types").CourseCode;
    branch: string;
    created_at: string;
    exam_year: number;
  }
  const { data: recent } = await supabase
    .from("students")
    .select("id, hall_ticket, name, course, branch, created_at, exam_year")
    .order("created_at", { ascending: false })
    .limit(5)
    .returns<RecentRow[]>();
  const recentStudents = (recent ?? []).map((r) => ({
    id: r.id,
    hallTicket: r.hall_ticket,
    name: r.name,
    course: r.course,
    branch: r.branch,
    createdAt: r.created_at,
    examYear: r.exam_year,
  }));
  const label = latestRow
    ? `${capMonth(latestRow.exam_month)} ${latestRow.exam_year}`
    : "—";
  const detail = latestRow ? `Semester ${latestRow.semester} Finals` : "No exam data";
  return {
    totalStudents: totalStudents ?? 0,
    addedThisMonth: addedThisMonth ?? 0,
    passRate,
    latestExam: { label, detail },
    activeNotices: activeNotices ?? 0,
    recentStudents,
  };
}

function capMonth(m: string): string {
  return m.charAt(0) + m.slice(1).toLowerCase();
}
