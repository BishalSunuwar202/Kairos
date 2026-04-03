'use client'

import { useState } from 'react'
import { usePresentationStore } from '@/store/presentation-store'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface QuickAddModalProps {
  open: boolean
  onClose: () => void
  afterIndex: number
}

export function QuickAddModal({ open, onClose, afterIndex }: QuickAddModalProps) {
  const insertSlide = usePresentationStore((s) => s.insertSlide)
  const [content, setContent] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    insertSlide(afterIndex, {
      type: 'note',
      title: 'Note',
      content: content.trim(),
    })
    setContent('')
    onClose()
  }

  function handleClose() {
    setContent('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your note here..."
            rows={5}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={!content.trim()}>Add Note</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
