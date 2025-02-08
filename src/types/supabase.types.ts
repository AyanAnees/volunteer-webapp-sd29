// This file will be replaced with generated types from Supabase
// For now, we'll define basic types manually

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          type: 'volunteer' | 'organization' | 'admin'
          display_name: string | null
          bio: string | null
          location: string | null
          phone: string | null
          website: string | null
          profile_image_url: string | null
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          type: 'volunteer' | 'organization' | 'admin'
          display_name?: string | null
          bio?: string | null
          location?: string | null
          phone?: string | null
          website?: string | null
          profile_image_url?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: 'volunteer' | 'organization' | 'admin'
          display_name?: string | null
          bio?: string | null
          location?: string | null
          phone?: string | null
          website?: string | null
          profile_image_url?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      skills: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profile_skills: {
        Row: {
          id: string
          profile_id: string
          skill_id: string
          proficiency_level: number
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          skill_id: string
          proficiency_level: number
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          skill_id?: string
          proficiency_level?: number
          created_at?: string
        }
      }
      availability: {
        Row: {
          id: string
          profile_id: string
          day_of_week: number
          start_time: string
          end_time: string
          recurring: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          day_of_week: number
          start_time: string
          end_time: string
          recurring?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          recurring?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          creator_id: string
          title: string
          description: string | null
          location: string | null
          start_datetime: string
          end_datetime: string
          status: 'draft' | 'published' | 'canceled' | 'completed'
          max_volunteers: number | null
          min_volunteers: number
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          title: string
          description?: string | null
          location?: string | null
          start_datetime: string
          end_datetime: string
          status: 'draft' | 'published' | 'canceled' | 'completed'
          max_volunteers?: number | null
          min_volunteers?: number
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          title?: string
          description?: string | null
          location?: string | null
          start_datetime?: string
          end_datetime?: string
          status?: 'draft' | 'published' | 'canceled' | 'completed'
          max_volunteers?: number | null
          min_volunteers?: number
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      event_skills: {
        Row: {
          id: string
          event_id: string
          skill_id: string
          importance_level: number
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          skill_id: string
          importance_level: number
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          skill_id?: string
          importance_level?: number
          created_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          event_id: string
          volunteer_id: string
          status: 'pending' | 'accepted' | 'rejected' | 'waitlisted' | 'canceled'
          message: string | null
          match_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          volunteer_id: string
          status: 'pending' | 'accepted' | 'rejected' | 'waitlisted' | 'canceled'
          message?: string | null
          match_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          volunteer_id?: string
          status?: 'pending' | 'accepted' | 'rejected' | 'waitlisted' | 'canceled'
          message?: string | null
          match_score?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          recipient_id: string
          sender_id: string | null
          type: string
          title: string
          message: string | null
          link: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          recipient_id: string
          sender_id?: string | null
          type: string
          title: string
          message?: string | null
          link?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          recipient_id?: string
          sender_id?: string | null
          type?: string
          title?: string
          message?: string | null
          link?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
      history: {
        Row: {
          id: string
          volunteer_id: string
          event_id: string
          hours_logged: number | null
          feedback: string | null
          rating: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          volunteer_id: string
          event_id: string
          hours_logged?: number | null
          feedback?: string | null
          rating?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          volunteer_id?: string
          event_id?: string
          hours_logged?: number | null
          feedback?: string | null
          rating?: number | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
