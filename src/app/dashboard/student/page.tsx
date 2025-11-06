import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StudentDashboardClient } from '@/components/student-dashboard-client'

export default async function StudentDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get student data
  const { data: student } = await supabase
    .from('students')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!student) {
    redirect('/link-account')
  }

  // Get total merits
  const { count: totalMerits } = await supabase
    .from('records')
    .select('quantity', { count: 'exact', head: false })
    .eq('student_id', student.id)
    .eq('type', 'merit')
    .eq('is_deleted', false)

  // Calculate sum of merit quantities
  const { data: meritRecords } = await supabase
    .from('records')
    .select('quantity')
    .eq('student_id', student.id)
    .eq('type', 'merit')
    .eq('is_deleted', false)

  const meritsTotal = meritRecords?.reduce((sum, record) => sum + record.quantity, 0) || 0

  // Get total demerits
  const { data: demeritRecords } = await supabase
    .from('records')
    .select('quantity')
    .eq('student_id', student.id)
    .eq('type', 'demerit')
    .eq('is_deleted', false)

  const demeritsTotal = demeritRecords?.reduce((sum, record) => sum + record.quantity, 0) || 0

  // Get current month's raffle entries
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
  const { data: raffleEntry } = await supabase
    .from('raffle_entries')
    .select('total_entries, remaining_entries')
    .eq('student_id', student.id)
    .eq('month', currentMonth)
    .single()

  // Get current week's uniform passes (Monday to Sunday)
  const now = new Date()
  const startOfWeek = new Date(now)
  const dayOfWeek = now.getDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Monday is 1, Sunday is 0
  startOfWeek.setDate(now.getDate() + diff)
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  const { data: uniformPasses } = await supabase
    .from('uniform_passes')
    .select('*')
    .eq('student_id', student.id)
    .gte('earned_on', startOfWeek.toISOString())
    .lte('earned_on', endOfWeek.toISOString())
    .order('earned_on', { ascending: false })

  // Get all records with teacher info
  const { data: recordsRaw } = await supabase
    .from('records')
    .select(`
      id,
      type,
      reason,
      quantity,
      created_at,
      teachers!inner (
        name
      )
    `)
    .eq('student_id', student.id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(100)

  // Transform records to match expected type
  const records = recordsRaw?.map((record: any) => ({
    ...record,
    teachers: Array.isArray(record.teachers) ? record.teachers[0] : record.teachers
  }))

  return (
    <StudentDashboardClient
      student={student}
      avatarUrl={user.user_metadata?.avatar_url || user.user_metadata?.picture}
      meritsTotal={meritsTotal}
      demeritsTotal={demeritsTotal}
      raffleEntries={raffleEntry?.total_entries || 0}
      uniformPasses={uniformPasses?.length || 0}
      records={records || []}
    />
  )
}
