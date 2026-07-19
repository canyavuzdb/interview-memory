import 'server-only'

import { CatalogPersistenceError } from '@/lib/catalog/errors'
import {
  companyAliasResolutionRecordListSchema,
  companyRecordListSchema,
  compensationBandRecordListSchema,
  roleFamilyRecordListSchema,
  roleRecordListSchema,
  sectorRecordListSchema,
} from '@/lib/server/catalog/persistence.schemas'
import type { CatalogRepository } from '@/lib/server/catalog/service'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export function createSupabaseCatalogRepository(): CatalogRepository {
  const client = createAdminSupabaseClient()

  return {
    async listActiveSectors() {
      const { data, error } = await client.rpc('list_active_sectors_v1')

      if (error) {
        throw new CatalogPersistenceError('SECTOR_LIST_FAILED')
      }

      const result = sectorRecordListSchema.safeParse(data)

      if (!result.success) {
        throw new CatalogPersistenceError('SECTOR_RESPONSE_INVALID')
      }

      return result.data
    },

    async listActiveRoleFamilies(query) {
      const { data, error } = await client.rpc(
        'list_active_role_families_v1',
        {
          p_taxonomy_version: query.taxonomyVersion,
          p_after_sort_order: query.afterSortOrder ?? undefined,
          p_after_id: query.afterId ?? undefined,
          p_limit: query.limit,
        },
      )

      if (error) {
        throw new CatalogPersistenceError('ROLE_FAMILY_LIST_FAILED')
      }

      const result = roleFamilyRecordListSchema.safeParse(data)

      if (!result.success) {
        throw new CatalogPersistenceError(
          'ROLE_FAMILY_RESPONSE_INVALID',
        )
      }

      return result.data
    },

    async listActiveRoles(query) {
      const { data, error } = await client.rpc('list_active_roles_v1', {
        p_role_family_id: query.roleFamilyId,
        p_taxonomy_version: query.taxonomyVersion,
        p_after_sort_order: query.afterSortOrder ?? undefined,
        p_after_id: query.afterId ?? undefined,
        p_limit: query.limit,
      })

      if (error) {
        throw new CatalogPersistenceError('ROLE_LIST_FAILED')
      }

      const result = roleRecordListSchema.safeParse(data)

      if (!result.success) {
        throw new CatalogPersistenceError('ROLE_RESPONSE_INVALID')
      }

      return result.data
    },

    async listPublishedCompanies(query) {
      const { data, error } = await client.rpc(
        'list_published_companies_v1',
        {
          p_sector_id: query.sectorId ?? undefined,
          p_country_code: query.countryCode ?? undefined,
          p_after_display_name: query.afterDisplayName ?? undefined,
          p_after_id: query.afterId ?? undefined,
          p_limit: query.limit,
        },
      )

      if (error) {
        throw new CatalogPersistenceError('COMPANY_LIST_FAILED')
      }

      const result = companyRecordListSchema.safeParse(data)

      if (!result.success) {
        throw new CatalogPersistenceError('COMPANY_RESPONSE_INVALID')
      }

      return result.data
    },

    async listActiveCompensationBands(query) {
      const { data, error } = await client.rpc(
        'list_active_compensation_bands_v1',
        {
          p_currency_code: query.currencyCode,
          p_pay_period: query.payPeriod,
          p_gross_net: query.grossNet,
          p_region_code: query.regionCode,
          p_definition_version: query.definitionVersion,
          p_after_lower_bound: query.afterLowerBound ?? undefined,
          p_after_id: query.afterId ?? undefined,
          p_limit: query.limit,
        },
      )

      if (error) {
        throw new CatalogPersistenceError(
          'COMPENSATION_BAND_LIST_FAILED',
        )
      }

      const result = compensationBandRecordListSchema.safeParse(data)

      if (!result.success) {
        throw new CatalogPersistenceError(
          'COMPENSATION_BAND_RESPONSE_INVALID',
        )
      }

      return result.data
    },

    async resolveCompanyAlias(query) {
      const { data, error } = await client.rpc(
        'resolve_company_alias_v1',
        {
          p_alias: query.alias,
          p_country_code: query.countryCode ?? undefined,
          p_locale: query.locale ?? undefined,
        },
      )

      if (error) {
        throw new CatalogPersistenceError(
          'COMPANY_ALIAS_RESOLUTION_FAILED',
        )
      }

      const result =
        companyAliasResolutionRecordListSchema.safeParse(data)

      if (!result.success) {
        throw new CatalogPersistenceError(
          'COMPANY_ALIAS_RESPONSE_INVALID',
        )
      }

      return result.data[0] ?? null
    },
  }
}
