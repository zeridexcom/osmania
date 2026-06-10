-- Osmania Results Portal — initial schema
-- Run order: 0001_init.sql (this file) before any data load.

create extension if not exists "pgcrypto";

-- =========================================================
-- Enums (CHECK-constrained text columns for portability)
-- =========================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'course_code') then
    create type course_code as enum (
      'BA', 'BCOM', 'BSC', 'BBA', 'BCA', 'BE', 'BTECH',
      'MA', 'MCOM', 'MSC', 'MBA', 'MCA'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'regulation') then
    create type regulation as enum ('CBCS', 'NON_CBCS', 'AICTE_MODEL');
  end if;
  if not exists (select 1 from pg_type where typname = 'result_status') then
    create type result_status as enum ('PASS', 'FAIL', 'PENDING', 'WITH_HELD');
  end if;
  if not exists (select 1 from pg_type where typname = 'grade') then
    create type grade as enum ('O', 'A+', 'A', 'B+', 'B', 'C', 'D', 'F');
  end if;
end $$;

-- =========================================================
-- students
-- =========================================================

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  hall_ticket text not null unique,
  name text not null,
  father_name text not null,
  mother_name text not null,
  dob date not null,
  course text not null check (course in (
    'BA','BCOM','BSC','BBA','BCA','BE','BTECH',
    'MA','MCOM','MSC','MBA','MCA'
  )),
  branch text not null,
  regulation text not null check (regulation in ('CBCS','NON_CBCS','AICTE_MODEL')),
  semester int not null check (semester between 1 and 10),
  exam_month text not null,
  exam_year int not null,
  college_code text not null,
  college_name text not null,
  sgpa numeric(4,2) not null,
  cgpa numeric(4,2),
  result_status text not null check (result_status in ('PASS','FAIL','PENDING','WITH_HELD')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists students_course_idx on public.students (course);
create index if not exists students_exam_year_idx on public.students (exam_year);
create index if not exists students_semester_idx on public.students (semester);
create extension if not exists pg_trgm;

create index if not exists students_result_status_idx on public.students (result_status);
create index if not exists students_name_trgm_idx on public.students using gin (name gin_trgm_ops);
create index if not exists students_hall_ticket_trgm_idx on public.students using gin (hall_ticket gin_trgm_ops);

-- =========================================================
-- subjects
-- =========================================================

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  code text not null,
  name text not null,
  credits numeric(4,2) not null,
  internal_max int not null,
  internal_obtained int not null,
  external_max int not null,
  external_obtained int not null,
  total_max int not null,
  total_obtained int not null,
  grade text not null check (grade in ('O','A+','A','B+','B','C','D','F')),
  grade_points numeric(3,1) not null,
  sort_order int not null default 0
);

create index if not exists subjects_student_id_idx on public.subjects (student_id);
create index if not exists subjects_student_sort_idx on public.subjects (student_id, sort_order);

-- =========================================================
-- notices
-- =========================================================

create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  exam_label text not null,
  released_on date not null,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists notices_released_on_idx on public.notices (released_on desc);
create index if not exists notices_is_published_idx on public.notices (is_published);

-- =========================================================
-- updated_at trigger on students
-- =========================================================

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists students_set_updated_at on public.students;
create trigger students_set_updated_at
before update on public.students
for each row execute function public.set_updated_at();

-- =========================================================
-- Row Level Security
-- Public read on all three tables. All writes go through
-- the service-role key from API handlers.
-- =========================================================

alter table public.students enable row level security;
alter table public.subjects enable row level security;
alter table public.notices enable row level security;

drop policy if exists students_public_read on public.students;
create policy students_public_read on public.students
  for select using (true);

drop policy if exists subjects_public_read on public.subjects;
create policy subjects_public_read on public.subjects
  for select using (true);

drop policy if exists notices_public_read on public.notices;
create policy notices_public_read on public.notices
  for select using (is_published = true);
