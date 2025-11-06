export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'student' | 'teacher' | 'principal'
export type RecordType = 'merit' | 'demerit'
export type ReportType = 'weekly' | 'monthly'
export type DetentionStatus = 'pending' | 'served' | 'excused'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: UserRole
          full_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role: UserRole
          full_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: UserRole
          full_name?: string
          created_at?: string
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          user_id: string | null
          full_name: string
          english_name: string
          grade: string
          section: string
          academic_year_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          full_name: string
          english_name: string
          grade: string
          section: string
          academic_year_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          full_name?: string
          english_name?: string
          grade?: string
          section?: string
          academic_year_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      teachers: {
        Row: {
          id: string
          user_id: string | null
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      principals: {
        Row: {
          id: string
          user_id: string | null
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      academic_years: {
        Row: {
          id: string
          year_name: string
          start_date: string
          end_date: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          year_name: string
          start_date: string
          end_date: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          year_name?: string
          start_date?: string
          end_date?: string
          is_active?: boolean
          created_at?: string
        }
      }
      records: {
        Row: {
          id: string
          student_id: string
          teacher_id: string
          academic_year_id: string | null
          type: RecordType
          reason: string
          quantity: number
          created_at: string
          updated_at: string
          edited_by: string | null
          is_deleted: boolean
        }
        Insert: {
          id?: string
          student_id: string
          teacher_id: string
          academic_year_id?: string | null
          type: RecordType
          reason: string
          quantity: number
          created_at?: string
          updated_at?: string
          edited_by?: string | null
          is_deleted?: boolean
        }
        Update: {
          id?: string
          student_id?: string
          teacher_id?: string
          academic_year_id?: string | null
          type?: RecordType
          reason?: string
          quantity?: number
          created_at?: string
          updated_at?: string
          edited_by?: string | null
          is_deleted?: boolean
        }
      }
      uniform_passes: {
        Row: {
          id: string
          student_id: string
          academic_year_id: string | null
          earned_on: string
          merits_count: number
          month: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          academic_year_id?: string | null
          earned_on?: string
          merits_count: number
          month: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          academic_year_id?: string | null
          earned_on?: string
          merits_count?: number
          month?: string
          created_at?: string
        }
      }
      detentions: {
        Row: {
          id: string
          student_id: string
          academic_year_id: string | null
          triggered_on: string
          demerits_count: number
          month: string
          status: DetentionStatus
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          academic_year_id?: string | null
          triggered_on?: string
          demerits_count: number
          month: string
          status?: DetentionStatus
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          academic_year_id?: string | null
          triggered_on?: string
          demerits_count?: number
          month?: string
          status?: DetentionStatus
          created_at?: string
        }
      }
      raffle_prizes: {
        Row: {
          id: string
          academic_year_id: string | null
          prize_name: string
          month: string
          claimed: boolean
          winner_id: string | null
          drawn_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          academic_year_id?: string | null
          prize_name: string
          month: string
          claimed?: boolean
          winner_id?: string | null
          drawn_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          academic_year_id?: string | null
          prize_name?: string
          month?: string
          claimed?: boolean
          winner_id?: string | null
          drawn_at?: string | null
          created_at?: string
        }
      }
      raffle_entries: {
        Row: {
          id: string
          student_id: string
          academic_year_id: string | null
          month: string
          total_entries: number
          remaining_entries: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          academic_year_id?: string | null
          month: string
          total_entries?: number
          remaining_entries?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          academic_year_id?: string | null
          month?: string
          total_entries?: number
          remaining_entries?: number
          created_at?: string
          updated_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          academic_year_id: string | null
          report_type: ReportType
          period: string
          generated_on: string
          file_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          academic_year_id?: string | null
          report_type: ReportType
          period: string
          generated_on?: string
          file_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          academic_year_id?: string | null
          report_type?: ReportType
          period?: string
          generated_on?: string
          file_url?: string | null
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          table_name: string
          record_id: string | null
          old_data: Json | null
          new_data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          table_name: string
          record_id?: string | null
          old_data?: Json | null
          new_data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          table_name?: string
          record_id?: string | null
          old_data?: Json | null
          new_data?: Json | null
          created_at?: string
        }
      }
      weekly_quotas: {
        Row: {
          id: string
          teacher_id: string
          week_start: string
          merits_issued: number
          quota_limit: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          week_start: string
          merits_issued?: number
          quota_limit?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          week_start?: string
          merits_issued?: number
          quota_limit?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
