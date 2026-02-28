import type { Slide } from '@/lib/types'
import { SLIDE_COLORS } from '@/lib/types'

interface SlideDisplayProps {
  slide: Slide
}

export function SlideDisplay({ slide }: SlideDisplayProps) {
  const borderColor = SLIDE_COLORS[slide.type]

  return (
    <div
      className="w-full h-full flex flex-col justify-center px-16 py-12 bg-white relative"
      style={{ borderTop: `10px solid ${borderColor}` }}
    >
      <span className="absolute top-4 left-6 text-xs uppercase tracking-widest text-gray-400 font-medium">
        {slide.type.replace('-', ' ')}
      </span>

      <h1 className="text-5xl font-bold text-[#1a3a5c] mb-6 leading-tight">
        {slide.title}
      </h1>

      <p className="text-3xl text-gray-700 whitespace-pre-wrap leading-relaxed">
        {slide.content}
      </p>

      {slide.subtitle && (
        <p className="text-2xl text-gray-400 mt-4">{slide.subtitle}</p>
      )}

      <span className="absolute bottom-6 right-8 text-3xl text-gray-200 select-none">
        ✝
      </span>
    </div>
  )
}
