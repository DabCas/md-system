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

  const userEmail = user.email

  // Get teacher data by user_id first
  let { data: teacher } = await supabase
    .from('teachers')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  // Check if user is a principal by user_id
  let { data: principal } = await supabase
    .from('principals')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  // If not found by user_id, try to find and auto-link by email
  if (!teacher && !principal && userEmail) {
    // Try to find principal by email first
    const { data: principalByEmail } = await supabase
      .from('principals')
      .select('*')
      .eq('email', userEmail)
      .maybeSingle()

    if (principalByEmail && !principalByEmail.user_id) {
      await supabase.from('users').upsert({
        id: user.id,
        email: userEmail,
        role: 'principal',
        full_name: user.user_metadata?.name || user.user_metadata?.full_name || ''
      }, { onConflict: 'id', ignoreDuplicates: false })

      await supabase
        .from('principals')
        .update({ user_id: user.id })
        .eq('id', principalByEmail.id)

      principal = { ...principalByEmail, user_id: user.id }
    }

    // Try to find teacher by email
    if (!principal) {
      const { data: teacherByEmail } = await supabase
        .from('teachers')
        .select('*')
        .eq('email', userEmail)
        .maybeSingle()

      if (teacherByEmail && !teacherByEmail.user_id) {
        await supabase.from('users').upsert({
          id: user.id,
          email: userEmail,
          role: 'teacher',
          full_name: user.user_metadata?.name || user.user_metadata?.full_name || ''
        }, { onConflict: 'id', ignoreDuplicates: false })

        await supabase
          .from('teachers')
          .update({ user_id: user.id })
          .eq('id', teacherByEmail.id)

        teacher = { ...teacherByEmail, user_id: user.id }
      }
    }
  }

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
