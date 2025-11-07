import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MeritForm } from '@/components/merit-form'

export default async function MeritPage() {
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

  // Get current week's quota (only for teachers, principals have unlimited)
  let meritsIssued = 0
  let quotaLimit = 999
  let remainingQuota = 999

  if (teacher) {
    const startOfWeek = getStartOfWeek(new Date())
    const { data: weeklyQuota } = await supabase
      .from('weekly_quotas')
      .select('*')
      .eq('teacher_id', teacher.id)
      .eq('week_start', startOfWeek)
      .single()

    meritsIssued = weeklyQuota?.merits_issued || 0
    quotaLimit = weeklyQuota?.quota_limit || 5
    remainingQuota = quotaLimit - meritsIssued
  }

  return (
    <MeritForm
      teacherId={accountId}
      teacherName={accountName}
      students={students || []}
      remainingQuota={remainingQuota}
      quotaLimit={quotaLimit}
    />
  )
}

function getStartOfWeek(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}
