/**
 * One-time script to import the Nepali Bible into Supabase.
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   node scripts/import-bible.mjs
 *
 * Source: godlytalias/Bible-Database (Nepali, public domain)
 * Books are 0-indexed in source → stored as 1-based (1-66) in Supabase.
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const SOURCE_URL =
  'https://raw.githubusercontent.com/godlytalias/Bible-Database/master/Nepali/bible.json'

console.log('Fetching Nepali Bible data from GitHub...')
const res = await fetch(SOURCE_URL)
if (!res.ok) {
  console.error('Failed to fetch:', res.status, res.statusText)
  process.exit(1)
}

const json = await res.json()
console.log(`Parsing ${json.Book.length} books...`)

const rows = []
for (let bookIdx = 0; bookIdx < json.Book.length; bookIdx++) {
  const book = json.Book[bookIdx]
  for (let chapIdx = 0; chapIdx < book.Chapter.length; chapIdx++) {
    const chapter = book.Chapter[chapIdx]
    for (let verseIdx = 0; verseIdx < chapter.Verse.length; verseIdx++) {
      const verseData = chapter.Verse[verseIdx]
      rows.push({
        book_num: bookIdx + 1,   // 1-based (1=Genesis … 66=Revelation)
        chapter:  chapIdx + 1,   // 1-based
        verse:    verseIdx + 1,  // 1-based
        text:     verseData.Verse,
      })
    }
  }
}

console.log(`Total verses parsed: ${rows.length}`)

// Test Supabase connectivity before bulk insert
console.log(`Testing Supabase connection to ${SUPABASE_URL} ...`)
try {
  const testRes = await fetch(`${SUPABASE_URL}/rest/v1/bible_verses?limit=0`, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  })
  console.log(`Connection test: ${testRes.status} ${testRes.statusText}`)
  if (!testRes.ok) {
    const body = await testRes.text()
    console.error('Response body:', body)
    process.exit(1)
  }
} catch (e) {
  console.error('Connection test failed:', e)
  process.exit(1)
}

const BATCH = 500
let inserted = 0

for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH)
  const { error } = await supabase.from('bible_verses').insert(batch)
  if (error) {
    console.error(`Error at batch starting at row ${i}:`, error.message)
    process.exit(1)
  }
  inserted += batch.length
  process.stdout.write(`\rInserted ${inserted} / ${rows.length}`)
}

console.log('\nDone! Nepali Bible imported successfully.')
