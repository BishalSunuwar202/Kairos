'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(data: { fullName: string; phone: string }) {
  const fullName = data.fullName.trim().slice(0, 100)
  const phone = data.phone.trim().slice(0, 20)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.auth.updateUser({
    data: {
      full_name: fullName,
      phone,
    },
  })
  if (error) throw new Error(error.message)
  revalidatePath('/profile')
}
