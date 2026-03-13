import { generateText } from 'ai'
import { google } from '@ai-sdk/google'
import { createClient } from '@/lib/supabase/server'
import type { GenerateRequest } from '@/lib/types'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const body: GenerateRequest = await req.json()

  const userMessage = JSON.stringify({
    fellowshipDate: body.fellowshipDate,
    anchorName: body.anchorName,
    bibleReaderName: body.bibleReaderName,
    bibleReaderVerse: body.bibleReaderVerse,
    bibleReaderText: body.bibleReaderText,
    sermonLeader: body.sermonLeader,
    songs: body.songs.map((s, i) => ({
      songNumber: i + 1,
      title: s.title || `Song ${i + 1}`,
      lyricsText: s.lyricsText,
    })),
    bibleRefs: body.bibleRefs,
    announcements: body.announcements,
    prayerPoints: body.prayerPoints,
  })

  const { text } = await generateText({
    model: google('gemini-2.5-flash-lite'),
    system: `You are a church fellowship presentation builder for a Nepali church community.
Return ONLY a valid JSON array of slide objects. No markdown, no code fences, no explanation.
Each object must have: { "id": number, "type": string, "title": string, "content": string, "subtitle"?: string }
Valid types: welcome, host, opening-prayer, lyrics, sermon, bible-reader, bible, announcements, closing-prayer

Language rules (strictly enforced):
- All slide text (title, content, subtitle) must be in Nepali (Devanagari script).
- People's names (anchorName, bibleReaderName, sermonLeader): transliterate into Devanagari (e.g. "Bishal Sunuwar" → "बिशाल सुनुवार").
- English prose (announcements, prayer points): translate into Nepali.
- Song lyrics and Bible verse text: use exactly as provided — do not alter them.

Slide order: welcome → host → opening-prayer → lyrics → sermon → bible-reader → bible (one slide per reference) → announcements → closing-prayer

For the welcome slide:
- Set "title" to a short, warm Nepali Christian welcome title (e.g. "परमेश्वरको घरमा स्वागत छ")
- Set "content" to a 2–3 sentence AI-generated welcoming Christian church message in Nepali (warm, faith-based, suitable for opening a Sunday fellowship)
- Set "subtitle" to the fellowshipDate converted to Bikram Sambat (BS) calendar and written fully in Nepali Devanagari numerals and Nepali month name (e.g. "फाल्गुन १७, २०८२")

For the host slide:
- Set "title" to "सञ्चालन"
- Set "content" to the anchorName transliterated into Devanagari

For the sermon slide:
- Set "title" to "उपदेश"
- Set "content" to the sermonLeader's name transliterated into Devanagari

For the bible-reader slide:
- Only create this slide if bibleReaderText is provided.
- Set "type" to "bible-reader"
- Set "title" to "बाइबल वाचन"
- Set "content" to bibleReaderText exactly as provided.
- Set "subtitle" to the bibleReaderName transliterated into Devanagari, followed by " · ", followed by bibleReaderVerse transliterated into Devanagari if needed.

For lyrics slides:
- Split each song into one slide per section (Verse 1, Chorus, Verse 2, Bridge, etc.)
- Set "title" to the song title (e.g. "Amazing Grace")
- Set "subtitle" to the section label, including the song number when there are multiple songs (e.g. "Song 1 · Verse 1", "Song 1 · Chorus", "Song 2 · Verse 1")
- Set "content" to the actual lyrics text for that section
- If a lyrics image is provided for a song, extract the text from it to create the lyrics slides

All songs should appear together in the lyrics section before moving to sermon.`,
    messages: [{ role: 'user', content: userMessage }],
  })

  const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  return Response.json({ slides: JSON.parse(cleaned) })
}
