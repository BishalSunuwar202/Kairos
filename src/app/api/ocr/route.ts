import { generateText } from 'ai'
import { google } from '@ai-sdk/google'
import { createClient } from '@/lib/supabase/server'
import type { OcrExtractedData } from '@/lib/types'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { image } = (await req.json()) as { image: string }
  if (!image) return new Response('No image provided', { status: 400 })

  if (!image.startsWith('data:image/')) {
    return new Response('Invalid image format', { status: 400 })
  }

  const { text } = await generateText({
    model: google('gemini-2.5-flash-lite'),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            image: new URL(image),
          },
          {
            type: 'text',
            text: `You are an OCR agent for a Nepali church fellowship app. Extract responsibility-name assignments from this image.

The image contains a schedule or roster listing church fellowship roles and the people assigned to them. The text may be in Nepali (Devanagari script), English, or a mix of both.

Match each role to the correct JSON field using these mappings:

- सञ्चालन / संचालन / सन्चालन / Anchor / Host / MC / सञ्चालक → "anchorName"
- भेटी सेवा / Offering Service / भेटि सेवा → "offeringServiceName"
- भेटीको प्रार्थना / Offering Prayer / भेटि प्रार्थना → "offeringPrayerName"
- समापन प्रार्थना / Last Prayer / Closing Prayer / अन्तिम प्रार्थना → "lastPrayerName"
- स्पेशल समय / Special Time / विशेष समय → "specialTimeName"
- बाइबल वाचन / Bible Reader / बाइबल पाठक / वाचन → "bibleReaderName"
- बचन / Sermon / Sermon Leader / वक्ता / प्रचारक / उपदेशक / बचनको सेवा → "sermonLeader"

Rules:
- Preserve names EXACTLY as written in the image (do not translate or transliterate names)
- Only include fields where you can confidently identify a match
- Return ONLY a valid JSON object, no markdown, no code fences, no explanation
- If no roles are found, return an empty object {}

Example output:
{"anchorName": "विशाल सुनुवार", "sermonLeader": "Pastor John", "lastPrayerName": "रबिन खड्का"}`,
          },
        ],
      },
    ],
  })

  const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  const extracted: OcrExtractedData = JSON.parse(cleaned)

  return Response.json(extracted)
}
