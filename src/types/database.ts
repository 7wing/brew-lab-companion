/**
 * Placeholder Database types for Supabase.
 *
 * TODO: Generate real types after running SUPABASE_STEPS.sql:
 *   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
 */

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
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          bio: string | null
          location: string | null
          avatar_url: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          bio?: string | null
          location?: string | null
          avatar_url?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          bio?: string | null
          location?: string | null
          avatar_url?: string | null
          created_at?: string | null
        }
      }
      recipes: {
        Row: {
          id: string
          user_id: string
          title: string
          type: string
          description: string | null
          abv: number | null
          estimated_days: number | null
          difficulty: number | null
          ingredients: Json
          steps: Json
          is_public: boolean
          starred: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          type: string
          description?: string | null
          abv?: number | null
          estimated_days?: number | null
          difficulty?: number | null
          ingredients?: Json
          steps?: Json
          is_public?: boolean
          starred?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          type?: string
          description?: string | null
          abv?: number | null
          estimated_days?: number | null
          difficulty?: number | null
          ingredients?: Json
          steps?: Json
          is_public?: boolean
          starred?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
      }
      batches: {
        Row: {
          id: string
          user_id: string
          recipe_id: string | null
          name: string
          type: string
          status: string
          start_date: string
          target_days: number
          og: number | null
          target_fg: number | null
          fermenter: string | null
          target_temp_f: number | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          recipe_id?: string | null
          name: string
          type: string
          status?: string
          start_date?: string
          target_days?: number
          og?: number | null
          target_fg?: number | null
          fermenter?: string | null
          target_temp_f?: number | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          recipe_id?: string | null
          name?: string
          type?: string
          status?: string
          start_date?: string
          target_days?: number
          og?: number | null
          target_fg?: number | null
          fermenter?: string | null
          target_temp_f?: number | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      readings: {
        Row: {
          id: string
          batch_id: string
          user_id: string
          gravity: number
          temp_f: number | null
          ph: number | null
          notes: string | null
          photo_url: string | null
          read_at: string | null
        }
        Insert: {
          id?: string
          batch_id: string
          user_id: string
          gravity: number
          temp_f?: number | null
          ph?: number | null
          notes?: string | null
          photo_url?: string | null
          read_at?: string | null
        }
        Update: {
          id?: string
          batch_id?: string
          user_id?: string
          gravity?: number
          temp_f?: number | null
          ph?: number | null
          notes?: string | null
          photo_url?: string | null
          read_at?: string | null
        }
      }
      batch_stages: {
        Row: {
          id: string
          batch_id: string
          name: string
          scheduled: string | null
          completed: boolean
          notes: string | null
          sort_order: number
        }
        Insert: {
          id?: string
          batch_id: string
          name: string
          scheduled?: string | null
          completed?: boolean
          notes?: string | null
          sort_order?: number
        }
        Update: {
          id?: string
          batch_id?: string
          name?: string
          scheduled?: string | null
          completed?: boolean
          notes?: string | null
          sort_order?: number
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          category: string
          title: string
          content: string
          type: string | null
          likes: number
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          category: string
          title: string
          content: string
          type?: string | null
          likes?: number
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          category?: string
          title?: string
          content?: string
          type?: string | null
          likes?: number
          created_at?: string | null
        }
      }
      post_likes: {
        Row: {
          post_id: string
          user_id: string
        }
        Insert: {
          post_id: string
          user_id: string
        }
        Update: {
          post_id?: string
          user_id?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          created_at: string | null
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          created_at?: string | null
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          created_at?: string | null
        }
      }
      challenges: {
        Row: {
          id: string
          title: string
          description: string | null
          type: string | null
          start_date: string | null
          end_date: string | null
          is_active: boolean
          created_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          type?: string | null
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean
          created_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          type?: string | null
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean
          created_at?: string | null
        }
      }
      challenge_entries: {
        Row: {
          challenge_id: string
          user_id: string
          batch_id: string | null
          joined_at: string | null
        }
        Insert: {
          challenge_id: string
          user_id: string
          batch_id?: string | null
          joined_at?: string | null
        }
        Update: {
          challenge_id?: string
          user_id?: string
          batch_id?: string | null
          joined_at?: string | null
        }
      }
      tasting_sessions: {
        Row: {
          id: string
          host_id: string
          batch_id: string | null
          title: string
          is_live: boolean
          started_at: string | null
          ended_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          host_id: string
          batch_id?: string | null
          title: string
          is_live?: boolean
          started_at?: string | null
          ended_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          host_id?: string
          batch_id?: string | null
          title?: string
          is_live?: boolean
          started_at?: string | null
          ended_at?: string | null
          created_at?: string | null
        }
      }
      tasting_messages: {
        Row: {
          id: string
          session_id: string
          user_id: string
          message: string
          created_at: string | null
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          message: string
          created_at?: string | null
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          message?: string
          created_at?: string | null
        }
      }
      tasting_notes: {
        Row: {
          id: string
          session_id: string
          user_id: string
          aroma: string | null
          flavor: string | null
          mouthfeel: string | null
          overall: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          aroma?: string | null
          flavor?: string | null
          mouthfeel?: string | null
          overall?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          aroma?: string | null
          flavor?: string | null
          mouthfeel?: string | null
          overall?: string | null
          created_at?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          body: string | null
          link: string | null
          is_read: boolean
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          body?: string | null
          link?: string | null
          is_read?: boolean
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          body?: string | null
          link?: string | null
          is_read?: boolean
          created_at?: string | null
        }
      }
      yeast_bank: {
        Row: {
          id: string
          user_id: string
          name: string
          strain_code: string | null
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          strain_code?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          strain_code?: string | null
          notes?: string | null
          created_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      toggle_post_like: {
        Args: { p_post_id: string; p_user_id: string }
        Returns: void
      }
      handle_new_user: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
