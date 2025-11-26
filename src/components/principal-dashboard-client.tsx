'use client'

import { useState } from 'react'
import {
  Users,
  Award,
  XCircle,
  TrendingUp,
  AlertTriangle,
  Clock,
  UserCheck,
  Calendar,
  Gavel,
  Check,
  Ban,
  ShieldCheck,
  RotateCcw,
  Loader2,
} from 'lucide-react'
import { DashboardHeader } from '@/components/dashboard-header'
import { createClient } from '@/lib/supabase/client'

interface Stats {
  totalStudents: number
  weekMerits: number
  weekDemerits: number
  monthMerits: number
  monthDemerits: number
  pendingDetentions: number
  totalTeachers: number
}

interface StudentSummary {
  name: string
  grade: string
  total: number
}

interface RecentRecord {
  id: string
  type: 'merit' | 'demerit'
  reason: string
  quantity: number
  created_at: string
  studentName: string
  studentGrade: string
  teacherName: string
}

interface Detention {
  id: string
  studentId: string
  studentName: string
  studentGrade: string
  demeritsCount: number
  month: string
  status: 'pending' | 'served' | 'excused'
  triggeredOn: string
  createdAt: string
}

interface UniformPass {
  id: string
  studentName: string
  studentGrade: string
  meritsCount: number
  createdAt: string
}

interface PrincipalDashboardClientProps {
  principalName: string
  avatarUrl?: string
  stats: Stats
  topStudents: StudentSummary[]
  attentionStudents: StudentSummary[]
  recentRecords: RecentRecord[]
  detentions: Detention[]
  uniformPasses: UniformPass[]
  monthlyResetDate: string
}

export function PrincipalDashboardClient({
  principalName,
  avatarUrl,
  stats,
  topStudents,
  attentionStudents,
  recentRecords,
  detentions: initialDetentions,
  uniformPasses,
  monthlyResetDate,
}: PrincipalDashboardClientProps) {
  const [detentions, setDetentions] = useState<Detention[]>(initialDetentions)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [isResetting, setIsResetting] = useState(false)

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const updateDetentionStatus = async (detentionId: string, newStatus: 'served' | 'excused') => {
    setUpdatingId(detentionId)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('detentions')
        .update({ status: newStatus })
        .eq('id', detentionId)

      if (error) {
        console.error('Failed to update detention:', error)
        alert('Failed to update detention status')
        return
      }

      // Update local state
      setDetentions(prev =>
        prev.map(d =>
          d.id === detentionId ? { ...d, status: newStatus } : d
        )
      )
    } finally {
      setUpdatingId(null)
    }
  }

  const handleResetCounts = async () => {
    if (!confirm('Are you sure you want to reset all merit and demerit counts? This will start a new counting period from now. Records are not deleted.')) {
      return
    }

    setIsResetting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('system_settings')
        .update({ value: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('key', 'monthly_reset_date')

      if (error) {
        console.error('Failed to reset:', error)
        alert('Failed to reset counts')
        return
      }

      // Refresh the page to show updated counts
      window.location.reload()
    } finally {
      setIsResetting(false)
    }
  }

  const formatResetDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const pendingDetentions = detentions.filter(d => d.status === 'pending')
  const resolvedDetentions = detentions.filter(d => d.status !== 'pending')

  return (
    <div className="min-h-screen bg-pampas">
      <DashboardHeader
        title="Principal Dashboard"
        userName={principalName}
        userRole="principal"
        avatarUrl={avatarUrl}
        showTeacherSwitch
      />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="Total Students"
            value={stats.totalStudents}
            color="bg-biscay"
          />
          <StatCard
            icon={<UserCheck className="h-5 w-5" />}
            label="Teachers"
            value={stats.totalTeachers}
            color="bg-biscay"
          />
          <StatCard
            icon={<Award className="h-5 w-5" />}
            label="Week Merits"
            value={stats.weekMerits}
            color="bg-emerald-600"
          />
          <StatCard
            icon={<XCircle className="h-5 w-5" />}
            label="Week Demerits"
            value={stats.weekDemerits}
            color="bg-camelot"
          />
        </div>

        {/* Period Summary */}
        <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-biscay" />
              <div>
                <h2 className="font-semibold text-biscay">Current Period</h2>
                <p className="text-xs text-gray-500">Since {formatResetDate(monthlyResetDate)}</p>
              </div>
            </div>
            <button
              onClick={handleResetCounts}
              disabled={isResetting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-camelot bg-camelot/10 hover:bg-camelot/20 rounded-lg transition-colors disabled:opacity-50"
            >
              {isResetting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RotateCcw className="h-3.5 w-3.5" />
              )}
              Reset Counts
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl md:text-3xl font-bold text-emerald-600">{stats.monthMerits}</p>
              <p className="text-xs text-gray-500">Total Merits</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-camelot">{stats.monthDemerits}</p>
              <p className="text-xs text-gray-500">Total Demerits</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-amber-600">{stats.pendingDetentions}</p>
              <p className="text-xs text-gray-500">Pending Detentions</p>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {/* Top Performers */}
          <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <h2 className="font-semibold text-biscay">Top Performers</h2>
            </div>
            {topStudents.length > 0 ? (
              <div className="space-y-1">
                {topStudents.map((student, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0"
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-600' :
                      index === 2 ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-50 text-gray-500'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="font-medium text-xs text-gray-900 truncate">{student.name}</span>
                    <span className="text-[10px] text-gray-400">G{student.grade}</span>
                    <span className="text-xs text-emerald-600 font-bold ml-auto">{student.total}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No merits recorded this month</p>
            )}
          </div>

          {/* Students Needing Attention */}
          <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h2 className="font-semibold text-biscay">Needs Attention</h2>
            </div>
            {attentionStudents.length > 0 ? (
              <div className="space-y-1">
                {attentionStudents.map((student, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0"
                  >
                    <span className="font-medium text-xs text-gray-900 truncate">{student.name}</span>
                    <span className="text-[10px] text-gray-400">G{student.grade}</span>
                    <span className={`text-xs font-bold ml-auto ${
                      student.total >= 3 ? 'text-red-600' : 'text-camelot'
                    }`}>
                      {student.total}{student.total >= 3 && ' ⚠️'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No students with demerits</p>
            )}
          </div>
        </div>

        {/* Uniform Passes This Week */}
        <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <h2 className="font-semibold text-biscay">Uniform Passes This Week</h2>
            {uniformPasses.length > 0 && (
              <span className="ml-auto bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-0.5 rounded-full">
                {uniformPasses.length} earned
              </span>
            )}
          </div>

          {uniformPasses.length > 0 ? (
            <div className="space-y-1">
              {uniformPasses.map((pass) => (
                <div
                  key={pass.id}
                  className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                  <span className="font-medium text-xs text-gray-900">{pass.studentName}</span>
                  <span className="text-[10px] text-gray-400">G{pass.studentGrade}</span>
                  <span className="text-xs text-emerald-600 ml-auto">at {pass.meritsCount} merits</span>
                  <span className="text-[10px] text-gray-400">{formatTime(pass.createdAt)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No uniform passes earned this week</p>
          )}
        </div>

        {/* Detention Management */}
        <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Gavel className="h-5 w-5 text-amber-600" />
            <h2 className="font-semibold text-biscay">Detention Management</h2>
            {pendingDetentions.length > 0 && (
              <span className="ml-auto bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full">
                {pendingDetentions.length} pending
              </span>
            )}
          </div>

          {pendingDetentions.length > 0 ? (
            <div className="space-y-2">
              {pendingDetentions.map((detention) => (
                <div
                  key={detention.id}
                  className="flex items-center gap-2 py-2 px-3 bg-amber-50 border border-amber-200 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-900">{detention.studentName}</span>
                      <span className="text-[10px] text-gray-400">G{detention.studentGrade}</span>
                      <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                        {detention.demeritsCount} demerits
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Triggered {formatTime(detention.triggeredOn)} • {detention.month}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => updateDetentionStatus(detention.id, 'served')}
                      disabled={updatingId === detention.id}
                      className="flex items-center gap-1 px-2 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                    >
                      <Check className="h-3 w-3" />
                      <span className="hidden sm:inline">Served</span>
                    </button>
                    <button
                      onClick={() => updateDetentionStatus(detention.id, 'excused')}
                      disabled={updatingId === detention.id}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 disabled:opacity-50 transition-colors"
                    >
                      <Ban className="h-3 w-3" />
                      <span className="hidden sm:inline">Excuse</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No pending detentions</p>
          )}

          {resolvedDetentions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Recently resolved</p>
              <div className="space-y-1">
                {resolvedDetentions.slice(0, 5).map((detention) => (
                  <div
                    key={detention.id}
                    className="flex items-center gap-2 py-1.5 text-gray-500"
                  >
                    {detention.status === 'served' ? (
                      <Check className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <Ban className="h-3 w-3 text-gray-400" />
                    )}
                    <span className="text-xs">{detention.studentName}</span>
                    <span className="text-[10px] text-gray-400">G{detention.studentGrade}</span>
                    <span className={`text-[10px] ml-auto ${
                      detention.status === 'served' ? 'text-emerald-600' : 'text-gray-400'
                    }`}>
                      {detention.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-5 w-5 text-biscay" />
            <h2 className="font-semibold text-biscay">Recent Activity</h2>
          </div>
          {recentRecords.length > 0 ? (
            <div className="space-y-1">
              {recentRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0"
                >
                  {record.type === 'merit' ? (
                    <Award className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-red-600 flex-shrink-0" />
                  )}
                  <span className="font-medium text-xs text-gray-900 truncate">{record.studentName}</span>
                  <span className="text-[10px] text-gray-400 hidden sm:inline">G{record.studentGrade}</span>
                  <span className="text-xs text-gray-400 truncate flex-1 min-w-0 hidden md:block">{record.reason}</span>
                  <span className="text-[10px] text-gray-400 hidden sm:inline">by {record.teacherName}</span>
                  <span className="text-[10px] text-gray-400">{formatTime(record.created_at)}</span>
                  <span className={`text-xs font-bold flex-shrink-0 ${
                    record.type === 'merit' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {record.type === 'merit' ? '+' : '-'}{record.quantity}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: string
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className={`inline-flex p-2 rounded-lg ${color} text-white mb-2`}>
        {icon}
      </div>
      <p className="text-2xl md:text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}
