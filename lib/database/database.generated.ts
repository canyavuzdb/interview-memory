export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  api: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_notice_v1: {
        Args: { p_document_type: string; p_locale: string }
        Returns: {
          content_sha256: string
          content_uri: string
          document_type: string
          effective_from: string
          id: string
          locale: string
          version: string
        }[]
      }
      record_authenticated_consent_v1: {
        Args: {
          p_auth_user_id: string
          p_decision: string
          p_event_source: string
          p_idempotency_key: string
          p_notice_version_id: string
          p_purpose_code: string
          p_subject_proof_hmac: string
          p_subject_proof_key_version: number
        }
        Returns: {
          event_created_at: string
          event_id: string
          replayed: boolean
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  authorization: {
    Tables: {
      user_role_assignments: {
        Row: {
          granted_at: string
          granted_by_user_id: string | null
          grantor_role_snapshot: string | null
          id: string
          reason_code: string
          revoked_at: string | null
          role_code: string
          subject_audit_principal: string
          user_id: string | null
        }
        Insert: {
          granted_at?: string
          granted_by_user_id?: string | null
          grantor_role_snapshot?: string | null
          id?: string
          reason_code: string
          revoked_at?: string | null
          role_code: string
          subject_audit_principal: string
          user_id?: string | null
        }
        Update: {
          granted_at?: string
          granted_by_user_id?: string | null
          grantor_role_snapshot?: string | null
          id?: string
          reason_code?: string
          revoked_at?: string | null
          role_code?: string
          subject_audit_principal?: string
          user_id?: string | null
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
  core: {
    Tables: {
      data_subjects: {
        Row: {
          anonymous_key_hmac: string | null
          anonymous_key_version: number | null
          auth_user_id: string | null
          created_at: string
          deleted_at: string | null
          id: string
          merged_into_id: string | null
          status: string
        }
        Insert: {
          anonymous_key_hmac?: string | null
          anonymous_key_version?: number | null
          auth_user_id?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          merged_into_id?: string | null
          status?: string
        }
        Update: {
          anonymous_key_hmac?: string | null
          anonymous_key_version?: number | null
          auth_user_id?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          merged_into_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_subjects_merged_into_id_fkey"
            columns: ["merged_into_id"]
            isOneToOne: false
            referencedRelation: "data_subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          account_status: string
          avatar_url: string | null
          created_at: string
          display_name: string | null
          locale: string
          onboarding_status: string
          timezone: string
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          account_status?: string
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          locale?: string
          onboarding_status?: string
          timezone?: string
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          account_status?: string
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          locale?: string
          onboarding_status?: string
          timezone?: string
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
  privacy: {
    Tables: {
      consent_events: {
        Row: {
          created_at: string
          data_subject_id: string | null
          decision: string
          event_source: string
          id: string
          idempotency_key: string
          notice_version_id: string
          occurred_at: string
          purpose_code: string
          subject_proof_hmac: string
          subject_proof_key_version: number
          submission_id: string | null
        }
        Insert: {
          created_at?: string
          data_subject_id?: string | null
          decision: string
          event_source: string
          id?: string
          idempotency_key: string
          notice_version_id: string
          occurred_at: string
          purpose_code: string
          subject_proof_hmac: string
          subject_proof_key_version: number
          submission_id?: string | null
        }
        Update: {
          created_at?: string
          data_subject_id?: string | null
          decision?: string
          event_source?: string
          id?: string
          idempotency_key?: string
          notice_version_id?: string
          occurred_at?: string
          purpose_code?: string
          subject_proof_hmac?: string
          subject_proof_key_version?: number
          submission_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consent_events_notice_version_id_fkey"
            columns: ["notice_version_id"]
            isOneToOne: false
            referencedRelation: "notice_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      notice_versions: {
        Row: {
          content_sha256: string
          content_uri: string
          created_at: string
          document_type: string
          effective_from: string
          id: string
          locale: string
          retired_at: string | null
          version: string
        }
        Insert: {
          content_sha256: string
          content_uri: string
          created_at?: string
          document_type: string
          effective_from: string
          id?: string
          locale: string
          retired_at?: string | null
          version: string
        }
        Update: {
          content_sha256?: string
          content_uri?: string
          created_at?: string
          document_type?: string
          effective_from?: string
          id?: string
          locale?: string
          retired_at?: string | null
          version?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_notice_purpose_compatible: {
        Args: { p_document_type: string; p_purpose_code: string }
        Returns: boolean
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
  api: {
    Enums: {},
  },
  authorization: {
    Enums: {},
  },
  core: {
    Enums: {},
  },
  privacy: {
    Enums: {},
  },
} as const
