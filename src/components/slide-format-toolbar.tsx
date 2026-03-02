'use client'

import { useState } from 'react'
import { usePresentationStore } from '@/store/presentation-store'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from 'lucide-react'
import type { SlideFormat } from '@/lib/types'

function SizeControl({
  value,
  defaultValue,
  onChange,
}: {
  value: number | undefined
  defaultValue: number
  onChange: (v: number) => void
}) {
  const current = value ?? defaultValue
  return (
    <div className="flex items-center gap-1">
      <Button variant="outline" size="icon" className="h-7 w-7 text-xs" onClick={() => onChange(Math.max(10, current - 2))}>−</Button>
      <span className="w-8 text-center text-sm font-mono">{current}</span>
      <Button variant="outline" size="icon" className="h-7 w-7 text-xs" onClick={() => onChange(current + 2)}>+</Button>
    </div>
  )
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Button
      variant="outline"
      size="icon"
      className={`h-7 w-7 text-xs ${active ? 'bg-[#1a3a5c] text-white border-[#1a3a5c]' : ''}`}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

function ColorPicker({ value, defaultValue, onChange }: { value: string | undefined; defaultValue: string; onChange: (v: string) => void }) {
  return (
    <input
      type="color"
      value={value ?? defaultValue}
      onChange={(e) => onChange(e.target.value)}
      className="h-7 w-7 cursor-pointer rounded border border-input p-0.5"
    />
  )
}

export function SlideFormatToolbar() {
  const { slides, currentSlide, updateSlide, applyFormatToAll } = usePresentationStore()
  const [scope, setScope] = useState<'this' | 'all'>('this')

  const slide = slides[currentSlide]
  if (!slide) return null

  const fmt: SlideFormat = slide.format ?? {}

  function update(patch: Partial<SlideFormat>) {
    if (scope === 'all') {
      applyFormatToAll(patch)
    } else {
      updateSlide(currentSlide, { format: { ...fmt, ...patch } })
    }
  }

  return (
    <div className="border rounded-lg p-3 space-y-3 bg-gray-50 text-sm">
      {/* Header + scope toggle */}
      <div className="flex items-center justify-between">
        <p className="font-semibold text-[#1a3a5c] text-xs uppercase tracking-wide">Format</p>
        <div className="flex items-center gap-1 bg-gray-200 rounded p-0.5">
          <button
            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${scope === 'this' ? 'bg-white text-[#1a3a5c] shadow-sm' : 'text-gray-500'}`}
            onClick={() => setScope('this')}
          >
            This slide
          </button>
          <button
            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${scope === 'all' ? 'bg-white text-[#1a3a5c] shadow-sm' : 'text-gray-500'}`}
            onClick={() => setScope('all')}
          >
            All slides
          </button>
        </div>
      </div>

      {scope === 'all' && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1">
          Changes will apply to every slide
        </p>
      )}

      {/* Background */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 w-20">Background</span>
        <ColorPicker value={fmt.backgroundColor} defaultValue="#ffffff" onChange={(v) => update({ backgroundColor: v })} />
      </div>

      <Separator />

      {/* Title */}
      <p className="text-xs font-medium text-gray-500">Title</p>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-400 w-10">Size</span>
        <SizeControl value={fmt.titleSize} defaultValue={48} onChange={(v) => update({ titleSize: v })} />
        <ToggleButton active={fmt.titleBold !== false} onClick={() => update({ titleBold: fmt.titleBold === false ? true : false })}>
          <strong>B</strong>
        </ToggleButton>
        <ToggleButton active={!!fmt.titleUnderline} onClick={() => update({ titleUnderline: !fmt.titleUnderline })}>
          <span className="underline">U</span>
        </ToggleButton>
        <ColorPicker value={fmt.titleColor} defaultValue="#1a3a5c" onChange={(v) => update({ titleColor: v })} />
      </div>

      <Separator />

      {/* Content */}
      <p className="text-xs font-medium text-gray-500">Content</p>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-400 w-10">Size</span>
        <SizeControl value={fmt.contentSize} defaultValue={30} onChange={(v) => update({ contentSize: v })} />
        <ToggleButton active={!!fmt.contentBold} onClick={() => update({ contentBold: !fmt.contentBold })}>
          <strong>B</strong>
        </ToggleButton>
        <ToggleButton active={!!fmt.contentUnderline} onClick={() => update({ contentUnderline: !fmt.contentUnderline })}>
          <span className="underline">U</span>
        </ToggleButton>
        <ColorPicker value={fmt.contentColor} defaultValue="#374151" onChange={(v) => update({ contentColor: v })} />
      </div>

      <Separator />

      {/* Padding */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 w-10">Padding</span>
        <SizeControl value={fmt.padding} defaultValue={48} onChange={(v) => update({ padding: v })} />
      </div>

      <Separator />

      {/* Vertical alignment */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 w-10">V Align</span>
        <ToggleButton active={(fmt.verticalAlign ?? 'center') === 'top'} onClick={() => update({ verticalAlign: 'top' })}>
          <AlignVerticalJustifyStart className="w-3 h-3" />
        </ToggleButton>
        <ToggleButton active={(fmt.verticalAlign ?? 'center') === 'center'} onClick={() => update({ verticalAlign: 'center' })}>
          <AlignVerticalJustifyCenter className="w-3 h-3" />
        </ToggleButton>
        <ToggleButton active={(fmt.verticalAlign ?? 'center') === 'bottom'} onClick={() => update({ verticalAlign: 'bottom' })}>
          <AlignVerticalJustifyEnd className="w-3 h-3" />
        </ToggleButton>
      </div>

      <Separator />

      {/* Horizontal text alignment */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 w-10">Text</span>
        <ToggleButton active={(fmt.textAlign ?? 'center') === 'left'} onClick={() => update({ textAlign: 'left' })}>
          <AlignLeft className="w-3 h-3" />
        </ToggleButton>
        <ToggleButton active={(fmt.textAlign ?? 'center') === 'center'} onClick={() => update({ textAlign: 'center' })}>
          <AlignCenter className="w-3 h-3" />
        </ToggleButton>
        <ToggleButton active={(fmt.textAlign ?? 'center') === 'right'} onClick={() => update({ textAlign: 'right' })}>
          <AlignRight className="w-3 h-3" />
        </ToggleButton>
        <ToggleButton active={fmt.textAlign === 'justify'} onClick={() => update({ textAlign: 'justify' })}>
          <AlignJustify className="w-3 h-3" />
        </ToggleButton>
      </div>
    </div>
  )
}
