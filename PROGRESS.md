# Homebrew Haven — PROGRESS.md
> Last updated: June 2026
> Stack: React + Vite + TypeScript + Supabase + TanStack Query + shadcn/ui + Tailwind

---

## SESSION STARTER PROMPT
Paste this at the start of every terminal AI session:

```
Read BLUEPRINT.md and PROGRESS.md before doing anything.

Stack: React (Vite, NOT Next.js), TypeScript, Supabase, TanStack Query v5, shadcn/ui, Tailwind CSS.
App: Homebrew Haven — fermentation batch tracker + social community for home brewers.

Rules for this codebase:
- All Supabase logic lives in src/hooks/ only — never inside components
- No mock data anywhere — Supabase for all persistence
- Strings come from src/constants/copy.js only (once created)
- Max 20 items per fetch, always paginate lists
- Optimistic updates on all toggle actions (likes, follows, stars)
- Use VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (NOT NEXT_PUBLIC_*)
- TypeScript types live in src/types/database.ts (placeholder — needs gen)
- RLS must be enabled on every table before we ship

Do not write any code yet. Read the files and tell me:
1. What phase we are in per MASTER_CHECKLIST.md
2. What you plan to do this session
3. Any risks or gaps you can see
```

---

## CURRENT STATUS: Phase 9 (mid-build, things breaking)

### ✅ DONE
- **Phase 1–2**: Prototyped in Lovable, extracted schema and screens
- **Phase 3**: Design tokens, folder structure, component library (shadcn) all decided
- **Phase 4**: Supabase client set up (`src/lib/supabase.ts`), env vars configured
- **Phase 5**: Full schema defined in `src/types/database.ts` (placeholder types)
- **Phase 6**: Auth fully built — email/password + Google + GitHub, PKCE callback, session persistence, protected routes, redirect after login
- **Phase 7**: RLS — **STATUS UNKNOWN** (see gaps below)
- **Phase 8**: Edge Functions — **NOT DONE** (see gaps below)
- **Phase 9**: All hooks built with real Supabase queries:
  - `useBatches`, `useBatch`, `useCreateBatch`, `useUpdateBatch`
  - `useReadings`, `useCreateReading`
  - `useRecipes`, `useCreateRecipe`, `useUpdateRecipe`, `useDeleteRecipe`
  - `usePosts`, `useCreatePost`, `useToggleLike`, `useComments`, `useAddComment`
  - `useProfile`, `useUpdateProfile`
  - `useFollows` (isFollowing, followerCount, followingCount, followers, following, follow, unfollow)
  - `useFollowedPosts`
  - `useNotifications` (realtime via postgres_changes)
  - `useChallenges`, `useJoinChallenge`
  - `useTastingNotes`, `useTastingMessages`, `useLatestTastingSession`
  - `useYeastBank`, `useAddYeastStrain`, `useDeleteYeastStrain`
  - `useUpload` (image compression via browser-image-compression)
- **Phase 10**: Copy constants — **NOT STARTED** (strings hardcoded in components)
- **Phase 11**: All UI screens built:
  - Brew Bench (Index), Recipe Vault, Community, Profile, BatchDetail, BrewSetup, Search, Auth, AuthCallback, LiveTasting
  - Loading skeletons on all list components ✅
  - Empty states present ✅ (but strings are hardcoded, not from copy.js)
  - Error states: partial
- **Tests**: Unit tests written for useBatches, useFollows, useFollowedPosts, useUpload, auth helpers, Auth page, Profile page

---

## ❌ KNOWN GAPS (fix these in order)

### CRITICAL — likely causing breakage right now
1. **RLS not verified** — unknown if policies exist on all tables. The service role key is referenced in seed scripts but may have been exposed. Run: check every table in Supabase dashboard has RLS enabled.
2. **`src/constants/copy.js` doesn't exist** — all UI strings are hardcoded. Low breakage risk but violates the blueprint.
3. **`useFollowedPosts` has a bug** — called with `{ enabled: isPostTab && isFollowingTab }` option but `useFollowedPosts` doesn't accept options. This will crash the Community page on the Following tab.
4. **`.env.local` not in `.gitignore`** — the `.gitignore` only has `*.local` which covers `.env.local` ✅ (this is fine, verify it)
5. **No `PROGRESS.md` or `BLUEPRINT.md`** existed before this session — AI has been working without session memory.

### HIGH — will break at launch
6. **No Edge Functions** — service role key operations (seeding, admin) are done directly. Payments, emails, and any admin actions need Edge Functions before production.
7. **No rate limiting** on any endpoint.
8. **`src/types/database.ts` is a hand-written placeholder** — needs real generated types: `npx supabase gen types typescript --project-id YOUR_ID > src/types/database.ts`
9. **`src/constants/copy.js` missing** — AI will keep hardcoding strings without it.
10. **No `events` table / analytics** — Phase 13 not started.
11. **Notifications bell in nav has no click handler** — shows badge but clicking does nothing.
12. **`useFollows` FK alias** — uses `profiles!follows_follower_id_fkey` and `profiles!follows_followed_id_fkey`. These aliases must match what Supabase actually named the FK. If they don't match, followers/following lists will fail silently.

### MEDIUM — polish before launch
13. **`toggle_post_like` RPC** — referenced in `usePosts.ts` but must exist as a Postgres function in Supabase.
14. **`handle_new_user` function** — listed in types but not verified it's a trigger on `auth.users`.
15. **`fts` column on `recipes` and `posts`** — `useRecipes` uses `.textSearch('fts', ...)` which requires a generated `tsvector` column. Must exist in schema.
16. **Session starter prompt was missing** — add `BLUEPRINT.md` to the repo root (fill it out).
17. **`src/pages/Community.tsx` — `useFollowedPosts` called incorrectly** (see gap #3 above).

---

## DECISIONS LOG
| Decision | Value |
|---|---|
| Framework | React + Vite (no SSR/SEO needed) |
| Auth | Supabase Auth — email/password + Google + GitHub |
| Component library | shadcn/ui |
| Styling | Tailwind CSS |
| State / data | TanStack Query v5 |
| TypeScript | Yes, strict mode off (`noImplicitAny: false`) |
| Pagination | Max 20 items per fetch |
| File uploads | Supabase Storage — buckets: `avatars`, `batch-photos` |
| Image compression | browser-image-compression (1MB max, 1920px max) |
| Realtime | Supabase postgres_changes — notifications table + tasting_messages |
| Design tokens | copper/teal/gold palette, IBM Plex Sans + Roboto Slab |
| Env var prefix | `VITE_` (not `NEXT_PUBLIC_`) |
| Delete strategy | Hard delete (no soft delete currently) |

---

## WHAT TO DO NEXT (in order)

**Session 1 — Stop the bleeding**
1. Verify RLS is enabled on every table in Supabase dashboard
2. Fix the `useFollowedPosts` bug in `Community.tsx`
3. Verify FK alias names in `useFollows.ts` match actual Supabase schema
4. Run the app, check browser console for errors, fix them

**Session 2 — Schema integrity**
5. Generate real TypeScript types from Supabase
6. Verify `toggle_post_like` RPC exists
7. Verify `fts` tsvector column exists on recipes and posts
8. Verify `handle_new_user` trigger exists on auth.users

**Session 3 — Copy & content**
9. Create `src/constants/copy.js` with all empty states, errors, success messages
10. Replace all hardcoded strings in components

**Session 4 — Wire up notifications**
11. Add click handler to notification bell (mark as read, show dropdown)

**Session 5 — Security**
12. Move any service role operations to Edge Functions
13. Add rate limiting
14. Full security audit per Phase 15 checklist

**Session 6 — Launch prep**
15. Create prod Supabase project
16. Run schema on prod
17. Deploy to Vercel

---

## KNOWN BUGS
- Community page "Following" tab likely crashes (useFollowedPosts called wrong)
- Notification bell click does nothing
- FK alias names on follows table joins unverified — may return empty arrays silently

---

## SUPABASE TABLES (confirmed in schema)
`profiles`, `recipes`, `batches`, `readings`, `batch_stages`, `posts`, `post_likes`, `comments`, `challenges`, `challenge_entries`, `tasting_sessions`, `tasting_messages`, `tasting_notes`, `notifications`, `follows`, `yeast_bank`

## SUPABASE STORAGE BUCKETS
`avatars`, `batch-photos`

## SUPABASE FUNCTIONS (must verify exist)
`toggle_post_like(p_post_id, p_user_id)`, `handle_new_user()`
