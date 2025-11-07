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
    // Check if email matches a principal
    const { data: principalByEmail } = await supabase
      .from('principals')
      .select('id, user_id')
      .eq('email', userEmail)
      .single()

    if (principalByEmail && !principalByEmail.user_id) {
      // Create user in public.users
      await supabase.from('users').insert({
        id: user.id,
        email: userEmail,
        role: 'principal',
        full_name: user.user_metadata?.name || user.user_metadata?.full_name || ''
      })

      // Link principal account
      await supabase
        .from('principals')
        .update({ user_id: user.id })
        .eq('id', principalByEmail.id)

      redirect('/dashboard/teacher')
    }

    // Check if email matches a teacher
    const { data: teacherByEmail } = await supabase
      .from('teachers')
      .select('id, user_id')
      .eq('email', userEmail)
      .single()

    if (teacherByEmail && !teacherByEmail.user_id) {
      // Create user in public.users
      await supabase.from('users').insert({
        id: user.id,
        email: userEmail,
        role: 'teacher',
        full_name: user.user_metadata?.name || user.user_metadata?.full_name || ''
      })

      // Link teacher account
      await supabase
        .from('teachers')
        .update({ user_id: user.id })
        .eq('id', teacherByEmail.id)

      redirect('/dashboard/teacher')
    }

    // Check if email matches a student
    const { data: studentByEmail } = await supabase
      .from('students')
      .select('id, user_id')
      .eq('email', userEmail)
      .single()

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
