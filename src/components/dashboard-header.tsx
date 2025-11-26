'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { LogOut, ArrowRightLeft, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DashboardHeaderProps {
  title: string
  subtitle?: string
  userName: string
  userRole: string
  avatarUrl?: string
  showPrincipalSwitch?: boolean
  showTeacherSwitch?: boolean
}

export function DashboardHeader({
  title,
  subtitle = 'St. Paul American School Clark',
  userName,
  userRole,
  avatarUrl,
  showPrincipalSwitch = false,
  showTeacherSwitch = false,
}: DashboardHeaderProps) {
  const router = useRouter()
  const supabase = createClient()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut({ scope: 'global' })
    router.refresh()
    router.push('/login')
  }

  return (
    <div className="bg-biscay text-white px-3 sm:px-4 md:px-6 py-3 md:py-4 shadow-sm sticky top-0 z-10">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left side - Logo and Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Image
            src="/spas-logo.png"
            alt="SPAS"
            width={36}
            height={36}
            className="rounded-full bg-white p-0.5 w-8 h-8 sm:w-9 sm:h-9"
          />
          <div>
            <h1 className="font-bold text-sm sm:text-base">{title}</h1>
            <p className="text-[10px] sm:text-xs text-white/70 hidden sm:block">{subtitle}</p>
          </div>
        </div>

        {/* Right side - Switch button and User dropdown */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Principal View Switch (shown on teacher dashboard for principals) */}
          {showPrincipalSwitch && (userRole === 'principal' || userRole === 'admin') && (
            <Button
              onClick={() => router.push('/dashboard/principal')}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white text-xs"
            >
              <ArrowRightLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Principal View</span>
              <span className="sm:hidden">Overview</span>
            </Button>
          )}

          {/* Teacher View Switch (shown on principal dashboard) */}
          {showTeacherSwitch && (
            <Button
              onClick={() => router.push('/dashboard/teacher')}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white text-xs"
            >
              <ArrowRightLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Issue Merits/Demerits</span>
              <span className="sm:hidden">Issue</span>
            </Button>
          )}

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1 sm:gap-2 hover:opacity-80 transition-opacity"
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={userName}
                  width={36}
                  height={36}
                  className="rounded-full ring-2 ring-white/20 w-8 h-8 sm:w-9 sm:h-9"
                />
              ) : (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 flex items-center justify-center ring-2 ring-white/20">
                  <span className="text-sm sm:text-base font-semibold">
                    {userName.charAt(0)}
                  </span>
                </div>
              )}
              <ChevronDown className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                  <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
