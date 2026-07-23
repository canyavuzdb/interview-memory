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
      append_application_outcome_v1: {
        Args: {
          p_active_capability_hmac: string
          p_active_capability_key_version: number
          p_application_id: string
          p_idempotency_key_hmac: string
          p_idempotency_request_fingerprint: string
          p_idempotency_subject_hmac: string
          p_idempotency_subject_type: string
          p_occurred_month: string
          p_outcome_code: string
          p_planned_start_month: string
          p_previous_capability_hmac: string
          p_previous_capability_key_version: number
          p_requester_data_subject_id: string
        }
        Returns: {
          application_id: string
          outcome_code: string
          outcome_event_id: string
        }[]
      }
      claim_idempotency_v1: {
        Args: {
          p_expires_at: string
          p_idempotency_key_hmac: string
          p_operation_code: string
          p_request_fingerprint: string
          p_subject_hmac: string
          p_subject_type: string
        }
        Returns: {
          outcome: string
          record_status: string
          resource_id: string
          resource_type: string
          response_code: number
        }[]
      }
      cleanup_security_ephemera_v1: {
        Args: { p_batch_size?: number }
        Returns: {
          idempotency_rows_deleted: number
          quota_rows_deleted: number
        }[]
      }
      complete_idempotency_v1: {
        Args: {
          p_idempotency_key_hmac: string
          p_operation_code: string
          p_request_fingerprint: string
          p_resource_id: string
          p_resource_type: string
          p_response_code: number
          p_subject_hmac: string
          p_subject_type: string
        }
        Returns: boolean
      }
      consume_submission_quota_v1: {
        Args: {
          p_counter_kind: string
          p_expires_at: string
          p_limit: number
          p_policy_hash: string
          p_policy_version: string
          p_scope: string
          p_subject_hmac: string
          p_subject_type: string
          p_window_kind: string
          p_window_start: string
        }
        Returns: {
          allowed: boolean
          current_count: number
          remaining: number
        }[]
      }
      create_company_experience_v1: {
        Args: {
          p_actual_days: number
          p_applied_role: string
          p_capability_expires_at: string
          p_capability_hmac: string
          p_capability_key_version: number
          p_command_fingerprint: string
          p_company_name: string
          p_consent_idempotency_key: string
          p_consent_subject_proof_hmac: string
          p_consent_subject_proof_key_version: number
          p_data_subject_id: string
          p_feedback_useful: number
          p_free_note: string
          p_ghosted_after_stage: string
          p_hr_professionalism: number
          p_idempotency_key_hmac: string
          p_idempotency_request_fingerprint: string
          p_idempotency_subject_hmac: string
          p_interviewer_prepared: number
          p_irrelevant_types: string[]
          p_locale: string
          p_notice_version_id: string
          p_payload_hash: string
          p_process_transparency: number
          p_process_year: number
          p_promised_days: number
          p_promised_timeline: string
          p_quota_24h_expires_at: string
          p_quota_24h_limit: number
          p_quota_24h_window_start: string
          p_quota_30d_expires_at: string
          p_quota_30d_limit: number
          p_quota_30d_window_start: string
          p_quota_policy_hash: string
          p_quota_policy_version: string
          p_quota_subject_hmac: string
          p_rejection_shared: string
          p_schema_version: number
          p_supersedes_submission_id: string
          p_was_asked_irrelevant: boolean
          p_was_ghosted: boolean
          p_would_recommend_process: string
        }
        Returns: {
          company_experience_id: string
          receipt_id: string
          submission_id: string
        }[]
      }
      create_company_experience_with_application_v1: {
        Args: {
          p_actual_days: number
          p_application_channel: string
          p_application_month: string
          p_applied_role: string
          p_capability_expires_at: string
          p_capability_hmac: string
          p_capability_key_version: number
          p_command_fingerprint: string
          p_company_name: string
          p_consent_idempotency_key: string
          p_consent_subject_proof_hmac: string
          p_consent_subject_proof_key_version: number
          p_current_outcome: string
          p_data_subject_id: string
          p_feedback_useful: number
          p_free_note: string
          p_ghosted_after_stage: string
          p_had_referral: boolean
          p_hr_professionalism: number
          p_idempotency_key_hmac: string
          p_idempotency_request_fingerprint: string
          p_idempotency_subject_hmac: string
          p_interviewer_prepared: number
          p_irrelevant_types: string[]
          p_last_stage: string
          p_locale: string
          p_notice_version_id: string
          p_outcome_month: string
          p_payload_hash: string
          p_planned_start_month: string
          p_process_transparency: number
          p_process_year: number
          p_promised_days: number
          p_promised_timeline: string
          p_quota_24h_expires_at: string
          p_quota_24h_limit: number
          p_quota_24h_window_start: string
          p_quota_30d_expires_at: string
          p_quota_30d_limit: number
          p_quota_30d_window_start: string
          p_quota_policy_hash: string
          p_quota_policy_version: string
          p_quota_subject_hmac: string
          p_rejection_shared: string
          p_schema_version: number
          p_supersedes_submission_id: string
          p_was_asked_irrelevant: boolean
          p_was_ghosted: boolean
          p_would_recommend_process: string
        }
        Returns: {
          company_experience_id: string
          job_application_id: string
          receipt_id: string
          submission_id: string
        }[]
      }
      create_moderation_company_v1: {
        Args: {
          p_company_id: string
          p_country_code: string
          p_display_name: string
          p_reviewer_user_id: string
          p_slug: string
        }
        Returns: {
          company_id: string
          country_code: string
          display_name: string
          publication_status: string
          slug: string
          verification_status: string
        }[]
      }
      create_search_episode_v1: {
        Args: {
          p_accepted_offers_count: number
          p_any_interviews_count: number
          p_applications_count: number
          p_capability_expires_at: string
          p_capability_hmac: string
          p_capability_key_version: number
          p_command_fingerprint: string
          p_consent_idempotency_key: string
          p_consent_subject_proof_hmac: string
          p_consent_subject_proof_key_version: number
          p_counts_are_estimated: boolean
          p_currently_employed: boolean
          p_data_subject_id: string
          p_employment_started_count: number
          p_employment_type: string
          p_ended_month: string
          p_experience_band: string
          p_hr_interviews_count: number
          p_human_responses_count: number
          p_idempotency_key_hmac: string
          p_idempotency_request_fingerprint: string
          p_idempotency_subject_hmac: string
          p_locale: string
          p_notice_version_id: string
          p_observed_through: string
          p_offers_count: number
          p_payload_hash: string
          p_quota_expires_at: string
          p_quota_limit: number
          p_quota_policy_hash: string
          p_quota_policy_version: string
          p_quota_subject_hmac: string
          p_quota_window_start: string
          p_role_level: string
          p_role_slug: string
          p_schema_version: number
          p_sector_slug: string
          p_started_month: string
          p_status: string
          p_supersedes_submission_id: string
          p_target_region: string
          p_technical_interviews_count: number
          p_work_mode: string
        }
        Returns: {
          receipt_id: string
          search_episode_id: string
          submission_id: string
        }[]
      }
      decide_submission_quality_v1: {
        Args: {
          p_company_id: string
          p_decision: string
          p_decision_id: string
          p_reason_code: string
          p_reviewer_note: string
          p_reviewer_user_id: string
          p_submission_id: string
        }
        Returns: {
          decided_at: string
          decision_id: string
          quality_status: string
          submission_id: string
        }[]
      }
      fail_idempotency_v1: {
        Args: {
          p_idempotency_key_hmac: string
          p_operation_code: string
          p_request_fingerprint: string
          p_response_code: number
          p_subject_hmac: string
          p_subject_type: string
        }
        Returns: boolean
      }
      get_application_outcome_result_v1: {
        Args: {
          p_active_capability_hmac: string
          p_active_capability_key_version: number
          p_outcome_event_id: string
          p_previous_capability_hmac: string
          p_previous_capability_key_version: number
          p_requester_data_subject_id: string
        }
        Returns: {
          application_id: string
          outcome_code: string
          outcome_event_id: string
        }[]
      }
      get_company_application_create_result_v1: {
        Args: { p_data_subject_id: string; p_submission_id: string }
        Returns: {
          capability_key_version: number
          company_experience_id: string
          job_application_id: string
          receipt_id: string
          submission_id: string
        }[]
      }
      get_company_experience_create_result_v1: {
        Args: { p_data_subject_id: string; p_submission_id: string }
        Returns: {
          capability_key_version: number
          company_experience_id: string
          receipt_id: string
          submission_id: string
        }[]
      }
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
      get_my_account_v1: {
        Args: never
        Returns: {
          account_status: string
          locale: string
          onboarding_status: string
          timezone: string
          user_id: string
          version: number
        }[]
      }
      get_search_episode_create_result_v1: {
        Args: { p_data_subject_id: string; p_submission_id: string }
        Returns: {
          capability_key_version: number
          receipt_id: string
          search_episode_id: string
          submission_id: string
        }[]
      }
      get_submission_receipt_v1: {
        Args: {
          p_active_capability_hmac?: string
          p_active_capability_key_version?: number
          p_previous_capability_hmac?: string
          p_previous_capability_key_version?: number
          p_receipt_id: string
          p_requester_data_subject_id?: string
        }
        Returns: {
          capability_rotated: boolean
          lifecycle_status: string
          quality_status: string
          receipt_id: string
          submitted_at: string
          survey_type: string
          withdrawn_at: string
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
      list_moderation_companies_v1: {
        Args: { p_limit: number; p_query: string; p_reviewer_user_id: string }
        Returns: {
          company_id: string
          country_code: string
          display_name: string
          publication_status: string
          slug: string
          verification_status: string
        }[]
      }
      list_moderation_queue_v1: {
        Args: {
          p_before_submission_id: string
          p_before_submitted_at: string
          p_limit: number
          p_quality_status: string
          p_reviewer_user_id: string
          p_survey_type: string
        }
        Returns: {
          any_interviews_count: number
          applications_count: number
          applied_role: string
          canonical_company_id: string
          company_name: string
          ended_month: string
          free_note: string
          human_responses_count: number
          last_reason_code: string
          locale: string
          offers_count: number
          quality_signals: string[]
          quality_status: string
          receipt_id: string
          role_id: string
          role_level: string
          schema_version: number
          started_month: string
          submission_id: string
          submitted_at: string
          survey_type: string
          target_region: string
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
      merge_anonymous_subject_v1: {
        Args: {
          p_active_anonymous_hmac: string
          p_anonymous_quota_subject_hmac: string
          p_auth_user_id: string
          p_authenticated_quota_subject_hmac: string
          p_previous_anonymous_hmac: string
        }
        Returns: {
          data_subject_id: string
          merged: boolean
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
      resolve_anonymous_subject_v1: {
        Args: {
          p_active_hmac: string
          p_active_key_version: number
          p_previous_hmac?: string
          p_previous_key_version?: number
        }
        Returns: {
          created: boolean
          data_subject_id: string
          key_rotated: boolean
        }[]
      }
      resolve_authenticated_subject_v1: {
        Args: { p_auth_user_id: string }
        Returns: {
          data_subject_id: string
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
      is_active_moderator_v1: { Args: { p_user_id: string }; Returns: boolean }
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
  moderation: {
    Tables: {
      submission_company_resolutions: {
        Row: {
          company_id: string
          resolved_at: string
          resolved_by_user_id: string | null
          resolver_audit_principal: string
          submission_id: string
        }
        Insert: {
          company_id: string
          resolved_at?: string
          resolved_by_user_id?: string | null
          resolver_audit_principal: string
          submission_id: string
        }
        Update: {
          company_id?: string
          resolved_at?: string
          resolved_by_user_id?: string | null
          resolver_audit_principal?: string
          submission_id?: string
        }
        Relationships: []
      }
      submission_quality_signals: {
        Row: {
          detected_at: string
          id: string
          severity: string
          signal_code: string
          source_field: string
          submission_id: string
        }
        Insert: {
          detected_at?: string
          id?: string
          severity: string
          signal_code: string
          source_field: string
          submission_id: string
        }
        Update: {
          detected_at?: string
          id?: string
          severity?: string
          signal_code?: string
          source_field?: string
          submission_id?: string
        }
        Relationships: []
      }
      submission_review_decisions: {
        Row: {
          company_id: string | null
          decided_at: string
          decision: string
          id: string
          previous_quality_status: string
          reason_code: string
          reviewer_audit_principal: string
          reviewer_note: string | null
          reviewer_user_id: string | null
          submission_id: string
        }
        Insert: {
          company_id?: string | null
          decided_at?: string
          decision: string
          id: string
          previous_quality_status: string
          reason_code: string
          reviewer_audit_principal: string
          reviewer_note?: string | null
          reviewer_user_id?: string | null
          submission_id: string
        }
        Update: {
          company_id?: string | null
          decided_at?: string
          decision?: string
          id?: string
          previous_quality_status?: string
          reason_code?: string
          reviewer_audit_principal?: string
          reviewer_note?: string | null
          reviewer_user_id?: string | null
          submission_id?: string
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
  moderation: {
    Enums: {},
  },
  privacy: {
    Enums: {},
  },
} as const
