'use client'

import { useState } from 'react'
import {
  Users,
  UserCheck,
  GraduationCap,
  Shield,
  Plus,
  Trash2,
  Search,
} from 'lucide-react'
import { DashboardHeader } from '@/components/dashboard-header'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Teacher {
  id: string
  name: string
  email: string
}

interface Principal {
  id: string
  name: string
  email: string
}

interface Student {
  id: string
  full_name: string
  english_name: string
  grade: string
  email: string | null
}

interface Stats {
  totalTeachers: number
  totalPrincipals: number
  totalStudents: number
  totalAdmins: number
}

interface AdminDashboardClientProps {
  adminName: string
  avatarUrl?: string
  stats: Stats
  teachers: Teacher[]
  principals: Principal[]
  students: Student[]
}

type TabType = 'teachers' | 'principals' | 'students'

export function AdminDashboardClient({
  adminName,
  avatarUrl,
  stats,
  teachers: initialTeachers,
  principals: initialPrincipals,
  students: initialStudents,
}: AdminDashboardClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const [activeTab, setActiveTab] = useState<TabType>('teachers')
  const [teachers, setTeachers] = useState(initialTeachers)
  const [principals, setPrincipals] = useState(initialPrincipals)
  const [students, setStudents] = useState(initialStudents)
  const [searchQuery, setSearchQuery] = useState('')

  // Add dialogs
  const [addTeacherOpen, setAddTeacherOpen] = useState(false)
  const [addPrincipalOpen, setAddPrincipalOpen] = useState(false)
  const [addStudentOpen, setAddStudentOpen] = useState(false)

  // Form states
  const [newTeacher, setNewTeacher] = useState({ name: '', email: '' })
  const [newPrincipal, setNewPrincipal] = useState({ name: '', email: '' })
  const [newStudent, setNewStudent] = useState({ full_name: '', english_name: '', grade: '', email: '' })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter functions
  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredPrincipals = principals.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredStudents = students.filter(s =>
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.english_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.grade.includes(searchQuery)
  )

  // Add teacher
  const handleAddTeacher = async () => {
    if (!newTeacher.name || !newTeacher.email) {
      toast.error('Please fill in all fields')
      return
    }

    setIsSubmitting(true)
    const { data, error } = await supabase
      .from('teachers')
      .insert({ name: newTeacher.name, email: newTeacher.email })
      .select()
      .single()

    if (error) {
      toast.error('Failed to add teacher: ' + error.message)
    } else {
      toast.success('Teacher added successfully')
      setTeachers([...teachers, data])
      setNewTeacher({ name: '', email: '' })
      setAddTeacherOpen(false)
    }
    setIsSubmitting(false)
  }

  // Add principal
  const handleAddPrincipal = async () => {
    if (!newPrincipal.name || !newPrincipal.email) {
      toast.error('Please fill in all fields')
      return
    }

    setIsSubmitting(true)
    const { data, error } = await supabase
      .from('principals')
      .insert({ name: newPrincipal.name, email: newPrincipal.email })
      .select()
      .single()

    if (error) {
      toast.error('Failed to add principal: ' + error.message)
    } else {
      toast.success('Principal added successfully')
      setPrincipals([...principals, data])
      setNewPrincipal({ name: '', email: '' })
      setAddPrincipalOpen(false)
    }
    setIsSubmitting(false)
  }

  // Add student
  const handleAddStudent = async () => {
    if (!newStudent.full_name || !newStudent.english_name || !newStudent.grade) {
      toast.error('Please fill in required fields')
      return
    }

    setIsSubmitting(true)
    const { data, error } = await supabase
      .from('students')
      .insert({
        full_name: newStudent.full_name,
        english_name: newStudent.english_name,
        grade: newStudent.grade,
        email: newStudent.email || null,
      })
      .select()
      .single()

    if (error) {
      toast.error('Failed to add student: ' + error.message)
    } else {
      toast.success('Student added successfully')
      setStudents([...students, data])
      setNewStudent({ full_name: '', english_name: '', grade: '', email: '' })
      setAddStudentOpen(false)
    }
    setIsSubmitting(false)
  }

  // Delete teacher
  const handleDeleteTeacher = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return

    const { error } = await supabase.from('teachers').delete().eq('id', id)
    if (error) {
      toast.error('Failed to delete teacher: ' + error.message)
    } else {
      toast.success('Teacher deleted')
      setTeachers(teachers.filter(t => t.id !== id))
    }
  }

  // Delete principal
  const handleDeletePrincipal = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return

    const { error } = await supabase.from('principals').delete().eq('id', id)
    if (error) {
      toast.error('Failed to delete principal: ' + error.message)
    } else {
      toast.success('Principal deleted')
      setPrincipals(principals.filter(p => p.id !== id))
    }
  }

  // Delete student
  const handleDeleteStudent = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This will also delete their records.`)) return

    const { error } = await supabase.from('students').delete().eq('id', id)
    if (error) {
      toast.error('Failed to delete student: ' + error.message)
    } else {
      toast.success('Student deleted')
      setStudents(students.filter(s => s.id !== id))
    }
  }

  return (
    <div className="min-h-screen bg-pampas">
      <DashboardHeader
        title="Admin Dashboard"
        userName={adminName}
        userRole="admin"
        avatarUrl={avatarUrl}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            icon={<UserCheck className="h-5 w-5" />}
            label="Teachers"
            value={stats.totalTeachers}
            color="bg-emerald-600"
          />
          <StatCard
            icon={<Shield className="h-5 w-5" />}
            label="Principals"
            value={stats.totalPrincipals}
            color="bg-biscay"
          />
          <StatCard
            icon={<GraduationCap className="h-5 w-5" />}
            label="Students"
            value={stats.totalStudents}
            color="bg-wild-blue"
          />
          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="Admins"
            value={stats.totalAdmins}
            color="bg-camelot"
          />
        </div>

        {/* User Management */}
        <div className="bg-white rounded-xl shadow-sm">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('teachers')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'teachers'
                    ? 'border-biscay text-biscay'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Teachers ({teachers.length})
              </button>
              <button
                onClick={() => setActiveTab('principals')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'principals'
                    ? 'border-biscay text-biscay'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Principals ({principals.length})
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'students'
                    ? 'border-biscay text-biscay'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Students ({students.length})
              </button>
            </div>
          </div>

          {/* Search and Add */}
          <div className="p-4 border-b border-gray-100 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              onClick={() => {
                if (activeTab === 'teachers') setAddTeacherOpen(true)
                else if (activeTab === 'principals') setAddPrincipalOpen(true)
                else setAddStudentOpen(true)
              }}
              className="bg-biscay hover:bg-biscay/90"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>

          {/* Content */}
          <div className="overflow-x-auto">
            {activeTab === 'teachers' && (
              filteredTeachers.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No teachers found</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-4 py-2 font-medium">Name</th>
                      <th className="px-4 py-2 font-medium">Email</th>
                      <th className="px-4 py-2 font-medium w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredTeachers.map((teacher) => (
                      <tr key={teacher.id} className="hover:bg-gray-50">
                        <td className="px-4 py-1.5 font-medium">{teacher.name}</td>
                        <td className="px-4 py-1.5 text-gray-500">{teacher.email}</td>
                        <td className="px-4 py-1.5">
                          <button
                            onClick={() => handleDeleteTeacher(teacher.id, teacher.name)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}

            {activeTab === 'principals' && (
              filteredPrincipals.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No principals found</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-4 py-2 font-medium">Name</th>
                      <th className="px-4 py-2 font-medium">Email</th>
                      <th className="px-4 py-2 font-medium w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredPrincipals.map((principal) => (
                      <tr key={principal.id} className="hover:bg-gray-50">
                        <td className="px-4 py-1.5 font-medium">{principal.name}</td>
                        <td className="px-4 py-1.5 text-gray-500">{principal.email}</td>
                        <td className="px-4 py-1.5">
                          <button
                            onClick={() => handleDeletePrincipal(principal.id, principal.name)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}

            {activeTab === 'students' && (
              filteredStudents.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No students found</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-4 py-2 font-medium">English Name</th>
                      <th className="px-4 py-2 font-medium">Full Name</th>
                      <th className="px-4 py-2 font-medium">Grade</th>
                      <th className="px-4 py-2 font-medium w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-4 py-1.5 font-medium">{student.english_name}</td>
                        <td className="px-4 py-1.5 text-gray-500">{student.full_name}</td>
                        <td className="px-4 py-1.5">{student.grade}</td>
                        <td className="px-4 py-1.5">
                          <button
                            onClick={() => handleDeleteStudent(student.id, student.english_name)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex gap-3">
          <a
            href="/dashboard/teacher"
            className="px-4 py-2 bg-white text-biscay rounded-lg shadow-sm hover:shadow text-sm font-medium"
          >
            Teacher Dashboard
          </a>
          <a
            href="/dashboard/principal"
            className="px-4 py-2 bg-white text-biscay rounded-lg shadow-sm hover:shadow text-sm font-medium"
          >
            Principal Dashboard
          </a>
        </div>
      </div>

      {/* Add Teacher Dialog */}
      <Dialog open={addTeacherOpen} onOpenChange={setAddTeacherOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Teacher</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="teacher-name">Name</Label>
              <Input
                id="teacher-name"
                value={newTeacher.name}
                onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="teacher-email">Email</Label>
              <Input
                id="teacher-email"
                type="email"
                value={newTeacher.email}
                onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                placeholder="john.doe@stpaulclark.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddTeacherOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTeacher} disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Teacher'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Principal Dialog */}
      <Dialog open={addPrincipalOpen} onOpenChange={setAddPrincipalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Principal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="principal-name">Name</Label>
              <Input
                id="principal-name"
                value={newPrincipal.name}
                onChange={(e) => setNewPrincipal({ ...newPrincipal, name: e.target.value })}
                placeholder="Jane Smith"
              />
            </div>
            <div>
              <Label htmlFor="principal-email">Email</Label>
              <Input
                id="principal-email"
                type="email"
                value={newPrincipal.email}
                onChange={(e) => setNewPrincipal({ ...newPrincipal, email: e.target.value })}
                placeholder="jane.smith@stpaulclark.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddPrincipalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddPrincipal} disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Principal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog open={addStudentOpen} onOpenChange={setAddStudentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="student-fullname">Full Name (Korean/Native)</Label>
              <Input
                id="student-fullname"
                value={newStudent.full_name}
                onChange={(e) => setNewStudent({ ...newStudent, full_name: e.target.value })}
                placeholder="Kim Min-jun"
              />
            </div>
            <div>
              <Label htmlFor="student-englishname">English Name</Label>
              <Input
                id="student-englishname"
                value={newStudent.english_name}
                onChange={(e) => setNewStudent({ ...newStudent, english_name: e.target.value })}
                placeholder="Daniel"
              />
            </div>
            <div>
              <Label htmlFor="student-grade">Grade</Label>
              <Input
                id="student-grade"
                value={newStudent.grade}
                onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                placeholder="10"
              />
            </div>
            <div>
              <Label htmlFor="student-email">Email (optional)</Label>
              <Input
                id="student-email"
                type="email"
                value={newStudent.email}
                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                placeholder="student@stpaulclark.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddStudentOpen(false)}>Cancel</Button>
            <Button onClick={handleAddStudent} disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Student'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
