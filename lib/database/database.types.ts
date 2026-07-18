import type { Database as GeneratedDatabase } from './database.generated'

export type ApiDatabase = Pick<GeneratedDatabase, 'api'>
export type CurrentNoticeRecord =
  GeneratedDatabase['api']['Functions']['get_current_notice_v1']['Returns'][number]
export type ConsentReceiptRecord =
  GeneratedDatabase['api']['Functions']['record_authenticated_consent_v1']['Returns'][number]

export type UserProfileRow =
  GeneratedDatabase['core']['Tables']['user_profiles']['Row']
export type UserProfileInsert =
  GeneratedDatabase['core']['Tables']['user_profiles']['Insert']
export type UserProfileUpdate =
  GeneratedDatabase['core']['Tables']['user_profiles']['Update']

export type DataSubjectRow =
  GeneratedDatabase['core']['Tables']['data_subjects']['Row']
export type DataSubjectInsert =
  GeneratedDatabase['core']['Tables']['data_subjects']['Insert']
export type DataSubjectUpdate =
  GeneratedDatabase['core']['Tables']['data_subjects']['Update']

export type UserRoleAssignmentRow =
  GeneratedDatabase['authorization']['Tables']['user_role_assignments']['Row']
export type UserRoleAssignmentInsert =
  GeneratedDatabase['authorization']['Tables']['user_role_assignments']['Insert']
export type UserRoleAssignmentUpdate =
  GeneratedDatabase['authorization']['Tables']['user_role_assignments']['Update']

export type NoticeVersionRow =
  GeneratedDatabase['privacy']['Tables']['notice_versions']['Row']
export type NoticeVersionInsert =
  GeneratedDatabase['privacy']['Tables']['notice_versions']['Insert']

export type ConsentEventRow =
  GeneratedDatabase['privacy']['Tables']['consent_events']['Row']
export type ConsentEventInsert =
  GeneratedDatabase['privacy']['Tables']['consent_events']['Insert']

// Consent events are append-only. Intentionally no ConsentEventUpdate alias is
// exported from the application-owned type surface.
