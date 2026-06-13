**Homebrew Haven**

Code Review & Bug Fix Report

Generated: June 12, 2026

**Review Summary**

  ----------------- ----------------- ----------------- -----------------
  **🔴 4 Critical** **🟠 6 High**     **🟡 4 Medium**   **🔵 6 Low**

  ----------------- ----------------- ----------------- -----------------

**Full Issue Index**

All identified issues sorted by severity. Full details and code fixes
follow.

  --------------------------------------------------------------------------------------------
  **\#**   **Severity**   **File**                  **Issue**                       **Type**
  -------- -------------- ------------------------- ------------------------------- ----------
  1        🔴 Critical    BatchDetail.tsx           estAbV typo --- runtime crash   Bug

  2        🔴 Critical    Community.tsx             useFollowedPosts called with    Bug
                                                    wrong arg                       

  3        🔴 Critical    BatchDetail.tsx           Duplicate share flows conflict  Bug

  4        🔴 Critical    useTastingNotes.ts        .single() throws on empty table Bug

  5        🟠 High        useProfile.ts             Wrong invalidation key ---      Bug
                                                    stale cache                     

  6        🟠 High        Index.tsx                 GravityCurve rendered without   Bug
                                                    readings                        

  7        🟠 High        ReadingsTable.tsx         Hardcoded mock data --- never   Bug
                                                    shows real data                 

  8        🟠 High        AppLayout.tsx             Bell button has no action       UX

  9        🟠 High        BatchDetail.tsx           stage.done vs stage.completed   Bug
                                                    field mismatch                  

  10       🟠 High        BatchDetail.tsx           Duplicate Log Reading dialog    Bug
                                                    triggers                        

  11       🟡 Medium      useReadings.ts            Missing read_at default ---     Bug
                                                    sort breaks                     

  12       🟡 Medium      AuthCallback.tsx          3s race condition on slow       Bug
                                                    networks                        

  13       🟡 Medium      Community.tsx             Pagination is fake --- no       UX
                                                    range() applied                 

  14       🟡 Medium      BrewSetup.tsx             Hardcoded                       Data
                                                    ingredients/fermenters          

  15       🟡 Medium      usePosts.ts               toggle_post_like RPC --- no SQL Data
                                                    migration                       

  16       🔵 Low         index.html                Placeholder title/OG meta tags  Polish

  17       🔵 Low         src/App.css               Unused default Vite CSS         Polish

  18       🔵 Low         Community.tsx             addComment declared but unused  Polish
                                                    at page level                   

  19       🔵 Low         FermentationMonitor.tsx   Dead Tasting Note / Upload      UX
                                                    Photo buttons                   

  20       🔵 Low         ThemeToggle.tsx           Conflicts with next-themes ---  Bug
                                                    dual theme systems              
  --------------------------------------------------------------------------------------------

**🔴 Critical Issues**

> **Issue #1 --- \[CRITICAL\] estAbV Typo --- Runtime Crash**
>
> **File:** src/pages/BatchDetail.tsx

**Problem:**

The variable estAbv is defined with a lowercase \"v\" but referenced as
estAbV (capital V).

This causes a ReferenceError at runtime whenever BatchDetail renders,
crashing the entire page.

**Fix:**

***❌ WRONG (line \~130 in the stats array):***

> { label: \"Est. ABV\", value: readingsLoading ? \"\...\" :
> \`\${estAbV}%\` }

***✅ REPLACE WITH:***

> { label: \"Est. ABV\", value: readingsLoading ? \"\...\" :
> \`\${estAbv}%\` }

Simple case-fix. estAbv is defined a few lines above the stats array.

> **Issue #2 --- \[CRITICAL\] useFollowedPosts Called with Wrong
> Argument**
>
> **File:** src/pages/Community.tsx

**Problem:**

useFollowedPosts() accepts no parameters --- it derives its enabled
state from the auth context internally.

Passing { enabled: \... } silently does nothing, so the Following tab
always fetches regardless of whether

it is the active tab, causing unnecessary network requests and potential
data leakage.

**Fix:**

***❌ WRONG:***

> const { data: followedPosts, isLoading: followedPostsLoading } =
>
> useFollowedPosts({ enabled: isPostTab && isFollowingTab });

***✅ REPLACE WITH:***

> const { data: followedPosts, isLoading: followedPostsLoading } =
> useFollowedPosts();

If you need conditional fetching, add an enabled option inside the hook
itself:

***In src/hooks/useFollowedPosts.ts, add a parameter:***

> export function useFollowedPosts(options?: { enabled?: boolean }) {
>
> const { user } = useAuth()
>
> return useQuery({
>
> queryKey: \[\"followedPosts\"\],
>
> queryFn: async () =\> { /\* existing code \*/ },
>
> enabled: (options?.enabled ?? true) && !!user,
>
> })
>
> }

Then the Community.tsx call becomes:

> const { data: followedPosts, isLoading: followedPostsLoading } =
>
> useFollowedPosts({ enabled: isPostTab && isFollowingTab });
>
> **Issue #3 --- \[CRITICAL\] Duplicate Share Flows --- Inline Button
> Fires With Empty State**
>
> **File:** src/pages/BatchDetail.tsx

**Problem:**

There are two conflicting share implementations in BatchDetail:

1\. An inline Share button in the hero section that calls handleShare()
directly (no dialog, empty title/content).

2\. A proper \"Share to Community\" Dialog in the sidebar.

The inline button fires immediately with empty shareTitle and
shareContent, posting a blank community post.

**Fix:**

***❌ WRONG --- hero section share button:***

> \<button
>
> onClick={() =\> handleShare()}
>
> disabled={createPost.isPending}
>
> \>
>
> \<Share2 size={14} /\> Share
>
> \</button\>

***✅ REPLACE WITH --- open the dialog instead:***

> \<button
>
> onClick={() =\> setShareOpen(true)}
>
> className=\"px-3 py-2 rounded-lg border border-border/50 text-sm
>
> hover:bg-muted transition-colors flex items-center gap-2\"
>
> \>
>
> \<Share2 size={14} /\> Share
>
> \</button\>
>
> **Issue #4 --- \[CRITICAL\] .single() Throws on Empty tasting_sessions
> Table**
>
> **File:** src/hooks/useTastingNotes.ts

**Problem:**

useLatestTastingSession() uses .single() which throws a PostgrestError
(PGRST116) when no rows exist.

This means on a fresh account with no tasting sessions, the entire
Community/LiveTasting page crashes.

**Fix:**

***❌ WRONG:***

> const { data, error } = await supabase
>
> .from(\"tasting_sessions\")
>
> .select(\"\*\")
>
> .order(\"created_at\", { ascending: false })
>
> .limit(1)
>
> .single() // \<\-- throws when table is empty
>
> if (error) throw error
>
> return data

***✅ REPLACE WITH:***

> const { data, error } = await supabase
>
> .from(\"tasting_sessions\")
>
> .select(\"\*\")
>
> .order(\"created_at\", { ascending: false })
>
> .limit(1)
>
> .maybeSingle() // \<\-- returns null instead of throwing
>
> if (error) throw error
>
> return data // null when no sessions exist --- LiveTastingPanel
> handles this

**🟠 High Severity Issues**

> **Issue #5 --- \[HIGH\] Wrong Query Invalidation Key --- Stale Profile
> Cache**
>
> **File:** src/hooks/useProfile.ts

**Problem:**

useUpdateProfile invalidates \[\"profile\"\] without the user ID, but
useProfile stores data under

\[\"profile\", user.id\]. The stale query is never busted, so profile
edits appear not to save.

**Fix:**

***❌ WRONG in useUpdateProfile onSuccess:***

> onSuccess: () =\> qc.invalidateQueries({ queryKey: \[\"profile\"\] })

***✅ REPLACE WITH:***

> onSuccess: () =\> {
>
> qc.invalidateQueries({ queryKey: \[\"profile\", user?.id\] })
>
> qc.invalidateQueries({ queryKey: \[\"profile\"\] }) // catches viewed
> profiles too
>
> },
>
> **Issue #6 --- \[HIGH\] GravityCurve Rendered Without Readings ---
> Always Shows \"No readings yet\"**
>
> **File:** src/pages/Index.tsx

**Problem:**

The GravityCurve component at the bottom of the Brew Bench accepts a
readings prop,

but Index.tsx renders it with no prop, so it always shows the empty
state even when batches have readings.

**Fix:**

***❌ WRONG (bottom of the central section):***

> \<GravityCurve /\>

***✅ REPLACE WITH --- use readings from the first batch:***

> // Add at the top of the Index component, after useBatches():
>
> const firstBatchId = batches?.\[0\]?.id
>
> const { data: dashboardReadings } = useReadings(firstBatchId)
>
> // Add import at top of file:
>
> import { useReadings } from \"@/hooks/useReadings\"
>
> // Then replace the empty GravityCurve call with:
>
> \<GravityCurve readings={dashboardReadings ?? undefined} /\>
>
> **Issue #7 --- \[HIGH\] Hardcoded Mock Data --- Never Shows Real
> Database Readings**
>
> **File:** src/components/ReadingsTable.tsx

**Problem:**

ReadingsTable.tsx defines a static local array of fake readings and
renders them.

It never calls useReadings() or any hook. Users will always see the same
Mar 1--7 fake data.

This is the full replacement for the component:

**Fix:**

***✅ Full replacement for src/components/ReadingsTable.tsx:***

> import { TrendingDown, TrendingUp } from \"lucide-react\"
>
> import { useReadings } from \"@/hooks/useReadings\"
>
> interface ReadingsTableProps {
>
> batchId?: string
>
> }
>
> const ReadingsTable = ({ batchId }: ReadingsTableProps) =\> {
>
> const { data: readings, isLoading } = useReadings(batchId)
>
> return (
>
> \<div className=\"glass-panel rounded-xl overflow-hidden\"\>
>
> \<div className=\"px-4 py-3 border-b border-border/50\"\>
>
> \<h3 className=\"font-slab font-semibold text-sm\"\>Recent
> Readings\</h3\>
>
> \</div\>
>
> {isLoading ? (
>
> \<div className=\"p-4 space-y-2\"\>
>
> {\[1,2,3\].map(i =\> \<div key={i} className=\"h-8 bg-muted/50 rounded
> animate-pulse\"/\>)}
>
> \</div\>
>
> ) : (readings ?? \[\]).length === 0 ? (
>
> \<p className=\"text-xs text-muted-foreground p-4 text-center\"\>No
> readings yet.\</p\>
>
> ) : (
>
> \<div className=\"overflow-x-auto\"\>
>
> \<table className=\"w-full text-sm\" role=\"table\"\>
>
> \<thead\>
>
> \<tr className=\"border-b border-border/30\"\>
>
> \<th className=\"text-left px-4 py-2 text-xs font-medium
> text-muted-foreground\"\>Date\</th\>
>
> \<th className=\"text-right px-4 py-2 text-xs font-medium
> text-muted-foreground\"\>SG\</th\>
>
> \<th className=\"text-right px-4 py-2 text-xs font-medium
> text-muted-foreground\"\>°F\</th\>
>
> \<th className=\"text-right px-4 py-2 text-xs font-medium
> text-muted-foreground\"\>pH\</th\>
>
> \</tr\>
>
> \</thead\>
>
> \<tbody\>
>
> {(readings ?? \[\]).slice(0, 8).map((r, i) =\> {
>
> const prev = readings?.\[i + 1\]
>
> const trend = prev
>
> ? r.gravity \< prev.gravity ? \"down\"
>
> : r.gravity \> prev.gravity ? \"up\" : \"stable\"
>
> : \"stable\"
>
> return (
>
> \<tr key={r.id} className=\"border-b border-border/20
> hover:bg-muted/30 transition-colors\"\>
>
> \<td className=\"px-4 py-2.5 font-medium\"\>
>
> {new Date(r.read_at ?? \"\").toLocaleDateString(undefined,
>
> { month: \"short\", day: \"numeric\" })}
>
> \</td\>
>
> \<td className=\"px-4 py-2.5 text-right font-mono text-copper\"\>
>
> {Number(r.gravity).toFixed(3)}
>
> \</td\>
>
> \<td className=\"px-4 py-2.5 text-right\"\>{r.temp_f ??
> \"---\"}\</td\>
>
> \<td className=\"px-4 py-2.5 text-right\"\>{r.ph ?? \"---\"}\</td\>
>
> \</tr\>
>
> )
>
> })}
>
> \</tbody\>
>
> \</table\>
>
> \</div\>
>
> )}
>
> \</div\>
>
> )
>
> }
>
> export default ReadingsTable

In Index.tsx, pass the first batch ID:

> \<ReadingsTable batchId={batches?.\[0\]?.id} /\>
>
> **Issue #8 --- \[HIGH\] Bell Button Has No onClick --- Notifications
> Are Unreadable**
>
> **File:** src/components/AppLayout.tsx

**Problem:**

The notification bell renders an unread count badge correctly, but
clicking it does nothing.

The simplest fix is to navigate to a notifications page or toggle a
dropdown.

Below is a minimal approach: navigate to /profile which contains account
settings.

**Fix:**

***❌ WRONG:***

> \<button
>
> className=\"relative p-2 rounded-lg hover:bg-muted transition-colors\"
>
> aria-label=\"Notifications\"
>
> \>

***✅ REPLACE WITH (add import { useNavigate } from
\"react-router-dom\"):***

> // Add at top of AppLayout component:
>
> const navigate = useNavigate()
>
> // Replace the button:
>
> \<button
>
> className=\"relative p-2 rounded-lg hover:bg-muted transition-colors\"
>
> aria-label=\"Notifications\"
>
> onClick={() =\> navigate(\"/profile\")}
>
> \>

For a proper notification drawer, create a NotificationPanel component
and toggle it with useState.

> **Issue #9 --- \[HIGH\] stage.done vs stage.completed --- Stages
> Always Show as Incomplete**
>
> **File:** src/pages/BatchDetail.tsx

**Problem:**

The batch_stages schema has a boolean field named \"completed\", but
BatchDetail.tsx

references \"done\" which does not exist. Every stage renders as
incomplete (grey dot).

**Fix:**

***❌ WRONG (in the fermentation log timeline):***

> className={\`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 z-10 \${
>
> stage.done ? \"bg-teal border-teal\" : \"bg-background border-border\"
>
> }\`}
>
> // and:
>
> className={\`flex-1 \${!stage.done ? \"opacity-60\" : \"\"}\`}

***✅ REPLACE WITH:***

> className={\`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 z-10 \${
>
> stage.completed ? \"bg-teal border-teal\" : \"bg-background
> border-border\"
>
> }\`}
>
> // and:
>
> className={\`flex-1 \${!stage.completed ? \"opacity-60\" : \"\"}\`}
>
> **Issue #10 --- \[HIGH\] Duplicate Log Reading Dialog Triggers
> Conflict**
>
> **File:** src/pages/BatchDetail.tsx

**Problem:**

There are two \<Dialog open={logOpen}\> wrappers both rendering with
open={logOpen}.

The sidebar trigger attempts to open the same dialog that is already
defined in the hero,

causing React to render two overlapping dialogs or silently ignore the
second.

**Fix:**

***❌ WRONG --- sidebar has a redundant full Dialog wrapper:***

> \<Dialog open={logOpen} onOpenChange={setLogOpen}\>
>
> \<DialogTrigger asChild\>
>
> \<button\>Add Reading\</button\>
>
> \</DialogTrigger\>
>
> \</Dialog\>

***✅ REPLACE WITH --- just a plain button that sets state:***

> \<button
>
> onClick={() =\> setLogOpen(true)}
>
> className=\"w-full flex items-center gap-2 px-3 py-2 rounded-lg border
>
> border-border/40 hover:bg-muted text-sm transition-colors\"
>
> \>
>
> \<Plus size={14} className=\"text-copper\" /\>
>
> Add Reading
>
> \</button\>

The Dialog definition in the hero section already handles
rendering/closing. Only one Dialog mount per state variable.

**🟡 Medium Severity Issues**

> **Issue #11 --- \[MEDIUM\] Missing read_at Default --- Chart Sorting
> Breaks**
>
> **File:** src/hooks/useReadings.ts

**Problem:**

When inserting a reading without an explicit read_at, the column stores
NULL.

GravityCurve sorts by read_at ASC --- NULL values sort first in
PostgreSQL,

causing the chart line to spike incorrectly at the start.

**Fix:**

***❌ WRONG in useCreateReading mutationFn:***

> const { data, error } = await supabase
>
> .from(\"readings\")
>
> .insert({ \...reading, user_id: user.id })

***✅ REPLACE WITH:***

> const { data, error } = await supabase
>
> .from(\"readings\")
>
> .insert({
>
> \...reading,
>
> user_id: user.id,
>
> read_at: reading.read_at ?? new Date().toISOString(),
>
> })
>
> **Issue #12 --- \[MEDIUM\] 3-Second Race Condition on Slow Networks**
>
> **File:** src/pages/AuthCallback.tsx

**Problem:**

The fallback timeout rejects authentication after exactly 3 seconds.

On slow networks or when auth providers take longer, the user sees
\"Sign in failed\"

even though the session is being established correctly.

**Fix:**

***❌ WRONG:***

> setTimeout(() =\> {
>
> subscription.unsubscribe()
>
> resolve(null)
>
> }, 3000)

***✅ REPLACE WITH (increase to 10 seconds):***

> setTimeout(() =\> {
>
> subscription.unsubscribe()
>
> resolve(null)
>
> }, 10000) // 10s --- allows for slow OAuth redirects
>
> **Issue #13 --- \[MEDIUM\] Pagination is Fake --- All Posts Always
> Load**
>
> **File:** src/pages/Community.tsx

**Problem:**

The page state increments and decrements but no .range() call is applied
to the query.

All posts always load on page 1. The pagination buttons are purely
cosmetic.

**Fix:**

***✅ Fix in src/hooks/usePosts.ts --- add limit/offset support:***

> const PAGE_SIZE = 20
>
> export function usePosts(category?: string, page: number = 1) {
>
> return useQuery({
>
> queryKey: \[\"posts\", category, page\],
>
> queryFn: async () =\> {
>
> const from = (page - 1) \* PAGE_SIZE
>
> const to = from + PAGE_SIZE - 1
>
> let q = supabase
>
> .from(\"posts\")
>
> .select(\"\*, profiles(username, avatar_url)\", { count: \"exact\" })
>
> .order(\"created_at\", { ascending: false })
>
> .range(from, to)
>
> if (category) q = q.eq(\"category\", category)
>
> const { data, error, count } = await q
>
> if (error) throw error
>
> return { posts: data ?? \[\], total: count ?? 0 }
>
> },
>
> })
>
> }

In Community.tsx pass page to usePosts and derive hasMore from total
count:

> const { data: postsData } = usePosts(category, page)
>
> const posts = postsData?.posts ?? \[\]
>
> const hasMore = (postsData?.total ?? 0) \> page \* 20
>
> **Issue #14 --- \[MEDIUM\] Hardcoded Ingredients and Fermenters**
>
> **File:** src/pages/BrewSetup.tsx

**Problem:**

All ingredient lists and fermenter options are static arrays defined in
the file.

They never reflect the user\'s yeast bank, real inventory, or saved
recipes.

The \"In Stock\" / \"Unavailable\" statuses are all hardcoded booleans.

**Fix:**

***✅ Pull fermenters from yeast bank and allow free-text entry:***

> // Add import:
>
> import { useYeastBank } from \"@/hooks/useYeastBank\"
>
> import { useRecipes } from \"@/hooks/useRecipes\"
>
> // Inside BrewSetup component:
>
> const { data: yeastStrains } = useYeastBank()
>
> const { data: savedRecipes } = useRecipes()
>
> // Replace static recipes array with:
>
> const recipes = \[
>
> \...(savedRecipes ?? \[\]).map(r =\> ({
>
> id: r.id, name: r.title, type: r.type,
>
> time: r.estimated_days ? \`\${r.estimated_days} days\` : \"Variable\"
>
> })),
>
> { id: \"custom\", name: \"Custom Recipe\", type: \"ferment\", time:
> \"Variable\" }
>
> \]
>
> **Issue #15 --- \[MEDIUM\] toggle_post_like RPC Has No SQL Migration**
>
> **File:** Supabase SQL (missing migration)

**Problem:**

usePosts.ts calls supabase.rpc(\"toggle_post_like\", \...) which is
listed in the Database types,

but no SQL migration file exists to create this function. It will return
a 404/error in production.

**Fix:**

***✅ Create this SQL in your Supabase SQL editor or migration file:***

> CREATE OR REPLACE FUNCTION toggle_post_like(
>
> p_post_id UUID,
>
> p_user_id UUID
>
> ) RETURNS void
>
> LANGUAGE plpgsql SECURITY DEFINER AS \$\$
>
> BEGIN
>
> IF EXISTS (
>
> SELECT 1 FROM post_likes
>
> WHERE post_id = p_post_id AND user_id = p_user_id
>
> ) THEN
>
> DELETE FROM post_likes
>
> WHERE post_id = p_post_id AND user_id = p_user_id;
>
> UPDATE posts SET likes = likes - 1 WHERE id = p_post_id;
>
> ELSE
>
> INSERT INTO post_likes (post_id, user_id) VALUES (p_post_id,
> p_user_id);
>
> UPDATE posts SET likes = likes + 1 WHERE id = p_post_id;
>
> END IF;
>
> END;
>
> \$\$;

**🔵 Low Severity / Polish Issues**

> **Issue #16 --- \[LOW\] Placeholder Title and Open Graph Meta Tags**
>
> **File:** index.html

**Problem:**

The HTML title and all OG meta tags still say \"Lovable App\" --- the
default project scaffold.

This affects browser tabs, search engine results, and social share
previews.

**Fix:**

***✅ REPLACE in index.html:***

> \<title\>Homebrew Haven\</title\>
>
> \<meta name=\"description\" content=\"Track your fermentation batches,
> share recipes, and connect with fellow home brewers.\" /\>
>
> \<meta name=\"author\" content=\"Homebrew Haven\" /\>
>
> \<meta property=\"og:title\" content=\"Homebrew Haven\" /\>
>
> \<meta property=\"og:description\" content=\"Track your fermentation
> batches, share recipes, and connect with fellow home brewers.\" /\>
>
> \<meta property=\"og:type\" content=\"website\" /\>
>
> **Issue #17 --- \[LOW\] Unused Default Vite CSS File**
>
> **File:** src/App.css

**Problem:**

App.css contains default Vite scaffold CSS (.logo, .card,
.read-the-docs, logo-spin keyframe).

None of these classes exist in the actual application. The file adds
noise and confusion.

**Fix:**

***✅ Replace the entire contents of src/App.css with:***

> /\* App.css --- intentionally empty.
>
> All styles are in src/index.css via Tailwind. \*/
>
> **Issue #18 --- \[LOW\] addComment Declared But Never Used at Page
> Level**
>
> **File:** src/pages/Community.tsx

**Problem:**

const addComment = useAddComment() is called at the top of Community.tsx
but never used.

The actual comment submission is handled inside the CommentSection
component which calls

its own useAddComment() hook. This is a dead declaration.

**Fix:**

***✅ Remove this line from the Community component body:***

> // DELETE this line:
>
> const addComment = useAddComment()
>
> **Issue #19 --- \[LOW\] Dead \"Tasting Note\" and \"Upload Photo\"
> Buttons in Sidebar**
>
> **File:** src/pages/FermentationMonitor.tsx

**Problem:**

The Quick Actions sidebar has two buttons with no onClick handlers ---
they render

but do nothing when clicked. The actual upload functionality is wired to
a label/input above.

**Fix:**

***❌ WRONG --- dead buttons in the sidebar:***

> \<button className=\"\...\"\>
>
> \<MessageSquare size={16} className=\"text-copper\" /\>
>
> Tasting Note
>
> \</button\>
>
> \<button className=\"\...\"\>
>
> \<Camera size={16} className=\"text-copper\" /\>
>
> Upload Photo
>
> \</button\>

***✅ Add state and wire them up:***

> // Add state at top of FermentationMonitor:
>
> const \[tastingOpen, setTastingOpen\] = useState(false)
>
> // Replace the Tasting Note button:
>
> \<button
>
> onClick={() =\> setTastingOpen(true)}
>
> className=\"w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
>
> border border-border/50 hover:bg-muted text-sm transition-colors\"
>
> \>
>
> \<MessageSquare size={16} className=\"text-copper\" /\>
>
> Tasting Note
>
> \</button\>
>
> // Remove the dead Upload Photo button --- the label above already
> handles it
>
> **Issue #20 --- \[LOW\] Dual Theme Systems --- ThemeToggle vs
> next-themes Conflict**
>
> **File:** src/components/ThemeToggle.tsx

**Problem:**

ThemeToggle.tsx manually toggles the \"dark\" class on
document.documentElement and

writes to localStorage under \"hh-theme\".

Meanwhile, sonner.tsx uses useTheme() from next-themes which manages its
own theme state.

These two systems can conflict: toggling dark mode via the button may
not update

the toast theming, causing toasts to render in the wrong color scheme.

**Fix:**

***✅ Unify under next-themes. Wrap the app in ThemeProvider (in
main.tsx or App.tsx):***

> // In App.tsx, add ThemeProvider:
>
> import { ThemeProvider } from \"next-themes\"
>
> const App = () =\> (
>
> \<ThemeProvider attribute=\"class\" defaultTheme=\"system\"
> enableSystem\>
>
> \<QueryClientProvider client={queryClient}\>
>
> {/\* \... rest of app \*/}
>
> \</QueryClientProvider\>
>
> \</ThemeProvider\>
>
> )

***✅ Replace ThemeToggle.tsx to use useTheme():***

> import { useTheme } from \"next-themes\"
>
> import { Moon, Sun } from \"lucide-react\"
>
> const ThemeToggle = () =\> {
>
> const { theme, setTheme } = useTheme()
>
> const dark = theme === \"dark\"
>
> return (
>
> \<button
>
> onClick={() =\> setTheme(dark ? \"light\" : \"dark\")}
>
> className=\"relative w-14 h-7 rounded-full bg-muted border
>
> border-border transition-colors duration-300 flex items-center
> px-0.5\"
>
> aria-label={dark ? \"Switch to light mode\" : \"Switch to dark mode\"}
>
> \>
>
> \<div className={\`w-6 h-6 rounded-full bg-gradient-to-br from-copper
> to-gold
>
> shadow-md flex items-center justify-center transition-transform
> duration-300
>
> \${dark ? \"translate-x-7\" : \"translate-x-0\"}\`}
>
> \>
>
> {dark
>
> ? \<Moon size={12} className=\"text-copper-foreground\" /\>
>
> : \<Sun size={12} className=\"text-copper-foreground\" /\>
>
> }
>
> \</div\>
>
> \</button\>
>
> )
>
> }
>
> export default ThemeToggle

**Additional Architecture Notes**

**Row Level Security (RLS)**

The hooks filter by user_id client-side, but no RLS migration files
exist in the repo. Without RLS enabled in Supabase, any authenticated
user could query another user\'s batches, readings, and recipes directly
via the API. Ensure the following policies are in place:

> \-- Enable RLS on all user-scoped tables
>
> ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
>
> ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
>
> ALTER TABLE readings ENABLE ROW LEVEL SECURITY;
>
> ALTER TABLE yeast_bank ENABLE ROW LEVEL SECURITY;
>
> \-- Example policy for batches (repeat for each table):
>
> CREATE POLICY \"Users can only access own batches\"
>
> ON batches FOR ALL
>
> USING (auth.uid() = user_id)
>
> WITH CHECK (auth.uid() = user_id);

**Error Boundaries**

There are no React error boundaries anywhere in the app. Any unhandled
render error will produce a blank white screen with no user feedback.
Add at minimum a top-level boundary in App.tsx:

> import { ErrorBoundary } from \"react-error-boundary\"
>
> function ErrorFallback({ error }: { error: Error }) {
>
> return (
>
> \<div className=\"min-h-screen flex items-center justify-center\"\>
>
> \<div className=\"glass-panel rounded-2xl p-8 text-center max-w-md\"\>
>
> \<h1 className=\"font-slab text-xl font-bold mb-2\"\>Something went
> wrong\</h1\>
>
> \<p className=\"text-sm text-muted-foreground\"\>{error.message}\</p\>
>
> \<button onClick={() =\> window.location.reload()} className=\"mt-4
> \...\"\>
>
> Reload
>
> \</button\>
>
> \</div\>
>
> \</div\>
>
> )
>
> }
>
> // Wrap in App.tsx:
>
> \<ErrorBoundary FallbackComponent={ErrorFallback}\>
>
> \<BrowserRouter\>\...
>
> \</ErrorBoundary\>

**useFollows FK Hint Fragility**

The follower/following queries use Supabase named FK hints:

> .select(\"\*, profiles!follows_follower_id_fkey(\...)\")

These will silently fail or return empty if the FK constraint name in
your Supabase project differs from \"follows_follower_id_fkey\". Verify
the exact constraint names in your schema with: SELECT conname FROM
pg_constraint WHERE conrelid = \'follows\'::regclass;

*End of Report --- 20 Issues Documented*
