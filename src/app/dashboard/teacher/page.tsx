import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TeacherDashboardClient } from '@/components/teacher-dashboard-client'
import { getSchoolWeekStart, getSchoolMonthStartISO } from '@/lib/utils'

export default async function TeacherDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get role from user metadata
  const userRole = user.user_metadata?.role
  const userEmail = user.email

  // Only admins, principals, and teachers can access this page
  if (userRole !== 'admin' && userRole !== 'principal' && userRole !== 'teacher') {
    redirect('/dashboard')
  }

  // Get account data by email (simple email matching)
  let accountData: { id: string; name: string } | null = null
  let teacherId = '' // This is always the teacher_id for issuing records
  let accountName = ''

  if (userRole === 'teacher') {
    const { data: teacher } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', userEmail)
      .maybeSingle()
    accountData = teacher
    teacherId = teacher?.id || ''
  } else if (userRole === 'principal') {
    const { data: principal } = await supabase
      .from('principals')
      .select('*')
      .eq('email', userEmail)
      .maybeSingle()
    accountData = principal
    // Principals also have a teacher record for issuing merits/demerits
    const { data: teacherRecord } = await supabase
      .from('teachers')
      .select('id')
      .eq('email', userEmail)
      .maybeSingle()
    teacherId = teacherRecord?.id || ''
  } else if (userRole === 'admin') {
    const { data: admin } = await supabase
      .from('admins')
      .select('*')
      .eq('email', userEmail)
      .maybeSingle()
    accountData = admin
    // Admins also have a teacher record for issuing merits/demerits
    const { data: teacherRecord } = await supabase
      .from('teachers')
      .select('id')
      .eq('email', userEmail)
      .maybeSingle()
    teacherId = teacherRecord?.id || ''
  }

  // Get user's avatar from metadata
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture

  // If account not found, something is wrong
  if (!accountData) {
    redirect('/login?error=account_not_found')
  }

  // If no teacher record found for principal/admin, something is wrong
  if ((userRole === 'principal' || userRole === 'admin') && !teacherId) {
    redirect('/login?error=teacher_record_not_found')
  }

  accountName = accountData?.name || ''

  // Get this week's records (sum of quantities, not count)
  const weekStart = getSchoolWeekStart(new Date())
  const weekStartDate = new Date(weekStart)
  const weekEndDate = new Date(weekStartDate)
  weekEndDate.setDate(weekEndDate.getDate() + 7)

  let meritsQuery = supabase
    .from('records')
    .select('quantity')
    .eq('type', 'merit')
    .gte('created_at', weekStartDate.toISOString())
    .lt('created_at', weekEndDate.toISOString())
    .eq('is_deleted', false)

  let demeritsQuery = supabase
    .from('records')
    .select('quantity')
    .eq('type', 'demerit')
    .gte('created_at', weekStartDate.toISOString())
    .lt('created_at', weekEndDate.toISOString())
    .eq('is_deleted', false)

  // If teacher (not principal/admin), filter by teacher_id
  if (userRole === 'teacher') {
    meritsQuery = meritsQuery.eq('teacher_id', teacherId)
    demeritsQuery = demeritsQuery.eq('teacher_id', teacherId)
  }

  const { data: meritsData } = await meritsQuery
  const { data: demeritsData } = await demeritsQuery
  const meritsThisWeek = meritsData?.reduce((sum, r) => sum + r.quantity, 0) || 0
  const demeritsThisWeek = demeritsData?.reduce((sum, r) => sum + r.quantity, 0) || 0

  // Get current week's quota (only for teachers, principals and admins have unlimited)
  let meritsIssued = 0
  let quotaLimit = 999
  let remainingQuota = 999

  if (userRole === 'teacher') {
    const startOfWeek = getSchoolWeekStart(new Date())

    // Get quota limit from weekly_quotas table
    const { data: weeklyQuota } = await supabase
      .from('weekly_quotas')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('week_start', startOfWeek)
      .single()

    quotaLimit = weeklyQuota?.quota_limit || 5

    // Calculate actual merits issued this week from records table
    const startOfWeekDate = new Date(startOfWeek)
    const endOfWeekDate = new Date(startOfWeekDate)
    endOfWeekDate.setDate(endOfWeekDate.getDate() + 7)

    const { data: weekRecords } = await supabase
      .from('records')
      .select('quantity')
      .eq('teacher_id', teacherId)
      .eq('type', 'merit')
      .gte('created_at', startOfWeekDate.toISOString())
      .lt('created_at', endOfWeekDate.toISOString())
      .eq('is_deleted', false)

    meritsIssued = weekRecords?.reduce((sum, record) => sum + record.quantity, 0) || 0
    remainingQuota = quotaLimit - meritsIssued
  }

  // Get current school month's records (resets on first Friday of month)
  const schoolMonthStart = getSchoolMonthStartISO(new Date())

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
        english_name,
        grade
      )
    `)
    .gte('created_at', schoolMonthStart)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(50)

  // If teacher (not principal/admin), filter by teacher_id
  if (userRole === 'teacher') {
    monthRecordsQuery = monthRecordsQuery.eq('teacher_id', teacherId)
  }

  const { data: monthRecordsRaw } = await monthRecordsQuery

  // Transform records to match expected type
  interface RecordWithStudents {
    id: string
    type: 'merit' | 'demerit'
    reason: string
    location: string | null
    quantity: number
    created_at: string
    students: { id: string; full_name: string; english_name: string; grade: string | null } | { id: string; full_name: string; english_name: string; grade: string | null }[]
  }

  const monthRecords = monthRecordsRaw?.map((record: RecordWithStudents) => ({
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
      teacherId={teacherId}
      teacherName={accountName}
      avatarUrl={avatarUrl}
      meritsThisWeek={meritsThisWeek}
      demeritsThisWeek={demeritsThisWeek}
      remainingQuota={remainingQuota}
      quotaLimit={quotaLimit}
      recentRecords={monthRecords || []}
      students={students || []}
      userRole={userRole}
    />
  )
}
