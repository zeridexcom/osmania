# Osmania University Results Portal

A personal/learning project that mirrors the look of the official Andhra University results portal, adapted for **Osmania University**. Admins add student results one-by-one through a protected dashboard; students look up results by **Hall Ticket Number + DOB**.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19** + **TypeScript 5**
- **Tailwind CSS v4** (CSS-first config in `app/globals.css`)
- **Supabase** (Postgres) — schema in `supabase/migrations/`
- **jose** for JWT admin auth (no third-party auth provider)
- **Zod** for runtime validation
- **Vitest** for unit tests (grading calculator)

## Quick start

```bash
npm install
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY, ADMIN_USERNAME, ADMIN_PASSWORD
npm run dev
```

Open <http://localhost:3000>.

## Routes

| Path | Access | Purpose |
|---|---|---|
| `/` | public | Landing + result lookup form |
| `/result` | public | POST handler that redirects to `/result/[htno]` |
| `/result/[htno]` | public | Statement of Marks (print-friendly) |
| `/notices` | public | Latest result-release notices |
| `/admin/login` | public | Admin login |
| `/admin` | protected | Dashboard |
| `/admin/students` | protected | Student list with filters + pagination |
| `/admin/students/new` | protected | Add student (info + dynamic subjects) |
| `/admin/students/[id]/edit` | protected | Edit student |
| `/admin/notices` | protected | CRUD notices |
| `/api/result/lookup` | public | POST `{ hallTicket, dob }` → student result |
| `/api/admin/login` | public | POST username/password → JWT cookie |
| `/api/admin/students` | protected | GET (list) / POST (create) |
| `/api/admin/students/[id]` | protected | GET / PUT / DELETE |
| `/api/admin/notices` | protected | GET / POST |
| `/api/admin/notices/[id]` | protected | PUT / DELETE |

## Grading

OU CBCS grading convention (see `lib/grading.ts` and `tests/grading.test.ts`):

| Marks (%) | Grade | Points |
|---|---|---|
| 90-100 | O | 10 |
| 80-89 | A+ | 9 |
| 70-79 | A | 8 |
| 60-69 | B+ | 7 |
| 50-59 | B | 6 |
| 40-49 | C | 5 |
| 36-39 | D | 4 |
| <36 | F | 0 |

`SGPA = Σ(gradePoints × credits) / Σ(credits)`

## Disclaimer

This is a **student/learning project** for personal/educational use. Always verify marks with the official [osmania.ac.in](https://www.osmania.ac.in) examination branch.
