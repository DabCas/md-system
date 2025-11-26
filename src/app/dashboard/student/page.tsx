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

  // Get the monthly reset date from settings
  const { data: resetSetting } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'monthly_reset_date')
    .single()

  const monthlyResetDate = resetSetting?.value ? new Date(resetSetting.value) : new Date()
  monthlyResetDate.setHours(0, 0, 0, 0)

  // Calculate sum of merit quantities (since last reset)
  const { data: meritRecords } = await supabase
    .from('records')
    .select('quantity')
    .eq('student_id', student.id)
    .eq('type', 'merit')
    .eq('is_deleted', false)
    .gte('created_at', monthlyResetDate.toISOString())

  const meritsTotal = meritRecords?.reduce((sum, record) => sum + record.quantity, 0) || 0

  // Get total demerits (since last reset)
  const { data: demeritRecords } = await supabase
    .from('records')
    .select('quantity')
    .eq('student_id', student.id)
    .eq('type', 'demerit')
    .eq('is_deleted', false)
    .gte('created_at', monthlyResetDate.toISOString())

  const demeritsTotal = demeritRecords?.reduce((sum, record) => sum + record.quantity, 0) || 0

  // Get raffle entries (since last reset)
  const { data: raffleEntries } = await supabase
    .from('raffle_entries')
    .select('total_entries')
    .eq('student_id', student.id)
    .gte('created_at', monthlyResetDate.toISOString())

  const totalRaffleEntries = raffleEntries?.reduce((sum, entry) => sum + (entry.total_entries || 0), 0) || 0

  // Get uniform passes (since last reset)
  const { data: uniformPassesThisPeriod } = await supabase
    .from('uniform_passes')
    .select('*')
    .eq('student_id', student.id)
    .gte('created_at', monthlyResetDate.toISOString())
    .order('created_at', { ascending: false })

  // Get all uniform passes (for history)
  const { data: allUniformPasses } = await supabase
    .from('uniform_passes')
    .select('*')
    .eq('student_id', student.id)
    .order('created_at', { ascending: false })
    .limit(20)

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
  interface RecordWithTeachers {
    id: string
    type: 'merit' | 'demerit'
    reason: string
    quantity: number
    created_at: string
    teachers: { name: string } | { name: string }[]
  }

  const records = recordsRaw?.map((record: RecordWithTeachers) => ({
    ...record,
    teachers: Array.isArray(record.teachers) ? record.teachers[0] : record.teachers
  }))

  // Calculate progress to next uniform pass
  const nextPassAt = (Math.floor(meritsTotal / 5) + 1) * 5
  const progressToNextPass = meritsTotal % 5

  // Check for pending detentions (since last reset)
  const { data: pendingDetention } = await supabase
    .from('detentions')
    .select('id, demerits_count, month, status')
    .eq('student_id', student.id)
    .eq('status', 'pending')
    .gte('created_at', monthlyResetDate.toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return (
    <StudentDashboardClient
      student={student}
      avatarUrl={user.user_metadata?.avatar_url || user.user_metadata?.picture}
      meritsTotal={meritsTotal}
      demeritsTotal={demeritsTotal}
      raffleEntries={totalRaffleEntries}
      uniformPassesThisMonth={uniformPassesThisPeriod?.length || 0}
      uniformPassHistory={allUniformPasses || []}
      nextPassAt={nextPassAt}
      progressToNextPass={progressToNextPass}
      records={records || []}
      pendingDetention={pendingDetention}
    />
  )
}
