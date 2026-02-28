'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { SlideMini } from './slide-mini'
import { usePresentationStore } from '@/store/presentation-store'
import { savePresentation } from '@/actions/presentation-actions'
import { toast } from 'sonner'
import { ImagePlus, Loader2, Play, Save } from 'lucide-react'
import type { GenerateRequest, Slide } from '@/lib/types'

export function CreateForm() {
  const { slides, setSlides, setIsPresenting, currentSlide, setCurrentSlide } =
    usePresentationStore()

  const [form, setForm] = useState<Omit<GenerateRequest, 'songLyricsImage'>>({
    fellowshipDate: '',
    anchorName: '',
    sermonLeader: '',
    songLyricsText: '',
    bibleRef: '',
    bibleText: '',
    announcements: '',
    prayerPoints: '',
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageData, setImageData] = useState<{ base64: string; mediaType: string } | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setImagePreview(result)
      const [header, base64] = result.split(',')
      const mediaType = header.split(':')[1].split(';')[0]
      setImageData({ base64, mediaType })
    }
    reader.readAsDataURL(file)
  }

  async function handleGenerate() {
    if (!form.fellowshipDate) {
      toast.error('Please enter the fellowship date')
      return
    }

    setIsGenerating(true)
    try {
      const body: GenerateRequest = { ...form, songLyricsImage: imageData ?? undefined }

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error('Generation failed')

      const text = await res.text()
      // Strip any data stream prefix if present
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (!jsonMatch) throw new Error('Invalid response format')

      const parsedSlides: Slide[] = JSON.parse(jsonMatch[0])
      setSlides(parsedSlides)
      toast.success(`Generated ${parsedSlides.length} slides`)
    } catch {
      toast.error('Failed to generate slides. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleSave() {
    if (slides.length === 0) {
      toast.error('Generate slides first')
      return
    }

    const title = form.anchorName
      ? `Fellowship — ${form.anchorName}`
      : `Fellowship ${form.fellowshipDate}`

    setIsSaving(true)
    try {
      await savePresentation({ title, date: form.fellowshipDate, slides })
      toast.success('Presentation saved!')
    } catch {
      toast.error('Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-[#1a3a5c]">New Presentation</h1>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="fellowshipDate">Fellowship Date</Label>
            <Input
              id="fellowshipDate"
              name="fellowshipDate"
              type="date"
              value={form.fellowshipDate}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="anchorName">Anchor / Host Name</Label>
            <Input
              id="anchorName"
              name="anchorName"
              placeholder="e.g. John Doe"
              value={form.anchorName}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="sermonLeader">Sermon Leader</Label>
          <Input
            id="sermonLeader"
            name="sermonLeader"
            placeholder="e.g. Pastor Jane"
            value={form.sermonLeader}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-1">
          <Label>Song Lyrics</Label>
          <Textarea
            name="songLyricsText"
            placeholder="Paste lyrics here (verse 1, chorus, verse 2...)"
            rows={4}
            value={form.songLyricsText}
            onChange={handleChange}
          />
          <div className="flex items-center gap-2 mt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="w-4 h-4 mr-1" /> Upload lyrics image
            </Button>
            {imagePreview && (
              <span className="text-xs text-green-600">Image attached ✓</span>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="bibleRef">Bible Reference</Label>
            <Input
              id="bibleRef"
              name="bibleRef"
              placeholder="e.g. John 3:16"
              value={form.bibleRef}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="bibleText">Bible Text</Label>
            <Input
              id="bibleText"
              name="bibleText"
              placeholder="Verse text..."
              value={form.bibleText}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="announcements">Announcements</Label>
          <Textarea
            id="announcements"
            name="announcements"
            placeholder="List announcements..."
            rows={3}
            value={form.announcements}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="prayerPoints">Prayer Points</Label>
          <Textarea
            id="prayerPoints"
            name="prayerPoints"
            placeholder="Prayer points..."
            rows={3}
            value={form.prayerPoints}
            onChange={handleChange}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button onClick={handleGenerate} disabled={isGenerating} className="flex-1">
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...
              </>
            ) : (
              'Generate Slides'
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsPresenting(true)}
            disabled={slides.length === 0}
          >
            <Play className="w-4 h-4 mr-1" /> Present
          </Button>
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={slides.length === 0 || isSaving}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Slide preview */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1a3a5c]">
          {slides.length > 0 ? `${slides.length} Slides` : 'Preview'}
        </h2>
        {slides.length === 0 ? (
          <Card className="h-48 flex items-center justify-center text-muted-foreground text-sm">
            Slides will appear here after generation
          </Card>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {slides.map((slide, i) => (
              <SlideMini
                key={slide.id}
                slide={slide}
                index={i}
                isActive={i === currentSlide}
                onClick={() => setCurrentSlide(i)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
