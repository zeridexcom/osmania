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

export type StudentRow = {
  id: string;
  hall_ticket: string;
  name: string;
  father_name: string;
  mother_name: string;
  dob: string;
  course: CourseCode;
  branch: string;
  regulation: Regulation;
  semester: number;
  exam_month: string;
  exam_year: number;
  college_code: string;
  college_name: string;
  sgpa: number;
  cgpa: number | null;
  result_status: ResultStatus;
  created_at: string;
  updated_at: string;
};

export type SubjectRow = {
  id: string;
  student_id: string;
  code: string;
  name: string;
  credits: number;
  internal_max: number;
  internal_obtained: number;
  external_max: number;
  external_obtained: number;
  total_max: number;
  total_obtained: number;
  grade: Grade;
  grade_points: number;
  sort_order: number;
};

export type NoticeRow = {
  id: string;
  title: string;
  description: string;
  exam_label: string;
  released_on: string;
  is_published: boolean;
  created_at: string;
};

export type StudentInsert = {
  hall_ticket: string;
  name: string;
  father_name: string;
  mother_name: string;
  dob: string;
  course: CourseCode;
  branch: string;
  regulation: Regulation;
  semester: number;
  exam_month: string;
  exam_year: number;
  college_code: string;
  college_name: string;
  sgpa: number;
  cgpa: number | null;
  result_status: ResultStatus;
};

export type StudentUpdate = Partial<StudentInsert>;

export type SubjectInsert = {
  student_id: string;
  code: string;
  name: string;
  credits: number;
  internal_max: number;
  internal_obtained: number;
  external_max: number;
  external_obtained: number;
  total_max: number;
  total_obtained: number;
  grade: Grade;
  grade_points: number;
  sort_order: number;
};

export type SubjectUpdate = Partial<Omit<SubjectInsert, "student_id">>;

export type NoticeInsert = {
  title: string;
  description: string;
  exam_label: string;
  released_on: string;
  is_published: boolean;
};

export type NoticeUpdate = Partial<NoticeInsert>;

type Row = { [key: string]: unknown };

export type Database = {
  public: {
    Tables: {
      students: {
        Row: StudentRow & Row;
        Insert: StudentInsert & Row;
        Update: StudentUpdate & Row;
        Relationships: [];
      };
      subjects: {
        Row: SubjectRow & Row;
        Insert: SubjectInsert & Row;
        Update: SubjectUpdate & Row;
        Relationships: [];
      };
      notices: {
        Row: NoticeRow & Row;
        Insert: NoticeInsert & Row;
        Update: NoticeUpdate & Row;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
