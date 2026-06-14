# The Complete Vibecoding Blueprint
> Everything you need to go from idea to a real, working app — in the right order.
> Fill in every blank in Phase 3 before you touch any code.

---

## The Golden Rules

> **If it needs to survive a page refresh → it lives in Supabase, not in state.**
> **Stop making decisions while building. Every decision is made here first.**
> **The quality of your prompts is the quality of your app.**

---

## The Full Build Order (Never Deviate From This)

```
PHASE 1  — Idea & Prototype (Lovable)
PHASE 2  — Extract From Lovable
PHASE 3  — Fill Out This Blueprint (all 21 sections)
PHASE 4  — Environment Setup
PHASE 5  — Database & Schema
PHASE 6  — Auth
PHASE 7  — Permissions (RLS)
PHASE 8  — Edge Functions & Rate Limiting
PHASE 9  — Data Hooks & Optimistic Updates
PHASE 10 — Copy & Content
PHASE 11 — UI Components (v0.dev)
PHASE 12 — Edge Cases, Error States & Offline Handling
PHASE 13 — Analytics
PHASE 14 — Seed Data & Testing
PHASE 15 — Security Audit
PHASE 16 — Deployment
PHASE 17 — Ongoing AI Context Strategy
```

---

## PHASE 1 — IDEA & PROTOTYPE (Lovable)

Use Lovable as your idea and prototype phase only. It is not your production app. It is your thinking tool.

**What to do in Lovable:**
- Build the prototype fast — don't worry about data or logic
- Get every screen looking roughly right
- Validate the idea and the user flow
- Screenshot every single screen before you leave

**What Lovable is NOT for:**
- Real database logic
- Production code
- Anything that needs to persist

**When you leave Lovable you should have:**
- Screenshots of every screen
- A clear sense of what users do in the app
- Nothing else — throw the code away

---

## PHASE 2 — EXTRACT FROM LOVABLE

Take your Lovable screenshots and give them to your AI with this exact prompt:

```
Here are screenshots of my app prototype.
Look at every screen and tell me:
1. What data does this app need?
2. What are the database tables?
3. What are the relationships between them?
4. What actions can users perform on each screen?
5. What needs to persist vs what is just UI state?
6. What roles do users have?
7. What should update in realtime?

Then write me the Supabase SQL schema.
```

---

## PHASE 3 — FILL OUT THIS BLUEPRINT

Answer every section before writing a single line of code. This is your source of truth.

---

### 3.1 App Overview
```
App Name:
What it does (2 sentences max):
Who is it for:
Public (anyone can see) or Private (behind login):
SEO needed (people find it on Google)? → Next.js
Behind login only? → React
Framework decision:
```

---

### 3.2 Auth — Who Are Your Users?
Decisions here affect your entire schema. Make them now.

```
Sign up method: [ ] Email/Password  [ ] Google  [ ] GitHub  [ ] Other
Open sign up or invite only:
Is there a logged-out experience (what can non-users see):
What does a brand new user see first (onboarding flow):
Account deletion — data deletes too or stays anonymously:
Can users change their email: [ ] Yes  [ ] No
Multiple sessions allowed (phone + laptop at same time): [ ] Yes  [ ] No
Password reset flow planned: [ ] Yes  [ ] No
```

---

### 3.3 User Roles
Add this to users table from day one even if you don't use it yet.

```sql
role TEXT DEFAULT 'user' -- values: 'user', 'admin', 'moderator'
```

```
Do you need admin features: [ ] Yes  [ ] No
If yes, what can admin do:
Do you need moderator or other roles:
Admin UI now or use Supabase dashboard to start: [ ] Dashboard for now  [ ] Build UI
```

---

### 3.4 Data — Every "Thing" In Your App
Write every noun in your app. Each noun = a table.

```
Example: Users, Posts, Likes, Comments, Followers, Notifications, Events

Your nouns:


```

Every table always gets these columns — no exceptions:
```sql
id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
created_at  TIMESTAMPTZ DEFAULT NOW(),
updated_at  TIMESTAMPTZ DEFAULT NOW()
```

> Use `TIMESTAMPTZ` not `TIMESTAMP` — stores timezone info. Always.

---

### 3.5 Table Relationships
Write every relationship in plain English.

```
Example:
- Users have many Posts
- Posts have many Likes
- A Like belongs to one User and one Post
- Users can follow other Users (self-referencing)

Your relationships:


```

---

### 3.6 Delete Strategy — Per Table
For every table: hard delete (gone forever) or soft delete (`deleted_at` column, just hidden).
Soft delete is safer — you can recover mistakes.

```
Table → strategy:
Example:
- users → soft delete (deleted_at)
- posts → soft delete (deleted_at)
- likes → hard delete (fine to lose)

Your decisions:


```

---

### 3.7 Indexes — Large Tables
List every table that will grow large (10k+ rows). AI adds indexes so queries stay fast.

```
Large tables and the columns you will query most:
Example:
- posts → user_id, created_at
- likes → post_id, user_id
- events → user_id, event_name

Your large tables:


```

---

### 3.8 Permissions — Who Can Do What?
Write every rule in plain English. AI converts to RLS policies.

```
Example:
- Anyone can read posts (logged in or not)
- A user can only edit their own posts
- Only the post owner can delete their post
- A user can only see their own DMs
- Admins can delete any post

Your rules:


```

---

### 3.9 Screens — Every Page in Your App
List logged-out screens and logged-in screens separately.

```
Logged-out screens:
Example: Landing page, Login, Sign up, Public profile

Your logged-out screens:


Logged-in screens:
Example: Feed, Profile (own), Profile (other user), Single post, Settings, Notifications, Admin panel

Your logged-in screens:


```

---

### 3.10 Screen Components — Break Every Screen Down
For each screen list its parts before building. Do this for every screen.

```
Example — Feed screen:
- FeedHeader (tabs, filter)
- PostCard (image, caption, like button, comment count)
- LikeButton (uses useLikes hook)
- CommentPreview
- InfiniteScroll / LoadMoreButton
- EmptyFeedState
- ErrorState

Your screens and their components:


```

---

### 3.11 Realtime — What Updates Live?
```
Example:
- Likes count → realtime
- Chat messages → realtime
- Notifications → realtime
- Profile bio → NOT realtime

Your realtime decisions:


```

---

### 3.12 File Uploads
```
Do you need file uploads: [ ] Yes  [ ] No

If yes:
[ ] Profile pictures   → bucket: avatars        → public/private:
[ ] Post images        → bucket: post-images     → public/private:
[ ] Videos             → bucket: videos          → public/private:
[ ] Documents          → bucket: documents       → public/private:

Max file size per type:
Allowed file types per bucket (jpg/png/pdf etc):
```

---

### 3.13 Notifications
```
In-app notifications:  [ ] Yes  [ ] No
Email notifications:   [ ] Yes  [ ] No
Push notifications:    [ ] Yes  [ ] No

What triggers a notification:
Example:
- Someone likes your post → notify owner
- Someone follows you → notify you
- Someone comments → notify post owner

Your triggers:


```

---

### 3.14 Third Party Services
Each service affects your schema and Edge Functions. Decide now.

```
[ ] Payments          → Stripe
[ ] Email sending     → Resend / Postmark
[ ] SMS               → Twilio
[ ] Maps              → Google Maps / Mapbox
[ ] AI features       → OpenAI / Anthropic
[ ] Other:

For each service checked: what does it affect in your schema?


```

---

### 3.15 Performance Decisions
Tell your AI these rules upfront. Never change mid-build.

```
Max items fetched at once: 20 (never fetch all rows)
Pagination style: [ ] Infinite scroll  [ ] Page numbers
All images: lazy loaded always
No SELECT * on large tables — fetch only needed columns

Large tables confirmed from 3.7: (copy from above)
```

---

### 3.16 Device & Responsive Strategy
```
[ ] Mobile first
[ ] Desktop first
[ ] Both (responsive from day one)
```

---

### 3.17 Design Tokens — One Source of Truth
Paste this to your AI before every component so everything looks consistent.

```
Primary color:
Secondary color:
Font:
Border radius: [ ] sharp  [ ] rounded  [ ] very rounded
Overall vibe:  [ ] minimal  [ ] bold  [ ] playful  [ ] professional
Component library: [ ] shadcn  [ ] MUI  [ ] Tailwind only
```

---

### 3.18 Folder Structure
Tell your AI this on day one. Never deviate.

```
src/
  components/    → reusable UI only, no data fetching here
  hooks/         → all Supabase logic lives here, one hook per feature
  pages/         → screens and routes
  lib/           → supabase client, analytics, helpers
  types/         → TypeScript types
  constants/     → copy.js, config values, never hardcode strings in components
```

---

### 3.19 TypeScript or JavaScript
```
[ ] TypeScript (safer, catches errors early — recommended)
[ ] Plain JavaScript (faster but messier at scale)
```
Pick one. Never mix. Tell your AI once.

---

### 3.20 Rate Limiting — Per Feature
Without this one person can spam your app and run up your bills.

```
Feature → limit:
Example:
- Sign up         → 5 attempts per IP per hour
- Login           → 10 attempts per IP per hour
- Post creation   → 10 per hour per user
- Like/unlike     → 60 per minute per user (toggling is fine)
- AI feature      → 5 per day per user (always limit these)
- File upload     → 20 per hour per user
- Email sending   → 3 per hour per user

Your decisions:


```

---

### 3.21 Analytics — What to Track
No Google Analytics needed. Just a Supabase `events` table. Free, private, yours.

```
Do you need analytics: [ ] Yes  [ ] No

Key events to track:
Example:
- user_signed_up
- post_created
- post_liked
- profile_viewed
- feature_X_used

Your events:


```

---

### 3.22 Copy & Content — Write Before You Build Any UI
Every empty state, error, success message, and onboarding text decided now.
Your AI uses real copy, never lorem ipsum.

```
Onboarding — what a brand new user sees and reads:


Empty states:
- Empty feed:            ""
- No notifications:      ""
- No followers yet:      ""
- No posts yet:          ""
- Search no results:     ""

Error messages:
- Something went wrong:  ""
- Upload failed:         ""
- Network error:         ""
- Not authorized:        ""
- Rate limit hit:        ""

Success messages:
- Post created:          ""
- Profile updated:       ""
- Password changed:      ""
- File uploaded:         ""
```

---

## PHASE 4 — ENVIRONMENT SETUP

Do this before writing any code.

### Step 1 — Two Supabase Projects
```
myapp-dev   → building and breaking things (use this always during development)
myapp-prod  → real users only, never touch directly during development
```

### Step 2 — Install Supabase
```bash
npm install @supabase/supabase-js
```

### Step 3 — Create `.env.local` immediately
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```
> Service role key → Edge Functions only. Never in any frontend file. Ever.

### Step 4 — Add `.env.local` to `.gitignore` before first commit
```
# .gitignore
.env.local
```

### Step 5 — Create `src/lib/supabase.js` — the very first file
```js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
```

**Never build anything before this file exists.**

---

## PHASE 5 — DATABASE & SCHEMA

Run all SQL in Supabase SQL editor (dev project) before any frontend code.

### AI Prompt — Full Schema:
```
Based on my blueprint, write the complete Supabase SQL schema:
- All tables with correct types
- UUID primary keys on every table
- TIMESTAMPTZ for all timestamps (not TIMESTAMP)
- created_at and updated_at on every table
- role TEXT DEFAULT 'user' on users table
- All foreign key relationships
- Indexes on large tables for frequently queried columns
- soft delete (deleted_at TIMESTAMPTZ) where specified
- events table for analytics

Write it all in one SQL block I can run in the Supabase SQL editor.
Do not skip any table.
```

### Schema Review Checklist (before moving on):
- [ ] Every table has UUID primary key
- [ ] Every table has `created_at TIMESTAMPTZ`
- [ ] Every table has `updated_at TIMESTAMPTZ`
- [ ] `role` column exists on users table
- [ ] All foreign keys set correctly
- [ ] Indexes added on large tables
- [ ] Soft delete columns added where decided
- [ ] `events` table created for analytics
- [ ] SQL runs without errors in Supabase SQL editor

---

## PHASE 6 — AUTH

Set up and manually test every auth flow before building any protected feature.

### Auth Setup AI Prompt:
```
Set up Supabase Auth for my app with:
- Sign up method: [from 3.2]
- Redirect after login to: [screen]
- Redirect after logout to: [screen]
- Protect these routes: [list from 3.9]
- Handle session persistence on refresh
```

### Auth Test Checklist (test every one manually):
- [ ] Sign up works
- [ ] Login works
- [ ] Logout works
- [ ] Password reset email sends and works
- [ ] Session persists on page refresh
- [ ] Logged-out user redirected from protected pages
- [ ] Logged-in user redirected away from login/signup
- [ ] Multiple sessions work (phone + laptop)
- [ ] Account deletion works
- [ ] Email change works

---

## PHASE 7 — PERMISSIONS (RLS)

After schema, before hooks. No exceptions.

### RLS AI Prompt:
```
Write Supabase RLS policies for every table based on these rules:
[paste your rules from 3.8]

Requirements:
- Enable RLS on every single table, no exceptions
- Write SELECT, INSERT, UPDATE, DELETE policies per table
- Admin role (role = 'admin') gets override access where needed
- No table should be left unprotected
```

### RLS Test Checklist:
- [ ] RLS enabled on every table
- [ ] Logged-in user cannot read data they shouldn't
- [ ] Logged-in user cannot edit someone else's data
- [ ] Logged-out user cannot access private data
- [ ] Admin overrides work correctly

---

## PHASE 8 — EDGE FUNCTIONS & RATE LIMITING

Sensitive operations live here, never in the frontend.

**What goes in Edge Functions:**
- Payments and Stripe webhooks
- Sending emails
- Admin actions
- Any operation using the service role key

```
Frontend → calls Edge Function → Edge Function does the sensitive thing
NEVER:    Frontend → does the sensitive thing directly
```

### Rate Limiting AI Prompt:
```
Add rate limiting to [feature] based on these limits from my blueprint:
[paste from 3.20]

- Enforce per user ID for authenticated actions
- Enforce per IP for unauthenticated actions (sign up, login)
- Return a clear error message when limit is hit: "[from 3.22]"
- Never expose rate limit logic in frontend code
```

---

## PHASE 9 — DATA HOOKS & OPTIMISTIC UPDATES

One hook per feature. All Supabase logic lives in hooks, never in components.

### Hook AI Prompt:
```
Write a [useFeatureName] React hook using Supabase that:
- Fetches [what data] with a max of 20 items, paginated
- Handles loading state (isLoading boolean)
- Handles error state (error message)
- Has [list actions] functions
- Uses optimistic updates for [toggle actions like likes, follows, saves]
- Uses realtime subscription if this table needs it
- Never uses mock data or hardcoded values
- All Supabase logic stays inside this hook
```

### Optimistic Updates — Always on Toggle Actions:
```
WITHOUT: User clicks like → waits for Supabase → UI updates  (feels slow, broken)
WITH:    User clicks like → UI updates instantly → Supabase saves in background (feels instant)

Always use optimistic updates for: likes, follows, saves, bookmarks, any on/off toggle
```

---

## PHASE 10 — COPY & CONTENT

Before any UI. Create the constants file first.

### Create `src/constants/copy.js`:
```js
export const COPY = {
  // Empty states
  emptyFeed:         "Nothing here yet. Follow some people to get started.",
  noNotifications:   "You're all caught up!",
  noFollowers:       "No followers yet.",
  noPosts:           "No posts yet.",
  noResults:         "No results found. Try a different search.",

  // Errors
  errorGeneric:      "Something went wrong. Try again.",
  errorUpload:       "Upload failed. Check your file size and try again.",
  errorNetwork:      "Connection lost. Check your internet and retry.",
  errorUnauthorized: "You don't have permission to do that.",
  errorRateLimit:    "Slow down! Try again in a moment.",

  // Success
  successPost:       "Post created!",
  successProfile:    "Profile updated.",
  successPassword:   "Password changed successfully.",
  successUpload:     "Upload complete!",
}
```

Replace all values with your actual copy from 3.22.

Tell your AI: *"always import copy from src/constants/copy.js — never hardcode strings in components"*

---

## PHASE 11 — UI COMPONENTS

Only start after hooks exist. Use v0.dev for design.

### The v0.dev Workflow:
1. Go to v0.dev
2. Describe your component with your design tokens from 3.17
3. Pick the design option you like
4. Copy the code
5. Give to your AI with the integration prompt below

### Component Integration AI Prompt:
```
Here is a component from v0.dev:
[paste component code]

Integrate it with my [hookName] hook:
- Use real data from the hook — no mock data, no hardcoded values
- Loading state → skeleton (not a spinner, not a blank screen)
- Empty state → {COPY.emptyX} from src/constants/copy.js
- Error state → {COPY.errorGeneric} with a retry button
- Match design tokens: [paste from 3.17]
- All Supabase logic stays in the hook, not in this component
```

### Before Building Any Component — Break the Screen Down:
```
List every part of the screen first:
Example — Profile screen:
  - ProfileHeader (avatar, name, bio, follow button)
  - FollowButton (uses useFollow hook, optimistic update)
  - ProfileStats (post count, follower count, following count)
  - ProfilePostsGrid (uses usePosts hook, paginated)
  - EmptyProfileState (if no posts)
  - ErrorState

Build each part separately. Integrate after all parts exist.
```

---

## PHASE 12 — EDGE CASES, ERROR STATES & OFFLINE HANDLING

Do this for every screen before calling a feature done.

### Every Screen Must Handle:
```
[ ] Loading state     → skeleton UI, never a blank screen
[ ] Empty state       → real copy from constants, never "No data"
[ ] Error state       → friendly message from constants + retry button
[ ] Unauthorized      → redirect to login page
[ ] Form validation   → validate before submit, show inline errors
[ ] Network failure   → don't leave user stuck or on blank screen
```

### Offline & Network AI Prompt:
```
Add offline and network error handling to this feature:
- Show an "You're offline" banner when internet is lost
- Disable submit/action buttons while offline
- When a request fails, show COPY.errorNetwork with a retry button
- Never leave the user on a blank or broken screen
- For critical actions, queue them and retry when connection returns
```

### Auth Edge Cases — Test Every One:
```
[ ] User refreshes page mid-session → session should persist
[ ] Session expires while app is open → graceful redirect to login
[ ] User opens app on new device → fresh session, works correctly
[ ] User visits protected page while logged out → redirect to login
[ ] User submits form then session expires → handle gracefully, don't lose data
```

---

## PHASE 13 — ANALYTICS

Add after core app works, before launch.

### The `events` Table (already in schema from Phase 5):
```sql
CREATE TABLE events (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  event_name  TEXT NOT NULL,
  properties  JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### Create `src/lib/analytics.js`:
```js
import { supabase } from './supabase'

export async function track(eventName, properties = {}) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('events').insert({
      user_id: user?.id ?? null,
      event_name: eventName,
      properties,
    })
  } catch {
    // Always fail silently — never let analytics break the app
  }
}
```

### Add `track()` After Every Key Action:
```js
track('user_signed_up')
track('post_created', { post_id: newPost.id })
track('post_liked', { post_id: postId })
track('profile_viewed', { viewed_user_id: userId })
// match your list from 3.21
```

---

## PHASE 14 — SEED DATA & TESTING

Never test with one user. Create realistic fake data first.

### Seed Script AI Prompt:
```
Write a seed script for my dev Supabase project that creates:
- 10 fake users with realistic names, bios, and avatar URLs
- 50 fake posts spread across all users
- Realistic likes and comments between users
- Follow relationships between users
- At least 1 admin user (role = 'admin')

I need to test: feed, notifications, realtime, pagination, and social features.
Insert directly into Supabase using the service role key.
```

### Testing Checklist:
```
[ ] Tested feed with multiple users (not just one)
[ ] Tested pagination (loads more correctly, does not break)
[ ] Tested realtime (open two browser tabs, changes reflect)
[ ] Tested notifications (trigger fires, notification appears)
[ ] Tested file uploads (correct bucket, correct permissions)
[ ] Tested rate limiting (hits limit, shows correct error message)
[ ] Tested all auth flows (sign up, login, logout, reset password)
[ ] Tested as logged-out user (cannot see private data)
[ ] Tested as admin user (admin overrides work)
[ ] Tested on mobile screen size
[ ] Tested offline state (disconnect internet, check behaviour)
```

---

## PHASE 15 — SECURITY AUDIT

Run through this before deployment. No exceptions.

```
[ ] Service role key is not in any frontend file
[ ] Service role key is not in any git commit history
[ ] .env.local is in .gitignore
[ ] RLS is enabled on every single table
[ ] Test: logged-out user cannot access private data via API
[ ] Test: user cannot read or edit another user's private data
[ ] Rate limiting is working on all vulnerable features
[ ] File uploads: type and size validated server-side, not just frontend
[ ] All sensitive operations are in Edge Functions, not frontend
[ ] No console.log statements exposing sensitive data in production
```

---

## PHASE 16 — DEPLOYMENT

### Pre-Deployment Checklist:
```
[ ] Switch all environment variables to prod Supabase project
[ ] Set all environment variables in Vercel/Netlify dashboard
[ ] Re-run all SQL on prod Supabase project (schema, RLS, indexes)
[ ] RLS confirmed enabled on every table in prod
[ ] Auth flows tested on prod (not just dev)
[ ] File uploads tested on prod
[ ] Rate limiting tested on prod
[ ] Error monitoring set up (Sentry — free tier is enough to start)
[ ] Supabase backups: free tier is manual only → upgrade to pro ($25/mo) if needed
[ ] Custom domain configured (if applicable)
```

### Hosting:
```
Next.js → Vercel (easiest, free tier is generous)
React   → Netlify (great for pure React apps)
```

### Supabase Free Tier Limits — Know These Before Launch:
```
Database storage:        500MB
File storage:            1GB
Monthly active users:    50,000
Realtime connections:    200 concurrent
Edge Function calls:     500,000 per month
Backups:                 Manual only (upgrade to pro for daily automatic)
```

> If your app has video or heavy images → plan for storage costs before launch.

---

## PHASE 17 — ONGOING AI CONTEXT STRATEGY

The reason vibecoding gets exhausting is context loss. The AI forgets everything between sessions. Fix it with two files you keep open always.

### File 1: This BLUEPRINT.md
Your app's source of truth. Every decision lives here.

### File 2: PROGRESS.md
Create this alongside blueprint. Update it every single session.

```markdown
# PROGRESS.md

## Done ✅
- Supabase client setup
- Auth (email + Google)
- Users table + RLS
- usePosts hook

## In Progress 🔧
- Likes feature (count works, realtime broken)

## Not Started ⏳
- Comments
- Notifications
- Profile editing
- Analytics tracking calls

## Known Bugs 🐛
- Profile image not updating after upload
- Feed pagination not triggering correctly

## Decisions Made
- Using infinite scroll (not page numbers)
- Soft delete on posts and comments
- shadcn for components
```

### Session Starter Prompt — Paste This Every Time You Open Your Editor:
```
Read BLUEPRINT.md and PROGRESS.md before we do anything.

My stack: [your framework] + Supabase + [TypeScript or JS] + Tailwind + [component library]

Rules for this session:
- No mock data ever. Supabase for all persistence.
- Never use useState for data that needs to survive a refresh.
- All Supabase logic lives in hooks, never in components.
- Always handle loading, empty, and error states on every screen.
- Use optimistic updates for all toggle actions (likes, follows, saves).
- Never fetch more than 20 items at once. Always paginate.
- All strings and copy come from src/constants/copy.js only.
- Folder structure is fixed: components / hooks / pages / lib / types / constants.
- [TypeScript or JS] only — never mix.
```

### When Something Works — Document It:
```
Tell your AI: "Update PROGRESS.md — mark [feature] as done. Note any decisions made."
```

### When You Find a Bug:
```
Tell your AI: "Add this to PROGRESS.md known bugs: [describe bug and where it is]"
```

---

## THE PROMPT RULES — Save These Forever

| ❌ Vague Prompt | ✅ Specific Prompt |
|---|---|
| "add the like button" | "add a LikeButton to PostCard using useLikes hook. Filled heart if liked, outline if not. Optimistic update. Show count next to icon. On error show COPY.errorGeneric" |
| "fix the profile page" | "profile image not updating after upload. Bug is in ProfilePage.jsx in handleUpload. Here is the error: [paste error]" |
| "make it look better" | "restyle this component to match design tokens: primary #X, font Inter, rounded-xl, minimal, using shadcn Card and Button" |
| "add a database table" | "add comments table: id UUID, post_id FK to posts, user_id FK to users, content TEXT, deleted_at TIMESTAMPTZ, timestamps. RLS: anyone can read, users can only delete their own" |
| "add analytics" | "add track('post_created', { post_id }) call after successful post insert in useCreatePost hook. Import track from src/lib/analytics.js" |
| "handle errors" | "add error handling to this hook: if fetch fails set error to COPY.errorGeneric, show retry button, never leave the screen blank" |

---

*Fill in every blank in Phase 3. Follow the build order. Update PROGRESS.md every session. Trust the process.*
