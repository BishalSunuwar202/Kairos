'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { updateProfile } from '@/actions/user-actions'
import type { User } from '@supabase/supabase-js'

interface ProfileFormProps {
  user: User
}

export function ProfileForm({ user }: ProfileFormProps) {
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined
  const initials = user.email?.slice(0, 2).toUpperCase() ?? 'U'
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null

  const [fullName, setFullName] = useState<string>(
    (user.user_metadata?.full_name as string | undefined) ?? ''
  )
  const [phone, setPhone] = useState<string>(
    (user.user_metadata?.phone as string | undefined) ?? user.phone ?? ''
  )
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    setIsSaving(true)
    try {
      await updateProfile({ fullName, phone })
      toast.success('Profile updated')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10 space-y-8">
      {/* Avatar + name header */}
      <div className="flex flex-col items-center gap-3">
        <Avatar className="w-20 h-20">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback className="bg-[#f59e0b] text-[#1a3a5c] text-2xl font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="text-center">
          <p className="font-semibold text-lg text-[#1a3a5c]">{fullName || user.email}</p>
          {memberSince && (
            <p className="text-xs text-gray-400">Member since {memberSince}</p>
          )}
        </div>
      </div>

      <Separator />

      {/* Editable fields */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={user.email ?? ''}
            readOnly
            className="bg-gray-50 text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400">Managed by Google — cannot be changed here</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+977 98XXXXXXXX"
          />
        </div>
      </div>

      <Button onClick={handleSave} disabled={isSaving} className="w-full">
        {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Changes'}
      </Button>
    </div>
  )
}
