'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Award, XCircle, Sparkles, Ticket, Calendar, ShieldCheck } from 'lucide-react'

interface Student {
  id: string
  full_name: string
  english_name: string
  grade: string
  section: string
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

interface StudentDashboardClientProps {
  student: Student
  avatarUrl?: string
  meritsTotal: number
  demeritsTotal: number
  raffleEntries: number
  uniformPasses: number
  records: Record[]
}

export function StudentDashboardClient({
  student,
  avatarUrl,
  meritsTotal,
  demeritsTotal,
  raffleEntries,
  uniformPasses,
  records,
}: StudentDashboardClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleProfileClick = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-pampas">
      {/* Header */}
      <div className="bg-biscay text-white px-4 py-3 shadow-sm">
        <div className="flex items-center justify-start gap-3 max-w-7xl mx-auto">
          <button
            onClick={handleProfileClick}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={student.english_name}
                width={36}
                height={36}
                className="rounded-full ring-2 ring-white/20"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center ring-2 ring-white/20">
                <span className="text-base font-semibold">
                  {student.english_name.charAt(0)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{student.english_name}</p>
              <span className="text-xs text-white/70">|</span>
              <p className="text-xs text-white/70">Grade {student.grade}</p>
            </div>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
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
              <div className="p-2 bg-wild-blue/10 rounded-lg mb-2">
                <ShieldCheck className="h-5 w-5 lg:h-6 lg:w-6 text-wild-blue" />
              </div>
              <p className="text-xs lg:text-sm text-gray-600">Uniform Pass</p>
              <p className="text-2xl lg:text-3xl font-bold text-wild-blue">{uniformPasses}</p>
            </div>
          </div>
        </div>

        {/* Records History */}
        <div className="space-y-4">
          <h2 className="text-base lg:text-lg font-semibold text-biscay px-1">Your Records</h2>

          {records.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No records yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {records.map((record) => {
                const date = new Date(record.created_at)
                const formattedDate = date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })

                return (
                  <div
                    key={record.id}
                    className="bg-white rounded-md px-3 lg:px-4 py-2.5 lg:py-3 shadow-sm flex items-center gap-3"
                  >
                    {record.type === 'merit' ? (
                      <Award className="h-4 w-4 text-wild-blue flex-shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-camelot flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 truncate">
                        {record.reason}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formattedDate} • {record.teachers?.name || 'Unknown'}
                      </p>
                    </div>
                    <span
                      className={`flex-shrink-0 text-base lg:text-lg font-bold ${
                        record.type === 'merit'
                          ? 'text-wild-blue'
                          : 'text-camelot'
                      }`}
                    >
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
