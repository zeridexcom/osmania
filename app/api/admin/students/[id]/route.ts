import { getAdminSession } from "@/lib/auth";
import { mapStudentRow } from "@/lib/data/map";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import type { StudentRow, SubjectRow } from "@/lib/supabase/types";
import {
  computeResultStatus,
  computeSgpa,
  finalizeSubject,
} from "@/lib/grading";
import { studentUpdateSchema } from "@/lib/validators";
import { extractClientIp } from "@/lib/ratelimit";
import { logAudit } from "@/lib/audit";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/admin/students/[id]">
) {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!isUuid(id)) {
    return Response.json({ error: "invalid_id" }, { status: 400 });
  }

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
    .select("*")
    .eq("id", id)
    .maybeSingle<StudentRow>();

  if (studentErr) {
    return Response.json(
      { error: "query_failed", message: studentErr.message },
      { status: 500 }
    );
  }
  if (!student) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  const { data: subjects, error: subjectsErr } = await supabase
    .from("subjects")
    .select("*")
    .eq("student_id", id)
    .order("sort_order", { ascending: true })
    .returns<SubjectRow[]>();

  if (subjectsErr) {
    return Response.json(
      { error: "query_failed", message: subjectsErr.message },
      { status: 500 }
    );
  }

  return Response.json({ data: mapStudentRow(student, subjects ?? []) });
}

export async function PUT(
  request: Request,
  context: RouteContext<"/api/admin/students/[id]">
) {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!isUuid(id)) {
    return Response.json({ error: "invalid_id" }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = studentUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      { error: "validation_error", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const input = parsed.data;

  let supabase;
  try {
    supabase = getSupabaseServiceClient();
  } catch (err) {
    return Response.json(
      { error: "service_unavailable", message: (err as Error).message },
      { status: 503 }
    );
  }

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
  if (input.cgpa !== undefined) updates.cgpa = input.cgpa;

  if (input.subjects !== undefined) {
    const finalSubjects = input.subjects.map(finalizeSubject);
    updates.sgpa = computeSgpa(finalSubjects);
    updates.result_status =
      input.resultStatus ?? computeResultStatus(finalSubjects, updates.sgpa as number);

    const { error: delErr } = await supabase
      .from("subjects")
      .delete()
      .eq("student_id", id);
    if (delErr) {
      return Response.json(
        { error: "update_failed", message: delErr.message },
        { status: 500 }
      );
    }
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
    const { error: insErr } = await supabase
      .from("subjects")
      .insert(subjectRows);
    if (insErr) {
      return Response.json(
        { error: "update_failed", message: insErr.message },
        { status: 500 }
      );
    }
  } else if (input.resultStatus !== undefined) {
    updates.result_status = input.resultStatus;
  }

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: "no_changes" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("students")
    .update(updates)
    .eq("id", id)
    .select("*")
    .maybeSingle<StudentRow>();

  if (error) {
    const code = error.code === "23505" ? "duplicate_hall_ticket" : "update_failed";
    return Response.json(
      { error: code, message: error.message },
      { status: code === "duplicate_hall_ticket" ? 409 : 500 }
    );
  }
  if (!data) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .eq("student_id", id)
    .order("sort_order", { ascending: true })
    .returns<SubjectRow[]>();

  const ip = extractClientIp(request.headers);
  logAudit(session.username, "student.update", ip, id);
  return Response.json({ data: mapStudentRow(data, subjects ?? []) });
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/admin/students/[id]">
) {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!isUuid(id)) {
    return Response.json({ error: "invalid_id" }, { status: 400 });
  }

  let supabase;
  try {
    supabase = getSupabaseServiceClient();
  } catch (err) {
    return Response.json(
      { error: "service_unavailable", message: (err as Error).message },
      { status: 503 }
    );
  }

  const { error } = await supabase.from("students").delete().eq("id", id);
  if (error) {
    return Response.json(
      { error: "delete_failed", message: error.message },
      { status: 500 }
    );
  }
  const ip = extractClientIp(_request.headers);
  logAudit(session.username, "student.delete", ip, id);
  return Response.json({ ok: true });
}

export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}
