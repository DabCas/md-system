'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Award, XCircle, Sparkles, Calendar, Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getSchoolWeekStart, getSchoolWeekEnd } from '@/lib/utils'
import { StudentSelector, type Student } from '@/components/student-selector'
import { QuantityPicker } from '@/components/quantity-picker'
import { DashboardHeader } from '@/components/dashboard-header'

// Check if record is within 1-hour edit window
function isWithinEditWindow(createdAt: string): boolean {
  const created = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - created.getTime()
  const oneHourMs = 60 * 60 * 1000
  return diffMs <= oneHourMs
}

// Get remaining time in edit window
function getRemainingEditTime(createdAt: string): string {
  const created = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - created.getTime()
  const oneHourMs = 60 * 60 * 1000
  const remainingMs = oneHourMs - diffMs
  if (remainingMs <= 0) return '0m'
  const remainingMins = Math.ceil(remainingMs / 60000)
  return `${remainingMins}m`
}

interface MeritDemeritRecord {
  id: string
  type: 'merit' | 'demerit'
  reason: string
  location?: string | null
  quantity: number
  created_at: string
  students: Student | null
}

interface TeacherDashboardClientProps {
  teacherId: string
  teacherName: string
  avatarUrl?: string
  meritsThisWeek: number
  demeritsThisWeek: number
  remainingQuota: number
  quotaLimit: number
  recentRecords: MeritDemeritRecord[]
  students: Student[]
  userRole?: string
}

export function TeacherDashboardClient({
  teacherId,
  teacherName,
  avatarUrl,
  meritsThisWeek,
  demeritsThisWeek,
  remainingQuota,
  quotaLimit,
  recentRecords,
  students,
  userRole,
}: TeacherDashboardClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [meritDialogOpen, setMeritDialogOpen] = useState(false)
  const [demeritDialogOpen, setDemeritDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<MeritDemeritRecord | null>(null)

  // Group records by week
  const recordsByWeek = groupRecordsByWeek(recentRecords)

  const handleEditClick = (record: MeritDemeritRecord) => {
    if (!isWithinEditWindow(record.created_at)) {
      toast.error('Edit window has expired (1 hour limit)')
      return
    }
    setSelectedRecord(record)
    setEditDialogOpen(true)
  }

  const handleDeleteClick = (record: MeritDemeritRecord) => {
    if (!isWithinEditWindow(record.created_at)) {
      toast.error('Delete window has expired (1 hour limit)')
      return
    }
    setSelectedRecord(record)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedRecord) return

    try {
      const { error } = await supabase
        .from('records')
        .update({ is_deleted: true })
        .eq('id', selectedRecord.id)

      if (error) throw error

      toast.success('Record deleted successfully')
      setDeleteDialogOpen(false)
      setSelectedRecord(null)
      router.refresh()
    } catch (error) {
      console.error('Error deleting record:', error)
      toast.error('Failed to delete record')
    }
  }

  return (
    <div className="min-h-screen bg-pampas">
      <DashboardHeader
        title="Teacher Dashboard"
        userName={teacherName}
        userRole={userRole || 'teacher'}
        avatarUrl={avatarUrl}
        showPrincipalSwitch={userRole === 'principal' || userRole === 'admin'}
      />

      <div className="w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
        {/* Top Section - Buttons and Stats */}
        <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4 md:space-y-6 mb-6 md:mb-8">
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
            <Button
              onClick={() => setMeritDialogOpen(true)}
              className="h-16 sm:h-20 md:h-24 text-sm sm:text-base md:text-lg font-semibold bg-wild-blue hover:bg-wild-blue-light text-white rounded-lg md:rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <Award className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                <span className="text-xs sm:text-base md:text-lg">Award Merit</span>
              </div>
            </Button>

            <Button
              onClick={() => setDemeritDialogOpen(true)}
              className="h-16 sm:h-20 md:h-24 text-sm sm:text-base md:text-lg font-semibold bg-camelot hover:bg-camelot-light text-white rounded-lg md:rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <XCircle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                <span className="text-xs sm:text-base md:text-lg">Issue Demerit</span>
              </div>
            </Button>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-lg md:rounded-xl p-3 sm:p-4 md:p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-biscay">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                <h2 className="font-semibold text-sm sm:text-base">This Week</h2>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] sm:text-xs text-gray-600">Merits</span>
                  <span className="text-xl sm:text-2xl md:text-3xl font-bold text-wild-blue">
                    {meritsThisWeek}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] sm:text-xs text-gray-600">Demerits</span>
                  <span className="text-xl sm:text-2xl md:text-3xl font-bold text-camelot">
                    {demeritsThisWeek}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] sm:text-xs text-gray-600">Quota</span>
                  <span className="text-xl sm:text-2xl md:text-3xl font-bold text-biscay">
                    {remainingQuota}
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-500">/{quotaLimit}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Records by Week */}
        {Object.keys(recordsByWeek).length > 0 && (
          <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4">
            <h2 className="text-sm sm:text-base md:text-lg font-semibold text-biscay px-1">Recent Activity</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {(Object.entries(recordsByWeek) as [string, MeritDemeritRecord[]][]).map(([weekLabel, weekRecords]) => (
                <div key={weekLabel} className="space-y-2">
                  <div className="flex items-center gap-2 px-1">
                    <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-wild-blue flex-shrink-0" />
                    <h3 className="font-semibold text-xs sm:text-sm text-biscay truncate">{weekLabel}</h3>
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    {weekRecords.map((record) => {
                      const canEdit = isWithinEditWindow(record.created_at)
                      return (
                        <div
                          key={record.id}
                          className="bg-white rounded-md px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 shadow-sm hover:shadow-md transition-shadow group"
                        >
                          <div className="flex items-center gap-2">
                            {record.type === 'merit' ? (
                              <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-wild-blue flex-shrink-0" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-camelot flex-shrink-0" />
                            )}
                            <span className="font-medium text-xs sm:text-sm text-biscay flex-shrink-0">
                              {record.students?.english_name || 'Unknown'}
                            </span>
                            <span className="text-xs sm:text-sm text-gray-500 truncate flex-1 min-w-0">
                              {record.reason}
                              {record.location && ` • 📍 ${record.location}`}
                            </span>
                            {canEdit && (
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleEditClick(record)}
                                  className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-biscay"
                                  title={`Edit (${getRemainingEditTime(record.created_at)} left)`}
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(record)}
                                  className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"
                                  title={`Delete (${getRemainingEditTime(record.created_at)} left)`}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                            <span
                              className={`flex-shrink-0 text-sm sm:text-base font-bold ${
                                record.type === 'merit'
                                  ? 'text-wild-blue'
                                  : 'text-camelot'
                              }`}
                            >
                              {record.type === 'merit' ? '+' : '-'}{record.quantity}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Merit Dialog */}
      <Dialog open={meritDialogOpen} onOpenChange={setMeritDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-wild-blue flex items-center gap-2">
              <Award className="h-5 w-5" />
              Award Merit
            </DialogTitle>
          </DialogHeader>
          <MeritFormContent
            teacherId={teacherId}
            students={students}
            remainingQuota={remainingQuota}
            onSuccess={() => {
              setMeritDialogOpen(false)
              router.refresh()
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Demerit Dialog */}
      <Dialog open={demeritDialogOpen} onOpenChange={setDemeritDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-camelot flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Issue Demerit
            </DialogTitle>
          </DialogHeader>
          <DemeritFormContent
            teacherId={teacherId}
            students={students}
            onSuccess={() => {
              setDemeritDialogOpen(false)
              router.refresh()
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        setEditDialogOpen(open)
        if (!open) setSelectedRecord(null)
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${selectedRecord?.type === 'merit' ? 'text-wild-blue' : 'text-camelot'}`}>
              <Pencil className="h-5 w-5" />
              Edit {selectedRecord?.type === 'merit' ? 'Merit' : 'Demerit'}
            </DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <EditRecordForm
              record={selectedRecord}
              onSuccess={() => {
                setEditDialogOpen(false)
                setSelectedRecord(null)
                router.refresh()
              }}
              onCancel={() => {
                setEditDialogOpen(false)
                setSelectedRecord(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={(open) => {
        setDeleteDialogOpen(open)
        if (!open) setSelectedRecord(null)
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete Record
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {selectedRecord?.type}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <p><strong>Student:</strong> {selectedRecord.students?.english_name}</p>
              <p><strong>Reason:</strong> {selectedRecord.reason}</p>
              <p><strong>Quantity:</strong> {selectedRecord.quantity}</p>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setSelectedRecord(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function groupRecordsByWeek(records: MeritDemeritRecord[]): Record<string, MeritDemeritRecord[]> {
  const grouped: Record<string, MeritDemeritRecord[]> = {}

  records.forEach((record) => {
    const date = new Date(record.created_at)
    const weekStartStr = getSchoolWeekStart(date)
    // Parse YYYY-MM-DD as local date (not UTC)
    const [year, month, day] = weekStartStr.split('-').map(Number)
    const weekStart = new Date(year, month - 1, day) // month is 0-indexed
    const weekEnd = getSchoolWeekEnd(date)

    const weekLabel = formatWeekLabel(weekStart, weekEnd)

    if (!grouped[weekLabel]) {
      grouped[weekLabel] = []
    }
    grouped[weekLabel].push(record)
  })

  return grouped
}

function formatWeekLabel(start: Date, end: Date): string {
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  const startMonth = monthNames[start.getMonth()]
  const endMonth = monthNames[end.getMonth()]
  const startDay = start.getDate()
  const endDay = end.getDate()

  if (startMonth === endMonth) {
    return `Week of ${startMonth} ${startDay}-${endDay}`
  } else {
    return `Week of ${startMonth} ${startDay} - ${endMonth} ${endDay}`
  }
}

// Merit Form Content Component
interface MeritFormContentProps {
  teacherId: string
  students: Student[]
  remainingQuota: number
  onSuccess: () => void
}

function MeritFormContent({
  teacherId,
  students,
  remainingQuota,
  onSuccess,
}: MeritFormContentProps) {
  const supabase = createClient()
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [reason, setReason] = useState('')
  const [location, setLocation] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!selectedStudent || !reason.trim() || quantity < 1) {
      toast.error('Please fill in all fields correctly')
      return
    }

    if (quantity > remainingQuota) {
      toast.error(`You only have ${remainingQuota} merits remaining in your weekly quota`)
      return
    }

    setIsSubmitting(true)

    try {
      const { data: academicYear } = await supabase
        .from('academic_years')
        .select('id')
        .eq('is_active', true)
        .single()

      const { error } = await supabase.from('records').insert({
        student_id: selectedStudent.id,
        teacher_id: teacherId,
        academic_year_id: academicYear?.id,
        type: 'merit',
        reason: reason.trim(),
        location: location.trim() || null,
        quantity,
      })

      if (error) {
        console.error('Supabase error details:', error)
        throw error
      }

      toast.success(`${quantity} merit${quantity > 1 ? 's' : ''} issued successfully!`)
      onSuccess()
    } catch (error: unknown) {
      console.error('Error submitting merit:', error)
      const message = error instanceof Error ? error.message : 'Please try again.'
      toast.error(`Failed to submit merit: ${message}`)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="student">Student *</Label>
        <StudentSelector
          students={students}
          selectedStudent={selectedStudent}
          onSelect={setSelectedStudent}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason *</Label>
        <Textarea
          id="reason"
          placeholder="e.g., Excellent class participation..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className="resize-none text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          placeholder="e.g., Room 301, Cafeteria..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label>Quantity (max: {remainingQuota}) *</Label>
        <QuantityPicker
          value={quantity}
          onChange={setQuantity}
          max={Math.min(5, remainingQuota)}
        />
        {quantity > remainingQuota && (
          <p className="text-xs text-center text-red-600">
            Exceeds your remaining quota of {remainingQuota}
          </p>
        )}
      </div>

      <Button
        className="w-full bg-wild-blue hover:bg-wild-blue-light text-white"
        onClick={handleSubmit}
        disabled={isSubmitting || !selectedStudent || !reason.trim() || quantity > remainingQuota}
      >
        {isSubmitting ? (
          'Submitting...'
        ) : (
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            <span>Award {quantity} Merit{quantity > 1 ? 's' : ''}</span>
          </div>
        )}
      </Button>
    </div>
  )
}

// Demerit Form Content Component
interface DemeritFormContentProps {
  teacherId: string
  students: Student[]
  onSuccess: () => void
}

function DemeritFormContent({
  teacherId,
  students,
  onSuccess,
}: DemeritFormContentProps) {
  const supabase = createClient()
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [reason, setReason] = useState('')
  const [location, setLocation] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!selectedStudent || !reason.trim() || quantity < 1 || quantity > 10) {
      toast.error('Please fill in all fields correctly')
      return
    }

    setIsSubmitting(true)

    try {
      const { data: academicYear } = await supabase
        .from('academic_years')
        .select('id')
        .eq('is_active', true)
        .single()

      const { error } = await supabase.from('records').insert({
        student_id: selectedStudent.id,
        teacher_id: teacherId,
        academic_year_id: academicYear?.id,
        type: 'demerit',
        reason: reason.trim(),
        location: location.trim() || null,
        quantity,
      })

      if (error) {
        console.error('Supabase error details:', error)
        throw error
      }

      toast.success(`${quantity} demerit${quantity > 1 ? 's' : ''} issued successfully!`)
      onSuccess()
    } catch (error: unknown) {
      console.error('Error submitting demerit:', error)
      const message = error instanceof Error ? error.message : 'Please try again.'
      toast.error(`Failed to submit demerit: ${message}`)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="student">Student *</Label>
        <StudentSelector
          students={students}
          selectedStudent={selectedStudent}
          onSelect={setSelectedStudent}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason *</Label>
        <Textarea
          id="reason"
          placeholder="e.g., Tardy, incomplete homework..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className="resize-none text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          placeholder="e.g., Room 301, Cafeteria..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label>Quantity (1-10) *</Label>
        <QuantityPicker
          value={quantity}
          onChange={setQuantity}
          max={10}
        />
        <p className="text-xs text-center text-gray-500">
          Note: 3 demerits = automatic detention
        </p>
      </div>

      <Button
        className="w-full bg-camelot hover:bg-camelot-light text-white"
        onClick={handleSubmit}
        disabled={isSubmitting || !selectedStudent || !reason.trim()}
      >
        {isSubmitting ? (
          'Submitting...'
        ) : (
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            <span>Issue {quantity} Demerit{quantity > 1 ? 's' : ''}</span>
          </div>
        )}
      </Button>
    </div>
  )
}

// Edit Record Form Component
interface EditRecordFormProps {
  record: MeritDemeritRecord
  onSuccess: () => void
  onCancel: () => void
}

function EditRecordForm({ record, onSuccess, onCancel }: EditRecordFormProps) {
  const supabase = createClient()
  const [reason, setReason] = useState(record.reason)
  const [location, setLocation] = useState(record.location || '')
  const [quantity, setQuantity] = useState(record.quantity)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!reason.trim() || quantity < 1) {
      toast.error('Please fill in all fields correctly')
      return
    }

    // Double-check the edit window
    if (!isWithinEditWindow(record.created_at)) {
      toast.error('Edit window has expired (1 hour limit)')
      onCancel()
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('records')
        .update({
          reason: reason.trim(),
          location: location.trim() || null,
          quantity,
        })
        .eq('id', record.id)

      if (error) throw error

      toast.success('Record updated successfully!')
      onSuccess()
    } catch (error) {
      console.error('Error updating record:', error)
      toast.error('Failed to update record')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-3 text-sm">
        <p className="text-gray-600">
          <strong>Student:</strong> {record.students?.english_name}
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Time remaining to edit: {getRemainingEditTime(record.created_at)}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-reason">Reason *</Label>
        <Textarea
          id="edit-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className="resize-none text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-location">Location</Label>
        <Input
          id="edit-location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label>Quantity *</Label>
        <QuantityPicker
          value={quantity}
          onChange={setQuantity}
          max={record.type === 'merit' ? 5 : 10}
        />
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          className={`flex-1 ${record.type === 'merit' ? 'bg-wild-blue hover:bg-wild-blue-light' : 'bg-camelot hover:bg-camelot-light'} text-white`}
          onClick={handleSubmit}
          disabled={isSubmitting || !reason.trim()}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}
