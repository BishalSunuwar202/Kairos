'use client'

import { useEffect, useMemo, useState } from 'react'
import { SlideDisplay } from './slide-display'
import type { ProjectorSessionState } from '@/lib/types'

const CHANNEL_NAME = 'kairos-projector'
const STORAGE_KEY = 'kairos_projector_session'

function readStoredSession(): ProjectorSessionState | null {
  if (typeof window === 'undefined') return null

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as ProjectorSessionState
  } catch {
    return null
  }
}

export function ProjectorSlideViewer() {
  const [session, setSession] = useState<ProjectorSessionState | null>(() => readStoredSession())

  useEffect(() => {
    const channel =
      typeof window !== 'undefined' && 'BroadcastChannel' in window
        ? new BroadcastChannel(CHANNEL_NAME)
        : null

    function applySession(next: ProjectorSessionState | null) {
      setSession(next)
    }

    function handleStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY) return

      if (!e.newValue) {
        applySession(null)
        return
      }

      try {
        applySession(JSON.parse(e.newValue) as ProjectorSessionState)
      } catch {
        applySession(null)
      }
    }

    function handleVisibility() {
      const latest = readStoredSession()
      if (latest) applySession(latest)
    }

    channel?.addEventListener('message', (event: MessageEvent<ProjectorSessionState | null>) => {
      applySession(event.data)
    })
    window.addEventListener('storage', handleStorage)
    window.addEventListener('focus', handleVisibility)

    return () => {
      channel?.close()
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('focus', handleVisibility)
    }
  }, [])

  const slide = useMemo(() => {
    if (!session?.isActive) return null
    return session.slides[session.currentSlide] ?? null
  }, [session])

  if (!session?.isActive || !slide) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-4xl mb-4">✝</p>
          <p className="text-lg font-medium">Projector is waiting for presentation</p>
          <p className="text-sm text-gray-400 mt-2">
            Start presentation mode from the main app to send slides here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-white">
      <SlideDisplay slide={slide} logoUrl={session.logoUrl} />
    </div>
  )
}
