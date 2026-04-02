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
      <main className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center px-4 relative">
        <div className="text-center max-w-lg">
          <div className="text-5xl mb-4">✝</div>
          <h1 className="text-4xl font-bold text-white mb-3">Kairos</h1>
          <p className="text-xl font-semibold text-white mb-2">
            Fellowship slides in seconds, not hours
          </p>
          <p className="text-[#94a3b8] mb-8 text-sm">
            AI generates beautiful Nepali church presentation slides from your service details
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleTryDemo}
              className="bg-[#f59e0b] text-[#0f172a] font-semibold px-6 py-3 rounded-lg hover:bg-[#d97706] transition-colors text-sm"
            >
              Try Demo
            </button>
            <button
              onClick={handleSignIn}
              className="border border-[#334155] text-[#94a3b8] font-medium px-6 py-3 rounded-lg hover:border-[#475569] hover:text-white transition-colors text-sm"
            >
              Sign in with Google
            </button>
          </div>
        </div>

        <p className="absolute bottom-8 text-[#334155] text-xs">
          Used by Abhishek Church
        </p>
      </main>
      <SlideViewer />
    </>
  )
}
