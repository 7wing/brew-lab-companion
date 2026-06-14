# The Master Vibecoding Checklist
> Every box maps directly to a section in BLUEPRINT.md.
> Work through these in order. An unchecked box = a decision waiting to break your build.

---

## PHASE 1 — IDEA & PROTOTYPE (Lovable)

- [ ] Built prototype in Lovable
- [ ] Validated the idea and the user flow
- [ ] Screenshotted every single screen before leaving
- [ ] Confirmed Lovable code will be thrown away (it is not production)

---

## PHASE 2 — EXTRACT FROM LOVABLE

- [ ] Screenshots given to AI with the extraction prompt
- [ ] AI identified every data table from the screenshots
- [ ] AI identified every user action per screen
- [ ] AI confirmed what needs to persist vs what is UI state only
- [ ] AI identified realtime needs from the screens
- [ ] Draft schema produced from extraction

---

## PHASE 3 — BLUEPRINT FILLED OUT

### 3.1 App Overview
- [ ] App name decided
- [ ] What it does written in 2 sentences max
- [ ] Who it is for defined
- [ ] Public vs private (behind login) decided
- [ ] Framework decided: Next.js (needs SEO) or React (behind login, no SEO needed)

### 3.2 Auth
- [ ] Sign up method decided (Email/Password, Google, GitHub, other)
- [ ] Open sign up vs invite only decided
- [ ] Logged-out experience defined (what non-users can see)
- [ ] Onboarding flow decided (what brand new user sees first)
- [ ] Account deletion behaviour decided (data deletes or stays anonymously)
- [ ] Email change allowed: decided
- [ ] Multiple sessions (phone + laptop): decided
- [ ] Password reset flow planned

### 3.3 User Roles
- [ ] `role TEXT DEFAULT 'user'` column planned on users table
- [ ] Admin features listed (or confirmed not needed yet)
- [ ] Other roles decided (moderator, creator, etc.)
- [ ] Admin UI vs Supabase dashboard decided (use dashboard to start)

### 3.4 Data — Tables
- [ ] Every noun in the app listed (each noun = a table)
- [ ] Every table has `id UUID` planned
- [ ] Every table has `created_at TIMESTAMPTZ` planned
- [ ] Every table has `updated_at TIMESTAMPTZ` planned
- [ ] `TIMESTAMPTZ` confirmed — NOT plain `TIMESTAMP`

### 3.5 Table Relationships
- [ ] Every relationship written out in plain English
- [ ] All one-to-many relationships identified
- [ ] All many-to-many relationships identified
- [ ] Self-referencing relationships identified (e.g. followers)

### 3.6 Delete Strategy
- [ ] Delete strategy decided for every table (hard or soft)
- [ ] `deleted_at TIMESTAMPTZ` column planned for all soft-delete tables

### 3.7 Indexes
- [ ] Every large table (10k+ rows) identified
- [ ] Columns that will be queried most listed per large table
- [ ] AI will add indexes on those columns

### 3.8 Permissions
- [ ] Every permission rule written in plain English
- [ ] Read rules defined per table
- [ ] Write/insert rules defined per table
- [ ] Delete rules defined per table
- [ ] Admin override rules defined

### 3.9 Screens
- [ ] Every logged-out screen listed
- [ ] Every logged-in screen listed
- [ ] Admin panel screens listed (if applicable)

### 3.10 Screen Components
- [ ] Every screen broken into its individual component parts
- [ ] Empty state component identified per screen
- [ ] Error state component identified per screen
- [ ] Loading skeleton identified per screen

### 3.11 Realtime
- [ ] Every table that needs realtime updates identified
- [ ] Every table confirmed as NOT needing realtime

### 3.12 File Uploads
- [ ] File uploads needed: decided
- [ ] Every file type listed (images, videos, documents)
- [ ] Supabase Storage bucket names decided
- [ ] Max file size per type decided
- [ ] Allowed file types per bucket decided (jpg/png/pdf etc.)
- [ ] Public vs private per bucket decided

### 3.13 Notifications
- [ ] In-app notifications: decided
- [ ] Email notifications: decided
- [ ] Push notifications: decided
- [ ] Every trigger that creates a notification listed

### 3.14 Third Party Services
- [ ] Payments (Stripe): decided
- [ ] Email sending (Resend/Postmark): decided
- [ ] SMS (Twilio): decided
- [ ] Maps (Google Maps/Mapbox): decided
- [ ] AI features (OpenAI/Anthropic): decided
- [ ] Schema impact of each service planned

### 3.15 Performance
- [ ] Max 20 items per fetch rule confirmed
- [ ] Pagination style decided (infinite scroll or page numbers)
- [ ] Lazy loading on all images confirmed
- [ ] No `SELECT *` on large tables rule confirmed

### 3.16 Device & Responsive
- [ ] Mobile first / Desktop first / Both decided

### 3.17 Design Tokens
- [ ] Primary color decided
- [ ] Secondary color decided
- [ ] Font decided
- [ ] Border radius style decided
- [ ] Overall visual vibe decided
- [ ] Component library decided (shadcn / MUI / Tailwind only)

### 3.18 Folder Structure
- [ ] `src/components/` — reusable UI only
- [ ] `src/hooks/` — all Supabase logic
- [ ] `src/pages/` — screens and routes
- [ ] `src/lib/` — supabase.js, analytics.js, helpers
- [ ] `src/types/` — TypeScript types
- [ ] `src/constants/` — copy.js and config values
- [ ] AI told this structure on day one

### 3.19 TypeScript
- [ ] TypeScript or plain JavaScript decided
- [ ] Never mixed — AI told once and consistently

### 3.20 Rate Limiting
- [ ] Sign up / login attempt limits decided
- [ ] Form submission limits decided
- [ ] AI feature limits decided (always rate limit these)
- [ ] File upload limits decided
- [ ] Public endpoint limits decided
- [ ] Email sending limits decided

### 3.21 Analytics
- [ ] Analytics needed: decided
- [ ] Every key event to track listed
- [ ] `events` table included in schema plan

### 3.22 Copy & Content
- [ ] Onboarding copy written (what new user sees and reads)
- [ ] Every empty state message written (real copy, not placeholders)
- [ ] Every error message written
- [ ] Every success message written
- [ ] Rate limit error message written
- [ ] Confirmed: no lorem ipsum anywhere in the app

---

## PHASE 4 — ENVIRONMENT SETUP

- [ ] Two Supabase projects created: `myapp-dev` and `myapp-prod`
- [ ] Only `myapp-dev` used during all development
- [ ] `myapp-prod` never touched directly during development
- [ ] `@supabase/supabase-js` installed
- [ ] `.env.local` file created
- [ ] `.env.local` added to `.gitignore` before first commit
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set in `.env.local`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set in `.env.local`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set in `.env.local`
- [ ] `src/lib/supabase.js` created as the very first file
- [ ] Service role key confirmed: not in any frontend file

---

## PHASE 5 — DATABASE & SCHEMA

- [ ] Full schema SQL written before any frontend code
- [ ] SQL run in Supabase SQL editor (dev project only)
- [ ] Every table has UUID primary key
- [ ] Every table has `created_at TIMESTAMPTZ`
- [ ] Every table has `updated_at TIMESTAMPTZ`
- [ ] `role TEXT DEFAULT 'user'` exists on users table
- [ ] All foreign key relationships set correctly
- [ ] Indexes added on all large table columns
- [ ] Soft delete columns (`deleted_at TIMESTAMPTZ`) added where decided
- [ ] `events` table created for analytics
- [ ] SQL runs without errors in Supabase SQL editor
- [ ] No table is missing from the schema

---

## PHASE 6 — AUTH

- [ ] Supabase Auth configured for chosen sign up methods
- [ ] Sign up flow tested manually
- [ ] Login flow tested manually
- [ ] Logout flow tested manually
- [ ] Password reset email sends and works end to end
- [ ] Session persists on page refresh confirmed
- [ ] Logged-out user gets redirected from protected pages
- [ ] Logged-in user gets redirected away from login/signup pages
- [ ] Multiple sessions work correctly (phone + laptop)
- [ ] Account deletion works
- [ ] Email change works

---

## PHASE 7 — PERMISSIONS (RLS)

- [ ] RLS enabled on every single table (no exceptions)
- [ ] SELECT policy written per table
- [ ] INSERT policy written per table
- [ ] UPDATE policy written per table
- [ ] DELETE policy written per table
- [ ] Admin override policies written where needed
- [ ] Tested: logged-in user cannot read data they should not see
- [ ] Tested: logged-in user cannot edit another user's data
- [ ] Tested: logged-out user cannot access any private data
- [ ] Tested: admin overrides work correctly

---

## PHASE 8 — EDGE FUNCTIONS & RATE LIMITING

- [ ] All sensitive operations moved to Edge Functions (payments, emails, admin, service role)
- [ ] Service role key only used inside Edge Functions
- [ ] Rate limiting added to sign up and login
- [ ] Rate limiting added to all form submissions
- [ ] Rate limiting added to all AI features
- [ ] Rate limiting added to file uploads
- [ ] Rate limiting added to all public-facing endpoints
- [ ] Rate limiting added to email sending
- [ ] Rate limit error messages match copy from 3.22
- [ ] Rate limiting tested (confirmed it blocks after the limit)

---

## PHASE 9 — DATA HOOKS & OPTIMISTIC UPDATES

- [ ] One hook created per feature (no logic inside components)
- [ ] All Supabase queries are inside hooks only
- [ ] Every hook handles loading state (`isLoading`)
- [ ] Every hook handles error state (`error`)
- [ ] Pagination implemented in every hook that fetches lists (max 20 items)
- [ ] Optimistic updates on all like/follow/save/bookmark toggles
- [ ] Realtime subscriptions added to all tables that need it
- [ ] Zero mock data anywhere in the codebase
- [ ] Zero hardcoded values anywhere in hooks

---

## PHASE 10 — COPY & CONTENT

- [ ] `src/constants/copy.js` created before any UI component is built
- [ ] All empty state messages in copy file
- [ ] All error messages in copy file (including rate limit message)
- [ ] All success messages in copy file
- [ ] All onboarding text in copy file
- [ ] AI confirmed: never hardcode strings in components, always import from copy.js

---

## PHASE 11 — UI COMPONENTS

- [ ] No UI component built before its hook exists
- [ ] v0.dev used to generate component designs
- [ ] Every screen broken into parts before building starts
- [ ] Each part built separately, integrated after
- [ ] Design tokens given to AI before every component
- [ ] Every component uses real hook data (no mock data)
- [ ] Every list component has a loading skeleton
- [ ] Every list component has an empty state (from copy.js)
- [ ] Every component that can fail has an error state (from copy.js)
- [ ] Every error state has a retry button

---

## PHASE 12 — EDGE CASES, ERROR STATES & OFFLINE HANDLING

### Every Screen:
- [ ] Loading state: skeleton UI, not blank screen
- [ ] Empty state: real copy from constants, not "No data"
- [ ] Error state: friendly message + retry button
- [ ] Unauthorized: redirects to login
- [ ] Form validation: runs before submit, shows inline errors

### Offline & Network:
- [ ] "You're offline" banner shown when connection lost
- [ ] Action buttons disabled when offline
- [ ] Critical actions queued and retried when connection returns
- [ ] Last cached data shown instead of blank screen
- [ ] No user action leaves a blank or broken screen

### Auth Edge Cases:
- [ ] Page refresh mid-session: session persists correctly
- [ ] Session expires while app open: graceful redirect to login
- [ ] App opened on new device: fresh session works correctly
- [ ] Protected page visited while logged out: redirects to login
- [ ] Form submitted when session just expired: handled gracefully

---

## PHASE 13 — ANALYTICS

- [ ] `events` table confirmed in Supabase (created in Phase 5)
- [ ] `src/lib/analytics.js` created with `track()` function
- [ ] `track()` fails silently — never breaks the app
- [ ] `track()` automatically includes the current user's ID
- [ ] Every key event from 3.21 has a `track()` call in the right place
- [ ] Analytics confirmed: added after core features work, before launch

---

## PHASE 14 — SEED DATA & TESTING

- [ ] 2-3 test accounts created in dev Supabase
- [ ] Seed script run: 10 fake users, 50 fake posts, likes, comments, follows
- [ ] At least 1 admin test account confirmed
- [ ] Feed tested with multiple users
- [ ] Pagination tested (loads more correctly)
- [ ] Realtime tested between two browser tabs
- [ ] Notifications tested (trigger fires, notification appears)
- [ ] File uploads tested (correct bucket, correct permissions)
- [ ] Rate limiting tested (blocks after limit, shows correct message)
- [ ] All auth flows tested
- [ ] Logged-out user tested (cannot see private data via API)
- [ ] Admin user tested (overrides work)
- [ ] Tested on mobile screen size
- [ ] Offline state tested (disconnect internet, check every screen)

---

## PHASE 15 — SECURITY AUDIT

- [ ] Service role key is not in any frontend file
- [ ] Service role key is not in any git commit history
- [ ] `.env.local` is in `.gitignore`
- [ ] RLS is enabled on every table — double checked
- [ ] Tested: logged-out user cannot access private data via direct API call
- [ ] Tested: user cannot read or edit another user's private data
- [ ] Rate limiting confirmed working on all vulnerable features
- [ ] File uploads: type and size validated server-side (not just frontend)
- [ ] All sensitive operations confirmed in Edge Functions only
- [ ] No `console.log` exposing sensitive data left in codebase

---

## PHASE 16 — DEPLOYMENT

- [ ] All environment variables switched to prod Supabase project
- [ ] All environment variables added to Vercel/Netlify dashboard
- [ ] Full schema SQL re-run on prod Supabase project
- [ ] RLS confirmed enabled on every prod table
- [ ] Auth flows re-tested on prod
- [ ] File uploads re-tested on prod
- [ ] Rate limiting re-tested on prod
- [ ] Error monitoring set up (Sentry — free tier)
- [ ] Supabase backups confirmed (upgrade to pro if daily backups needed)
- [ ] Custom domain configured if applicable
- [ ] `.env.local` confirmed NOT in git repository

---

## PHASE 17 — ONGOING AI CONTEXT STRATEGY

- [ ] `BLUEPRINT.md` kept up to date as decisions change
- [ ] `PROGRESS.md` created
- [ ] `PROGRESS.md` updated at the end of every single session
- [ ] Every session starts with the full session starter prompt
- [ ] AI told the full stack at the start of every session
- [ ] AI told: no mock data, Supabase for all persistence
- [ ] AI told: optimistic updates on all toggle actions
- [ ] AI told: max 20 items per fetch, always paginate
- [ ] AI told: copy from constants/copy.js only
- [ ] AI told: all Supabase logic in hooks, never in components
- [ ] When a feature is done → PROGRESS.md updated immediately
- [ ] When a bug is found → added to PROGRESS.md known bugs
- [ ] When a decision is made → added to PROGRESS.md decisions

---

*If every box is checked, you built it right. If any box is skipped, that is where the exhaustion comes from.*
