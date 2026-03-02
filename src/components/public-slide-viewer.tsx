'use client'

import { useEffect, useState } from 'react'
import { SlideDisplay } from './slide-display'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Slide } from '@/lib/types'

interface PublicSlideViewerProps {
  slides: Slide[]
  title: string
}

export function PublicSlideViewer({ slides, title }: PublicSlideViewerProps) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown')
        setCurrent((c) => Math.min(c + 1, slides.length - 1))
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp')
        setCurrent((c) => Math.max(c - 1, 0))
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [slides.length])

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-hidden">
        <SlideDisplay slide={slides[current]} />
      </div>

      <div className="flex items-center justify-between px-6 py-3 border-t bg-white">
        <p className="text-sm font-medium text-[#1a3a5c] truncate max-w-xs">{title}</p>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrent((c) => Math.max(c - 1, 0))}
            disabled={current === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Badge variant="secondary">
            {current + 1} / {slides.length}
          </Badge>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrent((c) => Math.min(c + 1, slides.length - 1))}
            disabled={current === slides.length - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-xs text-gray-400">✝ Kairos</p>
      </div>
    </div>
  )
}
