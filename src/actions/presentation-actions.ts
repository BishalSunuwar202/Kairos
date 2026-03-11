'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Slide, Presentation } from '@/lib/types'

export async function listPresentations(): Promise<Presentation[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('presentations')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function savePresentation(data: {
  title: string
  date: string
  slides: Slide[]
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('presentations').insert({
    user_id: user.id,
    title: data.title,
    date: data.date,
    slides: data.slides,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/library')
}

export async function deletePresentation(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('presentations')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/library')
}

export async function getPublicPresentation(id: string): Promise<Presentation | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('presentations').select('*').eq('id', id).single()
  return data ?? null
}
