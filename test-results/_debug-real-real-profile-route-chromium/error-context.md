# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: _debug-real.spec.ts >> real profile route
- Location: e2e/_debug-real.spec.ts:5:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:8082/", waiting until "load"

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications (F8)":
    - list
  - region "Notifications alt+T"
  - paragraph [ref=e5]: Loading…
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import { createClient } from "@supabase/supabase-js";
  3  | import ws from "ws";
  4  | 
  5  | test("real profile route", async ({ page }) => {
  6  |   const supabase = createClient(
  7  |     process.env.VITE_SUPABASE_URL!,
  8  |     process.env.VITE_SUPABASE_ANON_KEY!,
  9  |     { realtime: { transport: ws } }
  10 |   );
  11 |   const { data } = await supabase.auth.signInWithPassword({
  12 |     email: "hoppy.brewer@example.com",
  13 |     password: "TestPass123!",
  14 |   });
  15 |   if (!data.session) throw new Error("login failed");
  16 |   await supabase
  17 |     .from("profiles")
  18 |     .update({ onboarding_completed: true })
  19 |     .eq("id", data.user!.id);
  20 | 
  21 |   const url = new URL(process.env.VITE_SUPABASE_URL!);
  22 |   const key = `sb-${url.hostname.split(".")[0]}-auth-token`;
> 23 |   await page.goto("http://localhost:8082/");
     |              ^ Error: page.goto: Test timeout of 30000ms exceeded.
  24 |   await page.evaluate(
  25 |     ({ session, k }: { session: unknown; k: string }) => {
  26 |       localStorage.setItem(k, JSON.stringify(session));
  27 |     },
  28 |     { session: data.session, k: key }
  29 |   );
  30 |   await page.reload();
  31 |   await page.waitForTimeout(3000);
  32 | 
  33 |   const errors: string[] = [];
  34 |   page.on("pageerror", (e) => errors.push(e.message));
  35 |   page.on("console", (msg) => {
  36 |     if (msg.type() === "error") errors.push(msg.text());
  37 |   });
  38 |   await page.goto("http://localhost:8082/profile", {
  39 |     waitUntil: "networkidle",
  40 |     timeout: 10000,
  41 |   });
  42 |   await page.waitForTimeout(2000);
  43 |   const txt = await page.evaluate(() =>
  44 |     document.body.innerText.trim().substring(0, 300)
  45 |   );
  46 |   console.log("URL:", page.url());
  47 |   console.log("TXT:", txt);
  48 |   errors.forEach((e) => console.log("ERR:", e));
  49 |   expect(
  50 |     errors.filter((e) => e.includes("hook") || e.includes("Hook")).length
  51 |   ).toBe(0);
  52 | });
  53 | 
```