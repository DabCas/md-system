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

      // Try to auto-match and link account by email
      if (userEmail) {
        // Check if user is a principal FIRST (highest priority)
        const { data: principal } = await supabase
          .from('principals')
          .select('id, user_id')
          .eq('email', userEmail)
          .maybeSingle()

        if (principal) {
          // Ensure user exists in public.users (upsert to handle duplicates)
          await supabase
            .from('users')
            .upsert({
              id: user.id,
              email: userEmail,
              role: 'principal',
              full_name: user.user_metadata?.name || user.user_metadata?.full_name || ''
            }, {
              onConflict: 'id',
              ignoreDuplicates: false
            })

          // Link principal account if not linked
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
            // Ensure user exists in public.users (upsert to handle duplicates)
            await supabase
              .from('users')
              .upsert({
                id: user.id,
                email: userEmail,
                role: 'teacher',
                full_name: user.user_metadata?.name || user.user_metadata?.full_name || ''
              }, {
                onConflict: 'id',
                ignoreDuplicates: false
              })

            // Link teacher account if not linked
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

            if (student && !student.user_id) {
              // Auto-link student account
              await supabase
                .from('students')
                .update({ user_id: user.id })
                .eq('id', student.id)
            }
          }
        }
      }
    }
  }

  // Redirect to dashboard after successful login
  return NextResponse.redirect(`${origin}/dashboard`)
}
