import type { Slide, SlideType } from '@/lib/types'
import { SLIDE_COLORS } from '@/lib/types'
import { GripVertical } from 'lucide-react'

const TYPE_LABELS: Record<SlideType, string> = {
  'welcome':        'स्वागत',
  'host':           'आयोजक',
  'offering-service': 'भेटी सेवा',
  'offering-prayer': 'भेटीको प्रार्थना',
  'opening-prayer': 'आरम्भिक प्रार्थना',
  'lyrics':         'भजन',
  'special-time':   'स्पेशल समय',
  'bible-reader':   'बाइबल वाचन',
  'bible':          'बाइबल',
  'sermon':         'उपदेश',
  'announcements':  'सूचनाहरू',
  'closing-prayer': 'समापन प्रार्थना',
  'note': 'नोट',
}

interface SlideMiniProps {
  slide: Slide
  index: number
  isActive?: boolean
  onClick?: () => void
  draggable?: boolean
  isDragging?: boolean
  isDropTarget?: boolean
  onDragStart?: (e: React.DragEvent<HTMLButtonElement>) => void
  onDragOver?: (e: React.DragEvent<HTMLButtonElement>) => void
  onDrop?: (e: React.DragEvent<HTMLButtonElement>) => void
  onDragEnd?: () => void
}

export function SlideMini({
  slide,
  index,
  isActive,
  onClick,
  draggable = false,
  isDragging = false,
  isDropTarget = false,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: SlideMiniProps) {
  const borderColor = SLIDE_COLORS[slide.type]

  return (
    <button
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`w-full text-left rounded-lg border p-3 transition-all cursor-pointer ${
        isActive
          ? 'ring-2 ring-[#1a3a5c] bg-[#1a3a5c]/5'
          : 'hover:border-gray-400 hover:bg-gray-100 hover:shadow-md hover:scale-[1.02]'
      } ${isDragging ? 'opacity-50 scale-[0.98]' : ''} ${isDropTarget ? 'border-[#1a3a5c] bg-[#1a3a5c]/10' : ''}`}
      style={{ borderTop: `4px solid ${borderColor}` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-400 mb-1">
            {index + 1} · {TYPE_LABELS[slide.type]}
          </p>
          <p className="text-sm font-medium text-[#1a3a5c] truncate">{slide.title}</p>
          <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{slide.content}</p>
        </div>
        {draggable && (
          <span
            className="mt-0.5 shrink-0 text-gray-400"
            aria-hidden="true"
            title="Drag to reorder"
          >
            <GripVertical className="w-4 h-4" />
          </span>
        )}
      </div>
    </button>
  )
}
