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
      achievements: {
        Row: {
          achievement_key: string
          earned_at: string
          evidence: Json
          id: string
          user_id: string
        }
        Insert: {
          achievement_key: string
          earned_at?: string
          evidence?: Json
          id?: string
          user_id: string
        }
        Update: {
          achievement_key?: string
          earned_at?: string
          evidence?: Json
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      activity_events: {
        Row: {
          created_at: string
          id: string
          kind: string
          local_date: string
          source_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          local_date: string
          source_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          local_date?: string
          source_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      app_state: {
        Row: {
          avatar: string
          best_streak: number
          display_name: string
          freeze_month: string
          freeze_notice: boolean
          halo_log: Json
          id: string
          intention: string
          last_streak_date: string | null
          lumi_enabled: boolean
          motion_preference: string
          onboarded: boolean
          onboarding_step: number
          sound_enabled: boolean
          streak: number
          streaks_enabled: boolean
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar?: string
          best_streak?: number
          display_name?: string
          freeze_month?: string
          freeze_notice?: boolean
          halo_log?: Json
          id: string
          intention?: string
          last_streak_date?: string | null
          lumi_enabled?: boolean
          motion_preference?: string
          onboarded?: boolean
          onboarding_step?: number
          sound_enabled?: boolean
          streak?: number
          streaks_enabled?: boolean
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar?: string
          best_streak?: number
          display_name?: string
          freeze_month?: string
          freeze_notice?: boolean
          halo_log?: Json
          id?: string
          intention?: string
          last_streak_date?: string | null
          lumi_enabled?: boolean
          motion_preference?: string
          onboarded?: boolean
          onboarding_step?: number
          sound_enabled?: boolean
          streak?: number
          streaks_enabled?: boolean
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_checkins: {
        Row: {
          created_at: string
          id: string
          local_date: string
          mood: string
          reflection: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          local_date: string
          mood: string
          reflection?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          local_date?: string
          mood?: string
          reflection?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_plan_slots: {
        Row: {
          created_at: string
          id: string
          plan_id: string
          slot: number
          task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          plan_id: string
          slot: number
          task_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          plan_id?: string
          slot?: number
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_plan_slots_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "daily_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_plan_slots_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_plans: {
        Row: {
          closed_at: string | null
          created_at: string
          id: string
          local_date: string
          reflection: string
          revision: number
          updated_at: string
          user_id: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          id?: string
          local_date: string
          reflection?: string
          revision?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          id?: string
          local_date?: string
          reflection?: string
          revision?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          blocks: Json
          created_at: string
          hub_id: string | null
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          blocks?: Json
          created_at?: string
          hub_id?: string | null
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          blocks?: Json
          created_at?: string
          hub_id?: string | null
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
        ]
      }
      focus_sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          outcome: string | null
          paused_at: string | null
          paused_seconds: number
          planned_minutes: number
          started_at: string
          task_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          outcome?: string | null
          paused_at?: string | null
          paused_seconds?: number
          planned_minutes: number
          started_at: string
          task_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          outcome?: string | null
          paused_at?: string | null
          paused_seconds?: number
          planned_minutes?: number
          started_at?: string
          task_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "focus_sessions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      hubs: {
        Row: {
          archived_at: string | null
          color: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          position: number
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          color?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name: string
          position?: number
          user_id: string
        }
        Update: {
          archived_at?: string | null
          color?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          position?: number
          user_id?: string
        }
        Relationships: []
      }
      operation_receipts: {
        Row: {
          created_at: string
          id: string
          operation_id: string
          operation_kind: string
          payload_key: string
          result: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          operation_id: string
          operation_kind: string
          payload_key: string
          result?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          operation_id?: string
          operation_kind?: string
          payload_key?: string
          result?: Json
          user_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          ai_calls_reset_at: string
          ai_calls_used: number
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscription_end: string | null
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_calls_reset_at?: string
          ai_calls_used?: number
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscription_end?: string | null
          tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_calls_reset_at?: string
          ai_calls_used?: number
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscription_end?: string | null
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          board_column: string
          created_at: string
          done_at: string | null
          duration_minutes: number
          focus_sessions: number
          hub_id: string | null
          id: string
          is_done: boolean
          is_today: boolean
          notes: string
          position: number
          priority: string
          title: string
          user_id: string
        }
        Insert: {
          board_column?: string
          created_at?: string
          done_at?: string | null
          duration_minutes?: number
          focus_sessions?: number
          hub_id?: string | null
          id?: string
          is_done?: boolean
          is_today?: boolean
          notes?: string
          position?: number
          priority?: string
          title: string
          user_id: string
        }
        Update: {
          board_column?: string
          created_at?: string
          done_at?: string | null
          duration_minutes?: number
          focus_sessions?: number
          hub_id?: string | null
          id?: string
          is_done?: boolean
          is_today?: boolean
          notes?: string
          position?: number
          priority?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      remove_daily_plan_task: {
        Args: {
          _expected_revision: number
          _local_date: string
          _operation_id: string
          _task_id: string
        }
        Returns: Json
      }
      set_daily_plan_slot: {
        Args: {
          _expected_revision: number
          _local_date: string
          _operation_id: string
          _slot: number
          _task_id: string
        }
        Returns: Json
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
