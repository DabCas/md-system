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

  // Get all unlinked students
  const { data: students } = await supabase
    .from('students')
    .select('id, full_name, english_name, grade, section')
    .is('user_id', null)
    .order('full_name', { ascending: true })

  return (
    <LinkAccountClient
      user={user}
      students={students || []}
    />
  )
}
