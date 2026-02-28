'use client'

import { useEffect, useRef } from 'react'
import { usePresentationStore } from '@/store/presentation-store'
import { SlideDisplay } from './slide-display'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, X } from 'lucide-react'

export function SlideViewer() {
  const { slides, currentSlide, isPresenting, setIsPresenting, nextSlide, prevSlide } =
    usePresentationStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const isFullscreen = typeof document !== 'undefined' && !!document.fullscreenElement

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isPresenting) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextSlide()
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prevSlide()
      if (e.key === 'Escape') setIsPresenting(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPresenting, nextSlide, prevSlide, setIsPresenting])

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  if (!isPresenting || slides.length === 0) return null

  const slide = slides[currentSlide]

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-white flex flex-col"
    >
      <div className="flex-1 overflow-hidden">
        <SlideDisplay slide={slide} />
      </div>

      <div className="flex items-center justify-between px-6 py-3 border-t bg-white">
        <Button variant="ghost" size="sm" onClick={() => setIsPresenting(false)}>
          <X className="w-4 h-4 mr-1" /> Exit
        </Button>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={prevSlide} disabled={currentSlide === 0}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Badge variant="secondary">
            {currentSlide + 1} / {slides.length}
          </Badge>
          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  )
}
