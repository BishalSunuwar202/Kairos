'use client'

import { createClient } from '@/lib/supabase/client'
import { usePresentationStore } from '@/store/presentation-store'
import { DEMO_SLIDES } from '@/lib/demo-slides'
import { SlideViewer } from '@/components/slide-viewer'

export function LandingPage() {
  const { setSlides, setIsPresenting, setIsDemoMode } = usePresentationStore()

  function handleTryDemo() {
    setSlides(DEMO_SLIDES)
    setIsDemoMode(true)
    setIsPresenting(true)
  }

  function handleSignIn() {
    const supabase = createClient()
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
        queryParams: { prompt: 'select_account' },
      },
    })
  }

  return (
    <>
      <main
        className="min-h-screen flex flex-col items-center justify-center px-4 relative"
        style={{ background: '#0f172a' }}
      >
        {/* Hero card */}
        <div
          className="text-center max-w-lg w-full rounded-2xl px-8 py-12 mb-8"
          style={{
            background: 'linear-gradient(135deg, #1a3a5c 0%, #0f172a 100%)',
            boxShadow: '0 0 60px rgba(26,58,92,0.4)',
          }}
        >
          <div className="text-5xl mb-5 opacity-90">✝</div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Kairos</h1>
          <p className="text-lg font-semibold text-white mb-2">
            Fellowship slides in seconds, not hours
          </p>
          <p className="text-sm mb-8" style={{ color: '#94a3b8' }}>
            AI generates beautiful Nepali church presentation slides
            from your service details
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleTryDemo}
              className="font-semibold px-6 py-3 rounded-lg text-sm transition-all"
              style={{
                background: '#f59e0b',
                color: '#0f172a',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#d97706')}
              onMouseLeave={e => (e.currentTarget.style.background = '#f59e0b')}
            >
              Try Demo
            </button>
            <button
              onClick={handleSignIn}
              className="font-medium px-6 py-3 rounded-lg text-sm transition-all"
              style={{
                border: '1.5px solid #334155',
                color: '#94a3b8',
                background: 'transparent',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#475569'
                e.currentTarget.style.color = '#ffffff'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#334155'
                e.currentTarget.style.color = '#94a3b8'
              }}
            >
              Sign in with Google
            </button>
          </div>
        </div>

        {/* Steps */}
        <div className="flex gap-4 justify-center w-full max-w-sm">
          {[
            { n: '1', label: 'Enter details' },
            { n: '2', label: 'AI generates' },
            { n: '3', label: 'Present' },
          ].map(({ n, label }) => (
            <div
              key={n}
              className="flex-1 rounded-lg py-3 px-2 text-center"
              style={{ background: '#1e293b' }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mx-auto mb-1"
                style={{ background: '#f59e0b', color: '#0f172a' }}
              >
                {n}
              </div>
              <p className="text-xs" style={{ color: '#64748b' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <p className="absolute bottom-8 text-xs" style={{ color: '#334155' }}>
          Used by Abhishek Church
        </p>
      </main>
      <SlideViewer />
    </>
  )
}
