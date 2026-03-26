'use client'

import { useEffect, useState } from 'react'
import { deletePresentation } from '@/actions/presentation-actions'
import { usePresentationStore } from '@/store/presentation-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link2, Pencil, Play, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { Presentation, Slide } from '@/lib/types'

interface LibraryViewProps {
  presentations: Presentation[]
}

export function LibraryView({ presentations }: LibraryViewProps) {
  const { setSlides, setIsPresenting, startEditingPresentation, clearEditingPresentation } = usePresentationStore()
  const router = useRouter()
  const [items, setItems] = useState(presentations)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    setItems(presentations)
  }, [presentations])

  async function handleDelete(id: string) {
    try {
      setDeletingId(id)
      await deletePresentation(id)
      setItems((prev) => prev.filter((presentation) => presentation.id !== id))
      router.refresh()
      toast.success('Deleted')
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeletingId(null)
    }
  }

  function handleLoad(slides: Slide[]) {
    clearEditingPresentation()
    setSlides(slides)
    router.push('/')
  }

  function handleEdit(presentation: Presentation) {
    startEditingPresentation(presentation)
    router.push('/')
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="text-4xl mb-3">✝</p>
        <p>No saved presentations yet.</p>
        <p className="text-sm mt-1">Create one on the home page.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((p) => (
        <Card key={p.id}>
          <CardHeader>
            <CardTitle className="text-base text-[#1a3a5c] line-clamp-2">{p.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{p.date}</p>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">{p.slides.length} slides</Badge>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => handleLoad(p.slides)}
            >
              <Play className="w-3 h-3 mr-1" /> Load
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEdit(p)}
            >
              <Pencil className="w-3 h-3 mr-1" /> Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                clearEditingPresentation()
                setSlides(p.slides)
                setIsPresenting(true)
                router.push('/')
              }}
            >
              Present
            </Button>
            <Button
              size="sm"
              variant="ghost"
              title="Copy share link"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/p/${p.id}`)
                toast.success('Share link copied!')
              }}
            >
              <Link2 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              disabled={deletingId === p.id}
              onClick={() => handleDelete(p.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
