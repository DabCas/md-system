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

  // Get teacher data
  const { data: teacher } = await supabase
    .from('teachers')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Get user's avatar from metadata
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture

  if (!teacher) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Teacher Account Not Found</h1>
          <p className="mt-2 text-gray-600">
            Please contact an administrator to set up your account.
          </p>
        </div>
      </div>
    )
  }

  // Get today's records count
  const today = new Date().toISOString().split('T')[0]
  const { count: meritsToday } = await supabase
    .from('records')
    .select('*', { count: 'exact', head: true })
    .eq('teacher_id', teacher.id)
    .eq('type', 'merit')
    .gte('created_at', `${today}T00:00:00`)
    .eq('is_deleted', false)

  const { count: demeritsToday } = await supabase
    .from('records')
    .select('*', { count: 'exact', head: true })
    .eq('teacher_id', teacher.id)
    .eq('type', 'demerit')
    .gte('created_at', `${today}T00:00:00`)
    .eq('is_deleted', false)

  // Get current week's quota
  const startOfWeek = getStartOfWeek(new Date())
  const { data: weeklyQuota } = await supabase
    .from('weekly_quotas')
    .select('*')
    .eq('teacher_id', teacher.id)
    .eq('week_start', startOfWeek)
    .single()

  const meritsIssued = weeklyQuota?.merits_issued || 0
  const quotaLimit = weeklyQuota?.quota_limit || 5
  const remainingQuota = quotaLimit - meritsIssued

  // Get current month's records with student info
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: monthRecords } = await supabase
    .from('records')
    .select(`
      id,
      type,
      reason,
      quantity,
      created_at,
      students (
        id,
        full_name,
        english_name
      )
    `)
    .eq('teacher_id', teacher.id)
    .gte('created_at', startOfMonth.toISOString())
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(50)

  // Get all students for the form
  const { data: students } = await supabase
    .from('students')
    .select('id, full_name, english_name, grade, section')
    .order('grade', { ascending: true })
    .order('section', { ascending: true })
    .order('english_name', { ascending: true })

  return (
    <TeacherDashboardClient
      teacherId={teacher.id}
      teacherName={teacher.name}
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
