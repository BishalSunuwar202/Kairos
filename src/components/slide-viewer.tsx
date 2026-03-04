'use client'

import { useEffect, useRef, useState } from 'react'
import { usePresentationStore } from '@/store/presentation-store'
import { SlideDisplay } from './slide-display'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, FileDown, FileText, Maximize2, Minimize2, Plus, RotateCcw, X } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { QuickAddModal } from './quick-add-modal'

export function SlideViewer() {
  const { slides, currentSlide, isPresenting, setIsPresenting, nextSlide, prevSlide, setCurrentSlide } =
    usePresentationStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const isFullscreen = typeof document !== 'undefined' && !!document.fullscreenElement
  const [showAddModal, setShowAddModal] = useState(false)

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
    <>
      {/* Hidden print container — all slides rendered for @media print */}
      <div className="print-slides hidden">
        {slides.map((s) => (
          <div key={s.id} className="print-slide">
            <SlideDisplay slide={s} />
          </div>
        ))}
      </div>

      <QuickAddModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        afterIndex={currentSlide}
      />

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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentSlide(0)}
              disabled={currentSlide === 0}
              title="Restart from beginning"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentSlide(Math.floor((slides.length - 1) / 2))}
              title="Jump to middle slide"
            >
              Mid
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowAddModal(true)} title="Add slide">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" title="Export">
                  <FileDown className="w-4 h-4 mr-1" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => window.print()}>
                  <FileText className="w-4 h-4 mr-2" /> Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={async () => {
                  const { exportToPptx } = await import('@/lib/export-pptx')
                  await exportToPptx(slides)
                }}>
                  <FileDown className="w-4 h-4 mr-2" /> Export as PowerPoint
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
