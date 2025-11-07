import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LinkAccountClient } from '@/components/link-account-client'

export default async function LinkAccountPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userEmail = user.email

  // Auto-link teacher/principal/student by email if not linked yet
  if (userEmail) {
    // Check if email matches a principal FIRST (highest priority)
    const { data: principalByEmail } = await supabase
      .from('principals')
      .select('id, user_id')
      .eq('email', userEmail)
      .maybeSingle()

    if (principalByEmail) {
      // Ensure user exists in public.users (upsert to handle duplicates)
      await supabase.from('users').upsert({
        id: user.id,
        email: userEmail,
        role: 'principal',
        full_name: user.user_metadata?.name || user.user_metadata?.full_name || ''
      }, {
        onConflict: 'id',
        ignoreDuplicates: false
      })

      // Link principal account if not linked
      if (!principalByEmail.user_id) {
        await supabase
          .from('principals')
          .update({ user_id: user.id })
          .eq('id', principalByEmail.id)
      }

      redirect('/dashboard/teacher')
    }

    // Check if email matches a teacher
    const { data: teacherByEmail } = await supabase
      .from('teachers')
      .select('id, user_id')
      .eq('email', userEmail)
      .maybeSingle()

    if (teacherByEmail) {
      // Ensure user exists in public.users (upsert to handle duplicates)
      await supabase.from('users').upsert({
        id: user.id,
        email: userEmail,
        role: 'teacher',
        full_name: user.user_metadata?.name || user.user_metadata?.full_name || ''
      }, {
        onConflict: 'id',
        ignoreDuplicates: false
      })

      // Link teacher account if not linked
      if (!teacherByEmail.user_id) {
        await supabase
          .from('teachers')
          .update({ user_id: user.id })
          .eq('id', teacherByEmail.id)
      }

      redirect('/dashboard/teacher')
    }

    // Check if email matches a student
    const { data: studentByEmail } = await supabase
      .from('students')
      .select('id, user_id')
      .eq('email', userEmail)
      .maybeSingle()

    if (studentByEmail && !studentByEmail.user_id) {
      // Auto-link student account
      await supabase
        .from('students')
        .update({ user_id: user.id })
        .eq('id', studentByEmail.id)

      redirect('/dashboard/student')
    }
  }

  // Check if user is already a principal (use teacher dashboard for now)
  const { data: principal } = await supabase
    .from('principals')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (principal) {
    redirect('/dashboard/teacher')
  }

  // Check if user is already a teacher
  const { data: teacher } = await supabase
    .from('teachers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (teacher) {
    redirect('/dashboard/teacher')
  }

  // Check if user is already linked to a student
  const { data: linkedStudent } = await supabase
    .from('students')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (linkedStudent) {
    redirect('/dashboard/student')
  }

  // Get all unlinked students (only those without email, since email-matched students are auto-linked)
  const { data: students } = await supabase
    .from('students')
    .select('id, full_name, english_name, grade')
    .is('user_id', null)
    .order('full_name', { ascending: true })

  return (
    <LinkAccountClient
      user={user}
      students={students || []}
    />
  )
}
