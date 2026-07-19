import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CatalogPersistenceError } from '@/lib/catalog/errors'
import { createSupabaseCatalogRepository } from '@/lib/server/catalog/repository'
import type { CatalogRepository } from '@/lib/server/catalog/service'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabaseClient: vi.fn(),
}))

const id = '11111111-1111-4111-8111-111111111111'
const familyId = '22222222-2222-4222-8222-222222222222'
const rpc = vi.fn()

const sector = {
  id: 1,
  slug: 'software',
  display_name: 'Software',
  sort_order: 10,
}
const family = {
  id: familyId,
  slug: 'engineering',
  display_name: 'Engineering',
  taxonomy_version: 'v1',
  sort_order: 10,
}
const role = {
  id,
  role_family_id: familyId,
  slug: 'backend-engineer',
  display_name: 'Backend Engineer',
  taxonomy_version: 'v1',
  sort_order: 20,
}
const company = {
  id,
  slug: 'example',
  display_name: 'Example',
  sector_id: 1,
  country_code: 'TR',
}
const compensation = {
  id,
  currency_code: 'TRY',
  pay_period: 'monthly',
  gross_net: 'gross',
  region_code: 'tr',
  lower_bound: '10000',
  upper_bound: '20000',
  definition_version: 'v1',
  valid_from: '2026-01-01',
  valid_to: null,
}

beforeEach(() => {
  rpc.mockReset()
  vi.mocked(createAdminSupabaseClient).mockReturnValue({ rpc } as never)
})

describe('Supabase catalog repository', () => {
  it('uses the narrow RPC contracts and validates their responses', async () => {
    rpc
      .mockResolvedValueOnce({ data: [sector], error: null })
      .mockResolvedValueOnce({ data: [family], error: null })
      .mockResolvedValueOnce({ data: [role], error: null })
      .mockResolvedValueOnce({ data: [company], error: null })
      .mockResolvedValueOnce({ data: [compensation], error: null })
      .mockResolvedValueOnce({
        data: [{ company_id: id }],
        error: null,
      })
    const repository = createSupabaseCatalogRepository()

    await expect(repository.listActiveSectors()).resolves.toEqual([sector])
    await expect(
      repository.listActiveRoleFamilies({
        taxonomyVersion: 'v1',
        afterSortOrder: 10,
        afterId: familyId,
        limit: 51,
      }),
    ).resolves.toEqual([family])
    await expect(
      repository.listActiveRoles({
        roleFamilyId: familyId,
        taxonomyVersion: 'v1',
        afterSortOrder: 20,
        afterId: id,
        limit: 51,
      }),
    ).resolves.toEqual([role])
    await expect(
      repository.listPublishedCompanies({
        sectorId: 1,
        countryCode: 'TR',
        afterDisplayName: 'Example',
        afterId: id,
        limit: 26,
      }),
    ).resolves.toEqual([company])
    await expect(
      repository.listActiveCompensationBands({
        currencyCode: 'TRY',
        payPeriod: 'monthly',
        grossNet: 'gross',
        regionCode: 'tr',
        definitionVersion: 'v1',
        afterLowerBound: '10000',
        afterId: id,
        limit: 51,
      }),
    ).resolves.toEqual([compensation])
    await expect(
      repository.resolveCompanyAlias({
        alias: 'Example',
        countryCode: 'TR',
        locale: 'tr',
      }),
    ).resolves.toEqual({ company_id: id })

    expect(rpc).toHaveBeenNthCalledWith(1, 'list_active_sectors_v1')
    expect(rpc).toHaveBeenNthCalledWith(
      2,
      'list_active_role_families_v1',
      {
        p_taxonomy_version: 'v1',
        p_after_sort_order: 10,
        p_after_id: familyId,
        p_limit: 51,
      },
    )
    expect(rpc).toHaveBeenNthCalledWith(3, 'list_active_roles_v1', {
      p_role_family_id: familyId,
      p_taxonomy_version: 'v1',
      p_after_sort_order: 20,
      p_after_id: id,
      p_limit: 51,
    })
    expect(rpc).toHaveBeenNthCalledWith(
      4,
      'list_published_companies_v1',
      {
        p_sector_id: 1,
        p_country_code: 'TR',
        p_after_display_name: 'Example',
        p_after_id: id,
        p_limit: 26,
      },
    )
    expect(rpc).toHaveBeenNthCalledWith(
      5,
      'list_active_compensation_bands_v1',
      {
        p_currency_code: 'TRY',
        p_pay_period: 'monthly',
        p_gross_net: 'gross',
        p_region_code: 'tr',
        p_definition_version: 'v1',
        p_after_lower_bound: '10000',
        p_after_id: id,
        p_limit: 51,
      },
    )
    expect(rpc).toHaveBeenNthCalledWith(6, 'resolve_company_alias_v1', {
      p_alias: 'Example',
      p_country_code: 'TR',
      p_locale: 'tr',
    })
  })

  it('returns null when an alias does not resolve', async () => {
    rpc.mockResolvedValue({ data: [], error: null })

    await expect(
      createSupabaseCatalogRepository().resolveCompanyAlias({
        alias: 'Unknown',
        countryCode: null,
        locale: null,
      }),
    ).resolves.toBeNull()
  })

  const calls: Array<{
    name: string
    invoke: (repository: CatalogRepository) => Promise<unknown>
    failedCode: ConstructorParameters<typeof CatalogPersistenceError>[0]
    invalidCode: ConstructorParameters<typeof CatalogPersistenceError>[0]
  }> = [
    {
      name: 'sector',
      invoke: (repository) => repository.listActiveSectors(),
      failedCode: 'SECTOR_LIST_FAILED',
      invalidCode: 'SECTOR_RESPONSE_INVALID',
    },
    {
      name: 'role family',
      invoke: (repository) =>
        repository.listActiveRoleFamilies({
          taxonomyVersion: 'v1',
          afterSortOrder: null,
          afterId: null,
          limit: 51,
        }),
      failedCode: 'ROLE_FAMILY_LIST_FAILED',
      invalidCode: 'ROLE_FAMILY_RESPONSE_INVALID',
    },
    {
      name: 'role',
      invoke: (repository) =>
        repository.listActiveRoles({
          roleFamilyId: familyId,
          taxonomyVersion: 'v1',
          afterSortOrder: null,
          afterId: null,
          limit: 51,
        }),
      failedCode: 'ROLE_LIST_FAILED',
      invalidCode: 'ROLE_RESPONSE_INVALID',
    },
    {
      name: 'company',
      invoke: (repository) =>
        repository.listPublishedCompanies({
          sectorId: null,
          countryCode: null,
          afterDisplayName: null,
          afterId: null,
          limit: 26,
        }),
      failedCode: 'COMPANY_LIST_FAILED',
      invalidCode: 'COMPANY_RESPONSE_INVALID',
    },
    {
      name: 'compensation band',
      invoke: (repository) =>
        repository.listActiveCompensationBands({
          currencyCode: 'TRY',
          payPeriod: 'monthly',
          grossNet: 'gross',
          regionCode: 'tr',
          definitionVersion: 'v1',
          afterLowerBound: null,
          afterId: null,
          limit: 51,
        }),
      failedCode: 'COMPENSATION_BAND_LIST_FAILED',
      invalidCode: 'COMPENSATION_BAND_RESPONSE_INVALID',
    },
    {
      name: 'company alias',
      invoke: (repository) =>
        repository.resolveCompanyAlias({
          alias: 'Example',
          countryCode: null,
          locale: null,
        }),
      failedCode: 'COMPANY_ALIAS_RESOLUTION_FAILED',
      invalidCode: 'COMPANY_ALIAS_RESPONSE_INVALID',
    },
  ]

  it.each(calls)(
    'maps $name database failures to a stable code',
    async ({ invoke, failedCode }) => {
      rpc.mockResolvedValue({
        data: null,
        error: { message: 'private database detail' },
      })

      await expect(
        invoke(createSupabaseCatalogRepository()),
      ).rejects.toEqual(new CatalogPersistenceError(failedCode))
    },
  )

  it.each(calls)(
    'rejects malformed $name responses',
    async ({ invoke, invalidCode }) => {
      rpc.mockResolvedValue({ data: [{ unexpected: true }], error: null })

      await expect(
        invoke(createSupabaseCatalogRepository()),
      ).rejects.toEqual(new CatalogPersistenceError(invalidCode))
    },
  )

  it('rejects an ambiguous alias result', async () => {
    rpc.mockResolvedValue({
      data: [{ company_id: id }, { company_id: familyId }],
      error: null,
    })

    await expect(
      createSupabaseCatalogRepository().resolveCompanyAlias({
        alias: 'Example',
        countryCode: null,
        locale: null,
      }),
    ).rejects.toEqual(
      new CatalogPersistenceError('COMPANY_ALIAS_RESPONSE_INVALID'),
    )
  })
})
