import Image from 'next/image'
import type { Slide, SlideType } from '@/lib/types'
import { SLIDE_COLORS } from '@/lib/types'

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

interface SlideDisplayProps {
  slide: Slide
  logoUrl?: string | null
}

export function SlideDisplay({ slide, logoUrl }: SlideDisplayProps) {
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

  const justifyMap = { top: 'flex-start', center: 'center', bottom: 'flex-end' } as const
  const justifyContent = justifyMap[fmt.verticalAlign ?? 'center']
  const textAlign = fmt.textAlign ?? 'center'

  return (
    <div
      className="w-full h-full flex flex-col relative"
      style={{
        justifyContent,
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
        className="mb-6 leading-tight"
        style={{
          fontSize: titleSize,
          color: titleColor,
          fontWeight: titleWeight,
          textDecoration: titleDecoration,
          textAlign,
        }}
      >
        {slide.title}
      </h1>

      {slide.type === 'lyrics' && slide.subtitle && (
        <p className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-3" style={{ textAlign }}>
          {slide.subtitle}
        </p>
      )}

      <p
        className="whitespace-pre-wrap leading-relaxed"
        style={{
          fontSize: contentSize,
          color: contentColor,
          fontWeight: contentWeight,
          textDecoration: contentDecoration,
          textAlign,
        }}
      >
        {slide.content}
      </p>

      {slide.type !== 'lyrics' && slide.subtitle && (
        <p className="text-2xl text-gray-400 mt-4" style={{ textAlign }}>{slide.subtitle}</p>
      )}

      <div className="absolute bottom-4 right-6">
        {logoUrl
          ? (
            <Image
              src={logoUrl}
              alt="Church logo"
              width={80}
              height={40}
              unoptimized
              className="h-10 w-auto object-contain opacity-80"
            />
          )
          : <span className="text-3xl text-gray-200 select-none">✝</span>
        }
      </div>
    </div>
  )
}
