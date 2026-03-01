'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { SlideMini } from './slide-mini'
import { SlideFormatToolbar } from './slide-format-toolbar'
import { usePresentationStore } from '@/store/presentation-store'
import { savePresentation } from '@/actions/presentation-actions'
import { lookupBible, lookupSong } from '@/actions/lookup-actions'
import { toast } from 'sonner'
import { ImagePlus, Loader2, Play, Plus, Save, Trash2 } from 'lucide-react'
import type { GenerateRequest, Slide, SongEntry } from '@/lib/types'

interface SongState {
  number: string
  title: string
  lyricsText: string
  imagePreview: string | null
  imageData: { base64: string; mediaType: string } | null
}

function emptySong(): SongState {
  return { number: '', title: '', lyricsText: '', imagePreview: null, imageData: null }
}

export function CreateForm() {
  const { slides, setSlides, setIsPresenting, currentSlide, setCurrentSlide } =
    usePresentationStore()

  const [form, setForm] = useState({
    fellowshipDate: '',
    anchorName: '',
    sermonLeader: '',
    bibleRef: '',
    bibleText: '',
    announcements: '',
    prayerPoints: '',
  })
  const [songs, setSongs] = useState<SongState[]>([emptySong()])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isFetchingBible, setIsFetchingBible] = useState(false)
  const [fetchingSong, setFetchingSong] = useState<number | null>(null)
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function updateSong(index: number, field: keyof Pick<SongState, 'number' | 'title' | 'lyricsText'>, value: string) {
    setSongs((prev) => prev.map((s, i) => i === index ? { ...s, [field]: value } : s))
  }

  function addSong() {
    setSongs((prev) => [...prev, emptySong()])
  }

  function removeSong(index: number) {
    setSongs((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSongImage(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const [header, base64] = result.split(',')
      const mediaType = header.split(':')[1].split(';')[0]
      setSongs((prev) =>
        prev.map((s, i) =>
          i === index ? { ...s, imagePreview: result, imageData: { base64, mediaType } } : s
        )
      )
    }
    reader.readAsDataURL(file)
  }

  async function handleFetchBible() {
    if (!form.bibleRef.trim()) return
    setIsFetchingBible(true)
    try {
      const result = await lookupBible(form.bibleRef.trim())
      if ('error' in result) {
        toast.error(result.error)
      } else {
        setForm(prev => ({ ...prev, bibleText: result.text }))
        toast.success('Verse fetched (English KJV)')
      }
    } finally {
      setIsFetchingBible(false)
    }
  }

  async function handleFetchSong(index: number) {
    const song = songs[index]
    const hasQuery = song.title.trim() || song.number.trim()
    if (!hasQuery) return

    setFetchingSong(index)
    try {
      const result = await lookupSong({
        title: song.title.trim() || undefined,
        number: song.number ? parseInt(song.number) : undefined,
      })
      if (result.found) {
        updateSong(index, 'lyricsText', result.lyrics)
        toast.success(
          result.source === 'library' ? 'Found in your Song Library' : 'Found on nepalichristiansongs.com'
        )
      } else {
        toast.error('Not in Song Library. Add it at /songs, then Fetch again.')
      }
    } finally {
      setFetchingSong(null)
    }
  }

  async function handleGenerate() {
    if (!form.fellowshipDate) {
      toast.error('Please enter the fellowship date')
      return
    }

    setIsGenerating(true)
    try {
      const songEntries: SongEntry[] = songs.map((s) => ({
        title: s.title,
        lyricsText: s.lyricsText,
        ...(s.imageData ? { image: s.imageData } : {}),
      }))

      const body: GenerateRequest = { ...form, songs: songEntries }

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error('Generation failed')

      const { slides: parsedSlides } = await res.json() as { slides: Slide[] }
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

        {/* Songs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Song Lyrics</Label>
            <Button type="button" variant="outline" size="sm" onClick={addSong}>
              <Plus className="w-3 h-3 mr-1" /> Add song
            </Button>
          </div>

          {songs.map((song, i) => (
            <Card key={i} className="p-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-[#1a3a5c] shrink-0">Song {i + 1}</span>
                <Input
                  placeholder="#"
                  value={song.number}
                  onChange={(e) => updateSong(i, 'number', e.target.value)}
                  className="h-7 text-sm w-14 shrink-0"
                  type="number"
                  min="1"
                />
                <Input
                  placeholder="Song title (e.g. यीशु नाम)"
                  value={song.title}
                  onChange={(e) => updateSong(i, 'title', e.target.value)}
                  className="h-7 text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs shrink-0"
                  disabled={(!song.title.trim() && !song.number.trim()) || fetchingSong === i}
                  onClick={() => handleFetchSong(i)}
                >
                  {fetchingSong === i ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Fetch'}
                </Button>
                {songs.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-gray-400 hover:text-red-500"
                    onClick={() => removeSong(i)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>

              <Textarea
                placeholder="Paste lyrics here, or use Fetch to auto-fill"
                rows={3}
                value={song.lyricsText}
                onChange={(e) => updateSong(i, 'lyricsText', e.target.value)}
                className="text-sm"
              />

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => fileInputRefs.current[i]?.click()}
                >
                  <ImagePlus className="w-3 h-3 mr-1" /> Upload image
                </Button>
                {song.imagePreview && (
                  <span className="text-xs text-green-600">Image attached ✓</span>
                )}
                <input
                  ref={(el) => { fileInputRefs.current[i] = el }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleSongImage(i, e)}
                />
              </div>
            </Card>
          ))}
        </div>

        {/* Bible */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="bibleRef">Bible Reference</Label>
            <div className="flex gap-1">
              <Input
                id="bibleRef"
                name="bibleRef"
                placeholder="e.g. John 3:16"
                value={form.bibleRef}
                onChange={handleChange}
                className="h-9"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 h-9"
                disabled={!form.bibleRef.trim() || isFetchingBible}
                onClick={handleFetchBible}
              >
                {isFetchingBible ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Fetch'}
              </Button>
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="bibleText">Bible Text</Label>
            <Input
              id="bibleText"
              name="bibleText"
              placeholder="Auto-filled or type verse..."
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
          <>
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
            <SlideFormatToolbar />
          </>
        )}
      </div>
    </div>
  )
}
