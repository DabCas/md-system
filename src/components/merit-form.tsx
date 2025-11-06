'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { ArrowLeft, Award, Check, ChevronsUpDown, Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Student {
  id: string
  full_name: string
  english_name: string
  grade: string
  section: string
}

interface MeritFormProps {
  teacherId: string
  teacherName: string
  students: Student[]
  remainingQuota: number
  quotaLimit: number
}

export function MeritForm({
  teacherId,
  teacherName,
  students,
  remainingQuota,
  quotaLimit,
}: MeritFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [open, setOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
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
      // Get active academic year
      const { data: academicYear } = await supabase
        .from('academic_years')
        .select('id')
        .eq('is_active', true)
        .single()

      // Insert record
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

      // Success! Redirect back to dashboard
      router.push('/dashboard/teacher')
      router.refresh()
    } catch (error: any) {
      console.error('Error submitting merit:', error)
      alert(`Failed to submit merit: ${error?.message || 'Please try again.'}`)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-merit-green text-white px-6 py-4 shadow-md">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Award Merit</h1>
            <p className="text-sm text-white/80">
              {remainingQuota} of {quotaLimit} remaining this week
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6 space-y-6">

        <div className="space-y-6">
            {/* Student Selector */}
            <div className="space-y-2">
              <Label htmlFor="student">Student *</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-auto py-3 text-left"
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
                              <span className="font-medium">
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

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason *</Label>
              <Textarea
                id="reason"
                placeholder="e.g., Excellent class participation, helped a classmate, completed homework..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="resize-none text-base"
              />
            </div>

            {/* Quantity Picker */}
            <div className="space-y-2">
              <Label>Quantity (1-5) *</Label>
              <div className="flex items-center justify-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-14 w-14"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-6 w-6" />
                </Button>
                <div className="text-5xl font-bold w-20 text-center">
                  {quantity}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-14 w-14"
                  onClick={() => setQuantity(Math.min(5, Math.min(remainingQuota, quantity + 1)))}
                  disabled={quantity >= 5 || quantity >= remainingQuota}
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </div>
              <p className="text-xs text-center text-gray-500">
                {quantity > remainingQuota && (
                  <span className="text-red-600">
                    Exceeds your remaining quota of {remainingQuota}
                  </span>
                )}
              </p>
            </div>

          {/* Submit Button */}
          <Button
            className="w-full h-16 text-lg font-bold bg-merit-green hover:bg-merit-green/90 text-white rounded-2xl shadow-lg active:scale-95 transition-all"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedStudent || !reason.trim() || quantity > remainingQuota}
          >
            {isSubmitting ? (
              'Submitting...'
            ) : (
              <div className="flex items-center gap-2">
                <Award className="h-6 w-6" />
                <span>Award {quantity} Merit{quantity > 1 ? 's' : ''}</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
