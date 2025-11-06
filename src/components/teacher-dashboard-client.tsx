'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Award, XCircle, Sparkles, Calendar, Check, ChevronsUpDown, Minus, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface Student {
  id: string
  full_name: string
  english_name: string
  grade?: string
  section?: string
}

interface FormStudent extends Student {
  grade: string
  section: string
}

interface Record {
  id: string
  type: 'merit' | 'demerit'
  reason: string
  quantity: number
  created_at: string
  students: Student
}

interface TeacherDashboardClientProps {
  teacherId: string
  teacherName: string
  avatarUrl?: string
  meritsToday: number
  demeritsToday: number
  remainingQuota: number
  quotaLimit: number
  recentRecords: Record[]
  students: FormStudent[]
}

export function TeacherDashboardClient({
  teacherId,
  teacherName,
  avatarUrl,
  meritsToday,
  demeritsToday,
  remainingQuota,
  quotaLimit,
  recentRecords,
  students,
}: TeacherDashboardClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [meritDialogOpen, setMeritDialogOpen] = useState(false)
  const [demeritDialogOpen, setDemeritDialogOpen] = useState(false)

  const handleProfileClick = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Group records by week
  const recordsByWeek = groupRecordsByWeek(recentRecords)

  return (
    <div className="min-h-screen bg-pampas">
      {/* Header with school brand color */}
      <div className="bg-biscay text-white px-4 py-3 shadow-sm">
        <div className="flex items-center justify-start gap-3 max-w-7xl mx-auto">
          <button
            onClick={handleProfileClick}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={teacherName}
                width={36}
                height={36}
                className="rounded-full ring-2 ring-white/20"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center ring-2 ring-white/20">
                <span className="text-base font-semibold">
                  {teacherName.charAt(0)}
                </span>
              </div>
            )}
            <span className="text-sm font-medium">{teacherName}</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Top Section - Buttons and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Action Buttons */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-3">
            <Button
              onClick={() => setMeritDialogOpen(true)}
              className="h-20 lg:h-24 text-base lg:text-lg font-semibold bg-wild-blue hover:bg-wild-blue-light text-white rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 lg:h-6 lg:w-6" />
                <span>Award Merit</span>
              </div>
            </Button>

            <Button
              onClick={() => setDemeritDialogOpen(true)}
              className="h-20 lg:h-24 text-base lg:text-lg font-semibold bg-camelot hover:bg-camelot-light text-white rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 lg:h-6 lg:w-6" />
                <span>Issue Demerit</span>
              </div>
            </Button>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm">
            <div className="flex items-center gap-2 text-biscay mb-4">
              <Sparkles className="h-4 w-4 lg:h-5 lg:w-5" />
              <h2 className="font-semibold text-sm lg:text-base">Today&apos;s Summary</h2>
            </div>

            <div className="grid grid-cols-3 gap-3 lg:gap-4">
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-wild-blue">
                  {meritsToday}
                </div>
                <div className="text-xs lg:text-sm text-gray-600 mt-0.5">Merits</div>
              </div>

              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-camelot">
                  {demeritsToday}
                </div>
                <div className="text-xs lg:text-sm text-gray-600 mt-0.5">Demerits</div>
              </div>

              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-biscay">
                  {remainingQuota}
                </div>
                <div className="text-xs lg:text-sm text-gray-600 mt-0.5">Quota</div>
              </div>
            </div>

            <div className="text-xs lg:text-sm text-center text-gray-500 mt-3">
              {remainingQuota} of {quotaLimit} remaining
            </div>
          </div>
        </div>

        {/* Recent Records by Week */}
        {Object.keys(recordsByWeek).length > 0 && (
          <div className="space-y-4">
            <h2 className="text-base lg:text-lg font-semibold text-biscay px-1">Recent Activity</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {Object.entries(recordsByWeek).map(([weekLabel, weekRecords]) => (
                <div key={weekLabel} className="space-y-2">
                  <div className="flex items-center gap-2 px-1">
                    <Calendar className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-wild-blue" />
                    <h3 className="font-semibold text-xs lg:text-sm text-biscay">{weekLabel}</h3>
                  </div>
                  <div className="space-y-1">
                    {weekRecords.map((record) => (
                      <div
                        key={record.id}
                        className="bg-white rounded-md px-2.5 py-2 shadow-sm flex items-center gap-2"
                      >
                        {record.type === 'merit' ? (
                          <Award className="h-3.5 w-3.5 text-wild-blue flex-shrink-0" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-camelot flex-shrink-0" />
                        )}
                        <span className="font-medium text-xs lg:text-sm text-biscay flex-shrink-0">
                          {record.students.english_name}
                        </span>
                        <span className="text-xs lg:text-sm text-gray-500 truncate flex-1">
                          {record.reason}
                        </span>
                        <span
                          className={`flex-shrink-0 text-sm lg:text-base font-bold ${
                            record.type === 'merit'
                              ? 'text-wild-blue'
                              : 'text-camelot'
                          }`}
                        >
                          {record.type === 'merit' ? '+' : '-'}{record.quantity}
                        </span>
                      </div>
                    ))}
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
            quotaLimit={quotaLimit}
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
    </div>
  )
}

function groupRecordsByWeek(records: Record[]): Record<string, Record[]> {
  const grouped: Record<string, Record[]> = {}

  records.forEach((record) => {
    const date = new Date(record.created_at)
    const weekStart = getWeekStart(date)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    const weekLabel = formatWeekLabel(weekStart, weekEnd)

    if (!grouped[weekLabel]) {
      grouped[weekLabel] = []
    }
    grouped[weekLabel].push(record)
  })

  return grouped
}

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday as start of week
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
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
  students: FormStudent[]
  remainingQuota: number
  quotaLimit: number
  onSuccess: () => void
}

function MeritFormContent({
  teacherId,
  students,
  remainingQuota,
  quotaLimit,
  onSuccess,
}: MeritFormContentProps) {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<FormStudent | null>(null)
  const [reason, setReason] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!selectedStudent || !reason.trim() || quantity < 1 || quantity > 5) {
      alert('Please fill in all fields correctly')
      return
    }

    if (quantity > remainingQuota) {
      alert(`You only have ${remainingQuota} merits remaining in your weekly quota`)
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
        quantity,
      })

      if (error) {
        console.error('Supabase error details:', error)
        throw error
      }

      onSuccess()
    } catch (error: any) {
      console.error('Error submitting merit:', error)
      alert(`Failed to submit merit: ${error?.message || 'Please try again.'}`)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="student">Student *</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between h-auto py-2 text-left text-sm"
            >
              {selectedStudent ? (
                <div className="flex flex-col">
                  <span className="font-medium">
                    {selectedStudent.english_name} ({selectedStudent.full_name})
                  </span>
                  <span className="text-xs text-gray-500">
                    Grade {selectedStudent.grade} - Section {selectedStudent.section}
                  </span>
                </div>
              ) : (
                <span className="text-gray-500">Select student...</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Search student..." />
              <CommandList>
                <CommandEmpty>No student found.</CommandEmpty>
                <CommandGroup>
                  {students.map((student) => (
                    <CommandItem
                      key={student.id}
                      value={`${student.english_name} ${student.full_name} ${student.grade} ${student.section}`}
                      onSelect={() => {
                        setSelectedStudent(student)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedStudent?.id === student.id
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {student.english_name} ({student.full_name})
                        </span>
                        <span className="text-xs text-gray-500">
                          Grade {student.grade} - Section {student.section}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
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
        <Label>Quantity (1-5) *</Label>
        <div className="flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="text-3xl font-bold w-16 text-center">
            {quantity}
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10"
            onClick={() => setQuantity(Math.min(5, Math.min(remainingQuota, quantity + 1)))}
            disabled={quantity >= 5 || quantity >= remainingQuota}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
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
  students: FormStudent[]
  onSuccess: () => void
}

function DemeritFormContent({
  teacherId,
  students,
  onSuccess,
}: DemeritFormContentProps) {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<FormStudent | null>(null)
  const [reason, setReason] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!selectedStudent || !reason.trim() || quantity < 1 || quantity > 5) {
      alert('Please fill in all fields correctly')
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
        quantity,
      })

      if (error) {
        console.error('Supabase error details:', error)
        throw error
      }

      onSuccess()
    } catch (error: any) {
      console.error('Error submitting demerit:', error)
      alert(`Failed to submit demerit: ${error?.message || 'Please try again.'}`)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="student">Student *</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between h-auto py-2 text-left text-sm"
            >
              {selectedStudent ? (
                <div className="flex flex-col">
                  <span className="font-medium">
                    {selectedStudent.english_name} ({selectedStudent.full_name})
                  </span>
                  <span className="text-xs text-gray-500">
                    Grade {selectedStudent.grade} - Section {selectedStudent.section}
                  </span>
                </div>
              ) : (
                <span className="text-gray-500">Select student...</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Search student..." />
              <CommandList>
                <CommandEmpty>No student found.</CommandEmpty>
                <CommandGroup>
                  {students.map((student) => (
                    <CommandItem
                      key={student.id}
                      value={`${student.english_name} ${student.full_name} ${student.grade} ${student.section}`}
                      onSelect={() => {
                        setSelectedStudent(student)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedStudent?.id === student.id
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {student.english_name} ({student.full_name})
                        </span>
                        <span className="text-xs text-gray-500">
                          Grade {student.grade} - Section {student.section}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
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
        <Label>Quantity (1-5) *</Label>
        <div className="flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="text-3xl font-bold w-16 text-center">
            {quantity}
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10"
            onClick={() => setQuantity(Math.min(5, quantity + 1))}
            disabled={quantity >= 5}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
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
