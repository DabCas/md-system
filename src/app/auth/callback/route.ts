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

        // Auto-link account and set role in user_metadata
        let userRole: string | null = null

        // Check if user is a principal (highest priority)
        const { data: principal } = await supabase
          .from('principals')
          .select('id, user_id')
          .eq('email', userEmail)
          .maybeSingle()

        if (principal) {
          userRole = 'principal'
          // Link principal account if not already linked
          if (!principal.user_id) {
            await supabase
              .from('principals')
              .update({ user_id: user.id })
              .eq('id', principal.id)
          }
        } else {
          // Check if user is a teacher
          const { data: teacher } = await supabase
            .from('teachers')
            .select('id, user_id')
            .eq('email', userEmail)
            .maybeSingle()

          if (teacher) {
            userRole = 'teacher'
            // Link teacher account if not already linked
            if (!teacher.user_id) {
              await supabase
                .from('teachers')
                .update({ user_id: user.id })
                .eq('id', teacher.id)
            }
          } else {
            // Check if user is a student
            const { data: student } = await supabase
              .from('students')
              .select('id, user_id')
              .eq('email', userEmail)
              .maybeSingle()

            if (student) {
              userRole = 'student'
              // Link student account if not already linked
              if (!student.user_id) {
                await supabase
                  .from('students')
                  .update({ user_id: user.id })
                  .eq('id', student.id)
              }
            }
          }
        }

        // Update user metadata with role (if found)
        if (userRole) {
          await supabase.auth.updateUser({
            data: { role: userRole }
          })
        }
      }
    }
  }

  // Redirect to dashboard after successful login
  return NextResponse.redirect(`${origin}/dashboard`)
}
