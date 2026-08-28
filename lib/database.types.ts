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
      activity: {
        Row: {
          actor_id: string | null
          created_at: string
          group_id: string
          id: string
          payload: Json
          type: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          group_id: string
          id?: string
          payload?: Json
          type: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          group_id?: string
          id?: string
          payload?: Json
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      albums: {
        Row: {
          created_at: string
          created_by: string
          event_id: string | null
          group_id: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          event_id?: string | null
          group_id: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          event_id?: string | null
          group_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "albums_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "albums_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "albums_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      event_date_options: {
        Row: {
          created_at: string
          created_by: string
          ends_at: string | null
          event_id: string
          id: string
          starts_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          ends_at?: string | null
          event_id: string
          id?: string
          starts_at: string
        }
        Update: {
          created_at?: string
          created_by?: string
          ends_at?: string | null
          event_id?: string
          id?: string
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_date_options_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_date_options_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_date_votes: {
        Row: {
          created_at: string
          option_id: string
          updated_at: string
          user_id: string
          vote: string
        }
        Insert: {
          created_at?: string
          option_id: string
          updated_at?: string
          user_id: string
          vote?: string
        }
        Update: {
          created_at?: string
          option_id?: string
          updated_at?: string
          user_id?: string
          vote?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_date_votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "event_date_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_date_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_members: {
        Row: {
          event_id: string
          joined_at: string
          rsvp: string
          user_id: string
        }
        Insert: {
          event_id: string
          joined_at?: string
          rsvp?: string
          user_id: string
        }
        Update: {
          event_id?: string
          joined_at?: string
          rsvp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_members_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_proofs: {
        Row: {
          created_at: string
          event_id: string
          id: string
          photo_reference: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          photo_reference: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          photo_reference?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_proofs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_proofs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_tasks: {
        Row: {
          assigned_to: string | null
          completed: boolean
          created_at: string
          event_id: string
          id: string
          title: string
        }
        Insert: {
          assigned_to?: string | null
          completed?: boolean
          created_at?: string
          event_id: string
          id?: string
          title: string
        }
        Update: {
          assigned_to?: string | null
          completed?: boolean
          created_at?: string
          event_id?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_tasks_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          cover_url: string | null
          created_at: string
          created_by: string
          description: string | null
          ends_at: string | null
          group_id: string
          id: string
          idea_id: string | null
          location: string | null
          name: string
          rarity: number
          score_total: number | null
          score_version: string | null
          starts_at: string | null
          status: string
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          ends_at?: string | null
          group_id: string
          id?: string
          idea_id?: string | null
          location?: string | null
          name: string
          rarity?: number
          score_total?: number | null
          score_version?: string | null
          starts_at?: string | null
          status?: string
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          ends_at?: string | null
          group_id?: string
          id?: string
          idea_id?: string | null
          location?: string | null
          name?: string
          rarity?: number
          score_total?: number | null
          score_version?: string | null
          starts_at?: string | null
          status?: string
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_participants: {
        Row: {
          expense_id: string
          settled: boolean
          share: number
          user_id: string
        }
        Insert: {
          expense_id: string
          settled?: boolean
          share: number
          user_id: string
        }
        Update: {
          expense_id?: string
          settled?: boolean
          share?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_participants_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string
          event_id: string | null
          group_id: string
          id: string
          paid_by: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description: string
          event_id?: string | null
          group_id: string
          id?: string
          paid_by: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string
          event_id?: string | null
          group_id?: string
          id?: string
          paid_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_paid_by_fkey"
            columns: ["paid_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_join_requests: {
        Row: {
          created_at: string
          group_id: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_join_requests_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_join_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_join_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          group_id: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          group_id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_messages: {
        Row: {
          body: string
          created_at: string
          edited_at: string | null
          group_id: string
          id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          edited_at?: string | null
          group_id: string
          id?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          edited_at?: string | null
          group_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          parent_group_id: string | null
          status: string
          theme: Json
          updated_at: string
          visibility: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          parent_group_id?: string | null
          status?: string
          theme?: Json
          updated_at?: string
          visibility?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          parent_group_id?: string | null
          status?: string
          theme?: Json
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "groups_parent_group_id_fkey"
            columns: ["parent_group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_votes: {
        Row: {
          created_at: string
          idea_id: string
          user_id: string
          vote: string
        }
        Insert: {
          created_at?: string
          idea_id: string
          user_id: string
          vote?: string
        }
        Update: {
          created_at?: string
          idea_id?: string
          user_id?: string
          vote?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_votes_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ideas: {
        Row: {
          category: string | null
          created_at: string
          created_by: string
          description: string | null
          group_id: string
          id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          group_id: string
          id?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          group_id?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ideas_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ideas_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          code: string
          created_at: string
          created_by: string
          expires_at: string | null
          group_id: string
          id: string
        }
        Insert: {
          code: string
          created_at?: string
          created_by: string
          expires_at?: string | null
          group_id: string
          id?: string
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string
          expires_at?: string | null
          group_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invites_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      photos: {
        Row: {
          album_id: string
          caption: string | null
          created_at: string
          id: string
          storage_path: string
          uploaded_by: string
        }
        Insert: {
          album_id: string
          caption?: string | null
          created_at?: string
          id?: string
          storage_path: string
          uploaded_by: string
        }
        Update: {
          album_id?: string
          caption?: string | null
          created_at?: string
          id?: string
          storage_path?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "photos_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      point_ledger: {
        Row: {
          created_at: string
          event_id: string | null
          group_id: string
          id: string
          metadata: Json
          points: number
          reason: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          group_id: string
          id?: string
          metadata?: Json
          points: number
          reason: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string | null
          group_id?: string
          id?: string
          metadata?: Json
          points?: number
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "point_ledger_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_ledger_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_ledger_user_id_fkey"
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
          created_at: string
          display_name: string
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_group_invite: { Args: { p_code: string }; Returns: string }
      confirm_plan: {
        Args: { p_event_id: string; p_option_id: string }
        Returns: {
          cover_url: string | null
          created_at: string
          created_by: string
          description: string | null
          ends_at: string | null
          group_id: string
          id: string
          idea_id: string | null
          location: string | null
          name: string
          rarity: number
          score_total: number | null
          score_version: string | null
          starts_at: string | null
          status: string
          updated_at: string
          verified_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "events"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_group: {
        Args: { p_description?: string; p_name: string }
        Returns: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          parent_group_id: string | null
          status: string
          theme: Json
          updated_at: string
          visibility: string
        }
        SetofOptions: {
          from: "*"
          to: "groups"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_group_invite: {
        Args: { p_group_id: string }
        Returns: {
          code: string
          created_at: string
          created_by: string
          expires_at: string | null
          group_id: string
          id: string
        }
        SetofOptions: {
          from: "*"
          to: "invites"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_plan: {
        Args: {
          p_description?: string
          p_group_id: string
          p_idea_id?: string
          p_location?: string
          p_name: string
          p_options?: Json
        }
        Returns: string
      }
      create_sub_group: {
        Args: {
          p_description?: string
          p_name: string
          p_parent_group_id: string
        }
        Returns: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          parent_group_id: string | null
          status: string
          theme: Json
          updated_at: string
          visibility: string
        }
        SetofOptions: {
          from: "*"
          to: "groups"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_group_invite: {
        Args: { p_code: string }
        Returns: {
          code: string
          expires_at: string
          group_description: string
          group_id: string
          group_name: string
        }[]
      }
      health_check: { Args: never; Returns: boolean }
      is_group_member: {
        Args: { target_group: string; target_user?: string }
        Returns: boolean
      }
      list_discoverable_groups: {
        Args: never
        Returns: {
          description: string
          id: string
          member_count: number
          name: string
        }[]
      }
      remove_group_member: {
        Args: { p_group_id: string; p_user_id: string }
        Returns: undefined
      }
      request_to_join_group: {
        Args: { p_group_id: string }
        Returns: {
          created_at: string
          group_id: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "group_join_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      review_group_join_request: {
        Args: { p_approve: boolean; p_request_id: string }
        Returns: {
          created_at: string
          group_id: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "group_join_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_group_member_role: {
        Args: { p_group_id: string; p_role: string; p_user_id: string }
        Returns: {
          group_id: string
          joined_at: string
          role: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "group_members"
          isOneToOne: true
          isSetofReturn: false
        }
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
