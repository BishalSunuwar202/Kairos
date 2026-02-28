import type { Slide } from '@/lib/types'
import { SLIDE_COLORS } from '@/lib/types'

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
      className={`w-full text-left rounded-lg border p-3 transition-all ${
        isActive ? 'ring-2 ring-[#1a3a5c]' : 'hover:border-gray-300'
      }`}
      style={{ borderTop: `4px solid ${borderColor}` }}
    >
      <p className="text-xs text-gray-400 mb-1">
        {index + 1} · {slide.type.replace('-', ' ')}
      </p>
      <p className="text-sm font-medium text-[#1a3a5c] truncate">{slide.title}</p>
      <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{slide.content}</p>
    </button>
  )
}
