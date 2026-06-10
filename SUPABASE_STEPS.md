# SUPABASE_STEPS.md — Homebrew Haven

> Complete handoff document. Run all SQL in the Supabase Dashboard → SQL Editor in order.
> Do NOT skip RLS policies — they protect your data.

---

## Pre-flight Checklist

- [ ] Supabase project created and `.env.local` populated
- [ ] All SQL below executed successfully
- [ ] Storage buckets created via Dashboard → Storage
- [ ] Auth → URL Configuration includes site URL + `http://localhost:5173` for dev
- [ ] TypeScript types generated with `npx supabase gen types typescript ...`

---

## 1. Custom Types

```sql
create type ferment_type as enum ('beer', 'kombucha', 'mead', 'cider', 'sourdough', 'ferment');
create type batch_status as enum ('planning', 'active', 'conditioning', 'completed', 'abandoned');
create type post_category as enum ('recipe', 'troubleshooting', 'tasting');
```

---

## 2. Users / Profiles

```sql
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text unique not null,
  display_name text,
  bio          text,
  location     text,
  avatar_url   text,
  created_at   timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are readable"
  on public.profiles for select using (true);

create policy "Users update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on sign-up
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

---

## 3. Recipes

```sql
create table public.recipes (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references public.profiles(id) on delete cascade not null,
  title          text not null,
  type           ferment_type not null,
  description    text,
  abv            numeric(4,1),
  estimated_days int,
  difficulty     int check (difficulty between 1 and 3),
  ingredients    jsonb default '[]',
  steps          jsonb default '[]',
  is_public      boolean default true,
  starred        boolean default false,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- Full-text search column
alter table public.recipes add column fts tsvector
  generated always as (to_tsvector('english', title || ' ' || coalesce(description, ''))) stored;
create index recipes_fts_idx on public.recipes using gin(fts);
create index recipes_user_id_idx on public.recipes(user_id);
create index recipes_type_idx on public.recipes(type);

alter table public.recipes enable row level security;

create policy "Recipes are readable by owner or if public"
  on public.recipes for select using (auth.uid() = user_id or is_public = true);

create policy "Users manage own recipes"
  on public.recipes for all using (auth.uid() = user_id);
```

---

## 4. Batches

```sql
create table public.batches (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.profiles(id) on delete cascade not null,
  recipe_id     uuid references public.recipes(id) on delete set null,
  name          text not null,
  type          ferment_type not null,
  status        batch_status default 'active',
  start_date    date not null default current_date,
  target_days   int not null default 14,
  og            numeric(5,3),
  target_fg     numeric(5,3),
  fermenter     text,
  target_temp_f numeric(4,1),
  notes         text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index batches_user_id_idx on public.batches(user_id);
create index batches_status_idx on public.batches(status);

alter table public.batches enable row level security;

create policy "Users see own batches"
  on public.batches for select using (auth.uid() = user_id);

create policy "Users insert own batches"
  on public.batches for insert with check (auth.uid() = user_id);

create policy "Users update own batches"
  on public.batches for update using (auth.uid() = user_id);

create policy "Users delete own batches"
  on public.batches for delete using (auth.uid() = user_id);
```

---

## 5. Readings

```sql
create table public.readings (
  id        uuid primary key default gen_random_uuid(),
  batch_id  uuid references public.batches(id) on delete cascade not null,
  user_id   uuid references public.profiles(id) on delete cascade not null,
  gravity   numeric(5,3) not null,
  temp_f    numeric(4,1),
  ph        numeric(3,1),
  notes     text,
  photo_url text,
  read_at   timestamptz default now()
);

create index readings_batch_id_idx on public.readings(batch_id);
create index readings_read_at_idx on public.readings(read_at desc);

alter table public.readings enable row level security;

create policy "Users see own readings"
  on public.readings for select using (auth.uid() = user_id);

create policy "Users insert own readings"
  on public.readings for insert with check (auth.uid() = user_id);

create policy "Users update own readings"
  on public.readings for update using (auth.uid() = user_id);

create policy "Users delete own readings"
  on public.readings for delete using (auth.uid() = user_id);
```

---

## 6. Batch Stages

```sql
create table public.batch_stages (
  id          uuid primary key default gen_random_uuid(),
  batch_id    uuid references public.batches(id) on delete cascade not null,
  name        text not null,
  scheduled   date,
  completed   boolean default false,
  notes       text,
  sort_order  int default 0
);

alter table public.batch_stages enable row level security;

create policy "Users see own batch stages"
  on public.batch_stages for select using (
    exists (select 1 from public.batches where id = batch_id and user_id = auth.uid())
  );

create policy "Users manage own batch stages"
  on public.batch_stages for all using (
    exists (select 1 from public.batches where id = batch_id and user_id = auth.uid())
  );
```

---

## 7. Community Posts

```sql
create table public.posts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete cascade not null,
  category    post_category not null,
  title       text not null,
  content     text not null,
  type        ferment_type,
  likes       int default 0,
  created_at  timestamptz default now()
);

alter table public.posts enable row level security;

create policy "Anyone can read posts"
  on public.posts for select using (true);

create policy "Users manage own posts"
  on public.posts for all using (auth.uid() = user_id);

create table public.post_likes (
  post_id  uuid references public.posts(id) on delete cascade,
  user_id  uuid references public.profiles(id) on delete cascade,
  primary key (post_id, user_id)
);

alter table public.post_likes enable row level security;

create policy "Anyone can read post_likes"
  on public.post_likes for select using (true);

create policy "Users manage own likes"
  on public.post_likes for all using (auth.uid() = user_id);

create table public.comments (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid references public.posts(id) on delete cascade not null,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  content     text not null,
  created_at  timestamptz default now()
);

alter table public.comments enable row level security;

create policy "Anyone can read comments"
  on public.comments for select using (true);

create policy "Users manage own comments"
  on public.comments for all using (auth.uid() = user_id);
```

---

## 8. Challenges

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

alter table public.challenges enable row level security;

create policy "Anyone can read challenges"
  on public.challenges for select using (true);

create policy "Only admins write challenges"
  on public.challenges for all using (false);

create table public.challenge_entries (
  challenge_id uuid references public.challenges(id) on delete cascade,
  user_id      uuid references public.profiles(id) on delete cascade,
  batch_id     uuid references public.batches(id) on delete set null,
  joined_at    timestamptz default now(),
  primary key (challenge_id, user_id)
);

alter table public.challenge_entries enable row level security;

create policy "Anyone can read challenge_entries"
  on public.challenge_entries for select using (true);

create policy "Users join challenges"
  on public.challenge_entries for insert with check (auth.uid() = user_id);

create policy "Users manage own entries"
  on public.challenge_entries for delete using (auth.uid() = user_id);
```

---

## 9. Live Tasting

```sql
create table public.tasting_sessions (
  id          uuid primary key default gen_random_uuid(),
  host_id     uuid references public.profiles(id) on delete cascade not null,
  batch_id    uuid references public.batches(id) on delete set null,
  title       text not null,
  is_live     boolean default false,
  started_at  timestamptz,
  ended_at    timestamptz,
  created_at  timestamptz default now()
);

alter table public.tasting_sessions enable row level security;

create policy "Anyone can read tasting_sessions"
  on public.tasting_sessions for select using (true);

create policy "Users manage own sessions"
  on public.tasting_sessions for all using (auth.uid() = host_id);

create table public.tasting_messages (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid references public.tasting_sessions(id) on delete cascade not null,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  message     text not null,
  created_at  timestamptz default now()
);

alter table public.tasting_messages enable row level security;

create policy "Anyone can read tasting_messages"
  on public.tasting_messages for select using (true);

create policy "Users send messages"
  on public.tasting_messages for insert with check (auth.uid() = user_id);

create policy "Users delete own messages"
  on public.tasting_messages for delete using (auth.uid() = user_id);

create table public.tasting_notes (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid references public.tasting_sessions(id) on delete cascade not null,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  aroma       text,
  flavor      text,
  mouthfeel   text,
  overall     text,
  created_at  timestamptz default now()
);

alter table public.tasting_notes enable row level security;

create policy "Anyone can read tasting_notes"
  on public.tasting_notes for select using (true);

create policy "Users manage own tasting_notes"
  on public.tasting_notes for all using (auth.uid() = user_id);
```

---

## 10. Notifications

```sql
create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete cascade not null,
  type        text not null,
  title       text not null,
  body        text,
  link        text,
  is_read     boolean default false,
  created_at  timestamptz default now()
);

create index notifications_user_id_idx on public.notifications(user_id, is_read);

alter table public.notifications enable row level security;

create policy "Users see own notifications"
  on public.notifications for select using (auth.uid() = user_id);

create policy "System inserts notifications"
  on public.notifications for insert with check (true);

create policy "Users update own notifications"
  on public.notifications for update using (auth.uid() = user_id);
```

---

## 11. Yeast Bank

```sql
create table public.yeast_bank (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete cascade not null,
  name        text not null,
  strain_code text,
  notes       text,
  created_at  timestamptz default now()
);

alter table public.yeast_bank enable row level security;

create policy "Users see own yeast_bank"
  on public.yeast_bank for select using (auth.uid() = user_id);

create policy "Users manage own yeast_bank"
  on public.yeast_bank for all using (auth.uid() = user_id);
```

---

## 12. RPC & Trigger Functions

### toggle_post_like

```sql
create or replace function public.toggle_post_like(p_post_id uuid, p_user_id uuid)
returns void as $$
begin
  if exists (select 1 from public.post_likes where post_id = p_post_id and user_id = p_user_id) then
    delete from public.post_likes where post_id = p_post_id and user_id = p_user_id;
    update public.posts set likes = likes - 1 where id = p_post_id;
  else
    insert into public.post_likes (post_id, user_id) values (p_post_id, p_user_id);
    update public.posts set likes = likes + 1 where id = p_post_id;
  end if;
end;
$$ language plpgsql security definer;
```

### notify_post_like

```sql
create or replace function public.notify_post_like()
returns trigger as $$
declare
  post_author uuid;
  liker_name  text;
begin
  select user_id into post_author from public.posts where id = new.post_id;
  select username into liker_name from public.profiles where id = new.user_id;

  if post_author != new.user_id then
    insert into public.notifications (user_id, type, title, body, link)
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
  after insert on public.post_likes
  for each row execute procedure public.notify_post_like();
```

### notify_comment

```sql
create or replace function public.notify_comment()
returns trigger as $$
declare
  post_author uuid;
  commenter   text;
begin
  select user_id into post_author from public.posts where id = new.post_id;
  select username into commenter from public.profiles where id = new.user_id;

  if post_author != new.user_id then
    insert into public.notifications (user_id, type, title, body, link)
    values (
      post_author,
      'comment',
      commenter || ' commented on your post',
      new.content,
      '/community'
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_comment_insert
  after insert on public.comments
  for each row execute procedure public.notify_comment();
```

### notify_challenge_join

```sql
create or replace function public.notify_challenge_join()
returns trigger as $$
begin
  -- Optional: notify challenge host or participants
  return new;
end;
$$ language plpgsql security definer;
```

---

## 13. Storage Buckets

### Create via Dashboard → Storage → New Bucket

| Bucket Name    | Public? | Purpose                  |
|----------------|---------|--------------------------|
| `avatars`      | Yes     | Profile photos           |
| `batch-photos` | No      | Fermentation photos      |
| `recipe-images`| Yes     | Recipe cover photos      |

### Storage RLS Policies

```sql
-- avatars
create policy "Avatar images are publicly accessible"
  on storage.objects for select using (bucket_id = 'avatars');

create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- batch-photos
create policy "Users can read own batch photos"
  on storage.objects for select
  using (
    bucket_id = 'batch-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can upload batch photos"
  on storage.objects for insert
  with check (
    bucket_id = 'batch-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- recipe-images
create policy "Recipe images are publicly accessible"
  on storage.objects for select using (bucket_id = 'recipe-images');

create policy "Users can upload recipe images"
  on storage.objects for insert
  with check (
    bucket_id = 'recipe-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## 14. Type Generation

After all SQL executes successfully, generate TypeScript types:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

Replace `YOUR_PROJECT_ID` with the project ID from your Supabase dashboard URL (e.g., `zvdkwjexmseczzpqkwyb`).

---

## 15. Post-Setup Checklist

- [ ] All SQL above ran without errors
- [ ] `profiles` table shows rows when a new user signs up
- [ ] Storage buckets `avatars`, `batch-photos`, `recipe-images` exist
- [ ] Auth → Providers → Google and GitHub are configured (optional but recommended)
- [ ] Auth → URL Configuration includes your production domain + `http://localhost:5173`
- [ ] Auth → URL Configuration also includes `/auth/callback` variants (e.g. `http://localhost:5173/auth/callback` and `https://your-domain.com/auth/callback`)
- [ ] Email templates (Confirmation, Magic Link, Recovery) redirect to `/auth/callback` instead of the root URL
- [ ] `src/types/database.ts` has been regenerated
- [ ] `npm run build` passes in the project
