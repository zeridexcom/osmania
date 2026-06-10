<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Osmania Results Portal

Next.js 16 + React 19 + Tailwind CSS v4 + Supabase (Postgres) + jose JWT + Zod + Vitest

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (unit tests only) |
| `npx tsc --noEmit` | Type check |

## Tailwind v4

CSS-first config in `app/globals.css` via `@theme`. **Do not** create `tailwind.config.ts`. Extend tokens in `@theme` block. Use `cn()` from `lib/utils.ts` (wraps `clsx` + `tailwind-merge`) for conditional classes.

## Next.js 16 quirks

- **No `middleware.ts`** — auth is route-handler-level via jose JWTs in cookies
- **`params` and `searchParams` are Promises** — always `await props.params`
- **Next.js config is flat** (`next.config.ts`) — no Turbopack-specific overrides needed

## Auth

Single env-var admin user (`ADMIN_USERNAME`, `ADMIN_PASSWORD`). JWT cookies via `jose` (HS256, 12h TTL). No third-party auth. See `lib/auth.ts`.

## Supabase

- `lib/supabase/service.ts` (service role key — admin writes)
- `lib/supabase/server.ts` (anon key — public reads)
- `lib/supabase/client.ts` (browser client)
- Schema: `supabase/migrations/0001_init.sql`
- Seed data: `supabase/seed.sql` (3 students, 4 notices)
- RLS: public read-all on `students`/`subjects`, published-only on `notices`. All writes bypass RLS via service role.
- During dev without Supabase, the app can fall back to mock data (`lib/data/mock-state.ts`)

## Data layer

Three levels: Supabase clients → `lib/data/server.ts` (business logic) → API handlers. Admin functions check `getAdminSession()` inline. Grading (SGPA, result status) computed server-side in `lib/grading.ts`.

## Testing

- Vitest, node environment, files in `tests/**/*.test.ts`
- Uses `@/` path alias (resolved via vitest config)
- `server-only` module shimmed in `tests/shims/server-only.ts` (empty export)
- No integration/e2e tests — unit tests only (grading, auth, validators, rate limiting)
- Run: `npm run test`

## Grading (OU CBCS)

| % | Grade | Points |
|---|-------|--------|
| 90-100 | O | 10 |
| 80-89 | A+ | 9 |
| 70-79 | A | 8 |
| 60-69 | B+ | 7 |
| 50-59 | B | 6 |
| 40-49 | C | 5 |
| 36-39 | D | 4 |
| <36 | F | 0 |

SGPA = Σ(gradePoints × credits) / Σ(credits). PASS if all subjects ≥ D and SGPA ≥ 5.

## Verification order

`npx tsc --noEmit` → `npm run lint` → `npm run test` → `npm run build` (slowest last).

## Key files

| File | Purpose |
|------|---------|
| `lib/types.ts` | All domain types |
| `lib/validators.ts` | Zod schemas |
| `lib/grading.ts` | Grade/SGPA/status logic |
| `lib/auth.ts` | JWT sign/verify, credential check |
| `lib/ratelimit.ts` | In-memory rate limiter (5 req/min/IP) |
| `lib/data/server.ts` | All DB read/write operations |
| `lib/data/mock-state.ts` | In-memory mock for dev without Supabase |
| `app/globals.css` | Design tokens, typography scale, component classes |
