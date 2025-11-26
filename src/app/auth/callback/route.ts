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
      const userEmail = user.email?.toLowerCase()

      // Email domain whitelist - only allow @stpaulclark.com and test accounts
      if (userEmail) {
        const allowedTestEmails = [
          'plukdennisalimpolos@gmail.com',
          'imdennisalimpolos@gmail.com',
          'mr.dennisalimpolos@gmail.com'
        ]
        const isTestAccount = allowedTestEmails.includes(userEmail)
        const isStPaulDomain = userEmail.endsWith('@stpaulclark.com')

        if (!isTestAccount && !isStPaulDomain) {
          // Unauthorized domain - sign out and redirect to login with error
          await supabase.auth.signOut()
          return NextResponse.redirect(`${origin}/login?error=unauthorized_domain`)
        }

        // Run all role checks in parallel for performance
        const [adminResult, principalResult, teacherResult, studentResult] = await Promise.all([
          supabase.from('admins').select('email').eq('email', userEmail).maybeSingle(),
          supabase.from('principals').select('email').eq('email', userEmail).maybeSingle(),
          supabase.from('teachers').select('email').eq('email', userEmail).maybeSingle(),
          supabase.from('students').select('email').eq('email', userEmail).maybeSingle(),
        ])

        // Determine role by priority: admin → principal → teacher → student
        let userRole: string | null = null
        if (adminResult.data) {
          userRole = 'admin'
        } else if (principalResult.data) {
          userRole = 'principal'
        } else if (teacherResult.data) {
          userRole = 'teacher'
        } else if (studentResult.data) {
          userRole = 'student'
        }

        // If role found, set it in user metadata
        if (userRole) {
          await supabase.auth.updateUser({
            data: { role: userRole }
          })
        } else {
          // User not found in any table - block access
          await supabase.auth.signOut()
          return NextResponse.redirect(`${origin}/login?error=user_not_found`)
        }
      }
    }
  }

  // Redirect to dashboard after successful login
  return NextResponse.redirect(`${origin}/dashboard`)
}
