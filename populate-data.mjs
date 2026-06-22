import { execSync } from 'child_process'

const TOKEN = 'eyJhbGciOiJFUzI1NiIsImtpZCI6IjNlNWJlYTJjLWNmMzUtNGNkMC05YTc4LWEwZGU5NGFjNGJlMSIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3p2ZGt3amV4bXNlY3p6cHFrd3liLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI2YWY4ZTk2ZC1hZjM0LTRlZDQtODY2MS04OWE1Y2I3OWFiODQiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzgyMTUzNzE2LCJpYXQiOjE3ODIxNTAxMTYsImVtYWlsIjoibWVhZC5tYXN0ZXJAZXhhbXBsZS5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsX3ZlcmlmaWVkIjp0cnVlfSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc4MjE1MDExNn1dLCJzZXNzaW9uX2lkIjoiNTUzMGRjMDYtNjAyMC00ODJmLTkzNzAtMDY1MThiMzYwZThlIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.mEoSF4lFvTocc_iAFJjpCYtip4hbPo1Dm0fdLjm69OoPShYbaYZS-H79ySU7oLGYUV1TxEnMCEgwexjh0XNqHg'
const APIKEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2ZGt3amV4bXNlY3p6cHFrd3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMjc5NDAsImV4cCI6MjA5NjYwMzk0MH0.NwJ7pl2qGWC93rKoCO5O_x3hLBP90euL-gSDKyFrnjI'
const BASE = 'https://zvdkwjexmseczzpqkwyb.supabase.co/rest/v1'

function curl(method, path, body = null, prefer = 'return=representation') {
  const cmd = `curl -s -w "\\nHTTP_STATUS:%{http_code}" -X ${method} "${BASE}${path}" \\
    -H "apikey: ${APIKEY}" \\
    -H "Authorization: Bearer ${TOKEN}" \\
    -H "Content-Type: application/json" \\
    -H "Prefer: ${prefer}" \\
    ${body ? `-d '${JSON.stringify(body)}'` : ''}`
  const out = execSync(cmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 })
  const lines = out.trim().split('\n')
  const statusLine = lines.pop()
  const status = parseInt(statusLine.replace('HTTP_STATUS:', ''))
  const bodyText = lines.join('\n')
  if (status >= 200 && status < 300) {
    try { return JSON.parse(bodyText) } catch { return bodyText }
  }
  console.error(`HTTP ${status}:`, bodyText)
  return null
}

function iso(d) { return d.toISOString().split('T')[0] }

const today = new Date()
const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)
const twoDaysAgo = new Date(today); twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
const threeDaysAgo = new Date(today); threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
const fiveDaysAgo = new Date(today); fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)
const sevenDaysAgo = new Date(today); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
const tenDaysAgo = new Date(today); tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)
const fourteenDaysAgo = new Date(today); fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
const fortyFourDaysAgo = new Date(today); fortyFourDaysAgo.setDate(fortyFourDaysAgo.getDate() - 44)

const USER_ID = '6af8e96d-af34-4ed4-8661-89a5cb79ab84'

// ── Delete existing data ────────────────────────────────────────────────
console.log('Deleting existing data...')

// Get existing batch IDs
const existingBatches = curl('GET', `/batches?select=id&user_id=eq.${USER_ID}`, null, 'count=exact')
const batchIds = Array.isArray(existingBatches) ? existingBatches.map(b => b.id) : []

if (batchIds.length > 0) {
  const idList = batchIds.join(',')
  curl('DELETE', `/batch_stages?batch_id=in.(${idList})`, null, 'return=minimal')
  curl('DELETE', `/readings?batch_id=in.(${idList})`, null, 'return=minimal')
  curl('DELETE', `/batches?user_id=eq.${USER_ID}`, null, 'return=minimal')
  console.log(`  Deleted ${batchIds.length} existing batches and their data`)
} else {
  console.log('  No existing batches found')
}

// ── Create batches ──────────────────────────────────────────────────────
const batches = [
  {
    name: "Summer Saison",
    type: "beer",
    status: "brew_day",
    start_date: iso(today),
    target_days: 14,
    og: 1.065,
    target_fg: 1.010,
    target_temp_f: 68,
    user_id: USER_ID,
    volume: 5,
    yeast_strain: "Wyeast 3711 French Saison",
  },
  {
    name: "Citra IPA",
    type: "beer",
    status: "fermenting",
    start_date: iso(fiveDaysAgo),
    target_days: 14,
    og: 1.072,
    target_fg: 1.012,
    target_temp_f: 66,
    user_id: USER_ID,
    volume: 5,
    yeast_strain: "Wyeast 1056 American Ale",
  },
  {
    name: "Traditional Mead",
    type: "mead",
    status: "fermenting",
    start_date: iso(tenDaysAgo),
    target_days: 30,
    og: 1.110,
    target_fg: 1.010,
    target_temp_f: 65,
    user_id: USER_ID,
    volume: 3,
    yeast_strain: "Lalvin D-47",
  },
  {
    name: "Dry-Hopped Pale Ale",
    type: "beer",
    status: "conditioning",
    start_date: iso(sevenDaysAgo),
    target_days: 21,
    og: 1.058,
    target_fg: 1.012,
    target_temp_f: 65,
    user_id: USER_ID,
    volume: 5,
    yeast_strain: "Wyeast 1272 American Ale II",
  },
  {
    name: "Blackberry Cider",
    type: "cider",
    status: "packaging",
    start_date: iso(fourteenDaysAgo),
    target_days: 10,
    og: 1.050,
    target_fg: 1.005,
    target_temp_f: 62,
    user_id: USER_ID,
    volume: 5,
    yeast_strain: "SafCider AB-1",
  },
  {
    name: "Oatmeal Stout",
    type: "beer",
    status: "batch_shelf",
    start_date: iso(fortyFourDaysAgo),
    target_days: 21,
    og: 1.062,
    target_fg: 1.016,
    target_temp_f: 65,
    user_id: USER_ID,
    volume: 5,
    yeast_strain: "Wyeast 1084 Irish Ale",
  },
]

console.log('Creating batches...')
const createdBatches = []
for (const batch of batches) {
  const result = curl('POST', '/batches', batch)
  if (result && result[0]) {
    createdBatches.push(result[0])
    console.log(`  Created: ${result[0].name} (${result[0].status})`)
  } else {
    console.error('  Failed to create batch:', batch.name)
  }
}

function getBatch(status, index = 0) {
  const matches = createdBatches.filter(b => b.status === status)
  return matches[index]
}

// ── Create batch stages ─────────────────────────────────────────────────
const saison = getBatch('brew_day')
const ipa = getBatch('fermenting', 0)
const mead = getBatch('fermenting', 1)
const paleAle = getBatch('conditioning')
const cider = getBatch('packaging')
const stout = getBatch('batch_shelf')

const stages = []
if (saison) {
  stages.push(
    { batch_id: saison.id, name: "Heat strike water", scheduled: iso(twoDaysAgo), completed: true, sort_order: 1 },
    { batch_id: saison.id, name: "Mash in", scheduled: iso(yesterday), completed: false, sort_order: 2 },
    { batch_id: saison.id, name: "Mash out", scheduled: iso(today), completed: false, sort_order: 3 },
    { batch_id: saison.id, name: "Sparge", scheduled: iso(tomorrow), completed: false, sort_order: 4 },
    { batch_id: saison.id, name: "Boil", scheduled: iso(tomorrow), completed: false, sort_order: 5 },
  )
}
if (ipa) {
  stages.push(
    { batch_id: ipa.id, name: "Pitch yeast", scheduled: iso(fiveDaysAgo), completed: true, sort_order: 1 },
    { batch_id: ipa.id, name: "Check gravity", scheduled: iso(threeDaysAgo), completed: true, sort_order: 2 },
    { batch_id: ipa.id, name: "Dry hop", scheduled: iso(tomorrow), completed: false, sort_order: 3 },
    { batch_id: ipa.id, name: "Cold crash", scheduled: iso(today), completed: false, sort_order: 4 },
  )
}
if (mead) {
  stages.push(
    { batch_id: mead.id, name: "Pitch yeast", scheduled: iso(tenDaysAgo), completed: true, sort_order: 1 },
    { batch_id: mead.id, name: "Add nutrients", scheduled: iso(fiveDaysAgo), completed: true, sort_order: 2 },
    { batch_id: mead.id, name: "Check gravity", scheduled: iso(today), completed: false, sort_order: 3 },
  )
}
if (paleAle) {
  stages.push(
    { batch_id: paleAle.id, name: "Dry hop", scheduled: iso(sevenDaysAgo), completed: true, sort_order: 1 },
    { batch_id: paleAle.id, name: "Cold crash", scheduled: iso(threeDaysAgo), completed: true, sort_order: 2 },
    { batch_id: paleAle.id, name: "Transfer & carb", scheduled: iso(tomorrow), completed: false, sort_order: 3 },
  )
}
if (cider) {
  stages.push(
    { batch_id: cider.id, name: "Rack to fermenter", scheduled: iso(fourteenDaysAgo), completed: true, sort_order: 1 },
    { batch_id: cider.id, name: "Add blackberry", scheduled: iso(tenDaysAgo), completed: true, sort_order: 2 },
    { batch_id: cider.id, name: "Bottle", scheduled: iso(tomorrow), completed: false, sort_order: 3 },
  )
}
if (stout) {
  stages.push(
    { batch_id: stout.id, name: "Pitch yeast", scheduled: iso(fortyFourDaysAgo), completed: true, sort_order: 1 },
    { batch_id: stout.id, name: "Bottle", scheduled: iso(fourteenDaysAgo), completed: true, sort_order: 2 },
  )
}

console.log('Creating batch stages...')
for (const stage of stages) {
  const result = curl('POST', '/batch_stages', stage)
  if (result && result[0]) {
    console.log(`  Stage: ${result[0].name} - ${result[0].scheduled}`)
  } else {
    console.error('  Failed to create stage:', stage.name)
  }
}

// ── Create readings ─────────────────────────────────────────────────────
const readings = []
if (ipa) {
  readings.push(
    { batch_id: ipa.id, gravity: 1.042, temp_f: 68, ph: 5.2, read_at: new Date(today.getTime() - 2 * 60 * 60 * 1000).toISOString() },
    { batch_id: ipa.id, gravity: 1.048, temp_f: 67, ph: 5.1, read_at: new Date(today.getTime() - 26 * 60 * 60 * 1000).toISOString() },
    { batch_id: ipa.id, gravity: 1.058, temp_f: 66, ph: 5.3, read_at: new Date(today.getTime() - 50 * 60 * 60 * 1000).toISOString() },
    { batch_id: ipa.id, gravity: 1.065, temp_f: 66, ph: 5.3, read_at: new Date(today.getTime() - 74 * 60 * 60 * 1000).toISOString() },
  )
}
if (mead) {
  readings.push(
    { batch_id: mead.id, gravity: 1.095, temp_f: 65, ph: null, read_at: new Date(today.getTime() - 4 * 60 * 60 * 1000).toISOString() },
    { batch_id: mead.id, gravity: 1.102, temp_f: 64, ph: null, read_at: new Date(today.getTime() - 28 * 60 * 60 * 1000).toISOString() },
  )
}
if (paleAle) {
  readings.push(
    { batch_id: paleAle.id, gravity: 1.012, temp_f: 38, ph: 4.2, read_at: new Date(today.getTime() - 8 * 60 * 60 * 1000).toISOString() },
    { batch_id: paleAle.id, gravity: 1.014, temp_f: 40, ph: 4.3, read_at: new Date(today.getTime() - 32 * 60 * 60 * 1000).toISOString() },
  )
}
if (cider) {
  readings.push(
    { batch_id: cider.id, gravity: 1.005, temp_f: 62, ph: 3.8, read_at: new Date(today.getTime() - 12 * 60 * 60 * 1000).toISOString() },
    { batch_id: cider.id, gravity: 1.008, temp_f: 63, ph: 3.9, read_at: new Date(today.getTime() - 36 * 60 * 60 * 1000).toISOString() },
  )
}
if (saison) {
  readings.push(
    { batch_id: saison.id, gravity: 1.065, temp_f: 70, ph: 5.5, read_at: new Date(today.getTime() - 1 * 60 * 60 * 1000).toISOString() },
  )
}

console.log('Creating readings...')
for (const reading of readings) {
  const result = curl('POST', '/readings', { ...reading, user_id: USER_ID })
  if (result && result[0]) {
    console.log(`  Reading: SG ${result[0].gravity} - ${result[0].read_at}`)
  } else {
    console.error('  Failed to create reading')
  }
}

console.log('\nDone! Data populated successfully.')
