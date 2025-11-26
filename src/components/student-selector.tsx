'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, ChevronsUpDown } from 'lucide-react'
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

export interface Student {
  id: string
  full_name: string
  english_name: string
  grade: string | null
}

interface StudentSelectorProps {
  students: Student[]
  selectedStudent: Student | null
  onSelect: (student: Student | null) => void
  placeholder?: string
  disabled?: boolean
}

export function StudentSelector({
  students,
  selectedStudent,
  onSelect,
  placeholder = 'Select student...',
  disabled = false,
}: StudentSelectorProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between h-auto py-2 text-left text-sm"
        >
          {selectedStudent ? (
            <div className="flex flex-col items-start">
              <span className="font-medium">{selectedStudent.english_name}</span>
              <span className="text-xs text-gray-500">
                {selectedStudent.full_name}
                {selectedStudent.grade && ` • Grade ${selectedStudent.grade}`}
              </span>
            </div>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search by name..." />
          <CommandList>
            <CommandEmpty>No student found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {students.map((student) => (
                <CommandItem
                  key={student.id}
                  value={`${student.english_name} ${student.full_name}`}
                  onSelect={() => {
                    onSelect(student)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedStudent?.id === student.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{student.english_name}</span>
                    <span className="text-xs text-gray-500">
                      {student.full_name}
                      {student.grade && ` • Grade ${student.grade}`}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
