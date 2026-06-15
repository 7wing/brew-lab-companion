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
      badges: {
        Row: {
          created_at: string | null
          criteria_key: string
          description: string | null
          icon_url: string | null
          id: string
          name: string
          target_value: number | null
        }
        Insert: {
          created_at?: string | null
          criteria_key: string
          description?: string | null
          icon_url?: string | null
          id?: string
          name: string
          target_value?: number | null
        }
        Update: {
          created_at?: string | null
          criteria_key?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          name?: string
          target_value?: number | null
        }
        Relationships: []
      }
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
          batch_number: number | null
          batch_size: number | null
          brew_date: string | null
          completed_date: string | null
          created_at: string | null
          fermenter: string | null
          finished_at: string | null
          id: string
          name: string
          notes: string | null
          og: number | null
          packaged_date: string | null
          recipe_id: string | null
          srm: number | null
          star_rating: number | null
          start_date: string
          status: Database["public"]["Enums"]["batch_status"] | null
          target_days: number
          target_fg: number | null
          target_temp_f: number | null
          type: Database["public"]["Enums"]["ferment_type"]
          updated_at: string | null
          user_id: string
          volume: number | null
          yeast_strain: string | null
        }
        Insert: {
          batch_number?: number | null
          batch_size?: number | null
          brew_date?: string | null
          completed_date?: string | null
          created_at?: string | null
          fermenter?: string | null
          finished_at?: string | null
          id?: string
          name: string
          notes?: string | null
          og?: number | null
          packaged_date?: string | null
          recipe_id?: string | null
          srm?: number | null
          star_rating?: number | null
          start_date?: string
          status?: Database["public"]["Enums"]["batch_status"] | null
          target_days?: number
          target_fg?: number | null
          target_temp_f?: number | null
          type: Database["public"]["Enums"]["ferment_type"]
          updated_at?: string | null
          user_id: string
          volume?: number | null
          yeast_strain?: string | null
        }
        Update: {
          batch_number?: number | null
          batch_size?: number | null
          brew_date?: string | null
          completed_date?: string | null
          created_at?: string | null
          fermenter?: string | null
          finished_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          og?: number | null
          packaged_date?: string | null
          recipe_id?: string | null
          srm?: number | null
          star_rating?: number | null
          start_date?: string
          status?: Database["public"]["Enums"]["batch_status"] | null
          target_days?: number
          target_fg?: number | null
          target_temp_f?: number | null
          type?: Database["public"]["Enums"]["ferment_type"]
          updated_at?: string | null
          user_id?: string
          volume?: number | null
          yeast_strain?: string | null
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
          rating: number | null
          submission_post_id: string | null
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          batch_id?: string | null
          challenge_id: string
          joined_at?: string | null
          rating?: number | null
          submission_post_id?: string | null
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          batch_id?: string | null
          challenge_id?: string
          joined_at?: string | null
          rating?: number | null
          submission_post_id?: string | null
          submitted_at?: string | null
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
            foreignKeyName: "challenge_entries_submission_post_id_fkey"
            columns: ["submission_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
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
          challenge_type: Database["public"]["Enums"]["challenge_type"] | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          max_participants: number | null
          moderation_status:
            | Database["public"]["Enums"]["moderation_status"]
            | null
          rules: string | null
          start_date: string | null
          title: string
          type: Database["public"]["Enums"]["ferment_type"] | null
        }
        Insert: {
          challenge_type?: Database["public"]["Enums"]["challenge_type"] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          max_participants?: number | null
          moderation_status?:
            | Database["public"]["Enums"]["moderation_status"]
            | null
          rules?: string | null
          start_date?: string | null
          title: string
          type?: Database["public"]["Enums"]["ferment_type"] | null
        }
        Update: {
          challenge_type?: Database["public"]["Enums"]["challenge_type"] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          max_participants?: number | null
          moderation_status?:
            | Database["public"]["Enums"]["moderation_status"]
            | null
          rules?: string | null
          start_date?: string | null
          title?: string
          type?: Database["public"]["Enums"]["ferment_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "challenges_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          edited_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          edited_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          edited_at?: string | null
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
      featured_recipes: {
        Row: {
          active: boolean | null
          created_at: string | null
          featured_type: string
          id: string
          recipe_id: string
          sort_order: number | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          featured_type?: string
          id?: string
          recipe_id: string
          sort_order?: number | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          featured_type?: string
          id?: string
          recipe_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "featured_recipes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
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
      lab_partners: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          slot: number | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slot?: number | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slot?: number | null
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          created_at: string | null
          email_enabled: boolean | null
          id: string
          in_app_enabled: boolean | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_user_id_fkey"
            columns: ["user_id"]
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
          appearance: string | null
          aroma: string | null
          batch_stage: string | null
          category: Database["public"]["Enums"]["post_category"]
          challenge_id: string | null
          content: string
          created_at: string | null
          current_ph: number | null
          current_sg: number | null
          current_temp: number | null
          edited_at: string | null
          flavor: string | null
          fts: unknown
          id: string
          likes: number | null
          mouthfeel: string | null
          overall: string | null
          photos: Json | null
          recipe_id: string | null
          star_rating: number | null
          title: string
          type: Database["public"]["Enums"]["ferment_type"] | null
          user_id: string
        }
        Insert: {
          appearance?: string | null
          aroma?: string | null
          batch_stage?: string | null
          category: Database["public"]["Enums"]["post_category"]
          challenge_id?: string | null
          content: string
          created_at?: string | null
          current_ph?: number | null
          current_sg?: number | null
          current_temp?: number | null
          edited_at?: string | null
          flavor?: string | null
          fts?: unknown
          id?: string
          likes?: number | null
          mouthfeel?: string | null
          overall?: string | null
          photos?: Json | null
          recipe_id?: string | null
          star_rating?: number | null
          title: string
          type?: Database["public"]["Enums"]["ferment_type"] | null
          user_id: string
        }
        Update: {
          appearance?: string | null
          aroma?: string | null
          batch_stage?: string | null
          category?: Database["public"]["Enums"]["post_category"]
          challenge_id?: string | null
          content?: string
          created_at?: string | null
          current_ph?: number | null
          current_sg?: number | null
          current_temp?: number | null
          edited_at?: string | null
          flavor?: string | null
          fts?: unknown
          id?: string
          likes?: number | null
          mouthfeel?: string | null
          overall?: string | null
          photos?: Json | null
          recipe_id?: string | null
          star_rating?: number | null
          title?: string
          type?: Database["public"]["Enums"]["ferment_type"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
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
          brew_types: Database["public"]["Enums"]["ferment_type"][] | null
          brewing_since: string | null
          cover_photo_url: string | null
          created_at: string | null
          display_name: string | null
          experience_level: string | null
          favourite_styles: string | null
          id: string
          location: string | null
          onboarding_completed: boolean | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          brew_types?: Database["public"]["Enums"]["ferment_type"][] | null
          brewing_since?: string | null
          cover_photo_url?: string | null
          created_at?: string | null
          display_name?: string | null
          experience_level?: string | null
          favourite_styles?: string | null
          id: string
          location?: string | null
          onboarding_completed?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          brew_types?: Database["public"]["Enums"]["ferment_type"][] | null
          brewing_since?: string | null
          cover_photo_url?: string | null
          created_at?: string | null
          display_name?: string | null
          experience_level?: string | null
          favourite_styles?: string | null
          id?: string
          location?: string | null
          onboarding_completed?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
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
      recipe_ratings: {
        Row: {
          batch_id: string | null
          created_at: string | null
          id: string
          rating: number
          recipe_id: string
          user_id: string
        }
        Insert: {
          batch_id?: string | null
          created_at?: string | null
          id?: string
          rating: number
          recipe_id: string
          user_id: string
        }
        Update: {
          batch_id?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          recipe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ratings_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ratings_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_stages: {
        Row: {
          action: string
          created_at: string | null
          day: number
          id: string
          notes: string | null
          recipe_id: string
          sort_order: number | null
        }
        Insert: {
          action: string
          created_at?: string | null
          day: number
          id?: string
          notes?: string | null
          recipe_id: string
          sort_order?: number | null
        }
        Update: {
          action?: string
          created_at?: string | null
          day?: number
          id?: string
          notes?: string | null
          recipe_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_stages_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          abv: number | null
          batch_size: number | null
          created_at: string | null
          curated: boolean | null
          description: string | null
          difficulty: number | null
          edited_at: string | null
          estimated_days: number | null
          forked_from: string | null
          fts: unknown
          ibu: number | null
          id: string
          ingredients: Json | null
          is_public: boolean | null
          moderation_status:
            | Database["public"]["Enums"]["moderation_status"]
            | null
          rejection_reason: string | null
          srm: number | null
          starred: boolean | null
          steps: Json | null
          style: string | null
          target_fg: number | null
          target_og: number | null
          title: string
          type: Database["public"]["Enums"]["ferment_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          abv?: number | null
          batch_size?: number | null
          created_at?: string | null
          curated?: boolean | null
          description?: string | null
          difficulty?: number | null
          edited_at?: string | null
          estimated_days?: number | null
          forked_from?: string | null
          fts?: unknown
          ibu?: number | null
          id?: string
          ingredients?: Json | null
          is_public?: boolean | null
          moderation_status?:
            | Database["public"]["Enums"]["moderation_status"]
            | null
          rejection_reason?: string | null
          srm?: number | null
          starred?: boolean | null
          steps?: Json | null
          style?: string | null
          target_fg?: number | null
          target_og?: number | null
          title: string
          type: Database["public"]["Enums"]["ferment_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          abv?: number | null
          batch_size?: number | null
          created_at?: string | null
          curated?: boolean | null
          description?: string | null
          difficulty?: number | null
          edited_at?: string | null
          estimated_days?: number | null
          forked_from?: string | null
          fts?: unknown
          ibu?: number | null
          id?: string
          ingredients?: Json | null
          is_public?: boolean | null
          moderation_status?:
            | Database["public"]["Enums"]["moderation_status"]
            | null
          rejection_reason?: string | null
          srm?: number | null
          starred?: boolean | null
          steps?: Json | null
          style?: string | null
          target_fg?: number | null
          target_og?: number | null
          title?: string
          type?: Database["public"]["Enums"]["ferment_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipes_forked_from_fkey"
            columns: ["forked_from"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reported_content: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          id: string
          reason: string
          reporter_id: string
          status: string | null
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string | null
          id?: string
          reason: string
          reporter_id: string
          status?: string | null
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reported_content_reporter_id_fkey"
            columns: ["reporter_id"]
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
      user_badges: {
        Row: {
          awarded_at: string | null
          badge_id: string
          user_id: string
        }
        Insert: {
          awarded_at?: string | null
          badge_id: string
          user_id: string
        }
        Update: {
          awarded_at?: string | null
          badge_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_privacy: {
        Row: {
          batch_shelf_visibility: string | null
          profile_visibility: string | null
          user_id: string
          yeast_bank_visibility: string | null
        }
        Insert: {
          batch_shelf_visibility?: string | null
          profile_visibility?: string | null
          user_id: string
          yeast_bank_visibility?: string | null
        }
        Update: {
          batch_shelf_visibility?: string | null
          profile_visibility?: string | null
          user_id?: string
          yeast_bank_visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_privacy_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          gravity_unit: string | null
          temperature_unit: string | null
          theme: string | null
          user_id: string
          volume_unit: string | null
        }
        Insert: {
          gravity_unit?: string | null
          temperature_unit?: string | null
          theme?: string | null
          user_id: string
          volume_unit?: string | null
        }
        Update: {
          gravity_unit?: string | null
          temperature_unit?: string | null
          theme?: string | null
          user_id?: string
          volume_unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      yeast_bank: {
        Row: {
          created_at: string | null
          generation: number | null
          id: string
          name: string
          notes: string | null
          source: string | null
          storage_date: string | null
          strain_code: string | null
          updated_at: string | null
          user_id: string
          viability_notes: string | null
        }
        Insert: {
          created_at?: string | null
          generation?: number | null
          id?: string
          name: string
          notes?: string | null
          source?: string | null
          storage_date?: string | null
          strain_code?: string | null
          updated_at?: string | null
          user_id: string
          viability_notes?: string | null
        }
        Update: {
          created_at?: string | null
          generation?: number | null
          id?: string
          name?: string
          notes?: string | null
          source?: string | null
          storage_date?: string | null
          strain_code?: string | null
          updated_at?: string | null
          user_id?: string
          viability_notes?: string | null
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
        | "brew_day"
        | "fermenting"
        | "packaging"
        | "batch_shelf"
        | "finished"
      challenge_type: "official" | "community"
      ferment_type:
        | "beer"
        | "kombucha"
        | "mead"
        | "cider"
        | "sourdough"
        | "ferment"
        | "wine"
      moderation_status: "pending" | "approved" | "rejected" | "needs_edits"
      post_category: "recipe" | "troubleshooting" | "tasting" | "brew_log"
      user_role: "brewer" | "moderator" | "super_admin"
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
        "brew_day",
        "fermenting",
        "packaging",
        "batch_shelf",
        "finished",
      ],
      challenge_type: ["official", "community"],
      ferment_type: [
        "beer",
        "kombucha",
        "mead",
        "cider",
        "sourdough",
        "ferment",
        "wine",
      ],
      moderation_status: ["pending", "approved", "rejected", "needs_edits"],
      post_category: ["recipe", "troubleshooting", "tasting", "brew_log"],
      user_role: ["brewer", "moderator", "super_admin"],
    },
  },
} as const
