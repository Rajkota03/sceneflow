export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      beat_generations: {
        Row: {
          created_at: string
          custom_prompt: string | null
          generated_beats: Json
          genre: string
          id: string
          structure_type: string
          theme: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_prompt?: string | null
          generated_beats: Json
          genre: string
          id?: string
          structure_type: string
          theme: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_prompt?: string | null
          generated_beats?: Json
          genre?: string
          id?: string
          structure_type?: string
          theme?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      beat_templates: {
        Row: {
          created_at: string
          custom_prompt: string | null
          description: string | null
          genre: string
          id: string
          is_public: boolean
          name: string
          structure_type: string
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_prompt?: string | null
          description?: string | null
          genre: string
          id?: string
          is_public?: boolean
          name: string
          structure_type: string
          theme: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_prompt?: string | null
          description?: string | null
          genre?: string
          id?: string
          is_public?: boolean
          name?: string
          structure_type?: string
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      conflict_situations: {
        Row: {
          created_at: string
          description: string | null
          id: number
          lead_ins: string | null
          lead_outs: string | null
          story_type: string | null
          sub_type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id: number
          lead_ins?: string | null
          lead_outs?: string | null
          story_type?: string | null
          sub_type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          lead_ins?: string | null
          lead_outs?: string | null
          story_type?: string | null
          sub_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      masterplots: {
        Row: {
          a_clause_label: string | null
          a_clause_text: string | null
          b_clause_label: string | null
          b_clause_text: string | null
          c_clause_label: string | null
          c_clause_text: string | null
          conflict_start_id: number | null
          created_at: string
          masterplot_id: string
          updated_at: string
        }
        Insert: {
          a_clause_label?: string | null
          a_clause_text?: string | null
          b_clause_label?: string | null
          b_clause_text?: string | null
          c_clause_label?: string | null
          c_clause_text?: string | null
          conflict_start_id?: number | null
          created_at?: string
          masterplot_id: string
          updated_at?: string
        }
        Update: {
          a_clause_label?: string | null
          a_clause_text?: string | null
          b_clause_label?: string | null
          b_clause_text?: string | null
          c_clause_label?: string | null
          c_clause_text?: string | null
          conflict_start_id?: number | null
          created_at?: string
          masterplot_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_structures: {
        Row: {
          created_at: string
          project_id: string
          structure_id: string
        }
        Insert: {
          created_at?: string
          project_id: string
          structure_id: string
        }
        Update: {
          created_at?: string
          project_id?: string
          structure_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_structures_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_structures_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "structures"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          author_id: string
          content: Json
          created_at: string
          id: string
          notes: Json | null
          title: string
          title_page: Json | null
          updated_at: string
        }
        Insert: {
          author_id: string
          content?: Json
          created_at?: string
          id: string
          notes?: Json | null
          title: string
          title_page?: Json | null
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: Json
          created_at?: string
          id?: string
          notes?: Json | null
          title?: string
          title_page?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      scenes: {
        Row: {
          author_id: string
          content_fountain: string | null
          content_richtext: Json
          created_at: string
          id: string
          project_id: string
          scene_number: number | null
          title: string | null
          updated_at: string
        }
        Insert: {
          author_id: string
          content_fountain?: string | null
          content_richtext?: Json
          created_at?: string
          id: string
          project_id: string
          scene_number?: number | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string
          content_fountain?: string | null
          content_richtext?: Json
          created_at?: string
          id?: string
          project_id?: string
          scene_number?: number | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      standalone_notes: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      structures: {
        Row: {
          beats: Json
          created_at: string
          description: string | null
          id: string
          name: string
          structure_type: string
          updated_at: string
        }
        Insert: {
          beats?: Json
          created_at?: string
          description?: string | null
          id: string
          name: string
          structure_type?: string
          updated_at?: string
        }
        Update: {
          beats?: Json
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          structure_type?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      masterplot_conflict_view: {
        Row: {
          a_clause_label: string | null
          a_clause_text: string | null
          b_clause_label: string | null
          b_clause_text: string | null
          c_clause_label: string | null
          c_clause_text: string | null
          conflict_description: string | null
          conflict_start_id: number | null
          lead_ins: string | null
          lead_outs: string | null
          masterplot_id: string | null
          story_type: string | null
          sub_type: string | null
        }
        Relationships: []
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
