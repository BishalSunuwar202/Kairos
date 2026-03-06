'use client'

import { useEffect, useRef, useState } from 'react'
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
import { ImageIcon, Loader2, Play, Plus, Save, Trash2, X } from 'lucide-react'
import type { BibleEntry, GenerateRequest, Slide, SongEntry } from '@/lib/types'
import { DEMO_SLIDES } from '@/lib/demo-slides'

interface SongState {
  number: string
  title: string
  lyricsText: string
}

function emptySong(): SongState {
  return { number: '', title: '', lyricsText: '' }
}

export function CreateForm() {
  const { slides, setSlides, setIsPresenting, currentSlide, setCurrentSlide } =
    usePresentationStore()

  const [form, setForm] = useState({
    fellowshipDate: '',
    anchorName: '',
    sermonLeader: '',
    announcements: '',
    prayerPoints: '',
  })
  const [songs, setSongs] = useState<SongState[]>([emptySong()])
  const [bibleRefs, setBibleRefs] = useState<BibleEntry[]>([{ ref: '', text: '' }])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [fetchingBible, setFetchingBible] = useState<number | null>(null)
  const [fetchingSong, setFetchingSong] = useState<number | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLogoUrl(localStorage.getItem('kairos_church_logo'))
  }, [])

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      localStorage.setItem('kairos_church_logo', dataUrl)
      setLogoUrl(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  function removeLogo() {
    localStorage.removeItem('kairos_church_logo')
    setLogoUrl(null)
    if (logoInputRef.current) logoInputRef.current.value = ''
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function updateSong(index: number, field: keyof SongState, value: string) {
    setSongs((prev) => prev.map((s, i) => i === index ? { ...s, [field]: value } : s))
  }

  function addSong() {
    setSongs((prev) => [...prev, emptySong()])
  }

  function removeSong(index: number) {
    setSongs((prev) => prev.filter((_, i) => i !== index))
  }

  function updateBibleRef(index: number, field: keyof BibleEntry, value: string) {
    setBibleRefs(prev => prev.map((b, i) => i === index ? { ...b, [field]: value } : b))
  }

  function addBibleRef() {
    setBibleRefs(prev => [...prev, { ref: '', text: '' }])
  }

  function removeBibleRef(index: number) {
    setBibleRefs(prev => prev.filter((_, i) => i !== index))
  }

  async function handleFetchBible(index: number) {
    const ref = bibleRefs[index].ref.trim()
    if (!ref) return
    setFetchingBible(index)
    try {
      const result = await lookupBible(ref)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        updateBibleRef(index, 'text', result.text)
        toast.success('Verse fetched')
      }
    } finally {
      setFetchingBible(null)
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
          result.source === 'library' ? 'Found in song library' : 'Found on nepalichristiansongs.com'
        )
      } else {
        toast.error('Song not found. Try a different title or number.')
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
      }))

      const body: GenerateRequest = { ...form, songs: songEntries, bibleRefs }

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
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">New Presentation</h1>
          <p className="text-sm text-gray-500 mt-0.5">Fill in the details below to generate slides</p>
        </div>

        {/* Church Logo */}
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50">
          {logoUrl ? (
            <img src={logoUrl} alt="Church logo" className="h-12 w-12 object-contain rounded" />
          ) : (
            <div className="h-12 w-12 rounded border-2 border-dashed border-gray-300 flex items-center justify-center bg-white">
              <ImageIcon className="w-5 h-5 text-gray-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700">Church Logo</p>
            <p className="text-xs text-gray-400">Shown in bottom-right of every slide</p>
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoUpload}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => logoInputRef.current?.click()}>
            {logoUrl ? 'Change' : 'Upload'}
          </Button>
          {logoUrl && (
            <Button type="button" variant="ghost" size="sm" onClick={removeLogo} className="text-gray-400 hover:text-red-500 px-2">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

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
                  className="h-8 text-sm w-14 shrink-0"
                  type="number"
                  min="1"
                />
                <Input
                  placeholder="Song title (e.g. यीशु नाम)"
                  value={song.title}
                  onChange={(e) => updateSong(i, 'title', e.target.value)}
                  className="h-8 text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs shrink-0"
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
                    className="h-8 w-8 shrink-0 text-gray-400 hover:text-red-500"
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
            </Card>
          ))}
        </div>

        <hr className="border-gray-100" />

        {/* Bible References */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Bible References</Label>
            <Button type="button" variant="outline" size="sm" onClick={addBibleRef}>
              <Plus className="w-3 h-3 mr-1" /> Add reference
            </Button>
          </div>

          {bibleRefs.map((bible, i) => (
            <div key={i} className="space-y-1">
              <div className="flex gap-1">
                <Input
                  placeholder="e.g. John 3:16"
                  value={bible.ref}
                  onChange={(e) => updateBibleRef(i, 'ref', e.target.value)}
                  className="h-8 text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs shrink-0"
                  disabled={!bible.ref.trim() || fetchingBible === i}
                  onClick={() => handleFetchBible(i)}
                >
                  {fetchingBible === i ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Fetch'}
                </Button>
                {bibleRefs.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-gray-400 hover:text-red-500"
                    onClick={() => removeBibleRef(i)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
              <Input
                placeholder="Verse text (auto-filled or type)"
                value={bible.text}
                onChange={(e) => updateBibleRef(i, 'text', e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          ))}
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
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#1a3a5c]">
            {slides.length > 0 ? `${slides.length} Slides` : 'Preview'}
          </h2>
          <Button variant="outline" size="sm" onClick={() => setSlides(DEMO_SLIDES)}>
            Try Demo
          </Button>
        </div>
        {slides.length === 0 ? (
          <Card className="h-48 flex items-center justify-center text-muted-foreground text-sm">
            Fill in the form and click Generate Slides
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
