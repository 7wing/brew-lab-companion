export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      batch_stages: {
        Row: {
          batch_id: string
          completed: boolean | null
          id: string
          name: string
          notes: string | null
          scheduled: string | null
          sort_order: number | null
        }
        Insert: {
          batch_id: string
          completed?: boolean | null
          id?: string
          name: string
          notes?: string | null
          scheduled?: string | null
          sort_order?: number | null
        }
        Update: {
          batch_id?: string
          completed?: boolean | null
          id?: string
          name?: string
          notes?: string | null
          scheduled?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "batch_stages_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      batches: {
        Row: {
          created_at: string | null
          fermenter: string | null
          id: string
          name: string
          notes: string | null
          og: number | null
          recipe_id: string | null
          start_date: string
          status: Database["public"]["Enums"]["batch_status"] | null
          target_days: number
          target_fg: number | null
          target_temp_f: number | null
          type: Database["public"]["Enums"]["ferment_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          fermenter?: string | null
          id?: string
          name: string
          notes?: string | null
          og?: number | null
          recipe_id?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["batch_status"] | null
          target_days?: number
          target_fg?: number | null
          target_temp_f?: number | null
          type: Database["public"]["Enums"]["ferment_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          fermenter?: string | null
          id?: string
          name?: string
          notes?: string | null
          og?: number | null
          recipe_id?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["batch_status"] | null
          target_days?: number
          target_fg?: number | null
          target_temp_f?: number | null
          type?: Database["public"]["Enums"]["ferment_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "batches_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_entries: {
        Row: {
          batch_id: string | null
          challenge_id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          batch_id?: string | null
          challenge_id: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          batch_id?: string | null
          challenge_id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_entries_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_entries_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          start_date: string | null
          title: string
          type: Database["public"]["Enums"]["ferment_type"] | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          start_date?: string | null
          title: string
          type?: Database["public"]["Enums"]["ferment_type"] | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          start_date?: string | null
          title?: string
          type?: Database["public"]["Enums"]["ferment_type"] | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string | null
          followed_id: string
          follower_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          followed_id: string
          follower_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          followed_id?: string
          follower_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_followed_id_fkey"
            columns: ["followed_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          category: Database["public"]["Enums"]["post_category"]
          content: string
          created_at: string | null
          fts: unknown
          id: string
          likes: number | null
          title: string
          type: Database["public"]["Enums"]["ferment_type"] | null
          user_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["post_category"]
          content: string
          created_at?: string | null
          fts?: unknown
          id?: string
          likes?: number | null
          title: string
          type?: Database["public"]["Enums"]["ferment_type"] | null
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["post_category"]
          content?: string
          created_at?: string | null
          fts?: unknown
          id?: string
          likes?: number | null
          title?: string
          type?: Database["public"]["Enums"]["ferment_type"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          id: string
          location: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          location?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          location?: string | null
          username?: string
        }
        Relationships: []
      }
      readings: {
        Row: {
          batch_id: string
          gravity: number
          id: string
          notes: string | null
          ph: number | null
          photo_url: string | null
          read_at: string | null
          temp_f: number | null
          user_id: string
        }
        Insert: {
          batch_id: string
          gravity: number
          id?: string
          notes?: string | null
          ph?: number | null
          photo_url?: string | null
          read_at?: string | null
          temp_f?: number | null
          user_id: string
        }
        Update: {
          batch_id?: string
          gravity?: number
          id?: string
          notes?: string | null
          ph?: number | null
          photo_url?: string | null
          read_at?: string | null
          temp_f?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "readings_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "readings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          abv: number | null
          created_at: string | null
          description: string | null
          difficulty: number | null
          estimated_days: number | null
          fts: unknown
          id: string
          ingredients: Json | null
          is_public: boolean | null
          starred: boolean | null
          steps: Json | null
          title: string
          type: Database["public"]["Enums"]["ferment_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          abv?: number | null
          created_at?: string | null
          description?: string | null
          difficulty?: number | null
          estimated_days?: number | null
          fts?: unknown
          id?: string
          ingredients?: Json | null
          is_public?: boolean | null
          starred?: boolean | null
          steps?: Json | null
          title: string
          type: Database["public"]["Enums"]["ferment_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          abv?: number | null
          created_at?: string | null
          description?: string | null
          difficulty?: number | null
          estimated_days?: number | null
          fts?: unknown
          id?: string
          ingredients?: Json | null
          is_public?: boolean | null
          starred?: boolean | null
          steps?: Json | null
          title?: string
          type?: Database["public"]["Enums"]["ferment_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasting_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasting_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "tasting_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasting_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasting_notes: {
        Row: {
          aroma: string | null
          created_at: string | null
          flavor: string | null
          id: string
          mouthfeel: string | null
          overall: string | null
          session_id: string
          user_id: string
        }
        Insert: {
          aroma?: string | null
          created_at?: string | null
          flavor?: string | null
          id?: string
          mouthfeel?: string | null
          overall?: string | null
          session_id: string
          user_id: string
        }
        Update: {
          aroma?: string | null
          created_at?: string | null
          flavor?: string | null
          id?: string
          mouthfeel?: string | null
          overall?: string | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasting_notes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "tasting_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasting_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasting_sessions: {
        Row: {
          batch_id: string | null
          created_at: string | null
          ended_at: string | null
          host_id: string
          id: string
          is_live: boolean | null
          started_at: string | null
          title: string
        }
        Insert: {
          batch_id?: string | null
          created_at?: string | null
          ended_at?: string | null
          host_id: string
          id?: string
          is_live?: boolean | null
          started_at?: string | null
          title: string
        }
        Update: {
          batch_id?: string | null
          created_at?: string | null
          ended_at?: string | null
          host_id?: string
          id?: string
          is_live?: boolean | null
          started_at?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasting_sessions_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasting_sessions_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      yeast_bank: {
        Row: {
          created_at: string | null
          id: string
          name: string
          notes: string | null
          strain_code: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          strain_code?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          strain_code?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "yeast_bank_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      toggle_post_like: {
        Args: { p_post_id: string; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      batch_status:
        | "planning"
        | "active"
        | "conditioning"
        | "completed"
        | "abandoned"
      ferment_type:
        | "beer"
        | "kombucha"
        | "mead"
        | "cider"
        | "sourdough"
        | "ferment"
      post_category: "recipe" | "troubleshooting" | "tasting"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      batch_status: [
        "planning",
        "active",
        "conditioning",
        "completed",
        "abandoned",
      ],
      ferment_type: [
        "beer",
        "kombucha",
        "mead",
        "cider",
        "sourdough",
        "ferment",
      ],
      post_category: ["recipe", "troubleshooting", "tasting"],
    },
  },
} as const
