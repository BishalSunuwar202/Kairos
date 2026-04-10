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

The image contains a schedule or roster listing church fellowship roles and the people assigned to them. The text may be in Nepali (Devanagari script), English, or a mix of both. Labels and names are typically separated by ":" or "–".

Match each role to the correct JSON field using these mappings (labels may be abbreviated):

- लिड / लीड / Lead / सञ्चालन / संचालन / सन्चालन / Anchor / Host / MC / सञ्चालक → "anchorName"
- भेटी सेवा / भेटि सेवा / Offering Service → "offeringServiceName"
- भेटीको प्रार्थना / भेटिको प्रार्थना / Offering Prayer → "offeringPrayerName"
- समापन / समापन प्रार्थना / Last Prayer / Closing Prayer / अन्तिम प्रार्थना → "lastPrayerName"
- स्पेशल समय / Special Time / विशेष समय → "specialTimeName"
- बा.पाठ / बाइबल पाठ / बाइबल वाचन / Bible Reader / वाचन → "bibleReaderName" AND "bibleReaderVerse"
- बचन / Sermon / Sermon Leader / वक्ता / प्रचारक / उपदेशक / बचनको सेवा → "sermonLeader"

Special parsing rules:
- For बा.पाठ / Bible Reader: the value often contains BOTH a person name AND a Bible reference separated by "/" or ",". Split them: put the person name in "bibleReaderName" and the Bible reference (book + chapter:verse) in "bibleReaderVerse".
  Example: "रोहित खत्री/दानीएल11:11-15" → "bibleReaderName": "रोहित खत्री", "bibleReaderVerse": "दानीएल 11:11-15"
- For स्पेशल समय / Special Time: include the full value as-is (may contain name + duration like "रिना बराइली 2-5 मिनेट")
- For भेटी सेवा: the value may contain multiple names separated by "/" — include them all as-is
- Ignore labels like मिति (date), समय (time), स्तु.प्रसंसा (praise/worship) — they do not map to any field

General rules:
- Preserve names EXACTLY as written in the image (do not translate or transliterate)
- Only include fields where you can confidently identify a match
- Return ONLY a valid JSON object, no markdown, no code fences, no explanation
- If no roles are found, return an empty object {}

Example input image text:
लिड : शान्ति ढकाल
बा.पाठ : रोहित खत्री/दानीएल11:11-15
भेटी सेवा : टीका बिक/पुर्नमाया मादेन
भेटीको प्रार्थना : जित ब.तामाङ
बचन : सागर तामाङ
स्पेशल समय : रिना बराइली 2-5 मिनेट
समापन : पा.रबिन खड्का

Example output:
{"anchorName": "शान्ति ढकाल", "bibleReaderName": "रोहित खत्री", "bibleReaderVerse": "दानीएल 11:11-15", "offeringServiceName": "टीका बिक/पुर्नमाया मादेन", "offeringPrayerName": "जित ब.तामाङ", "sermonLeader": "सागर तामाङ", "specialTimeName": "रिना बराइली 2-5 मिनेट", "lastPrayerName": "पा.रबिन खड्का"}`,
          },
        ],
      },
    ],
  })

  const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  const extracted: OcrExtractedData = JSON.parse(cleaned)

  return Response.json(extracted)
}
