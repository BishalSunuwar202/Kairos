import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { SongLibrary } from '@/components/song-library'
import { listSongs } from '@/actions/song-actions'

export default async function SongsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const songs = await listSongs()

  return (
    <>
      <Navbar user={user} />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <SongLibrary initialSongs={songs} />
      </main>
    </>
  )
}
