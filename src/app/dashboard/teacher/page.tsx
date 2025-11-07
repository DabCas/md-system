import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TeacherDashboardClient } from '@/components/teacher-dashboard-client'

export default async function TeacherDashboardPage() {
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
    // Try to find principal by email first (highest priority)
    const { data: principalByEmail } = await supabase
      .from('principals')
      .select('*')
      .eq('email', userEmail)
      .maybeSingle()

    if (principalByEmail && !principalByEmail.user_id) {
      // Auto-link principal
      await supabase.from('users').upsert({
        id: user.id,
        email: userEmail,
        role: 'principal',
        full_name: user.user_metadata?.name || user.user_metadata?.full_name || ''
      }, {
        onConflict: 'id',
        ignoreDuplicates: false
      })

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
        // Auto-link teacher
        await supabase.from('users').upsert({
          id: user.id,
          email: userEmail,
          role: 'teacher',
          full_name: user.user_metadata?.name || user.user_metadata?.full_name || ''
        }, {
          onConflict: 'id',
          ignoreDuplicates: false
        })

        await supabase
          .from('teachers')
          .update({ user_id: user.id })
          .eq('id', teacherByEmail.id)

        teacher = { ...teacherByEmail, user_id: user.id }
      }
    }
  }

  // Get user's avatar from metadata
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture

  // If still not found, redirect to link-account page (for students)
  if (!teacher && !principal) {
    redirect('/link-account')
  }

  // Use teacher or principal data (principals have full access like teachers)
  const accountData = teacher || principal
  const accountId = accountData?.id || ''
  const accountName = accountData?.name || ''

  // Get today's records count (principals see all, teachers see only theirs)
  const today = new Date().toISOString().split('T')[0]
  let meritsQuery = supabase
    .from('records')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'merit')
    .gte('created_at', `${today}T00:00:00`)
    .eq('is_deleted', false)

  let demeritsQuery = supabase
    .from('records')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'demerit')
    .gte('created_at', `${today}T00:00:00`)
    .eq('is_deleted', false)

  // If teacher (not principal), filter by teacher_id
  if (teacher) {
    meritsQuery = meritsQuery.eq('teacher_id', teacher.id)
    demeritsQuery = demeritsQuery.eq('teacher_id', teacher.id)
  }

  const { count: meritsToday } = await meritsQuery
  const { count: demeritsToday } = await demeritsQuery

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

  // Get current month's records with student info
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  let monthRecordsQuery = supabase
    .from('records')
    .select(`
      id,
      type,
      reason,
      location,
      quantity,
      created_at,
      students!inner (
        id,
        full_name,
        english_name
      )
    `)
    .gte('created_at', startOfMonth.toISOString())
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(50)

  // If teacher (not principal), filter by teacher_id
  if (teacher) {
    monthRecordsQuery = monthRecordsQuery.eq('teacher_id', teacher.id)
  }

  const { data: monthRecordsRaw } = await monthRecordsQuery

  // Transform records to match expected type
  const monthRecords = monthRecordsRaw?.map((record: any) => ({
    ...record,
    students: Array.isArray(record.students) ? record.students[0] : record.students
  }))

  // Get all students for the form
  const { data: students } = await supabase
    .from('students')
    .select('id, full_name, english_name, grade')
    .order('grade', { ascending: true })
    .order('english_name', { ascending: true })

  return (
    <TeacherDashboardClient
      teacherId={accountId}
      teacherName={accountName}
      avatarUrl={avatarUrl}
      meritsToday={meritsToday || 0}
      demeritsToday={demeritsToday || 0}
      remainingQuota={remainingQuota}
      quotaLimit={quotaLimit}
      recentRecords={monthRecords || []}
      students={students || []}
    />
  )
}

function getStartOfWeek(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}
