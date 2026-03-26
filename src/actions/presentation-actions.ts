'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Presentation, PresentationFormData, Slide } from '@/lib/types'

export async function listPresentations(): Promise<Presentation[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('presentations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function savePresentation(data: {
  title: string
  date: string
  slides: Slide[]
  formData: PresentationFormData
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('presentations').insert({
    user_id: user.id,
    title: data.title,
    date: data.date,
    slides: data.slides,
    form_data: data.formData,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/library')
}

export async function updatePresentation(data: {
  id: string
  title: string
  date: string
  slides: Slide[]
  formData: PresentationFormData
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: updated, error } = await supabase
    .from('presentations')
    .update({
      title: data.title,
      date: data.date,
      slides: data.slides,
      form_data: data.formData,
    })
    .eq('id', data.id)
    .eq('user_id', user.id)
    .select('id')

  if (error) throw new Error(error.message)
  if (!updated || updated.length === 0) {
    throw new Error('Presentation was not updated')
  }

  revalidatePath('/library')
}

export async function deletePresentation(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('presentations')
    .delete()
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  if (!data || data.length === 0) {
    throw new Error('Presentation was not deleted')
  }
  revalidatePath('/library')
}

export async function getPublicPresentation(id: string): Promise<Presentation | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('presentations').select('*').eq('id', id).single()
  return data ?? null
}
