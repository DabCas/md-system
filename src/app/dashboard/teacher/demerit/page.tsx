import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DemeritForm } from '@/components/demerit-form'

export default async function DemeritPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get teacher data
  const { data: teacher } = await supabase
    .from('teachers')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Check if user is a principal
  const { data: principal } = await supabase
    .from('principals')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!teacher && !principal) {
    redirect('/dashboard')
  }

  const accountData = teacher || principal
  const accountId = accountData?.id || ''
  const accountName = accountData?.name || ''

  // Get all students
  const { data: students } = await supabase
    .from('students')
    .select('id, full_name, english_name, grade')
    .order('grade')
    .order('english_name')

  return (
    <DemeritForm
      teacherId={accountId}
      teacherName={accountName}
      students={students || []}
    />
  )
}
