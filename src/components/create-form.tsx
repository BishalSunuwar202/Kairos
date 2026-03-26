'use client'

import Image from 'next/image'
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
import { lookupBible, lookupBibleRange, lookupSong } from '@/actions/lookup-actions'
import { toast } from 'sonner'
import { Check, ImageIcon, Loader2, Play, Plus, Save, Trash2, X } from 'lucide-react'
import type { BibleEntry, GenerateRequest, Slide, SongEntry } from '@/lib/types'
import { DEMO_BIBLE_REFS, DEMO_FORM, DEMO_SLIDES, DEMO_SONGS, DEMO_WORSHIP_SONGS } from '@/lib/demo-slides'

const CREED_SLIDE_ID = -999

const CREED_SLIDE: Slide = {
  id: CREED_SLIDE_ID,
  type: 'bible',
  title: 'विश्वासको सार',
  content: `म विश्वास गर्दछु एक परमेश्वर सर्वशक्तिमान् पिता, स्वर्ग र पृथ्वी सृष्टि गर्नुहुनेमाथि ।
अनि उहाँका एकले पुत्र, हाम्रा प्रभु येशू ख्रीष्टमाथि, जो पवित्र आत्माको शक्तिद्वारा गर्भ धारण हुनुभयो, कन्ये मरियमदेखि जन्मनुभयो, जसले पन्तियस पिलातसको अधीनमा दुःख भोग्नुभयो, जो क्रूसमा टाँगिनुभयो, मर्नुभयो अनि गाडिनुभयो, तेस्रो दिनमा मरेकाहरुबाट बिउतानुभयो, स्वर्गमा चढिजानुभयो, अनि सर्वशक्तिमान् परमेश्वर पिताको दाहिने हातपट्टि बस्नुभएको छ; जहाँदेखि उहाँ जिउँदा र मरेकाहरूको न्याय गर्नलाई फेरि आउनुहुनेछ।
म विश्वास गर्दछु पवित्र आत्मामाथि; पवित्र मण्डलीमाथि; पवित्रहरूको सङ्गतिमाथि; पाप मोचनमाथि; शरीरको पुनरुत्थानमाथी; र अजम्मरी जीवनमाथि। आमिन्।`,
}

interface SongState {
  number: string
  title: string
  lyricsText: string
}

function emptySong(): SongState {
  return { number: '', title: '', lyricsText: '' }
}

export function CreateForm() {
  const { slides, setSlides, moveSlide, setIsPresenting, currentSlide, setCurrentSlide } =
    usePresentationStore()

  const [form, setForm] = useState({
    fellowshipDate: '',
    anchorName: '',
    offeringServiceName: '',
    offeringPrayerName: '',
    lastPrayerName: '',
    specialTimeName: '',
    bibleReaderName: '',
    bibleReaderVerse: '',
    bibleReaderText: '',
    sermonLeader: '',
    sermonTopicText: '',
  })
  const [songs, setSongs] = useState<SongState[]>([emptySong()])
  const [worshipSongs, setWorshipSongs] = useState<SongState[]>([emptySong()])
  const [bibleRefs, setBibleRefs] = useState<BibleEntry[]>([{ ref: '', text: '' }])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [fetchingBible, setFetchingBible] = useState<number | null>(null)
  const [fetchingBibleReaderVerse, setFetchingBibleReaderVerse] = useState(false)
  const [fetchingSong, setFetchingSong] = useState<number | null>(null)
  const [includeCreed, setIncludeCreed] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [draggedSlideIndex, setDraggedSlideIndex] = useState<number | null>(null)
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null)
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

  function toggleCreed() {
    if (!includeCreed) {
      setSlides([...slides, CREED_SLIDE])
    } else {
      setSlides(slides.filter(s => s.id !== CREED_SLIDE_ID))
    }
    setIncludeCreed(v => !v)
  }

  function handleSlideDragStart(index: number) {
    setDraggedSlideIndex(index)
    setDropTargetIndex(index)
  }

  function handleSlideDrop(index: number) {
    if (draggedSlideIndex === null) return
    moveSlide(draggedSlideIndex, index)
    setDraggedSlideIndex(null)
    setDropTargetIndex(null)
  }

  function resetDragState() {
    setDraggedSlideIndex(null)
    setDropTargetIndex(null)
  }

  function loadDemo() {
    setForm(DEMO_FORM)
    setSongs(DEMO_SONGS)
    setWorshipSongs(DEMO_WORSHIP_SONGS)
    setBibleRefs(DEMO_BIBLE_REFS)
    setIncludeCreed(false)
    setCurrentSlide(0)
    setSlides(DEMO_SLIDES)
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

  function updateWorshipSong(index: number, field: keyof SongState, value: string) {
    setWorshipSongs((prev) => prev.map((s, i) => i === index ? { ...s, [field]: value } : s))
  }

  function addWorshipSong() {
    setWorshipSongs((prev) => [...prev, emptySong()])
  }

  function removeWorshipSong(index: number) {
    setWorshipSongs((prev) => prev.filter((_, i) => i !== index))
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
      const isRange = /\d+\s*-\s*\d+$/.test(ref)
      const result = isRange ? await lookupBibleRange(ref) : await lookupBible(ref)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        updateBibleRef(index, 'text', result.text)
        toast.success(isRange ? 'Verse range fetched' : 'Verse fetched')
      }
    } finally {
      setFetchingBible(null)
    }
  }

  async function handleFetchBibleReaderVerse() {
    const ref = form.bibleReaderVerse.trim()
    if (!ref) return

    setFetchingBibleReaderVerse(true)
    try {
      const result = await lookupBibleRange(ref)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        setForm((prev) => ({ ...prev, bibleReaderText: result.text }))
        toast.success('Bible reader passage fetched')
      }
    } finally {
      setFetchingBibleReaderVerse(false)
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

  async function handleFetchWorshipSong(index: number) {
    const song = worshipSongs[index]
    const hasQuery = song.title.trim() || song.number.trim()
    if (!hasQuery) return

    setFetchingSong(index + 1000)
    try {
      const result = await lookupSong({
        title: song.title.trim() || undefined,
        number: song.number ? parseInt(song.number) : undefined,
      })
      if (result.found) {
        updateWorshipSong(index, 'lyricsText', result.lyrics)
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
      const worshipSongEntries: SongEntry[] = worshipSongs.map((s) => ({
        title: s.title,
        lyricsText: s.lyricsText,
      }))

      const body: GenerateRequest = {
        ...form,
        songs: songEntries,
        worshipSongs: worshipSongEntries,
        bibleRefs,
      }

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error('Generation failed')

      const { slides: parsedSlides } = await res.json() as { slides: Slide[] }
      const finalSlides = includeCreed ? [...parsedSlides, CREED_SLIDE] : parsedSlides
      setSlides(finalSlides)
      toast.success(`Generated ${finalSlides.length} slides`)
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
            <Image
              src={logoUrl}
              alt="Church logo"
              width={48}
              height={48}
              unoptimized
              className="h-12 w-12 object-contain rounded"
            />
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
            <Label htmlFor="anchorName">Anchor / Host Name (English or Nepali)</Label>
            <Input
              id="anchorName"
              name="anchorName"
              placeholder="e.g. John Doe or जोन डो"
              value={form.anchorName}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="offeringServiceName">भेटी सेवा (English or Nepali)</Label>
            <Input
              id="offeringServiceName"
              name="offeringServiceName"
              placeholder="e.g. Sagar Tamang or सागर तामाङ"
              value={form.offeringServiceName}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="offeringPrayerName">भेटीको प्रार्थना (English or Nepali)</Label>
            <Input
              id="offeringPrayerName"
              name="offeringPrayerName"
              placeholder="e.g. Rabin Khadka or रबिन खड्का"
              value={form.offeringPrayerName}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="lastPrayerName">Last Prayer (English or Nepali)</Label>
          <Input
            id="lastPrayerName"
            name="lastPrayerName"
            placeholder="e.g. Rabin Khadka or रबिन खड्का"
            value={form.lastPrayerName}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="specialTimeName">Special Time (English or Nepali)</Label>
          <Input
            id="specialTimeName"
            name="specialTimeName"
            placeholder="e.g. Youth Team or युवा टोली"
            value={form.specialTimeName}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="bibleReaderName">Bible Reader (English or Nepali)</Label>
            <Input
              id="bibleReaderName"
              name="bibleReaderName"
              placeholder="e.g. John Doe or जोन डो"
              value={form.bibleReaderName}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="sermonLeader">Sermon Leader (English or Nepali)</Label>
            <Input
              id="sermonLeader"
              name="sermonLeader"
              placeholder="e.g. Pastor Jane or पास्टर जेन"
              value={form.sermonLeader}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="sermonTopicText">Sermon Topic / Notes</Label>
          <Textarea
            id="sermonTopicText"
            name="sermonTopicText"
            placeholder="Write or paste the prepared sermon topic, outline, notes, or message here"
            rows={6}
            value={form.sermonTopicText}
            onChange={handleChange}
            className="text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="bibleReaderVerse">Bible Reader Verse</Label>
          <div className="flex gap-2">
            <Input
              id="bibleReaderVerse"
              name="bibleReaderVerse"
              placeholder="e.g. John 3:1-10"
              value={form.bibleReaderVerse}
              onChange={handleChange}
              className="text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0"
              disabled={!form.bibleReaderVerse.trim() || fetchingBibleReaderVerse}
              onClick={handleFetchBibleReaderVerse}
            >
              {fetchingBibleReaderVerse ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Fetch'}
            </Button>
          </div>
          <Textarea
            name="bibleReaderText"
            placeholder="Fetched Bible reader passage will appear here"
            rows={5}
            value={form.bibleReaderText}
            onChange={handleChange}
            className="text-sm"
          />
        </div>

        {/* Songs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Bhajan and Chorus</Label>
            <Button type="button" variant="outline" size="sm" onClick={addSong}>
              <Plus className="w-3 h-3 mr-1" /> Add song
            </Button>
          </div>

          {songs.map((song, i) => (
            <Card key={i} className="p-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-[#1a3a5c] shrink-0">Bhajan {i + 1}</span>
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

        {/* Apostles' Creed toggle */}
        <div
          role="button"
          onClick={toggleCreed}
          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all select-none ${
            includeCreed ? 'border-[#1a3a5c] bg-[#1a3a5c]/5 ring-1 ring-[#1a3a5c]' : 'hover:border-gray-300'
          }`}
        >
          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
            includeCreed ? 'bg-[#1a3a5c] border-[#1a3a5c]' : 'border-gray-400'
          }`}>
            {includeCreed && <Check className="w-3 h-3 text-white" />}
          </div>
          <div>
            <p className="text-sm font-medium text-[#1a3a5c]">विश्वासको सार</p>
            <p className="text-xs text-gray-400">Apostles&apos; Creed — adds a slide when selected</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Worship Song</Label>
            <Button type="button" variant="outline" size="sm" onClick={addWorshipSong}>
              <Plus className="w-3 h-3 mr-1" /> Add song
            </Button>
          </div>

          {worshipSongs.map((song, i) => (
            <Card key={i} className="p-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-[#1a3a5c] shrink-0">Worship Song {i + 1}</span>
                <Input
                  placeholder="#"
                  value={song.number}
                  onChange={(e) => updateWorshipSong(i, 'number', e.target.value)}
                  className="h-8 text-sm w-14 shrink-0"
                  type="number"
                  min="1"
                />
                <Input
                  placeholder="Song title (e.g. आराधना गरौं)"
                  value={song.title}
                  onChange={(e) => updateWorshipSong(i, 'title', e.target.value)}
                  className="h-8 text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs shrink-0"
                  disabled={(!song.title.trim() && !song.number.trim()) || fetchingSong === i + 1000}
                  onClick={() => handleFetchWorshipSong(i)}
                >
                  {fetchingSong === i + 1000 ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Fetch'}
                </Button>
                {worshipSongs.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-gray-400 hover:text-red-500"
                    onClick={() => removeWorshipSong(i)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>

              <Textarea
                placeholder="Paste lyrics here, or use Fetch to auto-fill"
                rows={3}
                value={song.lyricsText}
                onChange={(e) => updateWorshipSong(i, 'lyricsText', e.target.value)}
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
          <Button variant="outline" size="sm" onClick={loadDemo}>
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
                  draggable
                  isDragging={i === draggedSlideIndex}
                  isDropTarget={i === dropTargetIndex && i !== draggedSlideIndex}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = 'move'
                    handleSlideDragStart(i)
                  }}
                  onDragOver={(e) => {
                    e.preventDefault()
                    if (dropTargetIndex !== i) setDropTargetIndex(i)
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    handleSlideDrop(i)
                  }}
                  onDragEnd={resetDragState}
                />
              ))}
            </div>
            <p className="text-xs text-gray-400">Drag slides up or down to reorder them before presenting.</p>
            <SlideFormatToolbar />
          </>
        )}
      </div>
    </div>
  )
}
