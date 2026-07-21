import type { Database as GeneratedDatabase } from './database.generated'

export type ApiDatabase = Pick<GeneratedDatabase, 'api'>
export type CurrentNoticeRecord =
  GeneratedDatabase['api']['Functions']['get_current_notice_v1']['Returns'][number]
export type ConsentReceiptRecord =
  GeneratedDatabase['api']['Functions']['record_authenticated_consent_v1']['Returns'][number]
export type AccountContextRecord =
  GeneratedDatabase['api']['Functions']['get_my_account_v1']['Returns'][number]
export type AuthenticatedSubjectRecord =
  GeneratedDatabase['api']['Functions']['resolve_authenticated_subject_v1']['Returns'][number]

export type ActiveSectorRecord =
  GeneratedDatabase['api']['Functions']['list_active_sectors_v1']['Returns'][number]
export type ActiveRoleFamilyRecord =
  GeneratedDatabase['api']['Functions']['list_active_role_families_v1']['Returns'][number]
export type ActiveRoleRecord =
  GeneratedDatabase['api']['Functions']['list_active_roles_v1']['Returns'][number]
type GeneratedPublishedCompanyRecord =
  GeneratedDatabase['api']['Functions']['list_published_companies_v1']['Returns'][number]
export type PublishedCompanyRecord = Omit<
  GeneratedPublishedCompanyRecord,
  'country_code' | 'sector_id'
> & {
  country_code: string | null
  sector_id: number | null
}
type GeneratedActiveCompensationBandRecord =
  GeneratedDatabase['api']['Functions']['list_active_compensation_bands_v1']['Returns'][number]
export type ActiveCompensationBandRecord = Omit<
  GeneratedActiveCompensationBandRecord,
  'valid_to'
> & {
  valid_to: string | null
}
export type CompanyAliasResolutionRecord =
  GeneratedDatabase['api']['Functions']['resolve_company_alias_v1']['Returns'][number]

export type SectorRow =
  GeneratedDatabase['catalog']['Tables']['sectors']['Row']
export type RoleFamilyRow =
  GeneratedDatabase['catalog']['Tables']['role_families']['Row']
export type RoleRow =
  GeneratedDatabase['catalog']['Tables']['roles']['Row']
export type CompanyRow =
  GeneratedDatabase['catalog']['Tables']['companies']['Row']
export type CompanyAliasRow =
  GeneratedDatabase['catalog']['Tables']['company_aliases']['Row']
export type CompensationBandRow =
  GeneratedDatabase['catalog']['Tables']['compensation_bands']['Row']

// Catalog writes remain migration/moderation owned in B05. No generic
// Insert/Update aliases are exported from the application type surface.

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
