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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      app_clicks: {
        Row: {
          app_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          app_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          app_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      app_feedback_config: {
        Row: {
          app_id: string
          created_at: string
          feedback_type: string
          id: string
          is_enabled: boolean
          questions: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          app_id: string
          created_at?: string
          feedback_type?: string
          id?: string
          is_enabled?: boolean
          questions?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          app_id?: string
          created_at?: string
          feedback_type?: string
          id?: string
          is_enabled?: boolean
          questions?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      app_feedback_responses: {
        Row: {
          app_id: string
          config_id: string
          created_at: string
          feedback_type: string
          id: string
          response_data: Json
          user_id: string
        }
        Insert: {
          app_id: string
          config_id: string
          created_at?: string
          feedback_type: string
          id?: string
          response_data?: Json
          user_id: string
        }
        Update: {
          app_id?: string
          config_id?: string
          created_at?: string
          feedback_type?: string
          id?: string
          response_data?: Json
          user_id?: string
        }
        Relationships: []
      }
      app_tries: {
        Row: {
          app_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          app_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          app_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_tries_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps"
            referencedColumns: ["id"]
          },
        ]
      }
      app_updates: {
        Row: {
          app_id: string
          created_at: string
          id: string
          user_id: string
          version_notes: string
        }
        Insert: {
          app_id: string
          created_at?: string
          id?: string
          user_id: string
          version_notes: string
        }
        Update: {
          app_id?: string
          created_at?: string
          id?: string
          user_id?: string
          version_notes?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_updates_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps"
            referencedColumns: ["id"]
          },
        ]
      }
      apps: {
        Row: {
          app_icon_url: string | null
          app_name: string
          app_store_url: string | null
          caption: string | null
          comments_count: number | null
          created_at: string
          demo_video_url: string | null
          full_description: string | null
          github_url: string | null
          id: string
          likes_count: number | null
          platforms: string[] | null
          play_store_url: string | null
          pricing: string | null
          screenshots: string[] | null
          short_description: string | null
          slug: string | null
          status: string
          tagline: string | null
          tags: string[] | null
          tech_stack: string[] | null
          unpublish_reason: string | null
          updated_at: string
          user_id: string
          views_count: number | null
          website_url: string | null
        }
        Insert: {
          app_icon_url?: string | null
          app_name: string
          app_store_url?: string | null
          caption?: string | null
          comments_count?: number | null
          created_at?: string
          demo_video_url?: string | null
          full_description?: string | null
          github_url?: string | null
          id?: string
          likes_count?: number | null
          platforms?: string[] | null
          play_store_url?: string | null
          pricing?: string | null
          screenshots?: string[] | null
          short_description?: string | null
          slug?: string | null
          status?: string
          tagline?: string | null
          tags?: string[] | null
          tech_stack?: string[] | null
          unpublish_reason?: string | null
          updated_at?: string
          user_id: string
          views_count?: number | null
          website_url?: string | null
        }
        Update: {
          app_icon_url?: string | null
          app_name?: string
          app_store_url?: string | null
          caption?: string | null
          comments_count?: number | null
          created_at?: string
          demo_video_url?: string | null
          full_description?: string | null
          github_url?: string | null
          id?: string
          likes_count?: number | null
          platforms?: string[] | null
          play_store_url?: string | null
          pricing?: string | null
          screenshots?: string[] | null
          short_description?: string | null
          slug?: string | null
          status?: string
          tagline?: string | null
          tags?: string[] | null
          tech_stack?: string[] | null
          unpublish_reason?: string | null
          updated_at?: string
          user_id?: string
          views_count?: number | null
          website_url?: string | null
        }
        Relationships: []
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          app_id: string
          created_at: string
          id: string
          likes_count: number | null
          text: string
          user_id: string
        }
        Insert: {
          app_id: string
          created_at?: string
          id?: string
          likes_count?: number | null
          text: string
          user_id: string
        }
        Update: {
          app_id?: string
          created_at?: string
          id?: string
          likes_count?: number | null
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      profile_views: {
        Row: {
          created_at: string
          id: string
          user_id: string
          viewer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          viewer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          viewer_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          collaboration_looking_for: string[] | null
          created_at: string
          date_of_birth: string | null
          display_name: string | null
          education: Json | null
          gender: string | null
          github_url: string | null
          id: string
          instagram_url: string | null
          is_verified: boolean
          leetcode_url: string | null
          linkedin_url: string | null
          location: string | null
          looking_for_work: boolean | null
          open_to_collaboration: boolean | null
          portfolio_url: string | null
          preferred_platforms: string[] | null
          primary_skill: string | null
          professional_title: string | null
          referral_code: string | null
          referrals_count: number
          secondary_tools: string[] | null
          social_links: Json | null
          twitter_url: string | null
          updated_at: string
          user_id: string
          username: string | null
          website: string | null
          work_experience: Json | null
          work_experience_years: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          collaboration_looking_for?: string[] | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          education?: Json | null
          gender?: string | null
          github_url?: string | null
          id?: string
          instagram_url?: string | null
          is_verified?: boolean
          leetcode_url?: string | null
          linkedin_url?: string | null
          location?: string | null
          looking_for_work?: boolean | null
          open_to_collaboration?: boolean | null
          portfolio_url?: string | null
          preferred_platforms?: string[] | null
          primary_skill?: string | null
          professional_title?: string | null
          referral_code?: string | null
          referrals_count?: number
          secondary_tools?: string[] | null
          social_links?: Json | null
          twitter_url?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
          website?: string | null
          work_experience?: Json | null
          work_experience_years?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          collaboration_looking_for?: string[] | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          education?: Json | null
          gender?: string | null
          github_url?: string | null
          id?: string
          instagram_url?: string | null
          is_verified?: boolean
          leetcode_url?: string | null
          linkedin_url?: string | null
          location?: string | null
          looking_for_work?: boolean | null
          open_to_collaboration?: boolean | null
          portfolio_url?: string | null
          preferred_platforms?: string[] | null
          primary_skill?: string | null
          professional_title?: string | null
          referral_code?: string | null
          referrals_count?: number
          secondary_tools?: string[] | null
          social_links?: Json | null
          twitter_url?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
          website?: string | null
          work_experience?: Json | null
          work_experience_years?: number | null
        }
        Relationships: []
      }
      ratings: {
        Row: {
          app_id: string
          created_at: string
          id: string
          rating: number
          review_text: string | null
          user_id: string
        }
        Insert: {
          app_id: string
          created_at?: string
          id?: string
          rating: number
          review_text?: string | null
          user_id: string
        }
        Update: {
          app_id?: string
          created_at?: string
          id?: string
          rating?: number
          review_text?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          qualified_at: string | null
          referral_code: string
          referred_user_id: string | null
          referrer_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          qualified_at?: string | null
          referral_code: string
          referred_user_id?: string | null
          referrer_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          qualified_at?: string | null
          referral_code?: string
          referred_user_id?: string | null
          referrer_id?: string
          status?: string
        }
        Relationships: []
      }
      saved_apps: {
        Row: {
          app_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          app_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          app_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_apps_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps"
            referencedColumns: ["id"]
          },
        ]
      }
      user_consents: {
        Row: {
          consented_at: string
          id: string
          privacy_version: string
          terms_version: string
          user_id: string
        }
        Insert: {
          consented_at?: string
          id?: string
          privacy_version?: string
          terms_version?: string
          user_id: string
        }
        Update: {
          consented_at?: string
          id?: string
          privacy_version?: string
          terms_version?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          collaboration_looking_for: string[] | null
          created_at: string | null
          display_name: string | null
          education: Json | null
          github_url: string | null
          id: string | null
          instagram_url: string | null
          leetcode_url: string | null
          linkedin_url: string | null
          location: string | null
          looking_for_work: boolean | null
          open_to_collaboration: boolean | null
          portfolio_url: string | null
          preferred_platforms: string[] | null
          primary_skill: string | null
          professional_title: string | null
          secondary_tools: string[] | null
          social_links: Json | null
          twitter_url: string | null
          updated_at: string | null
          user_id: string | null
          username: string | null
          website: string | null
          work_experience: Json | null
          work_experience_years: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          collaboration_looking_for?: string[] | null
          created_at?: string | null
          display_name?: string | null
          education?: Json | null
          github_url?: string | null
          id?: string | null
          instagram_url?: string | null
          leetcode_url?: string | null
          linkedin_url?: string | null
          location?: string | null
          looking_for_work?: boolean | null
          open_to_collaboration?: boolean | null
          portfolio_url?: string | null
          preferred_platforms?: string[] | null
          primary_skill?: string | null
          professional_title?: string | null
          secondary_tools?: string[] | null
          social_links?: Json | null
          twitter_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
          website?: string | null
          work_experience?: Json | null
          work_experience_years?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          collaboration_looking_for?: string[] | null
          created_at?: string | null
          display_name?: string | null
          education?: Json | null
          github_url?: string | null
          id?: string | null
          instagram_url?: string | null
          leetcode_url?: string | null
          linkedin_url?: string | null
          location?: string | null
          looking_for_work?: boolean | null
          open_to_collaboration?: boolean | null
          portfolio_url?: string | null
          preferred_platforms?: string[] | null
          primary_skill?: string | null
          professional_title?: string | null
          secondary_tools?: string[] | null
          social_links?: Json | null
          twitter_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
          website?: string | null
          work_experience?: Json | null
          work_experience_years?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_referral_code: { Args: never; Returns: string }
      get_trending_apps: {
        Args: { max_results?: number; time_filter?: string }
        Returns: {
          app_id: string
          avg_rating: number
          engagement_score: number
          feedback_count: number
          ratings_count: number
          review_likes_count: number
          reviews_count: number
          saves_count: number
          trending_score: number
          tries_count: number
        }[]
      }
      increment_views: { Args: { app_id: string }; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
