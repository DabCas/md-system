import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.exchangeCodeForSession(code)

    if (user) {
      const userEmail = user.email

      // Email domain whitelist - only allow @stpaulclark.com and test accounts
      if (userEmail) {
        const allowedTestEmails = [
          'imdennisalimpolos@gmail.com',
          'mr.dennisalimpolos@gmail.com'
        ]
        const isTestAccount = allowedTestEmails.includes(userEmail.toLowerCase())
        const isStPaulDomain = userEmail.toLowerCase().endsWith('@stpaulclark.com')

        if (!isTestAccount && !isStPaulDomain) {
          // Unauthorized domain - sign out and redirect to login with error
          await supabase.auth.signOut()
          return NextResponse.redirect(`${origin}/login?error=unauthorized_domain`)
        }
      }

      // Note: Auto-linking is now handled by database trigger (handle_new_user)
      // No need for manual linking code here
    }
  }

  // Redirect to dashboard after successful login
  return NextResponse.redirect(`${origin}/dashboard`)
}
