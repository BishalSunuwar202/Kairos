'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { addSong, deleteSong, type SongRecord } from '@/actions/song-actions'

const CATEGORY_LABELS: Record<SongRecord['category'], string> = {
  bhajan: 'Bhajan',
  koras: 'Koras',
  other: 'Other',
}

const CATEGORY_COLORS: Record<SongRecord['category'], string> = {
  bhajan: 'bg-indigo-100 text-indigo-700',
  koras: 'bg-purple-100 text-purple-700',
  other: 'bg-gray-100 text-gray-600',
}

interface Props {
  initialSongs: SongRecord[]
}

const emptyForm = {
  number: '',
  category: 'bhajan' as SongRecord['category'],
  title: '',
  writer: '',
  lyrics: '',
}

export function SongLibrary({ initialSongs }: Props) {
  const [songs, setSongs] = useState<SongRecord[]>(initialSongs)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleAdd() {
    if (!form.title.trim()) { toast.error('Title is required'); return }
    if (!form.lyrics.trim()) { toast.error('Lyrics are required'); return }

    setIsSaving(true)
    try {
      await addSong({
        number: form.number ? parseInt(form.number) : null,
        category: form.category,
        title: form.title.trim(),
        writer: form.writer.trim() || null,
        lyrics: form.lyrics.trim(),
      })
      // Optimistically add to local list
      setSongs(prev => [{
        id: Date.now().toString(),
        number: form.number ? parseInt(form.number) : null,
        category: form.category,
        title: form.title.trim(),
        writer: form.writer.trim() || null,
        lyrics: form.lyrics.trim(),
        created_at: new Date().toISOString(),
      }, ...prev])
      setForm(emptyForm)
      setShowForm(false)
      toast.success('Song added to library')
    } catch {
      toast.error('Failed to add song')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      await deleteSong(id)
      setSongs(prev => prev.filter(s => s.id !== id))
      toast.success('Song removed')
    } catch {
      toast.error('Failed to delete song')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Song Library</h1>
          <p className="text-sm text-gray-500 mt-0.5">{songs.length} song{songs.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setShowForm(v => !v)}>
          <Plus className="w-4 h-4 mr-1" /> Add Song
        </Button>
      </div>

      {/* Add Song Form */}
      {showForm && (
        <Card className="p-4 space-y-3 border-[#1a3a5c]/20">
          <p className="font-semibold text-[#1a3a5c] text-sm">New Song</p>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Number (optional)</Label>
              <Input
                name="number"
                type="number"
                min="1"
                placeholder="e.g. 47"
                value={form.number}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm(prev => ({ ...prev, category: v as SongRecord['category'] }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bhajan">Bhajan</SelectItem>
                  <SelectItem value="koras">Koras</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Writer (optional)</Label>
              <Input name="writer" placeholder="Songwriter" value={form.writer} onChange={handleChange} />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Title *</Label>
            <Input name="title" placeholder="Song title" value={form.title} onChange={handleChange} />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Lyrics *</Label>
            <Textarea
              name="lyrics"
              placeholder={"को.:\n[chorus lyrics]\n\n१.:\n[verse 1]\n\n२.:\n[verse 2]"}
              rows={6}
              value={form.lyrics}
              onChange={handleChange}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => { setShowForm(false); setForm(emptyForm) }}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
            </Button>
          </div>
        </Card>
      )}

      {/* Songs Table */}
      {songs.length === 0 ? (
        <Card className="h-40 flex items-center justify-center text-sm text-muted-foreground">
          No songs yet. Add your church hymnal songs here.
        </Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 w-12">#</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 w-24">Category</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Title</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 hidden sm:table-cell">Writer</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {songs.map(song => (
                <tr key={song.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                    {song.number ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_COLORS[song.category]}`}>
                      {CATEGORY_LABELS[song.category]}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">{song.title}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs hidden sm:table-cell">{song.writer ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-gray-400 hover:text-red-500"
                      disabled={deletingId === song.id}
                      onClick={() => handleDelete(song.id)}
                    >
                      {deletingId === song.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Trash2 className="w-3.5 h-3.5" />}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
