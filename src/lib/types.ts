export type SlideType =
  | 'welcome'
  | 'host'
  | 'offering-service'
  | 'offering-prayer'
  | 'opening-prayer'
  | 'lyrics'
  | 'special-time'
  | 'bible-reader'
  | 'bible'
  | 'sermon'
  | 'announcements'
  | 'closing-prayer'
  | 'note'

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
  verticalAlign?: 'top' | 'center' | 'bottom'
  textAlign?: 'left' | 'center' | 'right' | 'justify'
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
  form_data?: PresentationFormData | null
  created_at: string
}

export interface ProjectorSessionState {
  sessionId: string
  slides: Slide[]
  currentSlide: number
  title: string
  logoUrl?: string | null
  isActive: boolean
}

export interface SongEntry {
  title: string
  lyricsText: string
}

export interface SongFormEntry {
  number: string
  title: string
  lyricsText: string
}

export interface BibleEntry {
  ref: string
  text: string
}

export interface GenerateRequest {
  fellowshipDate: string
  anchorName: string
  offeringServiceName: string
  offeringPrayerName: string
  lastPrayerName: string
  specialTimeName: string
  bibleReaderName: string
  bibleReaderVerse: string
  bibleReaderText: string
  sermonLeader: string
  sermonTopicText: string
  songs: SongEntry[]
  worshipSongs: SongEntry[]
  bibleRefs: BibleEntry[]
}

export interface PresentationFormData {
  fellowshipDate: string
  anchorName: string
  offeringServiceName: string
  offeringPrayerName: string
  lastPrayerName: string
  specialTimeName: string
  bibleReaderName: string
  bibleReaderVerse: string
  bibleReaderText: string
  sermonLeader: string
  sermonTopicText: string
  songs: SongFormEntry[]
  worshipSongs: SongFormEntry[]
  bibleRefs: BibleEntry[]
  includeCreed: boolean
}

export const SLIDE_COLORS: Record<SlideType, string> = {
  welcome: '#f59e0b',
  host: '#0ea5e9',
  'offering-service': '#8b5cf6',
  'offering-prayer': '#a855f7',
  'opening-prayer': '#9333ea',
  lyrics: '#6366f1',
  'special-time': '#ec4899',
  'bible-reader': '#16a34a',
  bible: '#22c55e',
  sermon: '#f97316',
  announcements: '#14b8a6',
  'closing-prayer': '#f43f5e',
  'note': '#6b7280',
}
