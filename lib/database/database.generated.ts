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
      list_active_compensation_bands_v1: {
        Args: {
          p_after_id?: string
          p_after_lower_bound?: string
          p_currency_code: string
          p_definition_version: string
          p_gross_net: string
          p_limit?: number
          p_pay_period: string
          p_region_code: string
        }
        Returns: {
          currency_code: string
          definition_version: string
          gross_net: string
          id: string
          lower_bound: string
          pay_period: string
          region_code: string
          upper_bound: string
          valid_from: string
          valid_to: string
        }[]
      }
      list_active_role_families_v1: {
        Args: {
          p_after_id?: string
          p_after_sort_order?: number
          p_limit?: number
          p_taxonomy_version: string
        }
        Returns: {
          display_name: string
          id: string
          slug: string
          sort_order: number
          taxonomy_version: string
        }[]
      }
      list_active_roles_v1: {
        Args: {
          p_after_id?: string
          p_after_sort_order?: number
          p_limit?: number
          p_role_family_id: string
          p_taxonomy_version: string
        }
        Returns: {
          display_name: string
          id: string
          role_family_id: string
          slug: string
          sort_order: number
          taxonomy_version: string
        }[]
      }
      list_active_sectors_v1: {
        Args: never
        Returns: {
          display_name: string
          id: number
          slug: string
          sort_order: number
        }[]
      }
      list_published_companies_v1: {
        Args: {
          p_after_display_name?: string
          p_after_id?: string
          p_country_code?: string
          p_limit?: number
          p_sector_id?: number
        }
        Returns: {
          country_code: string
          display_name: string
          id: string
          sector_id: number
          slug: string
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
      resolve_company_alias_v1: {
        Args: { p_alias: string; p_country_code?: string; p_locale?: string }
        Returns: {
          company_id: string
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
  catalog: {
    Tables: {
      companies: {
        Row: {
          country_code: string | null
          created_at: string
          display_name: string
          external_case_ref: string | null
          external_case_status: string | null
          external_case_synced_at: string | null
          id: string
          legal_name: string | null
          normalized_domain: string | null
          publication_status: string
          sector_id: number | null
          slug: string
          updated_at: string
          verification_status: string
          version: number
        }
        Insert: {
          country_code?: string | null
          created_at?: string
          display_name: string
          external_case_ref?: string | null
          external_case_status?: string | null
          external_case_synced_at?: string | null
          id?: string
          legal_name?: string | null
          normalized_domain?: string | null
          publication_status?: string
          sector_id?: number | null
          slug: string
          updated_at?: string
          verification_status?: string
          version?: number
        }
        Update: {
          country_code?: string | null
          created_at?: string
          display_name?: string
          external_case_ref?: string | null
          external_case_status?: string | null
          external_case_synced_at?: string | null
          id?: string
          legal_name?: string | null
          normalized_domain?: string | null
          publication_status?: string
          sector_id?: number | null
          slug?: string
          updated_at?: string
          verification_status?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "companies_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      company_aliases: {
        Row: {
          company_id: string
          country_code: string | null
          created_at: string
          id: string
          locale: string | null
          normalized_alias: string
          review_status: string
          reviewed_at: string | null
          source_code: string
        }
        Insert: {
          company_id: string
          country_code?: string | null
          created_at?: string
          id?: string
          locale?: string | null
          normalized_alias: string
          review_status?: string
          reviewed_at?: string | null
          source_code: string
        }
        Update: {
          company_id?: string
          country_code?: string | null
          created_at?: string
          id?: string
          locale?: string | null
          normalized_alias?: string
          review_status?: string
          reviewed_at?: string | null
          source_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_aliases_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      compensation_bands: {
        Row: {
          created_at: string
          currency_code: string
          definition_version: string
          gross_net: string
          id: string
          is_active: boolean
          lower_bound: number
          pay_period: string
          region_code: string
          upper_bound: number
          valid_from: string
          valid_to: string | null
        }
        Insert: {
          created_at?: string
          currency_code: string
          definition_version: string
          gross_net: string
          id?: string
          is_active?: boolean
          lower_bound: number
          pay_period: string
          region_code: string
          upper_bound: number
          valid_from: string
          valid_to?: string | null
        }
        Update: {
          created_at?: string
          currency_code?: string
          definition_version?: string
          gross_net?: string
          id?: string
          is_active?: boolean
          lower_bound?: number
          pay_period?: string
          region_code?: string
          upper_bound?: number
          valid_from?: string
          valid_to?: string | null
        }
        Relationships: []
      }
      role_families: {
        Row: {
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          slug: string
          sort_order: number
          taxonomy_version: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          is_active?: boolean
          slug: string
          sort_order?: number
          taxonomy_version: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean
          slug?: string
          sort_order?: number
          taxonomy_version?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          role_family_id: string
          slug: string
          sort_order: number
          taxonomy_version: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          is_active?: boolean
          role_family_id: string
          slug: string
          sort_order?: number
          taxonomy_version: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean
          role_family_id?: string
          slug?: string
          sort_order?: number
          taxonomy_version?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_family_taxonomy_fkey"
            columns: ["role_family_id", "taxonomy_version"]
            isOneToOne: false
            referencedRelation: "role_families"
            referencedColumns: ["id", "taxonomy_version"]
          },
        ]
      }
      sectors: {
        Row: {
          display_name: string
          id: number
          is_active: boolean
          slug: string
          sort_order: number
        }
        Insert: {
          display_name: string
          id?: never
          is_active?: boolean
          slug: string
          sort_order?: number
        }
        Update: {
          display_name?: string
          id?: never
          is_active?: boolean
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      normalize_company_alias_v1: { Args: { p_alias: string }; Returns: string }
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
  catalog: {
    Enums: {},
  },
  core: {
    Enums: {},
  },
  privacy: {
    Enums: {},
  },
} as const
