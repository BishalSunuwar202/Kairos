export type SlideType =
  | 'welcome'
  | 'host'
  | 'opening-prayer'
  | 'lyrics'
  | 'bible'
  | 'sermon'
  | 'announcements'
  | 'closing-prayer'

export interface SlideFormat {
  backgroundColor?: string
  titleSize?: number
  titleBold?: boolean
  titleUnderline?: boolean
  titleColor?: string
  contentSize?: number
  contentBold?: boolean
  contentUnderline?: boolean
  contentColor?: string
  padding?: number
}

export interface Slide {
  id: number
  type: SlideType
  title: string
  content: string
  subtitle?: string
  format?: SlideFormat
}

export interface Presentation {
  id: string
  user_id: string
  title: string
  date: string
  slides: Slide[]
  created_at: string
}

export interface SongEntry {
  title: string
  lyricsText: string
  image?: { base64: string; mediaType: string }
}

export interface GenerateRequest {
  fellowshipDate: string
  anchorName: string
  sermonLeader: string
  songs: SongEntry[]
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
