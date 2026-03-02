import { generateText } from 'ai'
import { google } from '@ai-sdk/google'
import type { GenerateRequest } from '@/lib/types'

type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'image'; image: string }

export async function POST(req: Request) {
  const body: GenerateRequest = await req.json()

  const content: ContentPart[] = []

  // Attach any song images so AI can extract lyrics from them
  for (const song of body.songs) {
    if (song.image) {
      content.push({
        type: 'image',
        image: `data:${song.image.mediaType};base64,${song.image.base64}`,
      })
    }
  }

  content.push({
    type: 'text',
    text: JSON.stringify({
      fellowshipDate: body.fellowshipDate,
      anchorName: body.anchorName,
      sermonLeader: body.sermonLeader,
      songs: body.songs.map((s, i) => ({
        songNumber: i + 1,
        title: s.title || `Song ${i + 1}`,
        lyricsText: s.lyricsText,
        hasImage: !!s.image,
      })),
      bibleRefs: body.bibleRefs,
      announcements: body.announcements,
      prayerPoints: body.prayerPoints,
    }),
  })

  const { text } = await generateText({
    model: google('gemini-2.5-flash-lite'),
    system: `You are a church fellowship presentation builder for a Nepali church community.
Return ONLY a valid JSON array of slide objects. No markdown, no code fences, no explanation.
Each object must have: { "id": number, "type": string, "title": string, "content": string, "subtitle"?: string }
Valid types: welcome, host, opening-prayer, lyrics, bible, sermon, announcements, closing-prayer

Language rules (strictly enforced):
- All slide text (title, content, subtitle) must be in Nepali (Devanagari script).
- People's names (anchorName, sermonLeader): transliterate into Devanagari (e.g. "Bishal Sunuwar" → "बिशाल सुनुवार").
- English prose (announcements, prayer points): translate into Nepali.
- Song lyrics and Bible verse text: use exactly as provided — do not alter them.

Slide order: welcome → host → opening-prayer → lyrics → bible (one slide per reference) → sermon → announcements → closing-prayer

For lyrics slides:
- Split each song into one slide per section (Verse 1, Chorus, Verse 2, Bridge, etc.)
- Set "title" to the song title (e.g. "Amazing Grace")
- Set "subtitle" to the section label, including the song number when there are multiple songs (e.g. "Song 1 · Verse 1", "Song 1 · Chorus", "Song 2 · Verse 1")
- Set "content" to the actual lyrics text for that section
- If a lyrics image is provided for a song, extract the text from it to create the lyrics slides

All songs should appear together in the lyrics section before moving to bible.`,
    messages: [{ role: 'user', content }],
  })

  const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  return Response.json({ slides: JSON.parse(cleaned) })
}
