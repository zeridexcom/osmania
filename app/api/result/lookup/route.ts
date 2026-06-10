import type { Student, Subject } from "@/lib/types";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import type {
  StudentRow,
  SubjectRow,
} from "@/lib/supabase/types";
import { sanitizeForPublic } from "@/lib/grading";
import { publicLookupSchema } from "@/lib/validators";
import {
  RATE_LIMIT_CONFIG,
  checkRateLimit,
  extractClientIp,
} from "@/lib/ratelimit";
import { generateVerificationHash } from "@/lib/data/server";

export async function POST(request: Request) {
  const ip = extractClientIp(request.headers);
  const limit = checkRateLimit(ip, "result.lookup");
  if (!limit.allowed) {
    const retryAfter = Math.max(
      1,
      Math.ceil((limit.resetAt - Date.now()) / 1000)
    );
    return Response.json(
      { error: "rate_limited", message: "Too many requests. Try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(RATE_LIMIT_CONFIG.maxRequests),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(limit.resetAt),
        },
      }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json(
      { error: "invalid_json" },
      { status: 400 }
    );
  }

  const parsed = publicLookupSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      { error: "validation_error", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { hallTicket, examYear } = parsed.data;

  let supabase;
  try {
    supabase = await getSupabaseServerClient();
  } catch (err) {
    return Response.json(
      { error: "service_unavailable", message: (err as Error).message },
      { status: 503 }
    );
  }

  const { data: student, error: studentErr } = await supabase
    .from("students")
    .select("*")
    .eq("hall_ticket", hallTicket)
    .maybeSingle<StudentRow>();

  if (studentErr) {
    return Response.json(
      { error: "lookup_failed", message: studentErr.message },
      { status: 500 }
    );
  }

  if (!student) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  if (student.exam_year !== examYear) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  const { data: subjects, error: subjectsErr } = await supabase
    .from("subjects")
    .select("*")
    .eq("student_id", student.id)
    .order("sort_order", { ascending: true })
    .returns<SubjectRow[]>();

  if (subjectsErr) {
    return Response.json(
      { error: "lookup_failed", message: subjectsErr.message },
      { status: 500 }
    );
  }

  const mappedSubjects: Subject[] = (subjects ?? []).map((row) => ({
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
  }));

  const full: Student = {
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
    subjects: mappedSubjects,
    createdAt: student.created_at,
    updatedAt: student.updated_at,
  };

  const result = sanitizeForPublic(full);
  result.verificationHash = generateVerificationHash(hallTicket, examYear);

  return Response.json(
    { result },
    {
      headers: {
        "X-RateLimit-Limit": String(RATE_LIMIT_CONFIG.maxRequests),
        "X-RateLimit-Remaining": String(limit.remaining),
        "X-RateLimit-Reset": String(limit.resetAt),
      },
    }
  );
}

export const dynamic = "force-dynamic";
