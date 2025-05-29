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
      events: {
        Row: {
          created_at: string | null
          id: string
          name: string
          start_date: string | null
          theme_json: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          start_date?: string | null
          theme_json?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          start_date?: string | null
          theme_json?: Json | null
        }
        Relationships: []
      }
      participants: {
        Row: {
          full_name: string | null
          id: string
          telegram_id: string | null
          username: string | null
        }
        Insert: {
          full_name?: string | null
          id?: string
          telegram_id?: string | null
          username?: string | null
        }
        Update: {
          full_name?: string | null
          id?: string
          telegram_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          author_name: string | null
          author_telegram_id: string | null
          author_username: string | null
          created_at: string | null
          event_id: string
          id: string
          is_anonymous: boolean | null
          is_answered: boolean | null
          is_approved: boolean | null
          session_id: string | null
          speaker_id: string | null
          text: string
        }
        Insert: {
          author_name?: string | null
          author_telegram_id?: string | null
          author_username?: string | null
          created_at?: string | null
          event_id: string
          id?: string
          is_anonymous?: boolean | null
          is_answered?: boolean | null
          is_approved?: boolean | null
          session_id?: string | null
          speaker_id?: string | null
          text: string
        }
        Update: {
          author_name?: string | null
          author_telegram_id?: string | null
          author_username?: string | null
          created_at?: string | null
          event_id?: string
          id?: string
          is_anonymous?: boolean | null
          is_answered?: boolean | null
          is_approved?: boolean | null
          session_id?: string | null
          speaker_id?: string | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_speaker_id_fkey"
            columns: ["speaker_id"]
            isOneToOne: false
            referencedRelation: "speakers"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string | null
          day: string | null
          description: string | null
          event_id: string
          id: string
          speaker_id: string | null
          time_from: string | null
          time_to: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          day?: string | null
          description?: string | null
          event_id: string
          id?: string
          speaker_id?: string | null
          time_from?: string | null
          time_to?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          day?: string | null
          description?: string | null
          event_id?: string
          id?: string
          speaker_id?: string | null
          time_from?: string | null
          time_to?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_speaker_id_fkey"
            columns: ["speaker_id"]
            isOneToOne: false
            referencedRelation: "speakers"
            referencedColumns: ["id"]
          },
        ]
      }
      speakers: {
        Row: {
          bio: string | null
          created_at: string | null
          event_id: string | null
          id: string
          name: string
          photo_url: string | null
          telegram_id: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          name: string
          photo_url?: string | null
          telegram_id?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          name?: string
          photo_url?: string | null
          telegram_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "speakers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          telegram_id: string
          work_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          telegram_id: string
          work_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          telegram_id?: string
          work_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "votes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_work_id_fkey"
            columns: ["work_id"]
            isOneToOne: false
            referencedRelation: "works"
            referencedColumns: ["id"]
          },
        ]
      }
      works: {
        Row: {
          author_name: string | null
          created_at: string | null
          description: string | null
          event_id: string
          id: string
          photo_url: string | null
          title: string
          video_url: string | null
          votes_count: number
        }
        Insert: {
          author_name?: string | null
          created_at?: string | null
          description?: string | null
          event_id: string
          id?: string
          photo_url?: string | null
          title: string
          video_url?: string | null
          votes_count?: number
        }
        Update: {
          author_name?: string | null
          created_at?: string | null
          description?: string | null
          event_id?: string
          id?: string
          photo_url?: string | null
          title?: string
          video_url?: string | null
          votes_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "works_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      vw_questions_detailed: {
        Row: {
          author_name: string | null
          author_telegram_id: string | null
          author_username: string | null
          created_at: string | null
          event_id: string | null
          id: string | null
          is_anonymous: boolean | null
          is_answered: boolean | null
          is_approved: boolean | null
          session_id: string | null
          speaker_id: string | null
          text: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_speaker_id_fkey"
            columns: ["speaker_id"]
            isOneToOne: false
            referencedRelation: "speakers"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_votes_detailed: {
        Row: {
          created_at: string | null
          event_id: string | null
          full_name: string | null
          id: string | null
          telegram_id: string | null
          username: string | null
          work_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "votes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_work_id_fkey"
            columns: ["work_id"]
            isOneToOne: false
            referencedRelation: "works"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
