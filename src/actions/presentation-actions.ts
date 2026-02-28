'use server'

import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Slide } from '@/lib/types'

async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return user
}

export async function listPresentations() {
  const user = await getUser()
  return prisma.presentation.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })
}

export async function savePresentation(data: {
  title: string
  date: string
  slides: Slide[]
}) {
  const user = await getUser()
  await prisma.presentation.create({
    data: {
      userId: user.id,
      title: data.title,
      date: data.date,
      slides: data.slides,
    },
  })
  revalidatePath('/library')
}

export async function deletePresentation(id: string) {
  const user = await getUser()
  await prisma.presentation.deleteMany({
    where: { id, userId: user.id },
  })
  revalidatePath('/library')
}
