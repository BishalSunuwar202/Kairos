export type SlideType =
  | 'welcome'
  | 'host'
  | 'opening-prayer'
  | 'lyrics'
  | 'bible'
  | 'sermon'
  | 'announcements'
  | 'closing-prayer'

export interface Slide {
  id: number
  type: SlideType
  title: string
  content: string
  subtitle?: string
}

export interface Presentation {
  id: string
  user_id: string
  title: string
  date: string
  slides: Slide[]
  created_at: string
}

export interface GenerateRequest {
  fellowshipDate: string
  anchorName: string
  sermonLeader: string
  songLyricsText: string
  songLyricsImage?: { base64: string; mediaType: string }
  bibleRef: string
  bibleText: string
  announcements: string
  prayerPoints: string
}

export const SLIDE_COLORS: Record<SlideType, string> = {
  welcome: '#f59e0b',
  host: '#0ea5e9',
  'opening-prayer': '#9333ea',
  lyrics: '#6366f1',
  bible: '#22c55e',
  sermon: '#f97316',
  announcements: '#14b8a6',
  'closing-prayer': '#f43f5e',
}
