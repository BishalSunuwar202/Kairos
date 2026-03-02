import { getPublicPresentation } from '@/actions/presentation-actions'
import { PublicSlideViewer } from '@/components/public-slide-viewer'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PublicPresentationPage({ params }: Props) {
  const { id } = await params
  const presentation = await getPublicPresentation(id)

  if (!presentation) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center gap-3">
        <p className="text-4xl">✝</p>
        <p className="text-lg font-medium text-[#1a3a5c]">Presentation not found</p>
        <p className="text-sm text-gray-400">This link may have expired or been removed.</p>
      </div>
    )
  }

  return (
    <PublicSlideViewer
      slides={presentation.slides}
      title={presentation.title}
    />
  )
}
