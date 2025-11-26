'use client'

import { Award, XCircle, Sparkles, Ticket, ShieldCheck, TrendingUp, AlertTriangle } from 'lucide-react'
import { DashboardHeader } from '@/components/dashboard-header'

interface Student {
  id: string
  full_name: string
  english_name: string
  grade: string
}

interface Teacher {
  name: string
}

interface Record {
  id: string
  type: 'merit' | 'demerit'
  reason: string
  quantity: number
  created_at: string
  teachers: Teacher | null
}

interface UniformPass {
  id: string
  merits_count: number
  month: string
  created_at: string
}

interface PendingDetention {
  id: string
  demerits_count: number
  month: string
  status: string
}

interface StudentDashboardClientProps {
  student: Student
  avatarUrl?: string
  meritsTotal: number
  demeritsTotal: number
  raffleEntries: number
  uniformPassesThisMonth: number
  uniformPassHistory: UniformPass[]
  nextPassAt: number
  progressToNextPass: number
  records: Record[]
  pendingDetention?: PendingDetention | null
}

export function StudentDashboardClient({
  student,
  avatarUrl,
  meritsTotal,
  demeritsTotal,
  raffleEntries,
  uniformPassesThisMonth,
  uniformPassHistory,
  nextPassAt,
  progressToNextPass,
  records,
  pendingDetention,
}: StudentDashboardClientProps) {
  return (
    <div className="min-h-screen bg-pampas">
      <DashboardHeader
        title="Student Dashboard"
        userName={student.english_name}
        userRole="student"
        avatarUrl={avatarUrl}
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Detention Alert */}
        {pendingDetention && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-red-800">Detention Required</h3>
              <p className="text-sm text-red-700 mt-1">
                You have a pending detention due to accumulating {pendingDetention.demerits_count} demerits.
                Please report to the principal&apos;s office to serve your detention.
              </p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 mb-6">
          {/* Merits Card */}
          <div className="bg-white rounded-xl p-3 lg:p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-wild-blue/10 rounded-lg mb-2">
                <Award className="h-5 w-5 lg:h-6 lg:w-6 text-wild-blue" />
              </div>
              <p className="text-xs lg:text-sm text-gray-600">Merits</p>
              <p className="text-2xl lg:text-3xl font-bold text-wild-blue">{meritsTotal}</p>
            </div>
          </div>

          {/* Demerits Card */}
          <div className="bg-white rounded-xl p-3 lg:p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-camelot/10 rounded-lg mb-2">
                <XCircle className="h-5 w-5 lg:h-6 lg:w-6 text-camelot" />
              </div>
              <p className="text-xs lg:text-sm text-gray-600">Demerits</p>
              <p className="text-2xl lg:text-3xl font-bold text-camelot">{demeritsTotal}</p>
            </div>
          </div>

          {/* Raffle Entries Card */}
          <div className="bg-white rounded-xl p-3 lg:p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-biscay/10 rounded-lg mb-2">
                <Ticket className="h-5 w-5 lg:h-6 lg:w-6 text-biscay" />
              </div>
              <p className="text-xs lg:text-sm text-gray-600">Raffle</p>
              <p className="text-2xl lg:text-3xl font-bold text-biscay">{raffleEntries}</p>
            </div>
          </div>

          {/* Uniform Passes Card */}
          <div className="bg-white rounded-xl p-3 lg:p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-emerald-500/10 rounded-lg mb-2">
                <ShieldCheck className="h-5 w-5 lg:h-6 lg:w-6 text-emerald-600" />
              </div>
              <p className="text-xs lg:text-sm text-gray-600">Uniform Pass</p>
              <p className="text-2xl lg:text-3xl font-bold text-emerald-600">{uniformPassesThisMonth}</p>
              <p className="text-[10px] text-gray-400">this month</p>
            </div>
          </div>
        </div>

        {/* Progress to Next Pass */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-semibold text-biscay">Progress to Next Uniform Pass</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${(progressToNextPass / 5) * 100}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
              {progressToNextPass}/5
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {progressToNextPass === 0
              ? `🎉 You just earned a pass! Next one at ${nextPassAt} merits.`
              : `${5 - progressToNextPass} more merit${5 - progressToNextPass > 1 ? 's' : ''} to earn your next uniform pass!`
            }
          </p>
        </div>

        {/* Uniform Pass History */}
        {uniformPassHistory.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <h2 className="text-sm font-semibold text-biscay">Uniform Pass History</h2>
            </div>
            <div className="space-y-1">
              {uniformPassHistory.map((pass) => {
                const date = new Date(pass.created_at)
                const formattedDate = date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
                return (
                  <div
                    key={pass.id}
                    className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" />
                    </div>
                    <span className="text-xs text-gray-600">Earned at {pass.merits_count} merits</span>
                    <span className="text-[10px] text-gray-400 ml-auto">{formattedDate}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Records History */}
        <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm">
          <h2 className="text-sm sm:text-base font-semibold text-biscay mb-3">Your Records</h2>

          {records.length === 0 ? (
            <div className="text-center py-6">
              <Sparkles className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No records yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {records.map((record) => {
                const date = new Date(record.created_at)
                const now = new Date()
                const diffMs = now.getTime() - date.getTime()
                const diffMins = Math.floor(diffMs / 60000)
                const diffHours = Math.floor(diffMs / 3600000)
                const diffDays = Math.floor(diffMs / 86400000)
                const timeAgo = diffMins < 60 ? `${diffMins}m ago` : diffHours < 24 ? `${diffHours}h ago` : `${diffDays}d ago`

                return (
                  <div
                    key={record.id}
                    className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0"
                  >
                    {record.type === 'merit' ? (
                      <Award className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-red-600 flex-shrink-0" />
                    )}
                    <span className="text-xs text-gray-500 truncate flex-1 min-w-0">{record.reason}</span>
                    <span className="text-[10px] text-gray-400 hidden sm:inline">by {record.teachers?.name || 'Unknown'}</span>
                    <span className="text-[10px] text-gray-400">{timeAgo}</span>
                    <span className={`text-xs font-bold flex-shrink-0 ${
                      record.type === 'merit' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {record.type === 'merit' ? '+' : '-'}{record.quantity}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
