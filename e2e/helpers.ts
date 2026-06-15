import { createClient } from '@supabase/supabase-js';
import type { Page } from '@playwright/test';
import ws from 'ws';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!;

const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Extract project ref from Supabase URL for localStorage key (Supabase JS v2 format)
const projectRef = SUPABASE_URL.replace(/^https?:\/\//, '').split('.')[0];
export const SB_KEY = `sb-${projectRef}-auth-token`;

export function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    realtime: { transport: ws },
  });
}

export function getSupabaseAdmin() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: ws },
  });
}

/**
 * Signs up a new test user via admin API (email confirmed),
 * marks onboarding_completed=true so tests skip the /onboarding redirect.
 */
export async function createTestUser(prefix = 'e2e') {
  const admin = getSupabaseAdmin();
  const email = `${prefix}-${Date.now()}@test.com`;
  const password = 'TestPassword123!';

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: prefix },
  });
  if (error) throw error;

  const userId = data.user!.id;

  // Wait for trigger to create profiles row
  let attempts = 0;
  while (attempts < 40) {
    const { data: profile } = await admin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (profile) break;
    await new Promise((r) => setTimeout(r, 500));
    attempts++;
  }

  // Mark onboarding complete so ProtectedRoute skips the /onboarding redirect
  const { error: updateError } = await admin
    .from('profiles')
    .update({ onboarding_completed: true })
    .eq('id', userId);

  if (updateError) throw updateError;

  return { email, password, userId };
}

/**
 * Authenticates a test user and sets localStorage so AuthContext picks it up,
 * then navigates to the home page.
 */
export async function loginAsTestUser(page: Page, email: string, password: string) {
  const supabase = getSupabase();
  const { data } = await supabase.auth.signInWithPassword({ email, password });
  if (!data.session) throw new Error(`Failed to sign in ${email}`);
  await page.goto('/auth');
  await page.evaluate(
    ({ session, key }: { session: unknown; key: string }) => {
      localStorage.setItem(key, JSON.stringify(session));
    },
    { session: data.session, key: SB_KEY }
  );
  await page.reload();
  await page.waitForURL('http://localhost:8080/', { timeout: 15000 });
}