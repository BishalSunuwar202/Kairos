'use server'

import { createClient } from '@/lib/supabase/server'

// ─────────────────────────────────────────────────────────────────
// Bible verse lookup — Supabase bible_verses table (Nepali)
// One-time import from godlytalias/Bible-Database; book_num is 1-based (1=Genesis…66=Revelation)
// ─────────────────────────────────────────────────────────────────

const BOOK_NUMBERS: Record<string, number> = {
  // Old Testament
  genesis: 1, gen: 1,
  exodus: 2, ex: 2, exod: 2,
  leviticus: 3, lev: 3,
  numbers: 4, num: 4,
  deuteronomy: 5, deut: 5,
  joshua: 6, josh: 6,
  judges: 7, judg: 7,
  ruth: 8,
  '1 samuel': 9, '1sam': 9, '1 sam': 9,
  '2 samuel': 10, '2sam': 10, '2 sam': 10,
  '1 kings': 11, '1kgs': 11, '1 kgs': 11,
  '2 kings': 12, '2kgs': 12, '2 kgs': 12,
  '1 chronicles': 13, '1chr': 13, '1 chr': 13,
  '2 chronicles': 14, '2chr': 14, '2 chr': 14,
  ezra: 15,
  nehemiah: 16, neh: 16,
  esther: 17, est: 17,
  job: 18,
  psalms: 19, psalm: 19, ps: 19,
  proverbs: 20, prov: 20,
  ecclesiastes: 21, eccl: 21,
  'song of solomon': 22, 'song of songs': 22, song: 22,
  isaiah: 23, isa: 23,
  jeremiah: 24, jer: 24,
  lamentations: 25, lam: 25,
  ezekiel: 26, ezek: 26,
  daniel: 27, dan: 27,
  hosea: 28, hos: 28,
  joel: 29,
  amos: 30,
  obadiah: 31, obad: 31,
  jonah: 32, jon: 32,
  micah: 33, mic: 33,
  nahum: 34, nah: 34,
  habakkuk: 35, hab: 35,
  zephaniah: 36, zeph: 36,
  haggai: 37, hag: 37,
  zechariah: 38, zech: 38,
  malachi: 39, mal: 39,
  // New Testament
  matthew: 40, matt: 40, mt: 40,
  mark: 41, mk: 41,
  luke: 42, lk: 42,
  john: 43, jn: 43, joh: 43,
  acts: 44,
  romans: 45, rom: 45,
  '1 corinthians': 46, '1cor': 46, '1 cor': 46,
  '2 corinthians': 47, '2cor': 47, '2 cor': 47,
  galatians: 48, gal: 48,
  ephesians: 49, eph: 49,
  philippians: 50, phil: 50,
  colossians: 51, col: 51,
  '1 thessalonians': 52, '1thess': 52, '1 thess': 52,
  '2 thessalonians': 53, '2thess': 53, '2 thess': 53,
  '1 timothy': 54, '1tim': 54, '1 tim': 54,
  '2 timothy': 55, '2tim': 55, '2 tim': 55,
  titus: 56, tit: 56,
  philemon: 57, phlm: 57,
  hebrews: 58, heb: 58,
  james: 59, jas: 59,
  '1 peter': 60, '1pet': 60, '1 pet': 60,
  '2 peter': 61, '2pet': 61, '2 pet': 61,
  '1 john': 62, '1jn': 62, '1 jn': 62,
  '2 john': 63, '2jn': 63, '2 jn': 63,
  '3 john': 64, '3jn': 64, '3 jn': 64,
  jude: 65,
  revelation: 66, rev: 66,
  // Nepali (Devanagari) book names — numbered books use Arabic after devanagariToArabic()
  // Old Testament
  'उत्पत्ति': 1, 'प्रस्थान': 2, 'लेवी': 3, 'लेवीय': 3,
  'गन्ती': 4, 'व्यवस्था': 5, 'यहोशू': 6, 'न्यायकर्ता': 7, 'न्याय': 7,
  'रूत': 8,
  '1 शमूएल': 9, '2 शमूएल': 10,
  '1 राजा': 11, '2 राजा': 12,
  '1 इतिहास': 13, '2 इतिहास': 14,
  'एज्रा': 15, 'नहेम्याह': 16, 'एस्तर': 17, 'अय्यूब': 18,
  'भजन': 19, 'भजनसंहिता': 19, 'भजन संहिता': 19,
  'नीतिवचन': 20, 'नीति': 20, 'उपदेशक': 21, 'श्रेष्ठगीत': 22,
  'यशायाह': 23, 'यशाया': 23, 'यर्मियाह': 24, 'यर्मि': 24,
  'विलापगीत': 25, 'यहेजकेल': 26, 'दानिएल': 27,
  'होशे': 28, 'योएल': 29, 'आमोस': 30, 'ओबद्याह': 31,
  'योना': 32, 'मीका': 33, 'नहूम': 34, 'हबक्कूक': 35,
  'सपन्याह': 36, 'हाग्गै': 37, 'जकर्याह': 38, 'मलाकी': 39,
  // New Testament
  'मत्ती': 40, 'मरकुस': 41, 'लूका': 42, 'यूहन्ना': 43,
  'प्रेरित काम': 44, 'प्रेरित': 44, 'रोमी': 45,
  '1 कोरिन्थी': 46, '2 कोरिन्थी': 47,
  'गलाती': 48, 'एफिसी': 49, 'फिलिप्पी': 50, 'कोलस्सी': 51,
  '1 थेस्सलोनिकी': 52, '2 थेस्सलोनिकी': 53,
  '1 तीमुथियुस': 54, '2 तीमुथियुस': 55,
  'तीतुस': 56, 'फिलेमोन': 57, 'इब्रानी': 58, 'याकूब': 59,
  '1 पत्रुस': 60, '2 पत्रुस': 61,
  '1 यूहन्ना': 62, '2 यूहन्ना': 63, '3 यूहन्ना': 64,
  'यहूदा': 65, 'प्रकाशित वाक्य': 66, 'प्रकाशित': 66, 'प्रका': 66,
}

// Convert Devanagari numerals (०–९) to ASCII digits (0–9)
function devanagariToArabic(str: string): string {
  return str.replace(/[०-९]/g, d => String(d.charCodeAt(0) - 0x0966))
}

function parseBibleRef(ref: string): { bookNum: number; chapter: number; verse: number } | null {
  const normalized = devanagariToArabic(ref.trim())
  const match = normalized.match(/^(.+?)\s+(\d+):(\d+)$/)
  if (!match) return null
  const bookKey = match[1].toLowerCase().trim()
  const bookNum = BOOK_NUMBERS[bookKey]
  if (!bookNum) return null
  return { bookNum, chapter: parseInt(match[2]), verse: parseInt(match[3]) }
}

function parseBibleRange(ref: string): {
  bookNum: number
  chapter: number
  startVerse: number
  endVerse: number
} | null {
  const normalized = devanagariToArabic(ref.trim()).replace(/\s*-\s*/, '-')
  const match = normalized.match(/^(.+?)\s+(\d+):(\d+)-(\d+)$/)
  if (!match) return null

  const bookKey = match[1].toLowerCase().trim()
  const bookNum = BOOK_NUMBERS[bookKey]
  if (!bookNum) return null

  const chapter = parseInt(match[2])
  const startVerse = parseInt(match[3])
  const endVerse = parseInt(match[4])

  if (startVerse > endVerse) return null

  return { bookNum, chapter, startVerse, endVerse }
}

export async function lookupBible(
  ref: string
): Promise<{ text: string } | { error: string }> {
  const parsed = parseBibleRef(ref)
  if (!parsed) return { error: 'Could not parse reference. Try "John 3:16" format.' }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bible_verses')
    .select('text')
    .eq('book_num', parsed.bookNum)
    .eq('chapter', parsed.chapter)
    .eq('verse', parsed.verse)
    .single()

  if (error || !data) return { error: 'Verse not found. Check the reference.' }
  return { text: data.text.trim() }
}

export async function lookupBibleRange(
  ref: string
): Promise<{ text: string } | { error: string }> {
  const parsed = parseBibleRange(ref)
  if (!parsed) return { error: 'Could not parse reference. Try "John 3:1-10" format.' }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bible_verses')
    .select('verse, text')
    .eq('book_num', parsed.bookNum)
    .eq('chapter', parsed.chapter)
    .gte('verse', parsed.startVerse)
    .lte('verse', parsed.endVerse)
    .order('verse', { ascending: true })

  if (error || !data || data.length === 0) {
    return { error: 'Verse range not found. Check the reference.' }
  }

  const text = data
    .map((entry) => `${entry.verse}. ${entry.text.trim()}`)
    .join('\n')

  return { text }
}

// ─────────────────────────────────────────────────────────────────
// Song lyrics lookup — Song Library (Supabase) → lyrics-storage (external Supabase)
// ─────────────────────────────────────────────────────────────────

async function lookupFromLyricsStorage(query: {
  title?: string
  number?: number
}): Promise<string | null> {
  const url = process.env.LYRICS_SUPABASE_URL
  const key = process.env.LYRICS_SUPABASE_ANON_KEY
  if (!url || !key) return null

  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
  }

  // Search by number first (number column is varchar in lyrics-storage)
  if (query.number) {
    const res = await fetch(
      `${url}/rest/v1/lyrics?number=eq.${query.number}&select=content&limit=1`,
      { headers }
    )
    if (res.ok) {
      const data: { content: string }[] = await res.json()
      if (data[0]?.content) return data[0].content.trim()
    }
  }

  // Search by title (ILIKE) — PostgREST uses * as wildcard in URL params
  if (query.title) {
    const titleParam = encodeURIComponent(query.title)
    const res = await fetch(
      `${url}/rest/v1/lyrics?title=ilike.*${titleParam}*&select=content&limit=1`,
      { headers }
    )
    if (res.ok) {
      const data: { content: string }[] = await res.json()
      if (data[0]?.content) return data[0].content.trim()
    }
  }

  return null
}

export async function lookupSong(query: {
  title?: string
  number?: number
}): Promise<{ found: boolean; lyrics: string; source: 'library' | 'web' | 'none' }> {
  const supabase = await createClient()

  // Step 1: Check Song Library (Kairos Supabase)
  let dbData: { lyrics: string } | null = null

  if (query.number) {
    const { data } = await supabase
      .from('songs')
      .select('lyrics')
      .eq('number', query.number)
      .limit(1)
      .maybeSingle()
    dbData = data
  }

  if (!dbData && query.title) {
    const { data } = await supabase
      .from('songs')
      .select('lyrics')
      .ilike('title', `%${query.title}%`)
      .limit(1)
      .maybeSingle()
    dbData = data
  }

  if (dbData?.lyrics) {
    return { found: true, lyrics: dbData.lyrics, source: 'library' }
  }

  // Step 2: Query lyrics-storage (external Supabase)
  const external = await lookupFromLyricsStorage(query)
  if (external) return { found: true, lyrics: external, source: 'web' }

  return { found: false, lyrics: '', source: 'none' }
}
