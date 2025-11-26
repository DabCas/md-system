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

  // Check if user is already a principal (use teacher dashboard for now)
  const { data: principal } = await supabase
    .from('principals')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (principal) {
    redirect('/dashboard/teacher')
  }

  // Check if user is already a teacher
  const { data: teacher } = await supabase
    .from('teachers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (teacher) {
    redirect('/dashboard/teacher')
  }

  // Check if user is already linked to a student
  const { data: linkedStudent } = await supabase
    .from('students')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

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
