'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { toast } from 'sonner'
import { AlertCircle, Loader2, Award, Shield, TrendingUp, Users } from 'lucide-react'
import Image from 'next/image'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam === 'unauthorized_domain') {
      setError('Only @stpaulclark.com email addresses are allowed.')
    } else if (errorParam === 'user_not_found') {
      setError('Your account is not registered in the system. Please contact the administrator.')
    }

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
        router.refresh()
      } else {
        setChecking(false)
      }
    }
    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push('/dashboard')
        router.refresh()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase.auth, searchParams])

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      setError(null)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: 'select_account',
          },
        },
      })

      if (error) {
        console.error('Error logging in:', error.message)
        toast.error('Failed to sign in. Please try again.')
        setLoading(false)
      }
    } catch (error) {
      console.error('Error:', error)
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-biscay via-biscay/95 to-camelot flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-white" />
          <p className="text-white/80 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-biscay via-biscay/95 to-camelot relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-camelot/30 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-white/5 rounded-full blur-2xl" />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {/* Logo & School Name */}
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
            <Image
              src="/spas-logo.png"
              alt="SPAS Logo"
              width={56}
              height={56}
              className="rounded-lg"
              priority
            />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl">St. Paul American School</h1>
            <p className="text-white/60 text-sm">Clark, Philippines</p>
          </div>
        </div>

        {/* Main Card */}
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
            {/* Title */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                Merit & Demerit System
              </h2>
              <p className="mt-2 text-white/60 text-sm">
                Track student achievements and behavior
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <FeatureCard
                icon={<Award className="h-4 w-4" />}
                title="Merit Awards"
              />
              <FeatureCard
                icon={<Shield className="h-4 w-4" />}
                title="Behavior Tracking"
              />
              <FeatureCard
                icon={<TrendingUp className="h-4 w-4" />}
                title="Real-time Stats"
              />
              <FeatureCard
                icon={<Users className="h-4 w-4" />}
                title="Role-based Access"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-xl bg-red-500/20 border border-red-400/30 p-4 flex gap-3">
                <div className="flex-shrink-0 w-9 h-9 bg-red-500/30 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-200" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-100">Access Denied</p>
                  <p className="text-sm text-red-200/80 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white rounded-xl px-4 py-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <svg className="h-5 w-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              {loading ? 'Signing in...' : 'Continue with Google'}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-transparent text-white/50">Authorized roles</span>
              </div>
            </div>

            {/* Role Pills - School colors only */}
            <div className="flex flex-wrap justify-center gap-2">
              <RolePill label="Student" variant="light" />
              <RolePill label="Teacher" variant="light" />
              <RolePill label="Principal" variant="maroon" />
              <RolePill label="Admin" variant="maroon" />
            </div>
          </div>

          {/* Footer Note */}
          <p className="mt-6 text-center text-sm text-white/50">
            Use your <span className="font-medium text-white/70">@stpaulclark.com</span> email to sign in
          </p>
        </div>

        {/* Bottom Footer */}
        <div className="mt-8 text-center space-y-2">
          <div className="flex justify-center gap-4 text-xs">
            <a href="/privacy" className="text-white/50 hover:text-white/80 underline">Privacy Policy</a>
            <a href="/terms" className="text-white/50 hover:text-white/80 underline">Terms of Service</a>
          </div>
          <p className="text-xs text-white/30">
            St. Paul American School Clark &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10 flex items-center gap-2">
      <div className="text-white/70">{icon}</div>
      <span className="text-white/80 text-xs font-medium">{title}</span>
    </div>
  )
}

function RolePill({ label, variant }: { label: string; variant: 'light' | 'maroon' }) {
  const colors = variant === 'light'
    ? 'bg-white/20 text-white border-white/30'
    : 'bg-camelot/40 text-white border-camelot/50'

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colors}`}>
      {label}
    </span>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-biscay via-biscay/95 to-camelot flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-white" />
          <p className="text-white/80 text-sm">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
