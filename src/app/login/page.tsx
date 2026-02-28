'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const supabase = createClient()

  async function handleGoogleSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-2">
          <div className="text-4xl">✝</div>
          <CardTitle className="text-2xl text-[#1a3a5c]">Fellowship Builder</CardTitle>
          <p className="text-sm text-muted-foreground">
            Sign in to create and save your presentations
          </p>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={handleGoogleSignIn}>
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
