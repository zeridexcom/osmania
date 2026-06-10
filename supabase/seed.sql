-- Osmania Results Portal — sample seed data
-- Mirrors the mock data shape used by the frontend during build.
-- Insert order: students first (returns id), then subjects per student.

begin;

-- =========================================================
-- Student 1 — B.Tech CSE, semester 4
-- =========================================================

insert into public.students (
  hall_ticket, name, father_name, mother_name, dob,
  course, branch, regulation, semester, exam_month, exam_year,
  college_code, college_name, sgpa, cgpa, result_status
) values (
  '160321733001', 'Aarav Sharma', 'Rajesh Sharma', 'Priya Sharma', '2002-08-14',
  'BTECH', 'Computer Science and Engineering', 'CBCS', 4, 'MAY', 2024,
  '1603', 'University College of Engineering, Hyderabad', 8.42, 8.18, 'PASS'
);

-- =========================================================
-- Student 2 — BA Economics, semester 6
-- =========================================================

insert into public.students (
  hall_ticket, name, father_name, mother_name, dob,
  course, branch, regulation, semester, exam_month, exam_year,
  college_code, college_name, sgpa, cgpa, result_status
) values (
  '120923045067', 'Sneha Reddy', 'Krishna Reddy', 'Lakshmi Devi', '2001-11-22',
  'BA', 'Economics', 'CBCS', 6, 'MAY', 2024,
  '1209', 'Nizam College, Hyderabad', 7.85, 7.62, 'PASS'
);

-- =========================================================
-- Student 3 — MBA, semester 2 (one F, FAIL)
-- =========================================================

insert into public.students (
  hall_ticket, name, father_name, mother_name, dob,
  course, branch, regulation, semester, exam_month, exam_year,
  college_code, college_name, sgpa, cgpa, result_status
) values (
  '150125011042', 'Mohammed Iqbal', 'Abdul Kalam', 'Fatima Begum', '1998-04-03',
  'MBA', 'Finance', 'AICTE_MODEL', 2, 'MAY', 2024,
  '1501', 'Osmania University Business School', 4.10, 6.30, 'FAIL'
);

-- =========================================================
-- Subjects for Student 1 (B.Tech CSE, all PASS)
-- =========================================================

insert into public.subjects (
  student_id, code, name, credits,
  internal_max, internal_obtained, external_max, external_obtained,
  total_max, total_obtained, grade, grade_points, sort_order
)
select s.id, x.code, x.name, x.credits,
       x.internal_max, x.internal_obtained, x.external_max, x.external_obtained,
       x.total_max, x.total_obtained, x.grade::grade, x.grade_points, x.sort_order
from public.students s
cross join (values
  ('CS401',  'Operating Systems',                4.0, 30, 28, 70, 64, 100,  92, 'O',  10.0, 1),
  ('CS402',  'Database Management Systems',       4.0, 30, 26, 70, 60, 100,  86, 'A+',  9.0, 2),
  ('CS403',  'Computer Networks',                 3.0, 30, 25, 70, 55, 100,  80, 'A+',  9.0, 3),
  ('CS404',  'Software Engineering',              3.0, 30, 27, 70, 50, 100,  77, 'A',   8.0, 4),
  ('HS401',  'Professional Ethics',               2.0, 30, 24, 70, 52, 100,  76, 'A',   8.0, 5),
  ('CS4L1',  'Operating Systems Lab',             1.5, 30, 28, 70, 65, 100,  93, 'O',  10.0, 6)
) as x(code, name, credits, internal_max, internal_obtained,
       external_max, external_obtained, total_max, total_obtained,
       grade, grade_points, sort_order)
where s.hall_ticket = '160321733001';

-- =========================================================
-- Subjects for Student 2 (BA Economics)
-- =========================================================

insert into public.subjects (
  student_id, code, name, credits,
  internal_max, internal_obtained, external_max, external_obtained,
  total_max, total_obtained, grade, grade_points, sort_order
)
select s.id, x.code, x.name, x.credits,
       x.internal_max, x.internal_obtained, x.external_max, x.external_obtained,
       x.total_max, x.total_obtained, x.grade::grade, x.grade_points, x.sort_order
from public.students s
cross join (values
  ('ECO601', 'Macroeconomics',             5.0, 30, 26, 70, 58, 100, 84, 'A+',  9.0, 1),
  ('ECO602', 'Indian Economy',             5.0, 30, 25, 70, 55, 100, 80, 'A+',  9.0, 2),
  ('ECO603', 'Public Finance',             4.0, 30, 24, 70, 50, 100, 74, 'A',   8.0, 3),
  ('ECO604', 'Development Economics',      4.0, 30, 23, 70, 47, 100, 70, 'A',   8.0, 4),
  ('ECO6L1', 'Econometrics Lab',           2.0, 30, 27, 70, 56, 100, 83, 'A+',  9.0, 5)
) as x(code, name, credits, internal_max, internal_obtained,
       external_max, external_obtained, total_max, total_obtained,
       grade, grade_points, sort_order)
where s.hall_ticket = '120923045067';

-- =========================================================
-- Subjects for Student 3 (MBA — one F, result FAIL)
-- =========================================================

insert into public.subjects (
  student_id, code, name, credits,
  internal_max, internal_obtained, external_max, external_obtained,
  total_max, total_obtained, grade, grade_points, sort_order
)
select s.id, x.code, x.name, x.credits,
       x.internal_max, x.internal_obtained, x.external_max, x.external_obtained,
       x.total_max, x.total_obtained, x.grade::grade, x.grade_points, x.sort_order
from public.students s
cross join (values
  ('MBA201', 'Corporate Finance',     4.0, 30, 20, 70,  8, 100, 28, 'F',  0.0, 1),
  ('MBA202', 'Marketing Management',  4.0, 30, 24, 70, 46, 100, 70, 'A',  8.0, 2),
  ('MBA203', 'Operations Research',   3.0, 30, 22, 70, 39, 100, 61, 'B+', 7.0, 3),
  ('MBA204', 'Business Analytics',    3.0, 30, 23, 70, 35, 100, 58, 'B',  6.0, 4)
) as x(code, name, credits, internal_max, internal_obtained,
       external_max, external_obtained, total_max, total_obtained,
       grade, grade_points, sort_order)
where s.hall_ticket = '150125011042';

-- =========================================================
-- Notices (4 sample entries)
-- =========================================================

insert into public.notices (title, description, exam_label, released_on, is_published) values
  ('B.Tech IV Semester Results — May 2024',
   'Results for the B.Tech IV Semester examinations conducted in May 2024 have been released. Students can view and download their statement of marks from the portal.',
   'B.Tech IV Sem — May 2024',
   '2024-06-15',
   true),
  ('BA VI Semester Results — May 2024',
   'Results for the BA VI Semester (Economics, History, Political Science) examinations conducted in May 2024 have been published.',
   'BA VI Sem — May 2024',
   '2024-06-12',
   true),
  ('MBA II Semester Revaluation Notification',
   'Applications for revaluation of MBA II Semester answer scripts are now open. Last date for submission is 30 June 2024.',
   'MBA II Sem — May 2024',
   '2024-06-10',
   true),
  ('Supplementary Exam Timetable — July 2024',
   'The timetable for supplementary examinations scheduled in July 2024 has been published. Hall tickets will be available for download from 25 June 2024.',
   'Supplementary — July 2024',
   '2024-06-20',
   true);

commit;
