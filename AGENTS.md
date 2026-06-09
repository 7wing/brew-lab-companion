# AGENTS.md — Homebrew Haven

This file tells the coding agent how to implement the Homebrew Haven app. Read this fully before touching any code.

---

## Project Overview

Homebrew Haven is a React 18 + Vite + TailwindCSS + shadcn/ui app for tracking home fermentation (beer, kombucha, mead, etc). The frontend prototype already exists. Your job is to wire it up to a real Supabase backend — replacing all mock/static data with live queries, adding auth, file uploads, and real-time features.

---

## Stack (do not deviate)

- **Frontend:** React 18, Vite, TypeScript, TailwindCSS, shadcn/ui
- **Server state:** TanStack React Query v5 — use this for ALL server state, no raw useEffect fetches
- **Forms:** React Hook Form + Zod
- **Backend:** Supabase (Postgres, Auth, Storage, Realtime)
- **Routing:** React Router v6
- **Hosting:** Vercel

---

## Constraints (never violate these)

- Never alter existing project configuration (`vite.config.ts`, `tailwind.config.ts`, `tsconfig.json`) unless explicitly required and noted
- All new code must use TanStack Query v5, React Hook Form + Zod, and Supabase JS v2 patterns
- Do not expose `SUPABASE_SERVICE_ROLE_KEY` to the frontend — ever
- Use existing shadcn/ui components; do not introduce new UI libraries
- Do not modify `.env.local` or commit secrets
- Do not call Supabase directly inside JSX render — always go through hooks
- Do not use `localStorage` or `sessionStorage` for auth state — Supabase handles it

---

## Assumptions

The agent should assume the following before starting:

- The Supabase project has been created and all env vars in `.env.local` are valid
- The human will execute `SUPABASE_STEPS.md` SQL in the Supabase SQL Editor before running the app
- TypeScript database types will be regenerated after schema creation — use a minimal placeholder until then
- `@supabase/supabase-js` is not yet installed and must be added
- All existing UI components and pages exist but use static/mock data — do not rewrite them, only wire them up

---

## Implementation Order

Work in this exact order. Do not skip ahead. Run `npm run build` to verify each phase before moving on.

---

### Phase 1 — Foundation

**Goal:** Install Supabase, create the handoff document, typed client, auth hooks, auth helpers, and protect all routes.

#### Step 0 — Create SUPABASE_STEPS.md (do this before any code)

Create `SUPABASE_STEPS.md` at the project root containing everything the human must do manually in the Supabase dashboard:

- Complete schema SQL for all tables in dependency order (profiles, recipes, batches, readings, batch_stages, posts, post_likes, comments, challenges, challenge_entries, tasting_sessions, tasting_messages, tasting_notes, notifications, yeast_bank)
- All RLS policies for every table
- The `toggle_post_like` Postgres RPC function
- All notification trigger functions (notify_post_like, and any others needed)
- Storage bucket creation instructions: `avatars` (public), `batch-photos` (private), `recipe-images` (public)
- Storage RLS policies for each bucket
- The type generation command: `npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts`
- A checklist of every manual step the human must complete before running the app

This is the human handoff doc — everything that cannot be done in code.

**Verify:** `test -f SUPABASE_STEPS.md`

#### Step 1 — Install Supabase and create typed client

- Install `@supabase/supabase-js`
- Create `src/lib/supabase.ts` with `createClient<Database>` using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Create `src/types/database.ts` with a minimal `Database` interface covering all tables as placeholders, plus a TODO comment with the full type-generation CLI command

**Verify:** `grep -q '@supabase/supabase-js' package.json && test -f src/lib/supabase.ts && test -f src/types/database.ts`

#### Step 2 — Auth hooks and helpers

- Create `src/contexts/AuthContext.tsx` — listens to `supabase.auth.onAuthStateChange`, exposes `session`, `user`, `loading`, `signOut`
- Create `src/lib/auth.ts` — `signUp` (inserts profiles row after auth.signUp), `signIn`, `signOut`, `signInWithGoogle`, `signInWithGitHub`

**Verify:** `test -f src/contexts/AuthContext.tsx && test -f src/lib/auth.ts`

#### Step 3 — Auth UI and route protection

- Create `src/pages/Auth.tsx` — login/register page using `@supabase/auth-ui-react` with Google + GitHub OAuth, styled with existing Tailwind/shadcn tokens
- Create `src/components/ProtectedRoute.tsx` — redirects to `/auth` if not logged in, shows loading state while auth initializes
- Modify `src/App.tsx` — wrap with `AuthProvider`, add `/auth` route, wrap all other routes with `ProtectedRoute`

**Verify:** `test -f src/pages/Auth.tsx && test -f src/components/ProtectedRoute.tsx && grep -q 'ProtectedRoute' src/App.tsx`

#### Step 4 — Build verification

**Verify:** `npm run build`

**Gate:** User can sign up, log in, and reach the app. Unauthenticated users are redirected to `/auth`.

---

### Phase 2 — Core Data (batches + readings)

**Goal:** Replace mock batch and readings data with live Supabase queries.

#### Step 1 — Batch hooks

Create `src/hooks/useBatches.ts`:
- `useBatches()` — fetches active batches for the current user
- `useCreateBatch()` — inserts a new batch, invalidates `['batches']` on success
- `useUpdateBatch()` — updates batch fields
- `useBatch(id)` — fetches a single batch by id

**Verify:** `test -f src/hooks/useBatches.ts`

#### Step 2 — Readings hooks

Create `src/hooks/useReadings.ts`:
- `useReadings(batchId)` — fetches all readings for a batch ordered by `read_at`
- `useCreateReading()` — inserts a reading, invalidates `['readings', batchId]` on success

**Verify:** `test -f src/hooks/useReadings.ts`

#### Step 3 — Wire Index.tsx

Modify `src/pages/Index.tsx`:
- Replace mock `batches` array with `useBatches()` hook
- Show loading skeleton while fetching
- Show empty state when no batches exist
- "Next action" badges computed from `batch_stages` where `completed = false`, ordered by `scheduled`

**Verify:** `grep -q 'useBatches' src/pages/Index.tsx`

#### Step 4 — Wire BrewSetup.tsx

Modify `src/pages/BrewSetup.tsx`:
- Wire wizard final step to `useCreateBatch()` mutation
- On success, navigate to `/batch/:newId`

**Verify:** `grep -q 'useCreateBatch' src/pages/BrewSetup.tsx`

#### Step 5 — Wire FermentationMonitor.tsx

Modify `src/pages/FermentationMonitor.tsx`:
- Replace mock readings with `useReadings(batchId)`
- Wire "Log Reading" button to open a Dialog form with gravity, temperature, pH fields
- Dialog submit calls `useCreateReading()`

**Verify:** `grep -q 'useReadings' src/pages/FermentationMonitor.tsx`

#### Step 6 — Wire GravityCurve.tsx

Modify `src/components/GravityCurve.tsx`:
- Replace static data array with real readings passed as props from `FermentationMonitor`

**Verify:** `npm run build`

**Gate:** Can create a batch, log readings, see the gravity chart update with real data.

---

### Phase 3 — Recipes + Community

**Goal:** Wire recipe vault, community feed, and challenges to real data.

#### Step 1 — Recipe hooks

Create `src/hooks/useRecipes.ts`:
- `useRecipes(filter?, search?)` — fetches recipes, supports type filter and full-text search via `.textSearch('fts', query, { type: 'websearch' })`
- `useCreateRecipe()` — inserts a recipe
- `useUpdateRecipe()` — updates recipe fields including `starred` toggle
- `useDeleteRecipe()` — deletes a recipe

**Verify:** `test -f src/hooks/useRecipes.ts`

#### Step 2 — Post hooks

Create `src/hooks/usePosts.ts`:
- `usePosts()` — fetches posts joined with `profiles`
- `useCreatePost()` — inserts a post
- `useToggleLike(postId)` — calls `supabase.rpc('toggle_post_like', ...)`
- `useComments(postId)` — fetches comments for a post
- `useAddComment()` — inserts a comment

**Verify:** `test -f src/hooks/usePosts.ts`

#### Step 3 — Wire RecipeVault.tsx

Modify `src/pages/RecipeVault.tsx`:
- Replace mock recipes with `useRecipes()` hook
- Wire search input to full-text search
- Wire filter tabs to type filter
- Wire "New Recipe" button to Dialog form + `useCreateRecipe()`
- Wire star icon to `useUpdateRecipe()` toggling `starred`

**Verify:** `grep -q 'useRecipes' src/pages/RecipeVault.tsx`

#### Step 4 — Wire Community.tsx

Modify `src/pages/Community.tsx`:
- Replace mock posts with `usePosts()` hook
- Wire like button to `useToggleLike()`
- Wire comments button to expandable section using `useComments(postId)`
- Wire share button to `navigator.share(...)`

**Verify:** `grep -q 'usePosts' src/pages/Community.tsx`

#### Step 5 — Wire Challenges.tsx

Modify `src/pages/Challenges.tsx`:
- Fetch from `challenges` + `challenge_entries` tables
- Wire Join button to insert into `challenge_entries`
- Show participant count from `challenge_entries`

**Verify:** `grep -q 'challenges' src/pages/Challenges.tsx`

#### Step 6 — Build verification

**Verify:** `npm run build`

**Gate:** Full CRUD on recipes. Can like/comment on community posts.

---

### Phase 4 — Uploads, Realtime, Notifications

**Goal:** File uploads, live chat, real-time notifications, profile page, and search.

#### Step 1 — Upload hook

Create `src/hooks/useUpload.ts`:
- `useUpload(bucket)` — wraps Supabase Storage, returns `{ upload, uploading, error }`
- Compress images before upload using `browser-image-compression` (max 1MB, max 1920px)
- Returns public URL on success

**Verify:** `test -f src/hooks/useUpload.ts`

#### Step 2 — Wire photo uploads

- Modify `src/pages/FermentationMonitor.tsx` — replace camera placeholder with real file input using `useUpload('batch-photos')`, save URL to reading record
- Modify `src/pages/BatchDetail.tsx` — wire all 4 Quick Action buttons: Add Reading (Dialog + `useCreateReading`), Upload Photo (`useUpload`), Tasting Note (insert into `tasting_notes`), Share to Community (insert into `posts`)

**Verify:** `grep -q 'useUpload' src/pages/FermentationMonitor.tsx && grep -q 'useUpload' src/pages/BatchDetail.tsx`

#### Step 3 — Wire Profile.tsx

Modify `src/pages/Profile.tsx`:
- Fetch real profile data from `profiles` table
- Wire avatar upload via `useUpload('avatars')`
- Wire Edit Profile Dialog to update `profiles` table
- Wire Yeast Bank accordion to `yeast_bank` table (fetch, add, delete strains)

**Verify:** `grep -q 'useUpload\|useProfile' src/pages/Profile.tsx`

#### Step 4 — Wire LiveTasting.tsx

Modify `src/pages/LiveTasting.tsx`:
- Fetch initial messages from `tasting_messages` joined with `profiles`
- Subscribe to Supabase Realtime on `tasting_messages` filtered by `session_id`
- Wire send button to insert into `tasting_messages`
- Clean up channel in `useEffect` return

**Verify:** `grep -q 'removeChannel' src/pages/LiveTasting.tsx`

#### Step 5 — Wire AppLayout.tsx

Modify `src/components/AppLayout.tsx`:
- Wire notification bell to query `notifications` table filtered by `user_id` and `is_read = false`
- Add Realtime subscription for new notifications, invalidate query on INSERT
- Wire header search input to navigate to `/search?q=...` on Enter

**Verify:** `grep -q 'notifications' src/components/AppLayout.tsx`

#### Step 6 — Create Search.tsx

Create `src/pages/Search.tsx`:
- Read `q` param from URL
- Full-text search across `recipes` (using `fts` column) and `posts`
- Show results grouped by type

**Verify:** `test -f src/pages/Search.tsx`

#### Step 7 — Mobile checklist

- Search bar: hidden on mobile, show as icon → full-width overlay
- Recipe filter tabs: use a shadcn `Sheet` component on mobile
- Live Tasting chat panel: collapse to bottom drawer using `vaul`
- All Dialogs: add `className="sm:max-w-md max-w-full"` to `DialogContent`
- File inputs: add `capture="environment"` on iOS for direct camera access
- Bottom nav tap targets: minimum 44×44px

#### Step 8 — Final build verification

**Verify:** `npm run build`

**Gate:** Photo uploads work. Live tasting chat updates in real time. Notification bell shows unread count.

---

## Key File Map

| File | Action |
|---|---|
| `SUPABASE_STEPS.md` | Create (Phase 1, Step 0) |
| `src/lib/supabase.ts` | Create |
| `src/lib/auth.ts` | Create |
| `src/contexts/AuthContext.tsx` | Create |
| `src/pages/Auth.tsx` | Create |
| `src/components/ProtectedRoute.tsx` | Create |
| `src/types/database.ts` | Create (placeholder, regenerate after schema) |
| `src/hooks/useBatches.ts` | Create |
| `src/hooks/useReadings.ts` | Create |
| `src/hooks/useRecipes.ts` | Create |
| `src/hooks/usePosts.ts` | Create |
| `src/hooks/useUpload.ts` | Create |
| `src/pages/Index.tsx` | Modify |
| `src/pages/BrewSetup.tsx` | Modify |
| `src/pages/BatchDetail.tsx` | Modify |
| `src/pages/FermentationMonitor.tsx` | Modify |
| `src/pages/RecipeVault.tsx` | Modify |
| `src/pages/Community.tsx` | Modify |
| `src/pages/Challenges.tsx` | Modify |
| `src/pages/LiveTasting.tsx` | Modify |
| `src/pages/Profile.tsx` | Modify |
| `src/pages/Search.tsx` | Create |
| `src/components/AppLayout.tsx` | Modify |
| `src/App.tsx` | Modify |
| `.env.local` | Create (never commit) |
| `vercel.json` | Create |

---

## Database Schema

All tables live in Supabase (PostgreSQL). Full SQL is in `SUPABASE_STEPS.md` (generated in Phase 1, Step 0). Key tables:

- `profiles` — extends `auth.users`, auto-created via trigger on signup
- `recipes` — has `fts` tsvector column for full-text search
- `batches` — tracks active fermentations
- `readings` — gravity/temp/pH logs per batch
- `batch_stages` — timeline milestones per batch
- `posts`, `post_likes`, `comments` — community feed
- `challenges`, `challenge_entries` — community challenges
- `tasting_sessions`, `tasting_messages`, `tasting_notes` — live tasting
- `notifications` — in-app alerts
- `yeast_bank` — per-user yeast strain tracking

RLS is enabled on every table. Users can only read/write their own data. Posts are publicly readable.

---

## Coding Conventions

- All Supabase queries go inside React Query `queryFn` callbacks — never in component bodies directly
- Every mutation must call `queryClient.invalidateQueries(...)` on success to keep UI in sync
- Use `useAuth()` from `AuthContext` to get `user` and `session` — never access `supabase.auth` directly in components
- All forms use React Hook Form + Zod for validation
- File uploads always go through the `useUpload(bucket)` hook — never call `supabase.storage` directly in components
- Realtime subscriptions must be cleaned up in the `useEffect` return: `return () => { supabase.removeChannel(channel) }`
- Never hardcode user IDs — always use `user.id` from `useAuth()`
- Query keys follow the pattern: `['entity']` for lists, `['entity', id]` for single items

---

## Environment Variables

`.env.local` (never commit):

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

---

## Realtime Pattern

```ts
useEffect(() => {
  const channel = supabase
    .channel('unique-channel-name')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'table_name',
      filter: `column=eq.${value}`
    }, (payload) => {
      // handle new row
    })
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}, [dependency])
```

---

## Supabase Query Pattern

```ts
// Read
const { data, error } = await supabase
  .from('table')
  .select('*, related_table(col1, col2)')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })

// Write
const { data, error } = await supabase
  .from('table')
  .insert({ ...fields })
  .select()
  .single()

// Update
await supabase.from('table').update({ field: value }).eq('id', id)

// RPC (stored function)
await supabase.rpc('function_name', { param1: value1 })
```

---

## Deployment

```bash
npm install -g vercel
vercel
```

Add `vercel.json` at the project root:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Vercel dashboard environment variables.

---

## Do Not

- Do not commit `.env.local`
- Do not call Supabase directly inside JSX render — always use hooks/queries
- Do not use `localStorage` or `sessionStorage` for auth state — Supabase handles it
- Do not skip RLS — every table must have row level security enabled before going live
- Do not use the service role key on the frontend — it bypasses RLS entirely
- Do not rewrite existing UI components — only wire them up to real data
- Do not introduce new UI libraries — use existing shadcn/ui components only
- Do not skip the build verification step at the end of each phase
