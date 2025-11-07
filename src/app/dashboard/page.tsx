import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is a principal (use teacher dashboard for now)
  const { data: principal } = await supabase
    .from('principals')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (principal) {
    redirect('/dashboard/teacher')
  }

  // Check if user is a teacher
  const { data: teacher } = await supabase
    .from('teachers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (teacher) {
    redirect('/dashboard/teacher')
  }

  // Check if user is a linked student
  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (student) {
    redirect('/dashboard/student')
  }

  // User is neither principal, teacher, nor linked student - needs to link account
  redirect('/link-account')
}
