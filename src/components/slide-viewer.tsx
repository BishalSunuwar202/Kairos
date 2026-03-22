'use client'

import { useEffect, useRef, useState } from 'react'
import { usePresentationStore } from '@/store/presentation-store'
import { SlideDisplay } from './slide-display'
import { SlideMini } from './slide-mini'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, FileDown, FileText, LayoutPanelLeft, Maximize2, Minimize2, Plus, RotateCcw, X } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { QuickAddModal } from './quick-add-modal'
import { toast } from 'sonner'
import type { ProjectorSessionState } from '@/lib/types'

const CHANNEL_NAME = 'kairos-projector'
const STORAGE_KEY = 'kairos_projector_session'

export function SlideViewer() {
  const { slides, currentSlide, isPresenting, setIsPresenting, nextSlide, prevSlide, setCurrentSlide } =
    usePresentationStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const projectorWindowRef = useRef<Window | null>(null)
  const projectorChannelRef = useRef<BroadcastChannel | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showNextPanel, setShowNextPanel] = useState(true)
  const [showSlideGrid, setShowSlideGrid] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    setLogoUrl(localStorage.getItem('kairos_church_logo'))
  }, [isPresenting])

  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return
    projectorChannelRef.current = new BroadcastChannel(CHANNEL_NAME)

    return () => {
      projectorChannelRef.current?.close()
      projectorChannelRef.current = null
    }
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isPresenting) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextSlide()
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prevSlide()
      if (e.key === 'Escape') setIsPresenting(false)
    }

    function handleFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement)
    }

    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [isPresenting, nextSlide, prevSlide, setIsPresenting])

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (!isPresenting || slides.length === 0) {
      const inactiveSession: ProjectorSessionState | null = null
      window.localStorage.removeItem(STORAGE_KEY)
      projectorChannelRef.current?.postMessage(inactiveSession)
      if (projectorWindowRef.current && !projectorWindowRef.current.closed) {
        projectorWindowRef.current.close()
      }
      projectorWindowRef.current = null
      return
    }

    const session: ProjectorSessionState = {
      sessionId: 'live',
      slides,
      currentSlide,
      title: 'Live Presentation',
      logoUrl,
      isActive: true,
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    projectorChannelRef.current?.postMessage(session)
  }, [currentSlide, isPresenting, logoUrl, slides])

  useEffect(() => {
    if (!isPresenting || typeof window === 'undefined') return

    const projectorUrl = `${window.location.origin}/projector`
    const popup = window.open(projectorUrl, 'kairos-projector', 'popup=yes,width=1280,height=720')

    if (!popup) {
      toast.error('Projector window was blocked. Allow pop-ups to use presenter mode.')
      return
    }

    projectorWindowRef.current = popup
    popup.focus()
  }, [isPresenting])

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
            <SlideDisplay slide={s} logoUrl={logoUrl} />
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
        {/* All slides grid overlay */}
        {showSlideGrid && (
          <div className="absolute inset-0 z-10 bg-gray-950/95 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <p className="text-sm font-semibold text-white">All Slides ({slides.length})</p>
              <button onClick={() => setShowSlideGrid(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto">
                {slides.map((s, i) => (
                  <SlideMini
                    key={s.id}
                    slide={s}
                    index={i}
                    isActive={i === currentSlide}
                    onClick={() => { setCurrentSlide(i); setShowSlideGrid(false) }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-hidden flex">
          {/* Current slide */}
          <div className="flex-1 overflow-hidden">
            <SlideDisplay slide={slide} logoUrl={logoUrl} />
          </div>

          {/* Next slide panel — hidden in fullscreen or when toggled off */}
          <div className={`w-96 bg-gray-950 flex flex-col gap-4 p-5 shrink-0 border-l border-gray-800 ${isFullscreen || !showNextPanel ? 'hidden' : ''}`}>
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Up Next</p>
              <button onClick={() => setShowNextPanel(false)} className="text-gray-600 hover:text-gray-400 transition-colors" title="Close panel">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {slides[currentSlide + 1] ? (
              <>
                <div className="aspect-video w-full overflow-hidden rounded-lg shadow-lg ring-1 ring-white/10">
                  <SlideDisplay slide={slides[currentSlide + 1]} logoUrl={logoUrl} />
                </div>
                <p className="text-xs text-gray-600 text-center tabular-nums">
                  {currentSlide + 2} / {slides.length}
                </p>
              </>
            ) : (
              <div className="aspect-video w-full flex items-center justify-center rounded-lg ring-1 ring-white/10 bg-gray-900">
                <p className="text-xs text-gray-600 text-center px-3">End of presentation</p>
              </div>
            )}
          </div>
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
            {!isFullscreen && (
              <Button
                variant={showNextPanel ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setShowNextPanel((v) => !v)}
                title={showNextPanel ? 'Hide next slide panel' : 'Show next slide panel'}
              >
                <LayoutPanelLeft className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setShowSlideGrid(true)} title="See all slides">
              All Slides
            </Button>
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
