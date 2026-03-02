import type { Slide, SlideType } from '@/lib/types'
import { SLIDE_COLORS } from '@/lib/types'

const TYPE_LABELS: Record<SlideType, string> = {
  'welcome':        'स्वागत',
  'host':           'आयोजक',
  'opening-prayer': 'आरम्भिक प्रार्थना',
  'lyrics':         'भजन',
  'bible':          'बाइबल',
  'sermon':         'उपदेश',
  'announcements':  'सूचनाहरू',
  'closing-prayer': 'समापन प्रार्थना',
}

interface SlideDisplayProps {
  slide: Slide
}

export function SlideDisplay({ slide }: SlideDisplayProps) {
  const borderColor = SLIDE_COLORS[slide.type]
  const fmt = slide.format ?? {}

  const bg = fmt.backgroundColor ?? '#ffffff'
  const pad = fmt.padding ?? 48

  const titleSize = fmt.titleSize ?? 48
  const titleColor = fmt.titleColor ?? '#1a3a5c'
  const titleWeight = fmt.titleBold !== false ? 'bold' : 'normal'
  const titleDecoration = fmt.titleUnderline ? 'underline' : 'none'

  const contentSize = fmt.contentSize ?? 30
  const contentColor = fmt.contentColor ?? '#374151'
  const contentWeight = fmt.contentBold ? 'bold' : 'normal'
  const contentDecoration = fmt.contentUnderline ? 'underline' : 'none'

  return (
    <div
      className="w-full h-full flex flex-col justify-center relative"
      style={{
        backgroundColor: bg,
        borderTop: `10px solid ${borderColor}`,
        paddingLeft: pad,
        paddingRight: pad,
        paddingTop: pad / 1.5,
        paddingBottom: pad / 1.5,
      }}
    >
      <span className="absolute top-4 left-6 text-xs uppercase tracking-widest text-gray-400 font-medium">
        {TYPE_LABELS[slide.type]}
      </span>

      <h1
        className="mb-6 leading-tight text-center"
        style={{
          fontSize: titleSize,
          color: titleColor,
          fontWeight: titleWeight,
          textDecoration: titleDecoration,
        }}
      >
        {slide.title}
      </h1>

      {slide.type === 'lyrics' && slide.subtitle && (
        <p className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-3 text-center">
          {slide.subtitle}
        </p>
      )}

      <p
        className="whitespace-pre-wrap leading-relaxed text-center"
        style={{
          fontSize: contentSize,
          color: contentColor,
          fontWeight: contentWeight,
          textDecoration: contentDecoration,
        }}
      >
        {slide.content}
      </p>

      {slide.type !== 'lyrics' && slide.subtitle && (
        <p className="text-2xl text-gray-400 mt-4 text-center">{slide.subtitle}</p>
      )}

      <span className="absolute bottom-6 right-8 text-3xl text-gray-200 select-none">
        ✝
      </span>
    </div>
  )
}
