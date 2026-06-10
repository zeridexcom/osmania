import { getAdminSession } from "@/lib/auth";
import { mapStudentRow } from "@/lib/data/map";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import type { StudentRow, SubjectRow } from "@/lib/supabase/types";
import {
  computeResultStatus,
  computeSgpa,
  finalizeSubject,
} from "@/lib/grading";
import { studentInputSchema, studentListQuerySchema } from "@/lib/validators";
import type { Student, Subject } from "@/lib/types";
import { extractClientIp } from "@/lib/ratelimit";
import { logAudit } from "@/lib/audit";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const queryParsed = studentListQuerySchema.safeParse(
    Object.fromEntries(url.searchParams.entries())
  );
  if (!queryParsed.success) {
    return Response.json(
      { error: "validation_error", issues: queryParsed.error.issues },
      { status: 400 }
    );
  }
  const { course, semester, examYear, q, page, pageSize } = queryParsed.data;

  let supabase;
  try {
    supabase = getSupabaseServiceClient();
  } catch (err) {
    return Response.json(
      { error: "service_unavailable", message: (err as Error).message },
      { status: 503 }
    );
  }

  let query = supabase
    .from("students")
    .select("*", { count: "exact" })
    .order("exam_year", { ascending: false })
    .order("hall_ticket", { ascending: true });

  if (course) query = query.eq("course", course);
  if (semester) query = query.eq("semester", semester);
  if (examYear) query = query.eq("exam_year", examYear);
  if (q) query = query.or(
    `name.ilike.%${q}%,hall_ticket.ilike.%${q}%,college_name.ilike.%${q}%`
  );

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query.returns<StudentRow[]>();
  if (error) {
    return Response.json(
      { error: "query_failed", message: error.message },
      { status: 500 }
    );
  }

  return Response.json({
    data: (data ?? []).map((row) => mapStudentRow(row, [])),
    page,
    pageSize,
    total: count ?? 0,
  });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = studentInputSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      { error: "validation_error", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const input = parsed.data;
  const finalSubjects = input.subjects.map(finalizeSubject);
  const sgpa = computeSgpa(finalSubjects);
  const resultStatus =
    input.resultStatus ?? computeResultStatus(finalSubjects, sgpa);

  let supabase;
  try {
    supabase = getSupabaseServiceClient();
  } catch (err) {
    return Response.json(
      { error: "service_unavailable", message: (err as Error).message },
      { status: 503 }
    );
  }

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
    const code =
      studentErr?.code === "23505" ? "duplicate_hall_ticket" : "insert_failed";
    return Response.json(
      { error: code, message: studentErr?.message ?? "Insert failed" },
      { status: code === "duplicate_hall_ticket" ? 409 : 500 }
    );
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

  const { error: subjectsErr } = await supabase
    .from("subjects")
    .insert(subjectRows);

  if (subjectsErr) {
    await supabase.from("students").delete().eq("id", student.id);
    return Response.json(
      { error: "insert_failed", message: subjectsErr.message },
      { status: 500 }
    );
  }

  const ip = extractClientIp(request.headers);
  logAudit(session.username, "student.create", ip, `${input.hallTicket} (${input.name})`);

  return Response.json(
    {
      data: mapStudentRow(
        student,
        subjectRows.map((r, i) => ({ ...r, id: `${student.id}_${i}` }))
      ),
    },
    { status: 201 }
  );
}

export const dynamic = "force-dynamic";

export type AdminStudentsListResponse = {
  data: StudentRow[];
  page: number;
  pageSize: number;
  total: number;
};

export type AdminStudentCreateResponse = {
  data: StudentRow & { subjects: Array<Omit<Subject, "id"> & { sort_order: number }> };
};

export type _AdminStudentMapped = Student;
export type _AdminSubjectMapped = Subject;
export type _AdminStudentRow = StudentRow;
export type _AdminSubjectRow = SubjectRow;
