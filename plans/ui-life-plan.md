# Plan: UI Life & Legitimacy Improvements

**Generated**: 2026-06-09
**Estimated Complexity**: Medium

## Overview

Make the Osmania Results Portal feel "more alive and legit" by closing the gap with the reference site (andrauniresults.vercel.app). Two tracks run in parallel:

- **Frontend Design**: Atmosphere, motion, trust signals, polish
- **Backend Developer**: API infrastructure, subscription, caching, verification

## Orchestration (for multi-agent-coordinator)

### Dependency Graph

```
                    ┌──────────────────────┐
                    │   Sprint 1: Both     │
                    │   Run in parallel    │
                    └────┬─────────────┬───┘
                         │             │
              ┌──────────▼──┐   ┌──────▼──────────┐
              │ Frontend    │   │ Backend          │
              │ Sprint 1-3  │   │ Sprint 1-3       │
              │ (sequential)│   │ (sequential)     │
              └──────────┬──┘   └──────┬──────────┘
                         │             │
                    ┌────▼─────────────▼────┐
                    │   Sprint 4: Integrate  │
                    │   (coordinate merge)   │
                    └────────────────────────┘
```

### Coordination Rules

1. **Frontend Sprint 1** and **Backend Sprint 1** start simultaneously — no cross-dependency
2. Within each track, sprints are sequential (1 → 2 → 3)
3. After both complete Sprint 3, **Sprint 4** (integration) begins
4. Share state via `task_id` handoff — each agent returns its task_id upon sprint completion
5. If either agent fails a task, coordinator pauses dependent work, retries once, then escalates

### Communication

- Coordinator holds the plan file (`plans/ui-life-plan.md`) and passes relevant sections to each agent
- Each agent reports back: `{ status, files_changed, task_id, issues }`
- Coordinator merges file changes from both agents

---

## Frontend Design Track

### Sprint F1: Atmosphere & Authenticity
**Goal**: Add watermark, trust signals, scrolling marquee

#### Task F1.1: Watermark Background
- **Location**: `app/globals.css` + `app/layout.tsx`
- **Description**: Add `body:before` pseudo-element with translucent OU logo as watermark. Add optional repeating text watermark pattern (CSS-only).
- **Acceptance**: Watermark visible as ghost overlay across all pages
- **Validation**: `npm run build` passes, visual check on homepage

#### Task F1.2: Trust Signals in Footer
- **Location**: `components/SiteFooter.tsx`
- **Description**: Add "SSL Secured", "Data Protected", "This result is authenticated and final" badges/text to footer. Use green lock icon + border.
- **Acceptance**: Trust badges visible in footer on all pages
- **Validation**: `npm run build` passes

#### Task F1.3: Scrolling Marquee for Notices
- **Location**: `app/page.tsx` (new section above search form), `app/globals.css`
- **Description**: CSS-only `@keyframes scroll-left` marquee showing latest announcement text. Pull from the existing `latestNotices` data.
- **Acceptance**: Announcement text scrolls horizontally on landing page
- **Validation**: `npm run build` passes

### Sprint F2: Motion & Interactivity
**Goal**: Page transitions, hover systems, scroll reveals, loading skeletons

#### Task F2.1: View Transitions API
- **Location**: `app/globals.css`
- **Description**: Add `@view-transition { navigation: auto; }` and `::view-transition-*` rules for crossfade on navigation.
- **Acceptance**: All page navigations fade smoothly (no white flash)
- **Validation**: Navigate between Home ↔ Notices ↔ Admin Login

#### Task F2.2: Hover Depth Utilities
- **Location**: `app/globals.css` + apply to `NoticeCard.tsx`, `StatCard.tsx`, calendar events
- **Description**: CSS utility classes `.hover-lift`, `.hover-glow`, `.hover-card` with translateY(-2px), shadow elevation, scale transforms.
- **Acceptance**: All cards/buttons lift with shadow on hover
- **Validation**: `npm run build` passes

#### Task F2.3: Scroll Stagger Reveal
- **Location**: New `hooks/use-in-view.ts` + new `components/AnimateIn.tsx` + `app/page.tsx`
- **Description**: Custom `useInView` hook using IntersectionObserver. `AnimateIn` client component wraps sections with fadeInUp animation + staggered delay.
- **Acceptance**: Landing page sections fade/slide in sequentially on scroll
- **Validation**: `npm run build` passes

#### Task F2.4: Skeleton Shimmer
- **Location**: `app/globals.css` (shimmer keyframes) + `components/Spinner.tsx` (refactor to skeleton)
- **Description**: CSS shimmer animation. Skeleton blocks that match result statement layout.
- **Acceptance**: Loading state shows shimmer skeleton, not just spinner
- **Validation**: Trigger result lookup, observe loading state

### Sprint F3: Polish
**Goal**: Emoji, certificate card, CAPTCHA animation, dark mode

#### Task F3.1: Emoji in Labels & Headers
- **Location**: `components/SearchForm.tsx`, `app/page.tsx`, `app/notices/page.tsx`
- **Description**: Add emojis (🎫, 📤, 📢, 📅, 📞) alongside existing lucide icons in form labels and section headers.
- **Acceptance**: Emojis visible next to labels
- **Validation**: `npm run build` passes

#### Task F3.2: Result Card Certificate Styling
- **Location**: `components/ResultCard.tsx` (or wherever the result statement renders)
- **Description**: Give result card 2px maroon border, gradient background, watermark overlay. Make it look like a printed certificate.
- **Acceptance**: Result page shows certificate-style card
- **Validation**: Load a result, observe card styling

#### Task F3.3: CAPTCHA Refresh Animation
- **Location**: `components/SearchForm.tsx` + `app/globals.css`
- **Description**: Add flip/rotate animation on CAPTCHA refresh. Shake animation on CAPTCHA error.
- **Acceptance**: CAPTCHA card-flips on refresh, shakes on error
- **Validation**: Click refresh, enter wrong CAPTCHA

#### Task F3.4: Dark Mode Toggle
- **Location**: `app/globals.css` (`.dark` class theme) + `components/SiteHeader.tsx` (toggle button)
- **Description**: Duplicate `@theme` block with dark values under `.dark`. Add moon/sun toggle in header gov bar. Persist to localStorage.
- **Acceptance**: Toggle switches between light/dark across all pages
- **Validation**: Click toggle, observe all pages

---

## Backend Developer Track

### Sprint B1: API Infrastructure
**Goal**: Subscription, health check, marquee data

#### Task B1.1: Notices Subscription API
- **Location**: New `app/api/subscribe/route.ts`
- **Description**: POST endpoint accepting `{ email }`. Validates with Zod. Stores in-memory or logs to console (mock for now). Returns `{ ok: true }`.
- **Acceptance**: POST to `/api/subscribe` returns 200 with valid email
- **Validation**: `curl -X POST /api/subscribe -d '{"email":"test@test.com"}'`

#### Task B1.2: Health Check Endpoint
- **Location**: New `app/api/health/route.ts`
- **Description**: GET endpoint returning `{ status: "ok", timestamp, version }`. Checks DB connectivity (if configured).
- **Acceptance**: GET `/api/health` returns 200 with status object
- **Validation**: `curl /api/health`

#### Task B1.3: Latest Notices API
- **Location**: New `app/api/notices/latest/route.ts`
- **Description**: GET endpoint returning top 5 published notices. Used by the marquee component.
- **Acceptance**: GET returns JSON array of notices
- **Validation**: `curl /api/notices/latest`

### Sprint B2: Result Enhancement
**Goal**: Authenticity, rate limiting, caching

#### Task B2.1: Result Verification Hash
- **Location**: `lib/data/server.ts` (add `generateVerificationHash` function)
- **Description**: Generate SHA-256 hash from `registerNumber + examYear + secretSalt`. Return alongside result data for authenticity verification.
- **Acceptance**: Result includes `verificationHash` field
- **Validation**: `npm run test`

#### Task B2.2: Rate Limiting Improvements
- **Location**: `lib/ratelimit.ts` (extend existing limiter)
- **Description**: Add per-route rate limiters: stricter for result lookup (3/min), looser for notices (30/min). Add IP-based tracking.
- **Acceptance**: Excessive requests to result API get 429
- **Validation**: `npm run test`

#### Task B2.3: Caching Layer
- **Location**: New `lib/cache.ts` + `lib/data/server.ts`
- **Description**: Simple in-memory TTL cache for notices (60s) and student results (300s). Reduce repeated DB calls.
- **Acceptance**: Second request within TTL returns cached data
- **Validation**: `npm run test`

### Sprint B3: Admin & Print
**Goal**: Audit logging, PDF generation

#### Task B3.1: Admin Audit Logging
- **Location**: New `lib/audit.ts` + admin routes
- **Description**: Log admin actions (login, notice create/update, result publish) with timestamp, user, action, IP. Store in-memory array.
- **Acceptance**: Admin actions recorded in audit log
- **Validation**: Perform admin action, check audit log

#### Task B3.2: PDF Generation Endpoint
- **Location**: New `app/api/result/[hallTicket]/pdf/route.ts`
- **Description**: Generate simple HTML-based PDF of result statement using a lightweight approach (html-to-text or pupeteer-free method). Return as downloadable PDF.
- **Acceptance**: GET returns downloadable PDF file
- **Validation**: Hit endpoint, verify PDF download

---

## Sprint 4: Integration & Verification
**Goal**: Merge both tracks, verify everything works together

- Run `npx tsc --noEmit` — fix type errors
- Run `npm run lint` — fix lint errors
- Run `npm run test` — ensure all tests pass
- Run `npm run build` — verify production build
- Manual visual check of all pages

## Testing Strategy

- **Frontend**: Visual verification + `npm run build`
- **Backend**: `npm run test` (unit tests for new utilities) + `curl` for API endpoints
- **Integration**: Full build + manual walkthrough of all user flows

## Potential Risks & Gotchas

1. **View Transitions API** — not supported in all browsers. Should degrade gracefully (no-op). Add `@supports` check.
2. **Dark mode** — inconsistent colors if not all tokens are mapped. Must audit every `--color-*` usage.
3. **Watermark** — may affect text contrast/readability. Keep opacity below 0.08.
4. **Marquee** — can be distracting. Add `prefers-reduced-motion` media query to pause.
5. **Cache layer** — stale data risk. Keep TTLs short (60s for notices).
6. **PDF generation** — heavy dependency. Consider keeping it simple with HTML→print→save approach.

## Rollback Plan

- Each task is a single commit. Revert individual commits if needed.
- `git stash` before starting, `git stash pop` after each verified sprint.
