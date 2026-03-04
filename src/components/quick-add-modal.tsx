'use client'

import { useState } from 'react'
import { usePresentationStore } from '@/store/presentation-store'
import type { SlideType } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const SLIDE_TYPE_OPTIONS: { value: SlideType; label: string }[] = [
  { value: 'welcome',        label: 'स्वागत (Welcome)' },
  { value: 'host',           label: 'आयोजक (Host)' },
  { value: 'opening-prayer', label: 'आरम्भिक प्रार्थना (Opening Prayer)' },
  { value: 'lyrics',         label: 'भजन (Lyrics)' },
  { value: 'bible',          label: 'बाइबल (Bible)' },
  { value: 'sermon',         label: 'उपदेश (Sermon)' },
  { value: 'announcements',  label: 'सूचनाहरू (Announcements)' },
  { value: 'closing-prayer', label: 'समापन प्रार्थना (Closing Prayer)' },
]

interface QuickAddModalProps {
  open: boolean
  onClose: () => void
  afterIndex: number
}

export function QuickAddModal({ open, onClose, afterIndex }: QuickAddModalProps) {
  const insertSlide = usePresentationStore((s) => s.insertSlide)

  const [type, setType] = useState<SlideType>('bible')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [subtitle, setSubtitle] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    insertSlide(afterIndex, {
      type,
      title: title.trim(),
      content: content.trim(),
      subtitle: subtitle.trim() || undefined,
    })
    setTitle('')
    setContent('')
    setSubtitle('')
    setType('bible')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Slide</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="slide-type">Type</Label>
            <select
              id="slide-type"
              value={type}
              onChange={(e) => setType(e.target.value as SlideType)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {SLIDE_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="slide-title">Title</Label>
            <Input
              id="slide-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. यूहन्ना ३:१६"
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="slide-content">Content</Label>
            <Textarea
              id="slide-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Slide content..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="slide-subtitle">Subtitle <span className="text-gray-400">(optional)</span></Label>
            <Input
              id="slide-subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. John 3:16"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">Add Slide</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
