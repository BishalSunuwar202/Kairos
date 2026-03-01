import { createClient } from '@/lib/supabase/server'
import { listPresentations } from '@/actions/presentation-actions'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { LibraryView } from '@/components/library-view'

export default async function LibraryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const presentations = await listPresentations()

  return (
    <>
      <Navbar user={user} />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-[#1a3a5c] mb-6">Your Presentations</h1>
        <LibraryView presentations={presentations} />
      </main>
    </>
  )
}
