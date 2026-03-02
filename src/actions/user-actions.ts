'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(data: { fullName: string; phone: string }) {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({
    data: {
      full_name: data.fullName,
      phone: data.phone,
    },
  })
  if (error) throw new Error(error.message)
  revalidatePath('/profile')
}
