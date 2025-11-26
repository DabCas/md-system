import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminDashboardClient } from '@/components/admin-dashboard-client'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Only admins can access this page
  const userRole = user.user_metadata?.role
  if (userRole !== 'admin') {
    redirect('/dashboard')
  }

  // Get admin data
  const { data: admin } = await supabase
    .from('admins')
    .select('id, name')
    .eq('email', user.email)
    .maybeSingle()

  if (!admin) {
    redirect('/login?error=account_not_found')
  }

  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture

  // Fetch all data in parallel
  const [
    teachersResult,
    principalsResult,
    studentsResult,
    adminsResult,
  ] = await Promise.all([
    supabase.from('teachers').select('id, name, email').order('name'),
    supabase.from('principals').select('id, name, email').order('name'),
    supabase.from('students').select('id, full_name, english_name, grade, email').order('grade').order('english_name'),
    supabase.from('admins').select('id', { count: 'exact', head: true }),
  ])

  return (
    <AdminDashboardClient
      adminName={admin.name}
      avatarUrl={avatarUrl}
      stats={{
        totalTeachers: teachersResult.data?.length || 0,
        totalPrincipals: principalsResult.data?.length || 0,
        totalStudents: studentsResult.data?.length || 0,
        totalAdmins: adminsResult.count || 0,
      }}
      teachers={teachersResult.data || []}
      principals={principalsResult.data || []}
      students={studentsResult.data || []}
    />
  )
}
