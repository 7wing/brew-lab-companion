import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://zvdkwjexmseczzpqkwyb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2ZGt3amV4bXNlY3p6cHFrd3liIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTAyNzk0MCwiZXhwIjoyMDk2NjAzOTQwfQ.u3ucIjJ4zew0Z8_L5uADM85fXTQOaNUQLAJX0D-nZfc'
)

async function check() {
  // 1. Check RLS on all tables
  const { data: rlsData, error: rlsErr } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_type', 'BASE TABLE')

  if (rlsErr) { console.error('RLS query error:', rlsErr); process.exit(1) }

  const tables = rlsData.map(r => r.table_name)
  console.log('Tables found:', tables.join(', '))

  // Check RLS enabled for each table
  const { data: policies, error: polErr } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT relname, relrowsecurity
      FROM pg_class
      WHERE relkind = 'r' AND relnamespace = 'public'::regnamespace
    `
  })

  console.log('\n--- RLS Status ---')
  if (polErr) {
    console.error('Could not query RLS via exec_sql:', polErr.message)
    // Fallback: try direct query on pg_class
    const { data: pgData, error: pgErr } = await supabase
      .from('pg_class')
      .select('relname, relrowsecurity')
      .eq('relnamespace', '2200') // public schema OID approx; better to use name
      .eq('relkind', 'r')
    if (pgErr) console.error('Fallback also failed:', pgErr)
    else console.log(pgData)
  } else {
    console.log(policies)
  }

  // 2. Check functions
  const { data: funcs, error: funcsErr } = await supabase
    .from('information_schema.routines')
    .select('routine_name, routine_type')
    .eq('routine_schema', 'public')

  console.log('\n--- Functions ---')
  if (funcsErr) console.error(funcsErr)
  else funcs.forEach(f => console.log(f.routine_name, f.routine_type))

  // 3. Check columns on recipes for fts
  const { data: cols, error: colsErr } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type')
    .eq('table_schema', 'public')
    .eq('table_name', 'recipes')

  console.log('\n--- Recipes columns ---')
  if (colsErr) console.error(colsErr)
  else cols.forEach(c => console.log(c.column_name, c.data_type))

  // 4. Check FK constraint names on follows
  const { data: fkData, error: fkErr } = await supabase
    .from('information_schema.table_constraints')
    .select('constraint_name, constraint_type')
    .eq('table_schema', 'public')
    .eq('table_name', 'follows')
    .eq('constraint_type', 'FOREIGN KEY')

  console.log('\n--- Follows FKs ---')
  if (fkErr) console.error(fkErr)
  else fkData.forEach(fk => console.log(fk.constraint_name))

  // 5. Check triggers on auth.users
  const { data: trigData, error: trigErr } = await supabase
    .from('information_schema.triggers')
    .select('trigger_name, event_object_table, action_statement')
    .eq('trigger_schema', 'auth')
    .eq('event_object_table', 'users')

  console.log('\n--- Auth triggers ---')
  if (trigErr) console.error(trigErr)
  else trigData.forEach(t => console.log(t.trigger_name))

  process.exit(0)
}

check()
