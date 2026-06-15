const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  const logs = [];
  page.on("pageerror", (err) => logs.push(`PAGEERROR: ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") logs.push(`CONSOLE: ${msg.text()}`);
  });

  // Test root route (landing if unauthenticated)
  await page.goto("http://localhost:8082/", { waitUntil: "networkidle", timeout: 15000 });
  await page.waitForTimeout(2000);
  const rootBody = await page.evaluate(() => document.body.innerText.trim().substring(0, 400));
  console.log("\n--- / (root) ---");
  console.log("BODY TEXT:", rootBody);
  logs.forEach((l) => console.log(l));

  // Take screenshot
  await page.screenshot({ path: "/project/workspace/screenshot-root.png", fullPage: true });

  // Test /auth
  logs.length = 0;
  await page.goto("http://localhost:8082/auth", { waitUntil: "networkidle", timeout: 15000 });
  await page.waitForTimeout(2000);
  const authBody = await page.evaluate(() => document.body.innerText.trim().substring(0, 400));
  console.log("\n--- /auth ---");
  console.log("BODY TEXT:", authBody);
  logs.forEach((l) => console.log(l));

  await page.screenshot({ path: "/project/workspace/screenshot-auth.png", fullPage: true });

  // Authenticate via localStorage to test protected routes
  const { data } = await (await import("@supabase/supabase-js")).createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  ).auth.signInWithPassword({
    email: "hoppy.brewer@example.com",
    password: "TestPass123!"
  });

  if (data.session) {
    const url = new URL(process.env.VITE_SUPABASE_URL);
    const key = `sb-${url.hostname.split(".")[0]}-auth-token`;
    await page.evaluate(
      ({ session, k }) => { localStorage.setItem(k, JSON.stringify(session)); },
      { session: data.session, k: key }
    );
    await page.reload();
    await page.waitForTimeout(3000);

    for (const route of ["/", "/recipes", "/community", "/profile", "/settings", "/admin"]) {
      logs.length = 0;
      await page.goto(`http://localhost:8082${route}`, { waitUntil: "networkidle", timeout: 15000 });
      await page.waitForTimeout(2000);
      const bodyText = await page.evaluate(() => document.body.innerText.trim().substring(0, 400));
      console.log(`\n--- ${route} (authenticated) ---`);
      console.log("BODY TEXT:", bodyText);
      logs.forEach((l) => console.log(l));
      await page.screenshot({ path: `/project/workspace/screenshot-${route.replace(/[^a-z]/g, "-")}.png`, fullPage: true });
    }
  } else {
    console.log("\n--- AUTH LOGIN FAILED ---");
    console.log("Could not authenticate; skipping protected route tests.");
  }

  await browser.close();
})();
