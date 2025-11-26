import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PrincipalDashboardClient } from '@/components/principal-dashboard-client'
import { getSchoolWeekStart, getSchoolWeekEnd } from '@/lib/utils'

export default async function PrincipalDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userRole = user.user_metadata?.role
  const userEmail = user.email

  // Only principals and admins can access this page
  if (userRole !== 'principal' && userRole !== 'admin') {
    redirect('/dashboard')
  }

  // Get principal data
  let principalData: { id: string; name: string } | null = null

  if (userRole === 'principal') {
    const { data: principal } = await supabase
      .from('principals')
      .select('id, name')
      .eq('email', userEmail)
      .maybeSingle()
    principalData = principal
  } else if (userRole === 'admin') {
    const { data: admin } = await supabase
      .from('admins')
      .select('id, name')
      .eq('email', userEmail)
      .maybeSingle()
    principalData = admin
  }

  if (!principalData) {
    redirect('/login?error=account_not_found')
  }

  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture

  // Get current week boundaries (Friday to Thursday)
  const now = new Date()
  const weekStart = new Date(getSchoolWeekStart(now))
  const weekEnd = getSchoolWeekEnd(now)

  // Get the monthly reset date from settings
  const { data: resetSetting } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'monthly_reset_date')
    .single()

  const monthlyResetDate = resetSetting?.value ? new Date(resetSetting.value) : new Date()
  monthlyResetDate.setHours(0, 0, 0, 0)

  // Run all queries in parallel for performance
  const [
    studentsResult,
    weekMeritsResult,
    weekDemeritsResult,
    monthMeritsResult,
    monthDemeritsResult,
    topStudentsResult,
    attentionStudentsResult,
    recentRecordsResult,
    teachersResult,
    detentionsResult,
    detentionsListResult,
    uniformPassesResult,
  ] = await Promise.all([
    // Total students count
    supabase.from('students').select('*', { count: 'exact', head: true }),

    // This week's merits
    supabase
      .from('records')
      .select('quantity')
      .eq('type', 'merit')
      .gte('created_at', weekStart.toISOString())
      .lte('created_at', weekEnd.toISOString())
      .eq('is_deleted', false),

    // This week's demerits
    supabase
      .from('records')
      .select('quantity')
      .eq('type', 'demerit')
      .gte('created_at', weekStart.toISOString())
      .lte('created_at', weekEnd.toISOString())
      .eq('is_deleted', false),

    // Merits since last reset
    supabase
      .from('records')
      .select('quantity')
      .eq('type', 'merit')
      .gte('created_at', monthlyResetDate.toISOString())
      .eq('is_deleted', false),

    // Demerits since last reset
    supabase
      .from('records')
      .select('quantity')
      .eq('type', 'demerit')
      .gte('created_at', monthlyResetDate.toISOString())
      .eq('is_deleted', false),

    // Top students by merit (since last reset)
    supabase
      .from('records')
      .select(`
        student_id,
        quantity,
        students!inner (
          id,
          english_name,
          grade
        )
      `)
      .eq('type', 'merit')
      .gte('created_at', monthlyResetDate.toISOString())
      .eq('is_deleted', false),

    // Students with demerits (needing attention)
    supabase
      .from('records')
      .select(`
        student_id,
        quantity,
        students!inner (
          id,
          english_name,
          grade
        )
      `)
      .eq('type', 'demerit')
      .gte('created_at', monthlyResetDate.toISOString())
      .eq('is_deleted', false),

    // Recent records with student and teacher info
    supabase
      .from('records')
      .select(`
        id,
        type,
        reason,
        quantity,
        created_at,
        students!inner (
          id,
          english_name,
          grade
        ),
        teachers!inner (
          id,
          name
        )
      `)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(20),

    // All teachers
    supabase.from('teachers').select('id, name'),

    // Pending detentions count
    supabase
      .from('detentions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),

    // All detentions with student info (for management)
    supabase
      .from('detentions')
      .select(`
        id,
        student_id,
        demerits_count,
        month,
        status,
        triggered_on,
        created_at,
        students!inner (
          id,
          english_name,
          grade
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50),

    // This week's uniform passes
    supabase
      .from('uniform_passes')
      .select(`
        id,
        student_id,
        merits_count,
        month,
        created_at,
        students!inner (
          id,
          english_name,
          grade
        )
      `)
      .gte('created_at', weekStart.toISOString())
      .lte('created_at', weekEnd.toISOString())
      .order('created_at', { ascending: false }),
  ])

  // Calculate totals
  const totalStudents = studentsResult.count || 0
  const weekMerits = weekMeritsResult.data?.reduce((sum, r) => sum + r.quantity, 0) || 0
  const weekDemerits = weekDemeritsResult.data?.reduce((sum, r) => sum + r.quantity, 0) || 0
  const monthMerits = monthMeritsResult.data?.reduce((sum, r) => sum + r.quantity, 0) || 0
  const monthDemerits = monthDemeritsResult.data?.reduce((sum, r) => sum + r.quantity, 0) || 0
  const pendingDetentions = detentionsResult.count || 0

  // Aggregate top students by merit
  interface StudentRecord {
    student_id: string
    quantity: number
    students: {
      id: string
      english_name: string
      grade: string
    } | {
      id: string
      english_name: string
      grade: string
    }[]
  }

  const meritsByStudent = new Map<string, { name: string; grade: string; total: number }>()
  topStudentsResult.data?.forEach((record: StudentRecord) => {
    const student = Array.isArray(record.students) ? record.students[0] : record.students
    const existing = meritsByStudent.get(student.id)
    if (existing) {
      existing.total += record.quantity
    } else {
      meritsByStudent.set(student.id, {
        name: student.english_name,
        grade: student.grade,
        total: record.quantity,
      })
    }
  })

  const topStudents = Array.from(meritsByStudent.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  // Aggregate students needing attention (by demerit count)
  const demeritsByStudent = new Map<string, { name: string; grade: string; total: number }>()
  attentionStudentsResult.data?.forEach((record: StudentRecord) => {
    const student = Array.isArray(record.students) ? record.students[0] : record.students
    const existing = demeritsByStudent.get(student.id)
    if (existing) {
      existing.total += record.quantity
    } else {
      demeritsByStudent.set(student.id, {
        name: student.english_name,
        grade: student.grade,
        total: record.quantity,
      })
    }
  })

  const attentionStudents = Array.from(demeritsByStudent.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  // Transform recent records
  interface RecentRecord {
    id: string
    type: 'merit' | 'demerit'
    reason: string
    quantity: number
    created_at: string
    students: { id: string; english_name: string; grade: string } | { id: string; english_name: string; grade: string }[]
    teachers: { id: string; name: string } | { id: string; name: string }[]
  }

  const recentRecords = recentRecordsResult.data?.map((record: RecentRecord) => ({
    id: record.id,
    type: record.type,
    reason: record.reason,
    quantity: record.quantity,
    created_at: record.created_at,
    studentName: Array.isArray(record.students) ? record.students[0].english_name : record.students.english_name,
    studentGrade: Array.isArray(record.students) ? record.students[0].grade : record.students.grade,
    teacherName: Array.isArray(record.teachers) ? record.teachers[0].name : record.teachers.name,
  })) || []

  // Transform detentions list
  interface DetentionRecord {
    id: string
    student_id: string
    demerits_count: number
    month: string
    status: 'pending' | 'served' | 'excused'
    triggered_on: string
    created_at: string
    students: { id: string; english_name: string; grade: string } | { id: string; english_name: string; grade: string }[]
  }

  const detentions = detentionsListResult.data?.map((d: DetentionRecord) => ({
    id: d.id,
    studentId: d.student_id,
    studentName: Array.isArray(d.students) ? d.students[0].english_name : d.students.english_name,
    studentGrade: Array.isArray(d.students) ? d.students[0].grade : d.students.grade,
    demeritsCount: d.demerits_count,
    month: d.month,
    status: d.status,
    triggeredOn: d.triggered_on,
    createdAt: d.created_at,
  })) || []

  // Transform uniform passes
  interface UniformPassRecord {
    id: string
    student_id: string
    merits_count: number
    month: string
    created_at: string
    students: { id: string; english_name: string; grade: string } | { id: string; english_name: string; grade: string }[]
  }

  const uniformPasses = uniformPassesResult.data?.map((p: UniformPassRecord) => ({
    id: p.id,
    studentName: Array.isArray(p.students) ? p.students[0].english_name : p.students.english_name,
    studentGrade: Array.isArray(p.students) ? p.students[0].grade : p.students.grade,
    meritsCount: p.merits_count,
    createdAt: p.created_at,
  })) || []

  return (
    <PrincipalDashboardClient
      principalName={principalData.name}
      avatarUrl={avatarUrl}
      stats={{
        totalStudents,
        weekMerits,
        weekDemerits,
        monthMerits,
        monthDemerits,
        pendingDetentions,
        totalTeachers: teachersResult.data?.length || 0,
      }}
      topStudents={topStudents}
      attentionStudents={attentionStudents}
      recentRecords={recentRecords}
      detentions={detentions}
      uniformPasses={uniformPasses}
      monthlyResetDate={monthlyResetDate.toISOString()}
    />
  )
}
