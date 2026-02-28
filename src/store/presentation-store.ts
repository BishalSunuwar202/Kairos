import { create } from 'zustand'
import type { Slide } from '@/lib/types'

interface PresentationStore {
  slides: Slide[]
  setSlides: (slides: Slide[]) => void

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
