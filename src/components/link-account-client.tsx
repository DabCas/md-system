'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Check, ChevronsUpDown } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { User } from '@supabase/supabase-js'

interface Student {
  id: string
  full_name: string
  english_name: string
  grade: string | null
  section: string | null
}

interface LinkAccountClientProps {
  user: User
  students: Student[]
}

export function LinkAccountClient({ user, students }: LinkAccountClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const [open, setOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [grade, setGrade] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const needsGradeInput = selectedStudent && !selectedStudent.grade

  // Auto-detect student based on Google account name
  useEffect(() => {
    if (students.length === 0) return

    // Get user's name from Google metadata
    const googleName = user.user_metadata?.name || user.user_metadata?.full_name || ''

    console.log('🔍 Auto-detection debug:')
    console.log('  Google name:', googleName)
    console.log('  User metadata:', user.user_metadata)

    if (!googleName) return

    // Try to find a matching student
    const nameLower = googleName.toLowerCase().trim()
    const nameParts = nameLower.split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts[nameParts.length - 1]

    const matchedStudent = students.find(student => {
      const fullNameLower = student.full_name.toLowerCase().trim()
      const englishNameLower = student.english_name.toLowerCase().trim()

      // Multiple matching strategies
      const matches = {
        exactEnglish: englishNameLower === nameLower,
        exactFull: fullNameLower === nameLower,
        firstNameMatch: englishNameLower === firstName || englishNameLower.includes(firstName),
        lastNameMatch: fullNameLower.includes(lastName) && lastName.length > 2,
        containsEnglish: nameLower.includes(englishNameLower) && englishNameLower.length > 2,
        containsFull: nameLower.includes(fullNameLower) && fullNameLower.length > 3,
      }

      const isMatch = Object.values(matches).some(m => m)

      if (isMatch) {
        console.log(`  ✅ Matched: ${student.english_name} (${student.full_name})`, matches)
      }

      return isMatch
    })

    if (matchedStudent) {
      console.log('  🎯 Auto-selected:', matchedStudent.english_name)
      setSelectedStudent(matchedStudent)
    } else {
      console.log('  ❌ No match found')
    }
  }, [students, user.user_metadata])

  const handleSubmit = async () => {
    if (!selectedStudent) {
      alert('Please select your name')
      return
    }

    if (needsGradeInput && !grade) {
      alert('Please select your grade')
      return
    }

    setIsSubmitting(true)

    try {
      const updateData: any = {
        user_id: user.id,
      }

      // If student doesn't have grade, update it
      if (needsGradeInput) {
        updateData.grade = grade
        updateData.section = 'A' // Default section since school doesn't use sections
      }

      const { error } = await supabase
        .from('students')
        .update(updateData)
        .eq('id', selectedStudent.id)

      if (error) {
        console.error('Error linking account:', error)
        throw error
      }

      // Redirect to student dashboard
      router.push('/dashboard/student')
      router.refresh()
    } catch (error: any) {
      console.error('Error linking account:', error)
      alert(`Failed to link account: ${error?.message || 'Please try again.'}`)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-pampas flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
              <div className="inline-flex mb-2">
                <Image
                  src={user.user_metadata?.avatar_url || user.user_metadata?.picture}
                  alt="Profile"
                  width={64}
                  height={64}
                  className="rounded-full ring-4 ring-biscay/20"
                />
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-biscay/10 mb-2">
                <span className="text-2xl font-bold text-biscay">
                  {user.user_metadata?.name?.charAt(0) || '?'}
                </span>
              </div>
            )}
            <h1 className="text-2xl font-bold text-biscay">Link Your Account</h1>
            <p className="text-sm text-gray-600">
              Select your name to access your dashboard
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Student Selector */}
            <div className="space-y-2">
              <Label htmlFor="student">Your Name *</Label>
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
                        {selectedStudent.grade && (
                          <span className="text-xs text-gray-500">
                            Grade {selectedStudent.grade}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500">Select your name...</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search your name..." />
                    <CommandList>
                      <CommandEmpty>No student found.</CommandEmpty>
                      <CommandGroup>
                        {students.map((student) => (
                          <CommandItem
                            key={student.id}
                            value={`${student.english_name} ${student.full_name}`}
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
                              {student.grade && (
                                <span className="text-xs text-gray-500">
                                  Grade {student.grade}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Grade (only if student doesn't have grade) */}
            {needsGradeInput && (
              <div className="space-y-2">
                <Label htmlFor="grade">Grade Level *</Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">Grade 6</SelectItem>
                    <SelectItem value="7">Grade 7</SelectItem>
                    <SelectItem value="8">Grade 8</SelectItem>
                    <SelectItem value="9">Grade 9</SelectItem>
                    <SelectItem value="10">Grade 10</SelectItem>
                    <SelectItem value="11">Grade 11</SelectItem>
                    <SelectItem value="12">Grade 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Submit Button */}
            <Button
              className="w-full h-12 bg-biscay hover:bg-biscay-light text-white"
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedStudent || (needsGradeInput && !grade)}
            >
              {isSubmitting ? 'Linking Account...' : 'Continue to Dashboard'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
