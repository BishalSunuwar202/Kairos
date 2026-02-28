import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { CreateForm } from '@/components/create-form'
import { SlideViewer } from '@/components/slide-viewer'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <>
      <Navbar user={user} />
      <main>
        <CreateForm />
      </main>
      <SlideViewer />
    </>
  )
}
