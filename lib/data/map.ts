import type { Notice, Student, Subject } from "@/lib/types";
import type { NoticeRow, StudentRow, SubjectRow } from "@/lib/supabase/types";

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

export function mapStudentRow(row: StudentRow, subjects: SubjectRow[] = []): Student {
  return {
    id: row.id,
    hallTicket: row.hall_ticket,
    name: row.name,
    fatherName: row.father_name,
    motherName: row.mother_name,
    dob: row.dob,
    course: row.course,
    branch: row.branch,
    regulation: row.regulation,
    semester: row.semester,
    examMonth: row.exam_month,
    examYear: row.exam_year,
    collegeCode: row.college_code,
    collegeName: row.college_name,
    sgpa: Number(row.sgpa),
    cgpa: row.cgpa === null ? null : Number(row.cgpa),
    resultStatus: row.result_status,
    subjects: subjects.map(mapSubject),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapNoticeRow(row: NoticeRow): Notice {
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
