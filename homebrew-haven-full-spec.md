# Homebrew Haven — Complete Product Specification

---

## Table of Contents
1. App Overview
2. Public vs Private Access
3. Landing Page
4. Navigation
5. Onboarding Flow
6. Brew Bench
7. Recipes Page
8. Recipe Detail Page
9. Community Page
10. Profile Page
11. Profile Settings Page
12. Admin Panel
13. User Roles & Permissions
14. Stepped Submissions & Composers
15. User Content Management (Edit & Delete)

---

## 1. App Overview

Homebrew Haven is a mobile-first brewing companion for homebrewers. It helps brewers track their batches across the full brew lifecycle, discover and share recipes, connect with a community of fellow brewers, and access brewing tools — all in one place.

**Core pages:**
- Brew Bench — operational mission control for active batches
- Recipes — browse, discover, and share recipes
- Community — social feed, troubleshooting, tastings, challenges
- Profile — personal brewing history, saved content, settings

**The brew lifecycle every batch moves through:**
```
Recipe → Brew day → Active fermentation → Conditioning → Packaging → Batch shelf
```

---

## 2. Public vs Private Access

Everything in the app is behind login. There are no public-facing app pages. Anonymous users only see the landing page.

**Why:** Community posts, recipes, and brewer profiles are created by members of a trusted community. Exposing that content to anonymous strangers without those users' knowledge is a violation of trust. The app is a community you join, not a public forum you browse.

**Public (no login):**
```
Landing page only
```

**Behind login (everything else):**
```
Brew Bench
Recipes
Recipe detail
Community
Profile
Profile settings
Admin panel (admin/moderator roles only)
```

When a logged-out user tries to access any app URL directly they are redirected to the landing page with a login/signup prompt.

---

## 3. Landing Page

The only public-facing page. Its sole job is to convince a stranger to sign up.

### Layout (Mobile + Desktop)

```
[ Nav: Homebrew Haven logo ————————— Log in | Sign up ]
────────────────────────────────────────────────────────
[ Hero ]
  Headline — "The brewing companion for serious homebrewers"
  Subheadline — short description of what the app does
  [ Sign up free ] [ See how it works ]

[ Feature highlights ]
  Screenshots or illustrations of:
  - Brew Bench — track your batches
  - Recipes — discover and share recipes
  - Community — connect with brewers

[ How it works ]
  Step 1 — Create your account
  Step 2 — Log your first batch
  Step 3 — Join the community

[ Testimonials ]
  From real brewers once available

[ Final CTA ]
  [ Sign up free ]

[ Footer ]
  About · Contact · Privacy Policy · Terms of Service
```

**Important:** No real user data, posts, or recipes are shown on the landing page. All visuals are screenshots or illustrations of the app interface.

---

## 4. Navigation

### Mobile Navigation

**Top bar (visible on all pages):**
```
[ Homebrew Haven logo ] ————————— [ ☰ Batches* ] [ 🔔 ]
```
*The ☰ Batches icon is contextual — it only appears when the user is on the Brew Bench tab.

**Bottom tab bar (persistent across all pages):**
```
[ 🍺 Brew Bench ] [ 📖 Recipes ] [ 👥 Community ] [ 👤 Profile ]
```

### Desktop Navigation

**Top nav bar (visible on all pages):**
```
[ Homebrew Haven logo ] [ Brew Bench | Recipes | Community | Profile ] ————— [ 🔔 ] [ Avatar ]
```

The profile avatar shows the user's initials. Clicking it opens a dropdown with links to Profile and Settings and a Log out option.

---

## 5. Onboarding Flow

Triggered immediately after a new user signs up. 4 steps, skippable at any point. Personalises the experience before the user reaches the Brew Bench.

### Step 1 — What you brew
```
Welcome to Homebrew Haven 🍺
What do you like to brew? (select all that apply)

[ Beer ] [ Cider ] [ Mead ] [ Kombucha ] [ Wine ] [ Sourdough ]

[ Continue ] [ Skip for now ]
```
Used to personalise recipe suggestions and community content.

### Step 2 — Experience level
```
How long have you been brewing?

[ Just starting out ]
[ 1–2 years ]
[ 3–5 years ]
[ 5+ years ]

[ Continue ] [ Skip for now ]
```
Used to set default recipe difficulty and surface relevant onboarding tips.

### Step 3 — Log your first batch (optional)
```
Do you have something brewing right now?

[ Yes, let's log it → ] [ Not yet, I'll look around first ]
```
If yes — goes directly into the New Brew stepped form.
If no — goes to the Brew Bench with a friendly empty state and a prompt to start a new brew.

### Step 4 — Follow some brewers
```
Here are some brewers you might like

[ avatar ] hoppy_brewer — IPA specialist ———— [ Follow ]
[ avatar ] meadmaker_mike — Mead expert ———— [ Follow ]
[ avatar ] sourdough_sam — Fermentation nerd — [ Follow ]

[ Go to Brew Bench ] [ Skip for now ]
```
Suggestions are seeded based on brew types selected in Step 1. Gets the Following feed populated immediately so Community does not feel empty on day one.

---

## 6. Brew Bench

The mission control page. Shows all in-progress batches across every lifecycle stage, upcoming actions, and recent readings. First page the user lands on after login.

### Mobile Layout
```
[ Top nav: Logo ————————————————— ☰  🔔 ]

[ Upcoming actions strip ]
  "Dry hop — Batch #001 — Today"
  "Cold crash — Batch #002 — Tomorrow"
  "Bottle — Batch #003 — Friday"

─────────────────────────────────────────
Brew day
[ Batch card ]

─────────────────────────────────────────
Active fermentation
[ Card 1 ][ Card 2 → swipe ]
View all active fermentations (4) →

─────────────────────────────────────────
Conditioning
[ Batch card ]

─────────────────────────────────────────
Packaging
[ Batch card ]

─────────────────────────────────────────
[ Recent readings ]
  Jun 14 · 1.065 · 68°F · 5.2pH · Batch #001 — IPA
  Jun 13 · 1.048 · 66°F · — · Batch #002 — Cider
  Jun 12 · 1.010 · 64°F · 5.0pH · Batch #003 — Stout

─────────────────────────────────────────
[ FAB — fixed bottom right, above bottom tab bar ]

[ Bottom tab bar: Brew Bench | Recipes | Community | Profile ]
```

### Desktop Layout
```
[ Top nav ]
────────────────────────────────────────────────────────────────
[ Batch sidebar          ] [ Main area                ] [ Right panel          ]
  Always visible            Brew day section            Upcoming actions
  Grouped by lifecycle      Active fermentation         Recent readings
  stage                     Conditioning                FAB bottom right
                            Packaging
────────────────────────────────────────────────────────────────
```

---

### Batch List Drawer (Mobile) / Sidebar (Desktop)

**Mobile trigger:** Tap ☰ in top nav — only visible on Brew Bench tab. Slides in from the left.
**Desktop:** Always visible as a fixed left sidebar. No trigger needed.

**Content — grouped by lifecycle stage, empty stages hidden:**
```
Batches
─────────────────────────────
Brew day (1)
  > Batch #004 — Stout

Fermenting (2)
  > Batch #001 — IPA         ← currently focused (highlighted)
  > Batch #002 — Cider

Conditioning (1)
  > Batch #003 — Mead

Packaging (1)
  > Batch #005 — Saison

Batch shelf (2)
  > Batch #006 — Wheat
  > Batch #007 — Porter
─────────────────────────────
```

Tapping any batch navigates to that batch's detail page. The detail page adapts its content based on the batch's current lifecycle stage.

---

### Lifecycle Stage Sections (Main Area)

Each stage has its own section label and card strip. Empty stages are hidden entirely. The Brew Bench shows ALL in-progress stages — not just active fermentation.

**Brew day**
Card shows: batch name, brew type tag, brew day checklist progress

**Active fermentation**
Card shows: batch name, brew type tag, current SG, days elapsed / total days, progress bar
If more than 2 batches in this stage: show 2 cards + "View all active fermentations (X) →"
"View all" opens the batch drawer pre-filtered to the fermenting stage

**Conditioning**
Card shows: batch name, brew type tag, conditioning method, days remaining

**Packaging**
Card shows: batch name, brew type tag, packaging method, estimated completion

**View all (per stage)**
Only appears when a stage has more than 2 batches. Each stage has its own "View all [stage] (X) →" link. Opens the batch drawer filtered to that stage only. Never a global view all.

---

### Upcoming Actions

**Purpose:** Time-sensitive tasks the brewer needs to complete across all batches. The most important information on the page.

**Mobile placement:** Prominent strip at the very top of page content, directly below the top nav bar.
**Desktop placement:** Top of the right panel.

**Content:**
```
Upcoming actions
─────────────────────────────
🔴 Dry hop — Batch #001 — Today (overdue shown first)
🟡 Cold crash — Batch #002 — Tomorrow
🟢 Bottle — Batch #003 — Friday
─────────────────────────────
```
- Sorted by urgency — overdue first, today next, upcoming after
- Actions are auto-generated from the fermentation schedule when a batch is created from a recipe
- Empty state: "No actions due"

**Notification priority levels:**
- 🔴 Overdue batch actions — highest priority
- 🟡 Today's batch actions — medium priority
- 🟢 Upcoming batch actions — standard priority
- All other notifications (likes, follows, comments) — standard priority

---

### Recent Readings

**Purpose:** Quick log of the most recent readings across all batches.

**Mobile placement:** Below all stage card sections.
**Desktop placement:** Below upcoming actions in the right panel.

**Content:**
```
Recent readings
─────────────────────────────────────────────────
Date     SG      °F    pH     Batch
Jun 14   1.065   68    5.2    Batch #001 — IPA
Jun 13   1.048   66    —      Batch #002 — Cider
Jun 12   1.010   64    5.0    Batch #003 — Stout
─────────────────────────────────────────────────
```
- Shows 3–5 most recent readings regardless of batch
- Each reading tagged with which batch it came from
- Most recent SG value highlighted in brand amber
- Gravity displayed in user's preferred unit (SG or Plato) set in preferences
- Empty state: "No readings yet."

---

### Fallback State (Nothing Active)

When a brewer has no in-progress batches the Brew Bench does not sit empty. It shows:

```
[ Upcoming actions — "No actions due" ]

Nothing brewing right now
─────────────────────────────
Recent batches
[ Batch #005 — Saison — completed Jun 1  ]
[ Batch #006 — Wheat  — completed May 12 ]
[ Batch #007 — Porter — completed Apr 3  ]

[ + Start a new brew ]
─────────────────────────────
```
Shows only the 3 most recent completed batches. Not the full batch shelf. Full batch shelf lives on the profile page.

---

### Speed FAB (Floating Action Button)

**Placement:** Fixed bottom right corner on both mobile and desktop. Always visible on the Brew Bench. Sits above the bottom tab bar on mobile.

**Behaviour:**
- Closed state: single round amber button with + icon
- On tap: expands to reveal 3 options in a vertical stack above the button
- + icon rotates to × when expanded
- Tapping outside collapses the FAB
- Tapping any option closes the FAB after opening the relevant tool

**FAB Menu Options:**
```
         [ 🌡 Temp Converter ]
         [ % ABV Calculator  ]
         [ 🍺 New Brew        ]
              [ × ]
```

**1. New Brew**
- Opens the New Brew stepped form (see Section 14)
- Pre-fills batch details if user arrived from a recipe via "Brew this"

**2. ABV Calculator**
- Opens a bottom sheet / modal
- Input: Original Gravity (OG) + Final Gravity (FG)
- Output: ABV calculated and displayed in real time
- Formula: ABV = (OG − FG) × 131.25
- Gravity inputs respect user's preferred unit (SG or Plato)

**3. Temp Converter**
- Opens a bottom sheet / modal
- Two inputs: °F and °C
- Typing in either field updates the other instantly in real time

---

### Batch Detail Page

Reached by tapping any fermentation card OR any batch in the drawer. A separate page from the Brew Bench overview. Content adapts based on the batch's current lifecycle stage.

**All stages show:**
```
[ Batch name — Brew type tag ]
[ Current lifecycle stage indicator ]
[ Link to source recipe (if created from one) ]
[ Move to [next stage] → button at bottom ]
[ ··· Edit batch ] [ 🗑 Delete batch ] ← via options menu top right
```

**Advancing to next stage:**
- Button at the bottom of the batch detail page: "Move to [next stage] →"
- Example: on an active fermentation batch it reads "Move to Conditioning →"
- Tapping shows a confirmation modal:
  ```
  Are you sure you want to move Batch #001 to Conditioning?
  This cannot be undone.
  [ Confirm ] [ Cancel ]
  ```

**Brew day:**
```
[ Brew day checklist — step by step from recipe ]
[ Ingredient list ]
[ Target OG to hit ]
```

**Active fermentation:**
```
[ Gravity curve chart — this batch only ]
[ Full readings log — SG, temp, pH, dates ]
[ + Log a reading button ]
[ Fermentation schedule + upcoming actions ]
[ ⚠ Something's wrong → troubleshooting flow ]
```

**Conditioning:**
```
[ Conditioning method (cold crash, fining agents) ]
[ Temperature target ]
[ Days remaining ]
[ Clarity notes ]
```

**Packaging:**
```
[ Bottling or kegging checklist ]
[ Carbonation targets ]
[ Volume being packaged ]
```

**Batch shelf:**
```
[ Tasting notes ]
[ Star rating ]
[ SRM colour swatch ]
[ Remaining volume ]
[ Packaged date ]
[ Mark as finished button ] ← when all volume is consumed
```

**Mark as finished:**
When a brewer marks a batch as finished it moves from the active batch shelf to a completed section within the Batch shelf tab on the profile. It is never deleted — brewing history is valuable. It is clearly marked as done but always visible and accessible.

---

### What Is NOT on the Brew Bench
- Page title "Brew Bench" — nav active state already communicates this
- "X active batches" subtitle — redundant with stage section labels
- Lab stats — moved to Profile page
- Featured Lab Partner — removed entirely
- Lab Tools in sidebar — moved into FAB
- Gravity curve on overview — moved to batch detail page
- Global "View all batches" link — replaced by per-stage view all links and batch drawer
- "Active fermentations" as the only section — replaced by all lifecycle stages

---

## 7. Recipes Page

A browsing and discovery page. Every user must be logged in to access it.

### Mobile Layout
```
[ Top nav: Logo ————————————————— 🔔 ]

[ Search recipes...  ] [ Filters ▾ ] [ + Share recipe ]

[ All | Curated ]                    [ Sort: Most brewed ▾ ]

─────────────────────────────────────────
Featured
[ Recipe card ][ Recipe card → scroll ]

─────────────────────────────────────────
[ Recipe card (full width) ]
[ Recipe card (full width) ]
[ Recipe card (full width) ]

[ Bottom tab bar ]
```

### Desktop Layout
```
[ Top nav ]
─────────────────────────────────────────────────────────
[ Search recipes...       ] [ Filters ▾ ] [ + Share recipe ]

[ All | Curated ]                          [ Sort: Most brewed ▾ ]

Featured
[ Card ][ Card ][ Card → scroll ]

─────────────────────────────────────────────────────────
[ Card ] [ Card ] [ Card ]
[ Card ] [ Card ] [ Card ]
─────────────────────────────────────────────────────────
```

---

### Search Bar
- Dominant element, spans most of the width
- Searches recipe names, styles, ingredients, brew type
- Scoped to recipes only — not community posts

### Filters Dropdown
- Single "Filters ▾" button beside the search bar
- Opens a dropdown panel with all filter options:
  - Brew type (Beer, Cider, Mead, Kombucha, Wine, Sourdough)
  - Style (IPA, Stout, Saison, Lager, Wheat, Sour etc.)
  - Difficulty (Beginner / Intermediate / Advanced)
  - Batch size (1 gal / 5 gal / 10 gal)
  - Fermentation time
  - ABV range
- When filters are active: button shows "Filters (2)" with a count badge
- Filters persist across All / Curated toggle switches

### All / Curated Toggle
- Sits below the search bar, left-aligned
- All — shows everything including community submissions
- Curated — shows hand-picked and verified recipes only

### Sort Dropdown
- Sits below the search bar, right-aligned, beside the toggle
- Options: Most brewed · Highest rated · Newest · Quickest
- Default: Most brewed

### Featured Strip
- Always visible regardless of toggle state
- Sits above the main recipe grid
- Horizontal scroll strip of hand-picked recipe cards
- Three types of featured: staff picks, seasonally relevant, lab partner sponsored
- Each card carries a "Featured" badge

### Share Recipe Button
- Outlined button (not filled) beside the search bar
- Visible to logged-in users only
- Always visible regardless of toggle state
- Opens the Share Recipe stepped form (see Section 14)
- Submissions always go to the community pool and go through moderation

### Recipe Card

**Mobile (condensed):**
```
[ Style tag ] [ ★ Save ]
Recipe name
ABV · SRM colour swatch · ⭐ 4.2
```

**Desktop (full):**
```
[ Style tag ] [ ★ Save ]
Recipe name
Submitted by @username · avatar  OR  ✓ Curated badge
ABV · IBU · SRM colour swatch · Difficulty · Brew time · ⭐ 4.2
```

### Star Rating on Recipe Cards
- Calculated only from brewers who completed a batch from this recipe
- After a batch is completed the app prompts: "How did this recipe turn out? ⭐"
- Rating is submitted from the batch completion prompt, not from the recipe page
- This prevents random ratings from users who never brewed the recipe
- Shows as an average star rating on the recipe card

### Recipe Forking
- If a brewer made significant changes to a recipe they can fork it into a new recipe
- Fork button available from within their brew log post or batch record
- Forked recipe credits the original: "Based on @username's IPA"
- Forked recipe goes through the same moderation flow as a new submission

---

## 8. Recipe Detail Page

Pure data. No social layer. No community section. No hero photo. One job — give a brewer everything they need to decide if they want to brew this recipe.

### Mobile Layout
```
[ ← Back ]          [ Share 🔗 ] [ ★ Save ] [ ··· ]

Recipe name
[ Style tag ] [ Curated badge OR submitted by @username · avatar ]
[ ABV ] [ IBU ] [ SRM swatch ] [ Difficulty ] [ Batch size ] [ Brew time ]

[ Brew this ↗ ] ← primary button, prominent

─────────────────────────────────────────
Ingredients
  Malts
  — 10lb Pale Malt
  — 1lb Crystal 60

  Hops
  — 1oz Citra @ 60 min
  — 0.5oz Mosaic @ 5 min

  Yeast
  — Wyeast 1056 American Ale, pitch at 65°F

  Water additions (optional)

  Adjuncts (optional)

─────────────────────────────────────────
Brew day instructions
  1. Heat 7 gallons of water to 154°F
  2. Mash for 60 minutes
  3. Sparge with 170°F water
  4. Boil for 60 minutes
  ...

─────────────────────────────────────────
Fermentation schedule
  Day 0  — Pitch yeast at 65°F
  Day 3  — Check gravity
  Day 5  — Dry hop
  Day 10 — Cold crash
  Day 14 — Package

─────────────────────────────────────────
Target numbers
  OG: 1.065 · FG: 1.010 · ABV: 7.2% · IBU: 45 · SRM: 8

─────────────────────────────────────────
[ Brew this ↗ ] ← repeated at bottom
```

The ··· options menu (top right) on own submitted recipes shows:
```
[ Edit recipe ]
[ Delete recipe ]
```
On other people's recipes the ··· shows:
```
[ Report recipe ]
[ Fork recipe ]
```

### Desktop Layout
```
[ ← Back ]
─────────────────────────────────────────────────────────
[ Recipe name                                           ]
[ Style ] [ Curated / @username ] [ Share 🔗 ] [ ★ Save ] [ ··· ] [ Brew this ↗ ]
[ ABV ] [ IBU ] [ SRM ] [ Difficulty ] [ Batch size ] [ Time ]

[ Ingredients (left col) ] [ Brew day instructions (right col) ]

[ Fermentation schedule ]

[ Target numbers ]

[ Brew this ↗ ] ← repeated at bottom
─────────────────────────────────────────────────────────
```

### Key Rules
- No community section on this page
- No brew count
- No hero photo
- No "Discuss this recipe on Community" link — removed to avoid empty dead-end pages
- Share icon shares a link externally (WhatsApp, copy link, social media)
- "Brew this" button creates a new batch on the Brew Bench pre-filled with this recipe's data, ingredients, targets, and fermentation schedule
- Fermentation schedule auto-populates Brew Bench upcoming actions when "Brew this" is tapped

---

## 9. Community Page

The social hub. About brewers talking to each other — not about recipes. Everything is behind login.

### Mobile Layout
```
[ Top nav: Logo ————————————————— 🔔 ]

[ Search community... ]

[ Brew logs | Troubleshooting | Tastings | Challenges ]

[ All | Following ]              [ Sort: Latest ▾ ]

─────────────────────────────────────────
[ Post card ]
[ Post card ]
[ Post card ]

[ FAB — fixed bottom right ✏ ]

[ Bottom tab bar ]
```

### Desktop Layout
```
[ Top nav ]
─────────────────────────────────────────────────────────
[ Search community...                                   ]

[ Brew logs | Troubleshooting | Tastings | Challenges ]

[ All | Following ]                      [ Sort: Latest ▾ ]

─────────────────────────────────────────────────────────
[ Post card ]
[ Post card ]
[ Post card ]
─────────────────────────────────────────────────────────
                              [ FAB — fixed bottom right ✏ ]
```

---

### Search Bar
- Searches community posts, usernames, recipe tags
- Scoped to community only — not recipes
- When arriving via a recipe tag link, search is pre-filled with that recipe tag

### Tabs
Four tabs — each filters the feed by post type:

- **Brew logs** — posts where brewers share results from a completed batch
- **Troubleshooting** — posts where brewers ask for help with a problem
- **Tastings** — posts where brewers share structured tasting notes
- **Challenges** — brew-along events (see Challenges section below)

Note: Live tab removed — to be added in a later phase.

### All / Following Toggle
- All — shows posts from the entire community
- Following — shows posts only from brewers the user follows
- Sits below the tabs, left-aligned

### Sort Dropdown
- Sits below the tabs, right-aligned beside the toggle
- Options: Latest · Most liked · Most commented

### Post Card
```
[ Avatar ] @username · Brew type tag · Time posted
Post title
Post preview text (truncated)
[ Photo thumbnail if attached ]
[ Recipe tag if tagged ]
─────────────────────────────────────────
[ ♡ 12 ] [ 💬 Comments ] [ Share ] [ ··· ]
```

The ··· options menu on own posts shows:
```
[ Edit post ]
[ Delete post ]
```
On other people's posts:
```
[ Report post ]
```

Tapping a post card opens the Post Detail Page.

### Post Detail Page
```
[ ← Back ]                                        [ ··· ]
[ Avatar ] @username · Brew type tag · Time posted
Post title
Full post content
[ Photos — full size ]
[ Recipe tag — tappable, goes to recipe detail ]
─────────────────────────────────────────
[ ♡ 12 Like ] [ Share ]
─────────────────────────────────────────
Comments (8)
[ Avatar ] @commenter — "Great result!"     [ ··· Edit / Delete ]
[ Avatar ] @commenter — "What yeast?"       [ ··· Edit / Delete ]
─────────────────────────────────────────
[ Write a comment...          ] [ Post ]
```

Own comments show Edit and Delete options via ···.
Other people's comments show a Report option via ···.

### Community FAB
- Fixed bottom right, pencil/compose icon ✏
- Single action — opens the post composer
- Detects which tab the user is on and pre-selects that post type in the composer
- If on Brew logs tab → opens Brew log composer
- If on Troubleshooting tab → opens Troubleshooting composer
- If on Tastings tab → opens Tastings composer
- If on Challenges tab → FAB is hidden (challenge participation has its own flow)

---

### Challenges Tab

A dedicated tab for time-bound brew-along events. Structured events, not a free feed.

**Challenges tab layout:**
```
Active challenges
[ July Saison Challenge ————— 14 days left · 42 joined ] [ Join ]
[ Summer Wheat Brew-along ——— 3 days left  · 18 joined ] [ Join ]

─────────────────────────────────────────
Upcoming challenges
[ August Stout Challenge ————— starts in 12 days       ] [ Remind me ]

─────────────────────────────────────────
Past challenges
[ June IPA Challenge ————————— ended · 67 participants ] [ View results ]
```

**Two types of challenges:**
- Official challenges — created by platform admins. Monthly, seasonal, themed.
- Community challenges — created by brewers. Goes through admin moderation before going live. Appears under a "Community challenges" subsection separate from Official challenges.

**Community challenge moderation flow:**
```
Brewer submits challenge (name, description, rules, brew type, dates)
→ Goes into admin moderation queue
→ Moderator approves or rejects with a reason
→ If approved: appears in Challenges tab under Community challenges
→ If rejected: brewer notified with reason
```

**Challenge Detail Page:**
```
[ Challenge name ]
[ Description and rules ]
[ Start date — End date ]
[ X brewers have joined ]
[ Join challenge ] ← if not joined
[ Submit my brew ] ← if joined and challenge active
[ ··· Edit / Delete ] ← only visible to challenge creator

─────────────────────────────────────────
DURING challenge (live submissions feed):
  X people joined · Y have submitted so far

  [ Avatar ] @hoppy_brewer — My Saison attempt — photo — ♡ 4
  [ Avatar ] @cider_sid — First saison ever! — photo — ♡ 2
  [ Avatar ] @kombucha_queen — Belgian Saison — photo — ♡ 7

─────────────────────────────────────────
AFTER challenge ends (leaderboard + full feed):
  Challenge ended · 67 submissions

  Top brews
  🥇 @kombucha_queen — Belgian Saison ————— ⭐ 4.8
  🥈 @hoppy_brewer — My Saison attempt ———— ⭐ 4.5
  🥉 @sourdough_sam — Farmhouse Saison ———— ⭐ 4.3

  [ View all 67 submissions ]
```

**Leaderboard notes:**
- Based on community star ratings of submitted brew logs
- Framed as celebratory not competitive — "Top brews" not "Winners"
- Encourages participation from beginners without feeling intimidating

**Submit my brew:**
- Opens the Brew log post composer pre-tagged to the challenge
- Challenge tag is locked — brewer cannot remove it
- Submission appears in the challenge feed and counts toward the leaderboard

---

### Recipe Tags in Community Posts
- Every post type has an optional recipe tag field
- Tags are never forced — always optional
- Tagging links the post to a recipe in the database
- Tagged posts are discoverable by searching that recipe tag on the Community page
- A brewer with a personal unsubmitted recipe has nothing to tag — they post without a tag

---

## 10. Profile Page

Shows a brewer's identity, brewing history, submitted recipes, and saved content. Two views — own profile and someone else's profile.

**Own profile:** Edit profile button, all content visible including drafts.
**Someone else's profile:** Follow / Unfollow button, public content only.

### Mobile Layout
```
[ Cover photo ]
[ Avatar ]
[ Display name ]
[ @username · Location ]
[ Bio ]
[ Brewing since [year] · Favourite styles: IPA · Saison · Mead ]
[ Edit profile ] ← own profile
[ Follow ] ← someone else's profile

─────────────────────────────────────────
[ Batches ] [ Recipes ] [ Followers ] [ Following ]

─────────────────────────────────────────
[ Brew logs | Recipes | Batch shelf | Yeast bank ]

─────────────────────────────────────────
(Content of selected tab)

─────────────────────────────────────────
Lab stats
[ Total batches ] [ Completed ] [ Avg brew days ] [ Favourite style ]
      24               18            21d               IPA

─────────────────────────────────────────
Awards & badges
[ 🏅 First brew ] [ 🏅 10 batches ] [ 🏅 Challenge winner ]

[ Bottom tab bar ]
```

### Desktop Layout
```
[ Top nav ]
─────────────────────────────────────────────────────────
[ Cover photo (full width)                              ]
[ Avatar · Display name · @username · Location          ]
[ Bio · Brewing since · Favourite styles                ]
[ Edit profile / Follow button                          ]
[ Batches · Recipes · Followers · Following stats bar   ]
─────────────────────────────────────────────────────────
[ Brew logs | Recipes | Batch shelf | Yeast bank tabs   ]
─────────────────────────────────────────────────────────
[ Tab content (left/center)     ] [ Lab stats + Badges (right) ]
─────────────────────────────────────────────────────────
```

---

### Stats Bar
```
[ 24 Batches ] [ 6 Recipes ] [ 47 Followers ] [ 12 Following ]
```
Tapping Followers or Following opens a modal list.

### Followers / Following Modal
```
Followers (47)
─────────────────────────────────────────
[ avatar ] @hoppy_brewer ———————— [ Follow back ]
[ avatar ] @cider_sid ——————————— [ Following   ]
[ avatar ] @sourdough_sam ———————— [ Follow back ]
```
Each person has an inline Follow / Following / Follow back button.

---

### Profile Tabs

**Brew logs tab**
Their community posts — brew logs, tastings, troubleshooting posted publicly.
On own profile each post shows a ··· menu with Edit and Delete options.

**Recipes tab**
Has an internal toggle:
```
[ My recipes | Saved ]
```
- My recipes — recipes they submitted to the community
- Saved — recipes they starred from the Recipes page
- On own profile: also shows draft recipes not yet submitted
- Own submitted recipes show a ··· menu with Edit and Delete options
- Uses the same recipe card design as the Recipes page

**Batch shelf tab**
All completed batches:
```
[ Batch name ] [ Brew type ] [ SRM swatch ] [ Date completed ] [ ⭐ rating ] [ Volume remaining ] [ ··· ]
```
··· menu on each batch shows:
```
[ Edit batch ]
[ Mark as finished ] ← when volume is fully consumed
[ Delete batch ]
```
Marking as finished moves the batch to a Finished subsection within the tab. Never deleted from history.

**Yeast bank tab**
Personal collection of saved and harvested yeast strains:
```
[ Strain name ] [ Source ] [ Generation ] [ Storage date ] [ Viability notes ] [ ··· Edit / Delete ]
```

---

### Lab Stats
```
Lab stats
─────────────────────────────────────────────────────────
Total batches   Completed   Avg brew days   Favourite style
     24              18          21d              IPA
─────────────────────────────────────────────────────────
```

### Awards & Badges
```
Awards & badges
[ 🏅 First brew ] [ 🏅 10 batches ] [ 🏅 5 recipes shared ] [ 🏅 Challenge winner ]
```
Earned automatically by reaching milestones. Displayed publicly on the profile.

### How Brewers Discover Each Other
- Through community posts — tap a username, visit their profile, follow
- Through challenge submissions — tap a participant's name
- Through recipe attribution — "submitted by @username" on recipe cards
- Through followers list of someone already followed
- No dedicated "find people" page at launch — discovery is organic through content

### Messaging
Not available at launch. To be added in a later phase.

---

## 11. Profile Settings Page

A separate page from the profile. Reached by tapping a settings icon on own profile or from the avatar dropdown on desktop. Each section opens its own sub-page.

### Mobile + Desktop Layout
```
[ ← Back · Settings ]

─────────────────────────────────────────
Account
Security
Notifications
Preferences
Privacy
Danger zone
─────────────────────────────────────────
```

---

### Account
```
[ Change profile photo ]
[ Change cover photo   ]
[ Display name         __________ ]
[ @username            __________ ]
[ Location             __________ ]
[ Bio                  __________ ]
[ Brewing since        __________ ]
[ Favourite styles     __________ ]
```

### Security
```
[ Change email ]
[ Change password ]
[ Connected accounts — Google · Apple ]
[ Active sessions ]
[ Two factor authentication ] ← coming later
```

**Active sessions:**
```
Active sessions
─────────────────────────────────────────
iPhone 14 · London, UK · Active now         [ Revoke ]
MacBook Pro · London, UK · 2 hours ago      [ Revoke ]
Chrome · Unknown · 3 days ago               [ Revoke ]
─────────────────────────────────────────
[ Revoke all other sessions ]
```
Shows device type, location, and last active time. "Revoke all other sessions" logs the user out everywhere except the current device.

**Social login — Google and Apple:**
- Supported from day one
- Apple sign-in is required for iOS App Store apps that offer any third party login
- Significantly reduces signup friction on mobile

### Notifications
Each notification type has two separate toggles — In-app and Email:

```
                                    In-app    Email
Someone follows you                  [ ✓ ]    [ ✓ ]
Someone likes your post              [ ✓ ]    [ — ]
Someone comments on your post        [ ✓ ]    [ ✓ ]
Someone tags you in a post           [ ✓ ]    [ ✓ ]
Challenge starting soon              [ ✓ ]    [ ✓ ]
Challenge ending soon                [ ✓ ]    [ — ]
Upcoming batch actions               [ ✓ ]    [ ✓ ]
New recipe from someone you follow   [ ✓ ]    [ — ]
Weekly brewing summary               [ — ]    [ ✓ ]
```

### Preferences
```
Temperature units    [ °F | °C ]
Gravity units        [ SG | Plato ]
Volume units         [ Gallons | Litres ]
Theme                [ Light | Dark | System default ]
```

**Gravity units note:**
- SG (Specific Gravity) is the standard for homebrewers
- Plato is used by professional and advanced homebrewers
- Both are supported
- All gravity data is stored as SG internally and converted to Plato on display if selected
- Affects all gravity readings across the entire app — batch detail, readings log, ABV calculator

### Privacy
```
Profile visibility         [ Public | Private ]
Batch shelf visibility     [ Everyone | Followers only | Only me ]
Yeast bank visibility      [ Everyone | Followers only | Only me ]
```

### Danger Zone
```
[ Export my data ]
[ Delete account ]
```

**Export my data:**
- Downloads all user data in two formats:
  - JSON — complete data export including profile, batches, readings, recipes, posts, saved recipes, yeast bank entries. Machine readable, standard for data portability.
  - CSV — batch history and readings only. Human readable, can be opened in any spreadsheet app.
- Required for GDPR compliance
- User receives a download link via email when the export is ready

**Delete account:**
- Confirmation required — user must type their username to confirm
- Irreversible
- All user data is permanently deleted
- Submitted recipes that are live remain but attribution is changed to "Deleted user"
- Community posts are permanently deleted

---

## 12. Admin Panel

A completely separate interface from the brewer-facing app. Only accessible to accounts with admin or moderator roles. Lives at admin.example.com.

### Admin Panel Layout
```
[ Homebrew Haven Admin · admin.example.com ]
[ Dashboard | Recipes | Posts | Users | Challenges | Featured | Partners | Notifications | Settings ]
```

### Dashboard
```
[ Key metrics — total users, active batches, recipes submitted, posts today ]
[ Pending recipe moderation queue ]
[ Reported posts queue ]
[ Recent signups ]
```

### Recipe Moderation
```
Pending recipes (12)
─────────────────────────────────────────
[ Recipe name ] [ Submitted by ] [ Date ] [ Review ] [ Approve ] [ Reject + reason ]
```
**Moderation flow:**
1. Automated checks run first — flags impossible ABV targets, wildly out-of-range quantities, known toxic ingredients
2. Passes to human review queue
3. Moderator reviews ingredients, quantities, and instructions for safety
4. On approve: recipe goes live in the community pool
5. On reject: moderator writes a reason, user is notified with the reason

### Post Moderation
```
Reported posts
─────────────────────────────────────────
[ Post title ] [ Reported by ] [ Reason ] [ View ] [ Delete ] [ Dismiss ]
```

### User Management
```
[ Search users... ]
─────────────────────────────────────────
[ @username ] [ Email ] [ Joined ] [ Role ] [ Warn ] [ Suspend ] [ Ban ]
```

### Challenges
```
[ + Create official challenge ]
─────────────────────────────────────────
Active
[ Challenge name ] [ Participants ] [ Ends ] [ Edit ] [ End early ]

Community (pending approval)
[ Challenge name ] [ Submitted by ] [ Approve ] [ Reject + reason ]
```

### Featured Recipes
```
[ + Add to featured strip ]
─────────────────────────────────────────
[ Recipe name ] [ Type ] [ Featured since ] [ Remove ]
```
Curate which recipes appear in the featured strip on the Recipes page. Three featured types: staff picks, seasonally relevant, lab partner sponsored.

### Lab Partners
```
[ + Add lab partner ]
─────────────────────────────────────────
[ Partner name ] [ Slot ] [ Active ] [ Edit ] [ Remove ]
```
Manage commercial yeast lab partnership slots and sponsored recipe features.

### Notifications
```
[ Send platform announcement ]
Subject:   __________
Message:   __________
Send to:   [ All users | Specific segment ]
[ Send ]
```

### Settings
```
Recipe moderation mode     [ Manual review | Auto-approve trusted users ]
Maintenance mode           [ Off | On — with custom message ]
Challenge visibility       [ Official only | Community challenges visible ]
```

---

## 13. User Roles & Permissions

### Brewer (standard user)
- Full access to Brew Bench, Recipes, Community, Profile
- Can submit recipes (goes to moderation queue)
- Can post in Community (Brew logs, Troubleshooting, Tastings)
- Can create community challenges (goes to moderation queue)
- Can follow other brewers
- Can join and participate in challenges
- Can star recipes, log batches, log readings
- Can edit and delete own recipes, posts, comments, batches, yeast bank entries
- Cannot access admin panel

### Moderator
- All brewer permissions
- Can approve or reject submitted recipes with a reason
- Can approve or reject community challenges with a reason
- Can delete posts that violate community guidelines
- Can warn or temporarily suspend users
- Cannot permanently ban users
- Cannot manage lab partnerships
- Cannot send platform announcements
- Cannot create official challenges
- Cannot access financial or platform data
- Access to admin.example.com — limited to: recipe moderation, post moderation, challenge moderation, user warnings and suspensions

### Super Admin (platform owner)
- Full access to everything
- Can create and manage official challenges
- Can curate featured recipes
- Can permanently ban users
- Can manage lab partner partnerships
- Can send platform-wide notifications
- Can export platform data
- Can manage moderator accounts and assign roles
- Can toggle maintenance mode
- Full access to admin.example.com — all sections

---

## 14. Stepped Submissions & Composers

### New Brew (Stepped — 4 steps)
Triggered from the FAB on the Brew Bench.

```
Step 1 — Basics
  Batch name (required)
  Brew type — Beer / Cider / Mead / Kombucha / Wine / Sourdough (required)
  Batch size (required)
  Brew date (required, cannot be in the past)

Step 2 — Recipe (optional)
  Link to an existing recipe from the database
  OR skip to enter targets manually

Step 3 — Yeast & targets
  Yeast strain (required)
  Target OG (required, must be greater than target FG)
  Target FG (required)
  Estimated ABV (auto-calculated from OG and FG, editable)

Step 4 — Review & start
  Summary of all entered details
  [ Start brew ] button
  Creates batch on Brew Bench in Brew day stage
```

### Brew This (Pre-filled New Brew)
Triggered from the "Brew this" button on a recipe detail page. Same 4 steps as New Brew but pre-filled with the recipe's data. Brewer confirms and adjusts if needed. Batch is created linked to the source recipe by recipe ID. Fermentation schedule from the recipe auto-populates upcoming actions on the Brew Bench.

### Share Recipe (Stepped — 5 steps)
Triggered from the "+ Share recipe" button on the Recipes page. Logged-in users only. Goes through moderation before going live.

```
Step 1 — Basics
  Recipe name (required)
  Brew type (required)
  Style — IPA, Stout, Saison etc. (required)
  Difficulty — Beginner / Intermediate / Advanced (required)
  Batch size (required)

Step 2 — Ingredients
  Malts / Fermentables (required)
  Hops (required for beer, optional for others)
  Yeast strain (required)
  Water additions (optional)
  Adjuncts — fruit, spices, extras (optional)

Step 3 — Instructions & schedule
  Brew day instructions — numbered steps (required)
  Fermentation schedule — day by day timeline (required)

Step 4 — Target numbers
  OG (required) · FG (required) · ABV (auto-calculated, editable)
  IBU (optional) · SRM (optional)

Step 5 — Review & submit
  Full summary of all entered details
  [ Submit for review ] button
  Goes into moderation queue
  User notified when approved or rejected with reason
```

### Post Composer (Single scrollable screen)
Triggered from the FAB on the Community page. Post type pre-selected based on active tab.

**Brew log composer:**
```
[ Post type: Brew log ]
Title (required) __________
Photos (optional) [ + Add photos ]
Description / what happened (required) __________
Tag a recipe (optional) [ Search recipes... ]
Brew type tag — Beer / Cider / Mead etc. (optional)
Star rating — how did it turn out? ⭐ (optional)
[ Post ]
```

**Troubleshooting composer:**
```
[ Post type: Troubleshooting ]
Title — describe your problem (required) __________
What is happening? (required) __________
Which stage is your batch in? (required)
  [ Brew day | Fermenting | Conditioning | Packaging ]
Current readings (optional)
  SG ______ Temp ______ pH ______
Photos (optional) [ + Add photos ]
Tag a recipe (optional) [ Search recipes... ]
Brew type tag (optional)
[ Post ]
```

**Tastings composer:**
```
[ Post type: Tasting ]
Title (required) __________
Photos (optional) [ + Add photos ]
Appearance (optional) __________
Aroma (optional) __________
Flavour (optional) __________
Mouthfeel (optional) __________
Overall rating ⭐ (required)
Tag a recipe (optional) [ Search recipes... ]
Brew type tag (optional)
[ Post ]
```

**Challenge submission:**
Same as Brew log composer but challenge tag is pre-filled and locked. Brewer cannot remove the challenge tag.

### Quick Actions (Single tap or quick modal)

**Star a recipe** — one tap on the star icon on any recipe card or detail page. Saves to profile under Saved recipes.

**Follow a brewer** — one tap on the Follow button on a profile or in a followers modal.

**Join a challenge** — one tap on the Join button on the challenges tab.

**Log a reading** — quick modal from inside a batch detail page:
```
[ Log a reading ]
Date (auto-filled today, editable)
SG ______ (displayed in user's preferred unit — SG or Plato)
Temp ______ (displayed in user's preferred unit — °F or °C)
pH ______ (optional)
[ Save reading ]
```

---

## 15. User Content Management (Edit & Delete)

Brewers have full control over their own content. Every piece of content they create has edit and delete options accessible via a ··· options menu. The following applies throughout the app:

### Recipes
- Edit: opens the Share Recipe stepped form pre-filled with existing data. Any edits go through moderation again before going live.
- Delete: confirmation modal required. Recipe is permanently removed. Batches created from this recipe retain their data but lose the recipe link.

### Community Posts (Brew logs, Troubleshooting, Tastings)
- Edit: opens the post composer pre-filled with existing content. Edited posts show an "Edited" label with timestamp.
- Delete: confirmation modal required. Post and all its comments are permanently deleted.

### Comments
- Edit: inline edit — comment text becomes an editable field in place. Edited comments show an "Edited" label.
- Delete: confirmation modal required. Comment is permanently deleted.

### Batches
- Edit: opens a batch edit form with all fields editable except brew type.
- Delete: confirmation modal required. Permanently removes the batch and all associated readings. Cannot be undone.
- Mark as finished: moves the batch to a Finished subsection in the Batch shelf tab. Never deleted. Always accessible in history.

### Yeast bank entries
- Edit: inline edit of all fields.
- Delete: confirmation modal required. Permanently removed.

### Challenges (community created)
- Edit: opens the challenge submission form pre-filled. Edits go through moderation again.
- Delete: only before the challenge goes live. Once active a challenge cannot be deleted — only an admin can end it early.

### General rules
- Brewers can only edit and delete their own content — never someone else's
- Deleted content is permanently removed — no soft delete or recovery
- Edited content shows an "Edited" label so the community knows it was changed
- Moderators and admins can delete any content regardless of ownership

