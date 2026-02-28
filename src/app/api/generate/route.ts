import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import type { GenerateRequest } from '@/lib/types'

type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'image'; image: string }

export async function POST(req: Request) {
  const body: GenerateRequest = await req.json()

  const content: ContentPart[] = []

  if (body.songLyricsImage) {
    content.push({
      type: 'image',
      image: `data:${body.songLyricsImage.mediaType};base64,${body.songLyricsImage.base64}`,
    })
  }

  content.push({
    type: 'text',
    text: JSON.stringify({
      fellowshipDate: body.fellowshipDate,
      anchorName: body.anchorName,
      sermonLeader: body.sermonLeader,
      songLyricsText: body.songLyricsText,
      bibleRef: body.bibleRef,
      bibleText: body.bibleText,
      announcements: body.announcements,
      prayerPoints: body.prayerPoints,
    }),
  })

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: `You are a church fellowship presentation builder.
Return ONLY a valid JSON array of slide objects. No markdown, no code fences, no explanation.
Each object must have: { "id": number, "type": string, "title": string, "content": string, "subtitle"?: string }
Valid types: welcome, host, opening-prayer, lyrics, bible, sermon, announcements, closing-prayer
Slide order: welcome → host → opening-prayer → lyrics (one slide per verse/chorus/bridge) → bible → sermon → announcements → closing-prayer
If a lyrics image is provided, extract the text from it to create the lyrics slides.`,
    messages: [{ role: 'user', content }],
  })

  return result.toTextStreamResponse()
}
