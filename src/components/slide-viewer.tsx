'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePresentationStore } from '@/store/presentation-store'
import { SlideDisplay } from './slide-display'
import { SlideMini } from './slide-mini'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, FileDown, FileText, LayoutPanelLeft, Maximize2, Minimize2, Minus, Monitor, Plus, RotateCcw, X } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { QuickAddModal } from './quick-add-modal'
import { toast } from 'sonner'
import type { ProjectorSessionState, Slide } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

const CHANNEL_NAME = 'kairos-projector'
const STORAGE_KEY = 'kairos_projector_session'
const LINES_PER_SLIDE = 4

interface DisplaySlide extends Slide {
  _originalIndex: number
}

function splitSlidesForDisplay(slides: Slide[]): DisplaySlide[] {
  const result: DisplaySlide[] = []
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i]
    const lines = (slide.content ?? '').split('\n').filter(l => l.trim() !== '')
    if (lines.length <= LINES_PER_SLIDE) {
      result.push({ ...slide, _originalIndex: i })
    } else {
      for (let j = 0; j < lines.length; j += LINES_PER_SLIDE) {
        result.push({
          ...slide,
          id: j === 0 ? slide.id : -(slide.id + j),
          content: lines.slice(j, j + LINES_PER_SLIDE).join('\n'),
          subtitle: j === 0 ? slide.subtitle : undefined,
          _originalIndex: i,
        })
      }
    }
  }
  return result
}

export function SlideViewer() {
  const { slides, currentSlide: storeCurrentSlide, isPresenting, setIsPresenting, isDemoMode } =
    usePresentationStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const projectorWindowRef = useRef<Window | null>(null)
  const projectorChannelRef = useRef<BroadcastChannel | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showNextPanel, setShowNextPanel] = useState(true)
  const [showSlideGrid, setShowSlideGrid] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [presenterTitleSize, setPresenterTitleSize] = useState(80)
  const [presenterContentSize, setPresenterContentSize] = useState(52)

  const displaySlides = useMemo(() => splitSlidesForDisplay(slides), [slides])
  const [displayIndex, setDisplayIndex] = useState(0)

  // Sync displayIndex when store's currentSlide changes (e.g. after QuickAddModal insert)
  useEffect(() => {
    const idx = displaySlides.findIndex(ds => ds._originalIndex === storeCurrentSlide)
    if (idx >= 0) setDisplayIndex(idx)
  }, [storeCurrentSlide, displaySlides])

  // Clamp displayIndex when displaySlides shrinks
  useEffect(() => {
    if (displayIndex >= displaySlides.length) {
      setDisplayIndex(Math.max(0, displaySlides.length - 1))
    }
  }, [displaySlides.length, displayIndex])

  const nextDisplay = useCallback(() => {
    setDisplayIndex(i => Math.min(i + 1, displaySlides.length - 1))
  }, [displaySlides.length])

  const prevDisplay = useCallback(() => {
    setDisplayIndex(i => Math.max(i - 1, 0))
  }, [])

  function handleDemoSignIn() {
    const supabase = createClient()
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
        queryParams: { prompt: 'select_account' },
      },
    })
  }

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
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextDisplay()
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prevDisplay()
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
  }, [isPresenting, nextDisplay, prevDisplay, setIsPresenting])

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (!isPresenting || displaySlides.length === 0) {
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
      slides: displaySlides.map(applyFontOverrides),
      currentSlide: displayIndex,
      title: 'Live Presentation',
      logoUrl,
      isActive: true,
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    projectorChannelRef.current?.postMessage(session)
  }, [displayIndex, isPresenting, logoUrl, displaySlides, presenterTitleSize, presenterContentSize])

  function applyFontOverrides(s: (typeof slides)[number]) {
    return {
      ...s,
      format: { ...s.format, titleSize: presenterTitleSize, contentSize: presenterContentSize },
    }
  }

  function openProjectorWindow() {
    const projectorUrl = `${window.location.origin}/projector`
    const popup = window.open(projectorUrl, 'kairos-projector', 'popup=yes,width=1280,height=720')
    if (!popup) {
      toast.error('Projector window was blocked. Allow pop-ups in your browser.')
      return
    }
    projectorWindowRef.current = popup
    popup.focus()
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  if (!isPresenting || displaySlides.length === 0) return null

  const slide = displaySlides[displayIndex]
  const originalIndex = slide?._originalIndex ?? 0

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
        afterIndex={originalIndex}
      />

      <div
        ref={containerRef}
        className="fixed inset-0 z-50 bg-white flex flex-col"
      >
        {/* All slides grid overlay */}
        {showSlideGrid && (
          <div className="absolute inset-0 z-10 bg-gray-950/95 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <p className="text-sm font-semibold text-white">All Slides ({displaySlides.length})</p>
              <button onClick={() => setShowSlideGrid(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto">
                {displaySlides.map((s, i) => (
                  <SlideMini
                    key={s.id}
                    slide={s}
                    index={i}
                    isActive={i === displayIndex}
                    onClick={() => { setDisplayIndex(i); setShowSlideGrid(false) }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-hidden flex">
          {/* Current slide */}
          <div className="flex-1 overflow-hidden">
            <SlideDisplay slide={applyFontOverrides(slide)} logoUrl={logoUrl} />
          </div>

          {/* Next slide panel — hidden in fullscreen or when toggled off */}
          <div className={`w-96 bg-gray-950 flex flex-col gap-4 p-5 shrink-0 border-l border-gray-800 ${isFullscreen || !showNextPanel ? 'hidden' : ''}`}>
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Up Next</p>
              <button onClick={() => setShowNextPanel(false)} className="text-gray-600 hover:text-gray-400 transition-colors" title="Close panel">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {displaySlides[displayIndex + 1] ? (
              <>
                <div className="aspect-video w-full overflow-hidden rounded-lg shadow-lg ring-1 ring-white/10">
                  <SlideDisplay slide={applyFontOverrides(displaySlides[displayIndex + 1])} logoUrl={logoUrl} />
                </div>
                <p className="text-xs text-gray-600 text-center tabular-nums">
                  {displayIndex + 2} / {displaySlides.length}
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
              onClick={() => setDisplayIndex(0)}
              disabled={displayIndex === 0}
              title="Restart from beginning"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={prevDisplay} disabled={displayIndex === 0}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Badge variant="secondary">
              {displayIndex + 1} / {displaySlides.length}
            </Badge>
            <Button
              variant="outline"
              size="icon"
              onClick={nextDisplay}
              disabled={displayIndex === displaySlides.length - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDisplayIndex(Math.floor((displaySlides.length - 1) / 2))}
              title="Jump to middle slide"
            >
              Mid
            </Button>
          </div>

          {/* Font size controls — presenter only */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400 font-medium w-4">T</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPresenterTitleSize(s => Math.max(20, s - 4))}>
                <Minus className="w-3 h-3" />
              </Button>
              <span className="text-xs w-7 text-center tabular-nums text-gray-600">{presenterTitleSize}</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPresenterTitleSize(s => s + 4)}>
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400 font-medium w-4">C</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPresenterContentSize(s => Math.max(12, s - 4))}>
                <Minus className="w-3 h-3" />
              </Button>
              <span className="text-xs w-7 text-center tabular-nums text-gray-600">{presenterContentSize}</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPresenterContentSize(s => s + 4)}>
                <Plus className="w-3 h-3" />
              </Button>
            </div>
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
            <Button variant="ghost" size="sm" onClick={openProjectorWindow} title="Open projector window on second screen">
              <Monitor className="w-4 h-4 mr-1" /> Projector
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

        {isDemoMode && (
          <div className="absolute bottom-16 left-0 right-0 flex justify-center z-50 pointer-events-none">
            <div className="bg-[#1a3a5c] border border-[#f59e0b] rounded-lg px-5 py-3 flex items-center gap-4 pointer-events-auto shadow-xl">
              <span className="text-white text-sm">Like what you see?</span>
              <button
                onClick={handleDemoSignIn}
                className="bg-[#f59e0b] text-[#1a3a5c] text-sm font-semibold px-4 py-1.5 rounded-md hover:bg-[#d97706] transition-colors"
              >
                Sign in to create your own
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
