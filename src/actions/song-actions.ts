'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface SongRecord {
  id: string
  number: number | null
  category: 'bhajan' | 'koras' | 'other'
  title: string
  writer: string | null
  lyrics: string
  created_at: string
}

export async function listSongs(): Promise<SongRecord[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .order('number', { ascending: true, nullsFirst: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as SongRecord[]
}

export async function addSong(song: {
  number?: number | null
  category: 'bhajan' | 'koras' | 'other'
  title: string
  writer?: string | null
  lyrics: string
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('songs').insert({
    number: song.number ?? null,
    category: song.category,
    title: song.title,
    writer: song.writer ?? null,
    lyrics: song.lyrics,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/songs')
}

export async function deleteSong(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('songs').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/songs')
}
