import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const supabaseUrl = 'https://zvdkwjexmseczzpqkwyb.supabase.co';
const supabaseServiceRoleKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2ZGt3amV4bXNlY3p6cHFrd3liIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTAyNzk0MCwiZXhwIjoyMDk2NjAzOTQwfQ.u3ucIjJ4zew0Z8_L5uADM85fXTQOaNUQLAJX0D-nZfc';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  realtime: {
    transport: ws,
  },
});

export async function getProfileByUserId(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function deleteUserById(userId: string) {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) throw error;
}

export async function findUserByEmail(email: string) {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) throw error;
  return data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
}

export async function getProfileByEmail(email: string) {
  const user = await findUserByEmail(email);
  if (!user) return null;
  return getProfileByUserId(user.id);
}

export async function deleteUserByEmail(email: string) {
  const user = await findUserByEmail(email);
  if (user) {
    await deleteUserById(user.id);
  }
}

export async function createTestUser(email: string, password: string) {
  await deleteUserByEmail(email);

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) throw error;
  if (!data.user) throw new Error('User not created');
  return data.user;
}
