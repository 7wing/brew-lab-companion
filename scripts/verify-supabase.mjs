import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const env = readFileSync(".env.local", "utf-8");
const url = env.match(/VITE_SUPABASE_URL=(.+)/)?.[1]?.trim();
const key = env.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim();

if (!url || !key) {
  console.error("❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);

const expectedTables = [
  "profiles",
  "recipes",
  "batches",
  "readings",
  "batch_stages",
  "posts",
  "post_likes",
  "comments",
  "challenges",
  "challenge_entries",
  "tasting_sessions",
  "tasting_messages",
  "tasting_notes",
  "notifications",
  "yeast_bank",
];

async function verifyTable(table) {
  const { error } = await supabase.from(table).select("*").limit(0);
  if (error && (error.code === "42P01" || error.message?.includes("does not exist"))) {
    return { table, exists: false, error: error.message };
  }
  return { table, exists: true };
}

async function main() {
  console.log("🔌 Connecting to Supabase...");
  console.log(`   URL: ${url}`);

  const results = await Promise.all(expectedTables.map(verifyTable));
  const missing = results.filter((r) => !r.exists);
  const present = results.filter((r) => r.exists);

  console.log(`\n✅ ${present.length}/${expectedTables.length} tables found:`);
  present.forEach((r) => console.log(`   ✓ ${r.table}`));

  if (missing.length > 0) {
    console.log(`\n❌ ${missing.length} table(s) missing:`);
    missing.forEach((r) => console.log(`   ✗ ${r.table} — ${r.error}`));
    process.exit(1);
  }

  console.log("\n🎉 All expected tables exist. Schema looks good!");
  process.exit(0);
}

main().catch((err) => {
  console.error("💥 Unexpected error:", err.message);
  process.exit(1);
});
