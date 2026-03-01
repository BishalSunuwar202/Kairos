'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signOut } from '@/actions/auth-actions'
import type { User } from '@supabase/supabase-js'

interface NavbarProps {
  user: User
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname()

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors ${
        pathname === href
          ? 'text-[#f59e0b] border-b-2 border-[#f59e0b] pb-0.5'
          : 'text-gray-300 hover:text-white'
      }`}
    >
      {label}
    </Link>
  )

  const initials = user.email?.slice(0, 2).toUpperCase() ?? 'U'
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined

  return (
    <header className="bg-[#1a3a5c] text-white">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-lg flex items-center gap-2">
            ✝ Fellowship Builder
          </span>
          <nav className="flex items-center gap-5">
            {navLink('/', 'Create')}
            {navLink('/library', 'Library')}
            {navLink('/songs', 'Songs')}
          </nav>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus:outline-none" suppressHydrationWarning>
              <Avatar className="w-8 h-8 cursor-pointer">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-[#f59e0b] text-[#1a3a5c] text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium">{user.user_metadata?.full_name ?? user.email}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form action={signOut}>
                <button type="submit" className="w-full text-left text-sm">
                  Sign out
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
