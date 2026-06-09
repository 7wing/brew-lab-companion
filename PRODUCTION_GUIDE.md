# Homebrew Haven — Full-Stack Implementation Guide

> A complete roadmap for turning this React/Vite prototype into a production-ready, fully functional app with authentication, a real database, file uploads, live features, and every button wired up.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Tech Stack Recommendations](#2-tech-stack-recommendations)
3. [Database Design](#3-database-design)
4. [Backend Setup (Supabase)](#4-backend-setup-supabase)
5. [Authentication & User Accounts](#5-authentication--user-accounts)
6. [File Uploads (Photos & Attachments)](#6-file-uploads-photos--attachments)
7. [Wiring Up Every Feature](#7-wiring-up-every-feature)
8. [Real-Time Features](#8-real-time-features)
9. [Notifications](#9-notifications)
10. [Search](#10-search)
11. [Mobile Responsiveness Checklist](#11-mobile-responsiveness-checklist)
12. [Deployment](#12-deployment)
13. [Environment Variables Reference](#13-environment-variables-reference)
14. [Step-by-Step Quickstart](#14-step-by-step-quickstart)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────┐
│                  Frontend                    │
│   React 18 + Vite + TailwindCSS + shadcn/ui │
│   React Query (server state)                 │
│   React Hook Form + Zod (forms)              │
│   React Router v6 (routing)                  │
└────────────────────┬────────────────────────┘
                     │ HTTPS / WebSocket
┌────────────────────▼────────────────────────┐
│               Supabase (BaaS)                │
│  ┌──────────────┐  ┌──────────────────────┐ │
│  │  PostgreSQL  │  │  Auth (JWT + OAuth)  │ │
│  │  (database)  │  │                      │ │
│  └──────────────┘  └──────────────────────┘ │
│  ┌──────────────┐  ┌──────────────────────┐ │
│  │  Storage     │  │  Realtime            │ │
│  │  (S3-like)   │  │  (WebSockets)        │ │
│  └──────────────┘  └──────────────────────┘ │
│  ┌──────────────┐                            │
│  │  Edge Funcs  │  (optional serverless)     │
│  └──────────────┘                            │
└─────────────────────────────────────────────┘
```

**Why Supabase?** It provides Postgres, Auth, Storage, and Realtime in one platform with a generous free tier — ideal for this app's needs (live tasting sessions, file uploads, community posts).

---

## 2. Tech Stack Recommendations

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 + Vite | Already in place |
| Styling | Tailwind + shadcn/ui | Already in place |
| Server state | TanStack React Query v5 | Already in place — wire to Supabase |
| Forms | React Hook Form + Zod | Already in place |
| Database | Supabase (PostgreSQL) | Replace mock data |
| Auth | Supabase Auth | Login, register, OAuth |
| File storage | Supabase Storage | Photos, attachments |
| Realtime | Supabase Realtime | Live tasting chat, live readings |
| Notifications | Supabase + browser Push API | Bell icon alerts |
| Search | Supabase full-text search (pg_trgm) | Recipe/batch search |
| Hosting | Vercel or Netlify | CI/CD from GitHub |
| Email | Supabase built-in + Resend (optional) | Auth emails, alerts |

---

## 3. Database Design

Run these SQL statements in the **Supabase SQL Editor** to create your schema.

### 3.1 Users / Profiles

```sql
-- Extends Supabase's built-in auth.users table
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text unique not null,
  display_name text,
  bio          text,
  location     text,
  avatar_url   text,
  created_at   timestamptz default now()
);

-- Auto-create profile when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 3.2 Recipes

```sql
create type ferment_type as enum ('beer', 'kombucha', 'mead', 'cider', 'sourdough', 'ferment');

create table public.recipes (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.profiles(id) on delete cascade,
  title        text not null,
  type         ferment_type not null,
  description  text,
  abv          numeric(4,1),
  estimated_days int,
  difficulty   int check (difficulty between 1 and 3),
  ingredients  jsonb default '[]',  -- [{ name, amount, unit }]
  steps        jsonb default '[]',  -- [{ order, description }]
  is_public    boolean default true,
  starred      boolean default false,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create index recipes_user_id_idx on public.recipes(user_id);
create index recipes_type_idx on public.recipes(type);
-- Full-text search
alter table public.recipes add column fts tsvector
  generated always as (to_tsvector('english', title || ' ' || coalesce(description, ''))) stored;
create index recipes_fts_idx on public.recipes using gin(fts);
```

### 3.3 Batches (Active Fermentations)

```sql
create type batch_status as enum ('planning', 'active', 'conditioning', 'completed', 'abandoned');

create table public.batches (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references public.profiles(id) on delete cascade,
  recipe_id      uuid references public.recipes(id) on delete set null,
  name           text not null,
  type           ferment_type not null,
  status         batch_status default 'active',
  start_date     date not null default current_date,
  target_days    int not null default 14,
  og             numeric(5,3),  -- original gravity
  target_fg      numeric(5,3),  -- target final gravity
  fermenter      text,
  target_temp_f  numeric(4,1),
  notes          text,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

create index batches_user_id_idx on public.batches(user_id);
create index batches_status_idx on public.batches(status);
```

### 3.4 Fermentation Readings

```sql
create table public.readings (
  id          uuid primary key default gen_random_uuid(),
  batch_id    uuid references public.batches(id) on delete cascade,
  user_id     uuid references public.profiles(id) on delete cascade,
  gravity     numeric(5,3) not null,
  temp_f      numeric(4,1),
  ph          numeric(3,1),
  notes       text,
  photo_url   text,
  read_at     timestamptz default now()
);

create index readings_batch_id_idx on public.readings(batch_id);
create index readings_read_at_idx  on public.readings(read_at desc);
```

### 3.5 Batch Timeline / Stages

```sql
create table public.batch_stages (
  id          uuid primary key default gen_random_uuid(),
  batch_id    uuid references public.batches(id) on delete cascade,
  name        text not null,
  scheduled   date,
  completed   boolean default false,
  notes       text,
  sort_order  int default 0
);
```

### 3.6 Community Posts

```sql
create type post_category as enum ('recipe', 'troubleshooting', 'tasting');

create table public.posts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete cascade,
  category    post_category not null,
  title       text not null,
  content     text not null,
  type        ferment_type,
  likes       int default 0,
  created_at  timestamptz default now()
);

create table public.post_likes (
  post_id  uuid references public.posts(id) on delete cascade,
  user_id  uuid references public.profiles(id) on delete cascade,
  primary key (post_id, user_id)
);

create table public.comments (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid references public.posts(id) on delete cascade,
  user_id     uuid references public.profiles(id) on delete cascade,
  content     text not null,
  created_at  timestamptz default now()
);
```

### 3.7 Challenges

```sql
create table public.challenges (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  type         ferment_type,
  start_date   date,
  end_date     date,
  is_active    boolean default true,
  created_at   timestamptz default now()
);

create table public.challenge_entries (
  challenge_id uuid references public.challenges(id) on delete cascade,
  user_id      uuid references public.profiles(id) on delete cascade,
  batch_id     uuid references public.batches(id) on delete set null,
  joined_at    timestamptz default now(),
  primary key (challenge_id, user_id)
);
```

### 3.8 Live Tasting Sessions

```sql
create table public.tasting_sessions (
  id          uuid primary key default gen_random_uuid(),
  host_id     uuid references public.profiles(id) on delete cascade,
  batch_id    uuid references public.batches(id) on delete set null,
  title       text not null,
  is_live     boolean default false,
  started_at  timestamptz,
  ended_at    timestamptz,
  created_at  timestamptz default now()
);

create table public.tasting_messages (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid references public.tasting_sessions(id) on delete cascade,
  user_id     uuid references public.profiles(id) on delete cascade,
  message     text not null,
  created_at  timestamptz default now()
);

create table public.tasting_notes (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid references public.tasting_sessions(id) on delete cascade,
  user_id     uuid references public.profiles(id) on delete cascade,
  aroma       text,
  flavor      text,
  mouthfeel   text,
  overall     text,
  created_at  timestamptz default now()
);
```

### 3.9 Notifications

```sql
create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete cascade,
  type        text not null,  -- 'like', 'comment', 'challenge', 'reading_due'
  title       text not null,
  body        text,
  link        text,
  is_read     boolean default false,
  created_at  timestamptz default now()
);

create index notifications_user_id_idx on public.notifications(user_id, is_read);
```

### 3.10 Yeast Bank

```sql
create table public.yeast_bank (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete cascade,
  name        text not null,
  strain_code text,
  notes       text,
  created_at  timestamptz default now()
);
```

### 3.11 Row Level Security (RLS)

Enable RLS on every table and add policies so users can only see/edit their own data (plus public content).

```sql
-- Example for batches
alter table public.batches enable row level security;

create policy "Users see own batches"
  on public.batches for select
  using (auth.uid() = user_id);

create policy "Users insert own batches"
  on public.batches for insert
  with check (auth.uid() = user_id);

create policy "Users update own batches"
  on public.batches for update
  using (auth.uid() = user_id);

create policy "Users delete own batches"
  on public.batches for delete
  using (auth.uid() = user_id);

-- Posts are public to read
alter table public.posts enable row level security;

create policy "Anyone can read posts"
  on public.posts for select using (true);

create policy "Users manage own posts"
  on public.posts for all
  using (auth.uid() = user_id);
```

Apply similar patterns for: `recipes`, `readings`, `profiles`, `comments`, `tasting_sessions`, `tasting_messages`, `tasting_notes`, `notifications`, `yeast_bank`.

---

## 4. Backend Setup (Supabase)

### 4.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Note your **Project URL** and **anon public key**
3. Run all SQL from Section 3 in the SQL Editor

### 4.2 Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### 4.3 Create the Client

Create `src/lib/supabase.ts`:

```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 4.4 Generate TypeScript Types

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

This gives you full type safety for all queries.

### 4.5 Wrap React Query with Supabase

Create `src/hooks/useBatches.ts` as an example pattern:

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useBatches() {
  return useQuery({
    queryKey: ['batches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    }
  })
}

export function useCreateBatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (batch: NewBatch) => {
      const { data, error } = await supabase.from('batches').insert(batch).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['batches'] })
  })
}
```

Follow this same pattern for every entity: `recipes`, `readings`, `posts`, `challenges`, etc.

---

## 5. Authentication & User Accounts

### 5.1 Install & Configure Auth UI

```bash
npm install @supabase/auth-ui-react @supabase/auth-ui-shared
```

### 5.2 Create an Auth Page

Create `src/pages/Auth.tsx`:

```tsx
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-panel rounded-2xl p-8 w-full max-w-md">
        <h1 className="font-slab text-2xl font-bold text-center mb-6">Homebrew Haven</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google', 'github']}
          redirectTo={window.location.origin}
        />
      </div>
    </div>
  )
}
```

### 5.3 Create an Auth Context

Create `src/contexts/AuthContext.tsx`:

```tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{
      session,
      user: session?.user ?? null,
      loading,
      signOut: () => supabase.auth.signOut()
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

### 5.4 Protect Routes

Create `src/components/ProtectedRoute.tsx`:

```tsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!user) return <Navigate to="/auth" replace />
  return <>{children}</>
}
```

### 5.5 Update App.tsx

```tsx
// Wrap BrowserRouter with AuthProvider
// Wrap all routes (except /auth) with ProtectedRoute
// Add <Route path="/auth" element={<AuthPage />} />
```

### 5.6 Wire the Profile Page

Replace the static mock data in `Profile.tsx` with real queries:

```ts
const { data: profile } = useQuery({
  queryKey: ['profile', user?.id],
  queryFn: async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*, batches(count), recipes(count)')
      .eq('id', user!.id)
      .single()
    return data
  }
})
```

---

## 6. File Uploads (Photos & Attachments)

### 6.1 Create Storage Buckets in Supabase

In the Supabase Dashboard → Storage → New Bucket:

| Bucket Name | Public? | Purpose |
|---|---|---|
| `avatars` | Yes | Profile photos |
| `batch-photos` | No | Fermentation photos per batch |
| `recipe-images` | Yes | Recipe cover photos |

### 6.2 Set Storage RLS Policies

```sql
-- Allow authenticated users to upload to batch-photos
create policy "Auth users upload batch photos"
on storage.objects for insert
with check (
  bucket_id = 'batch-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to read their own batch photos
create policy "Users read own batch photos"
on storage.objects for select
using (
  bucket_id = 'batch-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);
```

### 6.3 Create a Reusable Upload Hook

Create `src/hooks/useUpload.ts`:

```ts
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function useUpload(bucket: string) {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function upload(file: File, path?: string): Promise<string | null> {
    if (!user) return null
    setUploading(true)
    setError(null)

    const ext = file.name.split('.').pop()
    const filePath = path ?? `${user.id}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert: true })

    setUploading(false)

    if (uploadError) {
      setError(uploadError.message)
      return null
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
    return data.publicUrl
  }

  return { upload, uploading, error }
}
```

### 6.4 Wire the Photo Upload in FermentationMonitor & BatchDetail

Replace the camera placeholder div with:

```tsx
import { useUpload } from '@/hooks/useUpload'

const { upload, uploading } = useUpload('batch-photos')

async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0]
  if (!file) return
  const url = await upload(file, `${batchId}/${Date.now()}.jpg`)
  if (url) {
    // Save url to the reading record
    await supabase.from('readings').update({ photo_url: url }).eq('id', readingId)
    queryClient.invalidateQueries({ queryKey: ['readings', batchId] })
  }
}

// Replace the camera placeholder:
<label className="cursor-pointer w-full h-40 flex flex-col items-center justify-center border-2 border-dashed border-border/60 rounded-lg hover:border-copper/40 transition-colors">
  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
  {uploading ? <Loader2 className="animate-spin" /> : <Camera size={24} />}
  <p className="text-xs mt-2">{uploading ? 'Uploading...' : 'Upload photo or tap to capture'}</p>
</label>
```

### 6.5 Avatar Upload in Profile

```tsx
// In Profile.tsx — replace the static avatar
const { upload, uploading } = useUpload('avatars')

async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0]
  if (!file) return
  const url = await upload(file, `${user.id}/avatar.jpg`)
  if (url) {
    await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id)
    queryClient.invalidateQueries({ queryKey: ['profile'] })
  }
}
```

---

## 7. Wiring Up Every Feature

### 7.1 Brew Bench (Index.tsx) — Active Fermentations

Replace the `batches` mock array:

```ts
const { data: batches, isLoading } = useBatches() // hook from Section 4.5
```

**"Start New Brew" button** — Already routes to `/new-brew`. The form there needs to call `useCreateBatch()` on submit.

**"Dry Hop Tomorrow" / next action badges** — Computed from `batch_stages` table where `completed = false`, ordered by `scheduled` date.

**Gravity curve** — Replace static `data` array in `GravityCurve.tsx` with:

```ts
const { data: readings } = useQuery({
  queryKey: ['readings', batchId],
  queryFn: async () => {
    const { data } = await supabase
      .from('readings')
      .select('gravity, temp_f, read_at')
      .eq('batch_id', batchId)
      .order('read_at')
    return data
  }
})
```

**ReadingsTable** — Replace mock `readings` array with same query above.

### 7.2 Recipe Vault (RecipeVault.tsx)

- Replace `recipes` mock array with `useQuery` → `supabase.from('recipes').select(...)`.
- **Search input** — Wire to Supabase full-text search: `.textSearch('fts', searchTerm)`.
- **Filter tabs** — Add `.eq('type', activeFilter)` to query when not "All".
- **"New Recipe" button** — Open a `Dialog` (shadcn/ui) with a form that calls `useCreateRecipe()` mutation.
- **Star icon** — Toggle `starred` boolean via `supabase.from('recipes').update({ starred: !recipe.starred })`.
- **Recipe cards** — Make them links to a new `/recipes/:id` route with full recipe detail.

### 7.3 New Brew Wizard (BrewSetup.tsx)

The wizard is already 4 steps. Wire each to the real data:

- **Step 1 (Recipe)** — Replace `recipes` array with `useQuery` fetching from `recipes` table.
- **Step 2 (Ingredients)** — Derive from the selected recipe's `ingredients` JSON field. Add a "shopping list" export button.
- **Step 3 (Setup)** — Wire `selectedFermenter` + temperature input to form state.
- **Step 4 (Start)** — On "Start Fermentation", call `useCreateBatch()` with all collected data, then redirect to `/batch/:newId`.

```ts
const createBatch = useCreateBatch()

async function handleStart() {
  const batch = await createBatch.mutateAsync({
    user_id: user!.id,
    recipe_id: selectedRecipeId,
    name: selectedRecipe.name,
    type: selectedRecipe.type,
    start_date: new Date().toISOString().split('T')[0],
    target_days: selectedRecipe.estimated_days,
    target_temp_f: targetTemp,
    fermenter: fermenters[selectedFermenter].name,
  })
  navigate(`/batch/${batch.id}`)
}
```

### 7.4 Fermentation Monitor (FermentationMonitor.tsx)

- Fetch the specific batch + all its readings from Supabase.
- **"Log Reading" button** — Open a Dialog form with gravity, temperature, pH inputs + photo upload. On submit, insert into `readings` table and invalidate the readings query.
- **"Tasting Note" button** — Insert a row into `tasting_notes`.
- **Timeline stages** — Fetch from `batch_stages` for this batch. Checkbox to mark complete updates `completed = true`.

### 7.5 Batch Detail (BatchDetail.tsx)

- Load batch by `id` from URL params.
- All 4 "Quick Action" buttons:
  - **Add Reading** → same Dialog form as Monitor
  - **Upload Photo** → `useUpload` hook
  - **Tasting Note** → insert into `tasting_notes`
  - **Share to Community** → insert into `posts` with `category = 'tasting'` pre-filled

### 7.6 Community (Community.tsx)

- Fetch posts from `posts` table joined with `profiles`.
- **Like button** — Toggle row in `post_likes` table. Increment/decrement `posts.likes` via a Postgres function:

```sql
create or replace function toggle_post_like(p_post_id uuid, p_user_id uuid)
returns void as $$
begin
  if exists (select 1 from post_likes where post_id = p_post_id and user_id = p_user_id) then
    delete from post_likes where post_id = p_post_id and user_id = p_user_id;
    update posts set likes = likes - 1 where id = p_post_id;
  else
    insert into post_likes (post_id, user_id) values (p_post_id, p_user_id);
    update posts set likes = likes + 1 where id = p_post_id;
  end if;
end;
$$ language plpgsql security definer;
```

Call it with: `await supabase.rpc('toggle_post_like', { p_post_id: post.id, p_user_id: user.id })`

- **Comments button** — Open an expandable comments section fetching from `comments` table.
- **Share button** — Native Web Share API: `navigator.share({ title, text, url })`.
- **Pagination** — Use Supabase `.range(offset, offset + pageSize - 1)`.

### 7.7 Challenges (Challenges.tsx)

- Fetch from `challenges` table. Join `challenge_entries` to get participant count.
- **Join Challenge button** (add one) — Insert into `challenge_entries` table.
- Progress bar — Calculate based on `(now - start_date) / (end_date - start_date) * 100`.

### 7.8 Profile (Profile.tsx)

- Fetch profile, batch counts, recipe counts, badges, yeast bank from Supabase.
- **Edit Profile** — Add an edit button that opens a Dialog form. Submit updates `profiles` table.
- **Avatar upload** — As described in Section 6.5.
- **Yeast Bank accordion** — Fetch from `yeast_bank` table. Add/delete strains inline.
- **Badges** — Store in a `badges` JSONB column on `profiles` or a separate `user_badges` table.

### 7.9 Notification Bell

```tsx
// In AppLayout header — replace the static bell
const { data: notifications } = useQuery({
  queryKey: ['notifications'],
  queryFn: async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user!.id)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(20)
    return data
  },
  refetchInterval: 30_000  // poll every 30s (or use Realtime below)
})

const unreadCount = notifications?.length ?? 0
// Show dropdown with notification list on click
// Mark all read: supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id)
```

### 7.10 Header Search

Wire the search input to navigate to a search results route:

```tsx
// In AppLayout
const [query, setQuery] = useState('')
const navigate = useNavigate()

function handleSearch(e: React.KeyboardEvent) {
  if (e.key === 'Enter' && query.trim()) {
    navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }
}
```

Create `src/pages/Search.tsx` that searches recipes and posts using full-text search.

---

## 8. Real-Time Features

### 8.1 Live Tasting Chat

Replace the static message list in `LiveTasting.tsx`:

```ts
// Fetch initial messages
const { data: initialMessages } = useQuery({
  queryKey: ['tasting-messages', sessionId],
  queryFn: async () => {
    const { data } = await supabase
      .from('tasting_messages')
      .select('*, profiles(username, avatar_url)')
      .eq('session_id', sessionId)
      .order('created_at')
    return data
  }
})

// Subscribe to new messages in real time
useEffect(() => {
  const channel = supabase
    .channel(`tasting-${sessionId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'tasting_messages',
      filter: `session_id=eq.${sessionId}`
    }, (payload) => {
      setMessages(prev => [...prev, payload.new as TastingMessage])
    })
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}, [sessionId])

// Send message
async function sendMessage() {
  if (!input.trim()) return
  await supabase.from('tasting_messages').insert({
    session_id: sessionId,
    user_id: user!.id,
    message: input.trim()
  })
  setInput('')
}
```

### 8.2 Live Gravity Readings

Add real-time subscription in `FermentationMonitor.tsx`:

```ts
useEffect(() => {
  const channel = supabase
    .channel(`readings-${batchId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'readings',
      filter: `batch_id=eq.${batchId}`
    }, () => {
      queryClient.invalidateQueries({ queryKey: ['readings', batchId] })
    })
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}, [batchId])
```

---

## 9. Notifications

### 9.1 Trigger Notifications via Database Functions

Create a Postgres function that fires notifications automatically:

```sql
-- Notify when someone likes your post
create or replace function notify_post_like()
returns trigger as $$
declare
  post_author uuid;
  liker_name text;
begin
  select user_id into post_author from posts where id = new.post_id;
  select username into liker_name from profiles where id = new.user_id;

  if post_author != new.user_id then
    insert into notifications (user_id, type, title, body, link)
    values (
      post_author,
      'like',
      liker_name || ' liked your post',
      null,
      '/community'
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_post_like
  after insert on post_likes
  for each row execute procedure notify_post_like();
```

Create similar triggers for: new comments, challenge joins, batch milestone reminders.

### 9.2 Real-Time Notification Badge

Subscribe to the `notifications` table for the current user:

```ts
useEffect(() => {
  if (!user) return
  const channel = supabase
    .channel('notifications')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${user.id}`
    }, () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    })
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}, [user?.id])
```

---

## 10. Search

### 10.1 Full-Text Recipe Search

```ts
const { data: results } = useQuery({
  queryKey: ['search', query],
  queryFn: async () => {
    const { data } = await supabase
      .from('recipes')
      .select('*')
      .textSearch('fts', query, { type: 'websearch' })
      .limit(20)
    return data
  },
  enabled: query.length > 1
})
```

### 10.2 Filter by Type + Keyword

```ts
let q = supabase.from('recipes').select('*')
if (typeFilter !== 'all') q = q.eq('type', typeFilter)
if (search) q = q.ilike('title', `%${search}%`)
const { data } = await q.order('created_at', { ascending: false })
```

---

## 11. Mobile Responsiveness Checklist

The current layout is mostly responsive. These are the remaining gaps to fix:

- [ ] **Search bar in header** — Currently `hidden md:flex`. Add a search icon button on mobile that expands to a full-width search overlay.
- [ ] **Recipe Vault filter tabs** — Add a mobile filter sheet (shadcn/ui `Sheet` component) triggered by the Filter button.
- [ ] **Batch cards** — The horizontal scroll shelf works on mobile. Consider adding touch swipe gestures via `embla-carousel-react` (already installed).
- [ ] **Live Tasting chat** — On mobile, make the chat panel collapse/expand as a bottom drawer using the `vaul` package (already installed).
- [ ] **Gravity chart** — Ensure the recharts `ResponsiveContainer` renders correctly in constrained widths. Test on 320px.
- [ ] **Forms & Dialogs** — All Dialog components should be full-screen on mobile. Add `className="sm:max-w-md max-w-full"` to `DialogContent`.
- [ ] **File input** — On iOS, add `capture="environment"` to `<input type="file" accept="image/*">` to open the camera directly.
- [ ] **Bottom nav** — Currently shows 5 items. Ensure active states update correctly and tap targets are at least 44×44px.
- [ ] **Viewport meta tag** — Already set in `index.html`. Verify `user-scalable=no` is NOT set to preserve accessibility.

---

## 12. Deployment

### 12.1 Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Set environment variables in the Vercel dashboard (see Section 13).

Add `vercel.json` for SPA routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### 12.2 Netlify Alternative

Add `public/_redirects`:

```
/*  /index.html  200
```

### 12.3 Build Script

```bash
npm run build
# Output in /dist — ready to deploy
```

### 12.4 Supabase Production Checklist

- [ ] Enable email confirmation in Auth settings
- [ ] Set allowed redirect URLs (`Site URL` + `Redirect URLs`) in Auth → URL Configuration
- [ ] Turn off "Enable email confirmations" for development; turn it on for production
- [ ] Set up a custom SMTP provider (Resend, SendGrid) for auth emails under Auth → SMTP Settings
- [ ] Review and tighten all RLS policies before going live
- [ ] Set up database backups (available on Pro plan)

---

## 13. Environment Variables Reference

Create `.env.local` in the project root (never commit this file):

```env
# Supabase
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key

# Optional — only needed if using Edge Functions
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Add to `.gitignore`:

```
.env.local
.env.*.local
```

---

## 14. Step-by-Step Quickstart

Follow these steps in order to go from this prototype to a working app:

**Week 1 — Foundation**

1. Create a Supabase project
2. Run all SQL from Section 3 in the SQL Editor
3. Add `.env.local` with your Supabase credentials
4. Install `@supabase/supabase-js` and create `src/lib/supabase.ts`
5. Install `@supabase/auth-ui-react` and build the Auth page
6. Create `AuthContext` and wrap `App.tsx`
7. Add `ProtectedRoute` to all routes except `/auth`
8. **Verify:** You can sign up, log in, and see the app

**Week 2 — Core Data**

9. Create `useBatches`, `useCreateBatch` hooks
10. Replace mock batch data in `Index.tsx` with real queries
11. Wire the New Brew wizard (`BrewSetup.tsx`) to create real batches
12. Create `useReadings`, `useCreateReading` hooks
13. Wire "Log Reading" button to open a form and save to Supabase
14. Replace gravity chart with real readings data
15. **Verify:** You can create a batch, log readings, and see the chart update

**Week 3 — Recipes & Community**

16. Replace mock recipes with Supabase data in `RecipeVault.tsx`
17. Add the New Recipe form/dialog
18. Wire search and filter tabs
19. Replace mock posts in `Community.tsx` with Supabase data
20. Wire like, comment, and share buttons
21. Wire challenges page to real data
22. **Verify:** Full CRUD on recipes; like/comment on community posts

**Week 4 — Uploads, Realtime & Polish**

23. Create Storage buckets in Supabase
24. Build `useUpload` hook and wire photo upload in Monitor/BatchDetail
25. Add avatar upload to Profile
26. Set up Realtime subscription for live tasting chat
27. Set up Realtime subscription for notification bell
28. Add notification triggers in Postgres
29. Fix mobile responsiveness items from Section 11
30. Deploy to Vercel with environment variables set
31. **Verify:** End-to-end on a real mobile device

---

## Quick Reference — Key Files to Create or Modify

| File | Action |
|---|---|
| `src/lib/supabase.ts` | **Create** — Supabase client |
| `src/contexts/AuthContext.tsx` | **Create** — Auth state |
| `src/pages/Auth.tsx` | **Create** — Login/register page |
| `src/components/ProtectedRoute.tsx` | **Create** — Route guard |
| `src/types/database.ts` | **Generate** — Supabase types |
| `src/hooks/useBatches.ts` | **Create** — Batch queries |
| `src/hooks/useReadings.ts` | **Create** — Reading queries |
| `src/hooks/useRecipes.ts` | **Create** — Recipe queries |
| `src/hooks/usePosts.ts` | **Create** — Community queries |
| `src/hooks/useUpload.ts` | **Create** — File upload |
| `src/pages/Index.tsx` | **Modify** — Replace mock data |
| `src/pages/RecipeVault.tsx` | **Modify** — Replace mock data, wire search |
| `src/pages/BrewSetup.tsx` | **Modify** — Wire to createBatch mutation |
| `src/pages/BatchDetail.tsx` | **Modify** — Real data + action buttons |
| `src/pages/FermentationMonitor.tsx` | **Modify** — Real data + upload + realtime |
| `src/pages/Community.tsx` | **Modify** — Real data + like/comment |
| `src/pages/LiveTasting.tsx` | **Modify** — Realtime chat |
| `src/pages/Profile.tsx` | **Modify** — Real profile + avatar upload |
| `src/components/AppLayout.tsx` | **Modify** — Notification bell + real search |
| `src/App.tsx` | **Modify** — Add AuthProvider + Auth route |
| `.env.local` | **Create** — Credentials (do not commit) |

---

*This guide covers everything needed to make Homebrew Haven fully functional. Each section is self-contained — you can implement features independently and incrementally without breaking the existing UI.*
