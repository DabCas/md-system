import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get role from user metadata (set by auth callback)
  const userRole = user.user_metadata?.role

  // Route to appropriate dashboard based on role
  if (userRole === 'admin') {
    redirect('/dashboard/admin')
  } else if (userRole === 'principal') {
    redirect('/dashboard/principal')
  } else if (userRole === 'teacher') {
    redirect('/dashboard/teacher')
  } else if (userRole === 'student') {
    redirect('/dashboard/student')
  }

  // No role found - should not happen with new flow
  redirect('/login?error=no_role')
}
