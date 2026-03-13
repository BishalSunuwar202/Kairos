import type { Slide, SlideType } from '@/lib/types'
import { SLIDE_COLORS } from '@/lib/types'

const TYPE_LABELS: Record<SlideType, string> = {
  'welcome':        'स्वागत',
  'host':           'आयोजक',
  'opening-prayer': 'आरम्भिक प्रार्थना',
  'lyrics':         'भजन',
  'bible-reader':   'बाइबल वाचन',
  'bible':          'बाइबल',
  'sermon':         'उपदेश',
  'announcements':  'सूचनाहरू',
  'closing-prayer': 'समापन प्रार्थना',
}

interface SlideMiniProps {
  slide: Slide
  index: number
  isActive?: boolean
  onClick?: () => void
}

export function SlideMini({ slide, index, isActive, onClick }: SlideMiniProps) {
  const borderColor = SLIDE_COLORS[slide.type]

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-lg border p-3 transition-all cursor-pointer ${
        isActive
          ? 'ring-2 ring-[#1a3a5c] bg-[#1a3a5c]/5'
          : 'hover:border-gray-400 hover:bg-gray-100 hover:shadow-md hover:scale-[1.02]'
      }`}
      style={{ borderTop: `4px solid ${borderColor}` }}
    >
      <p className="text-xs text-gray-400 mb-1">
        {index + 1} · {TYPE_LABELS[slide.type]}
      </p>
      <p className="text-sm font-medium text-[#1a3a5c] truncate">{slide.title}</p>
      <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{slide.content}</p>
    </button>
  )
}
