export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      project: {
        Row: {
          id: number
          title: string
          updated_at: string
        }
        Insert: {
          id?: number
          title?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      timeline_items: {
        Row: {
          id: string
          title: string
          description: string
          duration_type: 'date' | 'time'
          due_date: string | null
          due_at: string | null
          status: 'berjalan' | 'selesai' | 'dibatalkan'
          position: number
          remind_at: string | null
          reminder_sent_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          duration_type: 'date' | 'time'
          due_date?: string | null
          due_at?: string | null
          status?: 'berjalan' | 'selesai' | 'dibatalkan'
          position?: number
          remind_at?: string | null
          reminder_sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          duration_type?: 'date' | 'time'
          due_date?: string | null
          due_at?: string | null
          status?: 'berjalan' | 'selesai' | 'dibatalkan'
          position?: number
          remind_at?: string | null
          reminder_sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          id: string
          name: string
          email: string
          message: string
          is_read: boolean
          ip_hash: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          message: string
          is_read?: boolean
          ip_hash?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          message?: string
          is_read?: boolean
          ip_hash?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      reorder_timeline: {
        Args: { p_ids: string[] }
        Returns: void
      }
      claim_due_reminders: {
        Args: Record<string, never>
        Returns: Database['public']['Tables']['timeline_items']['Row'][]
      }
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Project = Database['public']['Tables']['project']['Row']
export type TimelineItem = Database['public']['Tables']['timeline_items']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type ItemStatus = 'berjalan' | 'selesai' | 'dibatalkan'
