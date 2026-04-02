'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BookOpen, LogOut, PenSquare, UserRound } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

  const navLink = (href: string, label: string, icon: React.ReactNode) => (
    <Link
      href={href}
      className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
        pathname === href
          ? 'text-[#f59e0b] border-b-2 border-[#f59e0b] pb-0.5'
          : 'text-gray-300 hover:text-white'
      }`}
    >
      {icon}
      {label}
    </Link>
  )

  const initials = user.email?.slice(0, 2).toUpperCase() ?? 'U'
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined

  return (
    <header className="bg-[#1a3a5c] text-white">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/create" className="font-bold text-lg flex items-center gap-2 hover:text-[#f59e0b] transition-colors">
            ✝ Fellowship Builder
          </Link>
          <nav className="flex items-center gap-5">
            {navLink('/create', 'Create', <PenSquare className="w-4 h-4" />)}
            {navLink('/library', 'Library', <BookOpen className="w-4 h-4" />)}
          </nav>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus:outline-none" suppressHydrationWarning>
              <Avatar className="w-9 h-9 cursor-pointer">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-[#f59e0b] text-[#1a3a5c] text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                <UserRound className="w-3.5 h-3.5" /> My Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form action={signOut}>
                <button type="submit" className="w-full text-left text-sm flex items-center gap-2">
                  <LogOut className="w-3.5 h-3.5" /> Sign out
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
