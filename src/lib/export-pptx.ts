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
}

function hexNoHash(hex: string): string {
  return hex.replace('#', '')
}

function pxToPt(px: number): number {
  return Math.round(px * 0.75)
}

function pxToIn(px: number): number {
  return px / 96
}

export async function exportToPptx(slides: Slide[], fileName = 'kairos-presentation'): Promise<void> {
  const PptxGenJS = (await import('pptxgenjs')).default
  const pptx = new PptxGenJS()

  pptx.layout = 'LAYOUT_WIDE' // 13.33" x 7.5" (16:9)

  for (const slide of slides) {
    const fmt = slide.format ?? {}

    const bg = fmt.backgroundColor ?? '#ffffff'
    const pad = pxToIn(fmt.padding ?? 48)
    const borderColor = SLIDE_COLORS[slide.type]
    const typeLabel = TYPE_LABELS[slide.type]

    const titleSizePt = pxToPt(fmt.titleSize ?? 48)
    const titleColor = hexNoHash(fmt.titleColor ?? '#1a3a5c')
    const titleBold = fmt.titleBold !== false
    const titleUnderline = fmt.titleUnderline ?? false

    const contentSizePt = pxToPt(fmt.contentSize ?? 30)
    const contentColor = hexNoHash(fmt.contentColor ?? '#374151')
    const contentBold = fmt.contentBold ?? false
    const contentUnderline = fmt.contentUnderline ?? false

    const textAlign = fmt.textAlign ?? 'center'
    const valignMap = { top: 'top', center: 'middle', bottom: 'bottom' } as const
    const valign = valignMap[fmt.verticalAlign ?? 'center']

    const slideWidth = 13.33
    const slideHeight = 7.5
    const contentWidth = slideWidth - pad * 2

    const pptSlide = pptx.addSlide()
    pptSlide.background = { color: hexNoHash(bg) }

    // Top colored border bar
    pptSlide.addShape('rect' as Parameters<typeof pptSlide.addShape>[0], {
      x: 0,
      y: 0,
      w: slideWidth,
      h: 0.15,
      fill: { color: hexNoHash(borderColor) },
      line: { color: hexNoHash(borderColor), width: 0 },
    })

    // Type label (top-left)
    pptSlide.addText(typeLabel, {
      x: pad,
      y: 0.2,
      w: 4,
      h: 0.3,
      fontSize: 8,
      color: '9CA3AF',
      bold: false,
      align: 'left',
    })

    // Title
    pptSlide.addText(slide.title, {
      x: pad,
      y: 0.6,
      w: contentWidth,
      h: 2.0,
      fontSize: titleSizePt,
      color: titleColor,
      bold: titleBold,
      underline: { style: titleUnderline ? 'sng' : 'none' },
      align: textAlign as 'left' | 'center' | 'right' | 'justify',
      valign: 'top',
      wrap: true,
    })

    // Lyrics subtitle (song section marker)
    if (slide.type === 'lyrics' && slide.subtitle) {
      pptSlide.addText(slide.subtitle, {
        x: pad,
        y: 2.65,
        w: contentWidth,
        h: 0.3,
        fontSize: 8,
        color: '9CA3AF',
        bold: true,
        align: textAlign as 'left' | 'center' | 'right' | 'justify',
      })
    }

    // Content
    pptSlide.addText(slide.content, {
      x: pad,
      y: 2.9,
      w: contentWidth,
      h: 3.6,
      fontSize: contentSizePt,
      color: contentColor,
      bold: contentBold,
      underline: { style: contentUnderline ? 'sng' : 'none' },
      align: textAlign as 'left' | 'center' | 'right' | 'justify',
      valign,
      wrap: true,
    })

    // Non-lyrics subtitle (e.g. bible reference)
    if (slide.type !== 'lyrics' && slide.subtitle) {
      pptSlide.addText(slide.subtitle, {
        x: pad,
        y: 6.6,
        w: contentWidth,
        h: 0.4,
        fontSize: 18,
        color: '9CA3AF',
        align: textAlign as 'left' | 'center' | 'right' | 'justify',
      })
    }

    // Cross symbol (bottom-right)
    pptSlide.addText('✝', {
      x: 12.3,
      y: 6.8,
      w: 0.8,
      h: 0.5,
      fontSize: 20,
      color: 'E5E7EB',
      align: 'right',
    })
  }

  await pptx.writeFile({ fileName: `${fileName}.pptx` })
}
