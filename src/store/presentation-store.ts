import { create } from 'zustand'
import type { Slide, SlideFormat } from '@/lib/types'

interface PresentationStore {
  slides: Slide[]
  setSlides: (slides: Slide[]) => void
  updateSlide: (index: number, updates: Partial<Slide>) => void
  insertSlide: (afterIndex: number, slide: Omit<Slide, 'id'>) => void
  applyFormatToAll: (patch: Partial<SlideFormat>) => void

  isPresenting: boolean
  setIsPresenting: (value: boolean) => void

  currentSlide: number
  setCurrentSlide: (index: number) => void
  nextSlide: () => void
  prevSlide: () => void
}

export const usePresentationStore = create<PresentationStore>((set, get) => ({
  slides: [],
  setSlides: (slides) => set({ slides, currentSlide: 0 }),
  updateSlide: (index, updates) => {
    const slides = [...get().slides]
    slides[index] = { ...slides[index], ...updates }
    set({ slides })
  },
  insertSlide: (afterIndex, slide) => {
    const slides = [...get().slides]
    const newSlide = { ...slide, id: Date.now() }
    slides.splice(afterIndex + 1, 0, newSlide)
    set({ slides, currentSlide: afterIndex + 1 })
  },
  applyFormatToAll: (patch) => {
    const slides = get().slides.map((s) => ({
      ...s,
      format: { ...(s.format ?? {}), ...patch },
    }))
    set({ slides })
  },

  isPresenting: false,
  setIsPresenting: (value) => set({ isPresenting: value }),

  currentSlide: 0,
  setCurrentSlide: (index) => set({ currentSlide: index }),
  nextSlide: () => {
    const { currentSlide, slides } = get()
    if (currentSlide < slides.length - 1) set({ currentSlide: currentSlide + 1 })
  },
  prevSlide: () => {
    const { currentSlide } = get()
    if (currentSlide > 0) set({ currentSlide: currentSlide - 1 })
  },
}))
