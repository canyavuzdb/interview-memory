import { describe, expect, it, vi } from 'vitest'

import { CatalogPersistenceError } from '@/lib/catalog/errors'
import {
  CatalogServiceError,
  createCatalogService,
  type CatalogRepository,
} from '@/lib/server/catalog/service'

const id = '11111111-1111-4111-8111-111111111111'
const secondId = '22222222-2222-4222-8222-222222222222'
const familyId = '33333333-3333-4333-8333-333333333333'

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
} as const

function createRepository(
  overrides: Partial<CatalogRepository> = {},
): CatalogRepository {
  return {
    listActiveSectors: vi.fn().mockResolvedValue([sector]),
    listActiveRoleFamilies: vi.fn().mockResolvedValue([
      family,
      { ...family, id: secondId, sort_order: 20 },
    ]),
    listActiveRoles: vi.fn().mockResolvedValue([
      role,
      { ...role, id: secondId, sort_order: 30 },
    ]),
    listPublishedCompanies: vi.fn().mockResolvedValue([
      company,
      {
        ...company,
        id: secondId,
        slug: 'example-two',
        display_name: 'Example Two',
      },
    ]),
    listActiveCompensationBands: vi.fn().mockResolvedValue([
      compensation,
      {
        ...compensation,
        id: secondId,
        lower_bound: '20000',
        upper_bound: '30000',
      },
    ]),
    resolveCompanyAlias: vi.fn().mockResolvedValue({ company_id: id }),
    ...overrides,
  }
}

describe('catalog service', () => {
  it('maps sectors to the minimal public DTO', async () => {
    const repository = createRepository()

    await expect(
      createCatalogService(repository).listActiveSectors(),
    ).resolves.toEqual({
      items: [
        {
          id: 1,
          slug: 'software',
          displayName: 'Software',
          sortOrder: 10,
        },
      ],
      nextCursor: null,
    })
    expect(repository.listActiveSectors).toHaveBeenCalledWith()
  })

  it('builds a role-family keyset page and requests one extra row', async () => {
    const repository = createRepository()

    await expect(
      createCatalogService(repository).listActiveRoleFamilies({
        taxonomyVersion: 'v1',
        cursor: { sortOrder: 5, id },
        limit: 1,
      }),
    ).resolves.toEqual({
      items: [
        {
          id: familyId,
          slug: 'engineering',
          displayName: 'Engineering',
          taxonomyVersion: 'v1',
          sortOrder: 10,
        },
      ],
      nextCursor: { sortOrder: 10, id: familyId },
    })
    expect(repository.listActiveRoleFamilies).toHaveBeenCalledWith({
      taxonomyVersion: 'v1',
      afterSortOrder: 5,
      afterId: id,
      limit: 2,
    })
  })

  it('builds a role keyset page without leaking persistence names', async () => {
    const repository = createRepository()

    await expect(
      createCatalogService(repository).listActiveRoles({
        roleFamilyId: familyId,
        taxonomyVersion: 'v1',
        limit: 1,
      }),
    ).resolves.toEqual({
      items: [
        {
          id,
          roleFamilyId: familyId,
          slug: 'backend-engineer',
          displayName: 'Backend Engineer',
          taxonomyVersion: 'v1',
          sortOrder: 20,
        },
      ],
      nextCursor: { sortOrder: 20, id },
    })
    expect(repository.listActiveRoles).toHaveBeenCalledWith({
      roleFamilyId: familyId,
      taxonomyVersion: 'v1',
      afterSortOrder: null,
      afterId: null,
      limit: 2,
    })
  })

  it('normalizes company filters and creates a display-name cursor', async () => {
    const repository = createRepository()

    await expect(
      createCatalogService(repository).listPublishedCompanies({
        sectorId: 1,
        countryCode: 'tr',
        limit: 1,
      }),
    ).resolves.toEqual({
      items: [
        {
          id,
          slug: 'example',
          displayName: 'Example',
          sectorId: 1,
          countryCode: 'TR',
        },
      ],
      nextCursor: { displayName: 'Example', id },
    })
    expect(repository.listPublishedCompanies).toHaveBeenCalledWith({
      sectorId: 1,
      countryCode: 'TR',
      afterDisplayName: null,
      afterId: null,
      limit: 2,
    })
  })

  it('uses decimal strings for compensation keyset pagination', async () => {
    const repository = createRepository()

    await expect(
      createCatalogService(repository).listActiveCompensationBands({
        currencyCode: 'try',
        payPeriod: 'monthly',
        grossNet: 'gross',
        regionCode: 'tr',
        definitionVersion: 'v1',
        cursor: { lowerBound: '5000.2500', id: secondId },
        limit: 1,
      }),
    ).resolves.toEqual({
      items: [
        {
          id,
          currencyCode: 'TRY',
          payPeriod: 'monthly',
          grossNet: 'gross',
          regionCode: 'tr',
          lowerBound: '10000',
          upperBound: '20000',
          definitionVersion: 'v1',
          validFrom: '2026-01-01',
          validTo: null,
        },
      ],
      nextCursor: { lowerBound: '10000', id },
    })
    expect(repository.listActiveCompensationBands).toHaveBeenCalledWith({
      currencyCode: 'TRY',
      payPeriod: 'monthly',
      grossNet: 'gross',
      regionCode: 'tr',
      definitionVersion: 'v1',
      afterLowerBound: '5000.2500',
      afterId: secondId,
      limit: 2,
    })
  })

  it('returns null when there is no next page', async () => {
    const repository = createRepository({
      listPublishedCompanies: vi.fn().mockResolvedValue([company]),
    })

    await expect(
      createCatalogService(repository).listPublishedCompanies({
        limit: 1,
      }),
    ).resolves.toMatchObject({ nextCursor: null })
  })

  it('supports every cursor path and terminal page shape', async () => {
    const repository = createRepository({
      listActiveRoleFamilies: vi.fn().mockResolvedValue([family]),
      listActiveRoles: vi.fn().mockResolvedValue([role]),
      listPublishedCompanies: vi.fn().mockResolvedValue([company]),
      listActiveCompensationBands: vi
        .fn()
        .mockResolvedValue([compensation]),
    })
    const service = createCatalogService(repository)

    await expect(
      service.listActiveRoleFamilies({ taxonomyVersion: 'v1', limit: 1 }),
    ).resolves.toMatchObject({ nextCursor: null })
    await expect(
      service.listActiveRoles({
        roleFamilyId: familyId,
        taxonomyVersion: 'v1',
        cursor: { sortOrder: 5, id: secondId },
        limit: 1,
      }),
    ).resolves.toMatchObject({ nextCursor: null })
    await expect(
      service.listPublishedCompanies({
        cursor: { displayName: 'Earlier', id: secondId },
        limit: 1,
      }),
    ).resolves.toMatchObject({ nextCursor: null })
    await expect(
      service.listActiveCompensationBands({
        currencyCode: 'TRY',
        payPeriod: 'monthly',
        grossNet: 'gross',
        regionCode: 'tr',
        definitionVersion: 'v1',
        limit: 1,
      }),
    ).resolves.toMatchObject({ nextCursor: null })

    expect(repository.listActiveRoleFamilies).toHaveBeenCalledWith({
      taxonomyVersion: 'v1',
      afterSortOrder: null,
      afterId: null,
      limit: 2,
    })
    expect(repository.listActiveRoles).toHaveBeenCalledWith({
      roleFamilyId: familyId,
      taxonomyVersion: 'v1',
      afterSortOrder: 5,
      afterId: secondId,
      limit: 2,
    })
    expect(repository.listPublishedCompanies).toHaveBeenCalledWith({
      sectorId: null,
      countryCode: null,
      afterDisplayName: 'Earlier',
      afterId: secondId,
      limit: 2,
    })
    expect(repository.listActiveCompensationBands).toHaveBeenCalledWith({
      currencyCode: 'TRY',
      payPeriod: 'monthly',
      grossNet: 'gross',
      regionCode: 'tr',
      definitionVersion: 'v1',
      afterLowerBound: null,
      afterId: null,
      limit: 2,
    })
  })

  it('resolves a company alias through the server-only repository path', async () => {
    const repository = createRepository()
    const service = createCatalogService(repository)

    await expect(
      service.resolveCompanyAlias({
        alias: '  Example  ',
        countryCode: 'tr',
        locale: 'TR',
      }),
    ).resolves.toEqual({ companyId: id })
    expect(repository.resolveCompanyAlias).toHaveBeenCalledWith({
      alias: 'Example',
      countryCode: 'TR',
      locale: 'tr',
    })

    const noMatchRepository = createRepository({
      resolveCompanyAlias: vi.fn().mockResolvedValue(null),
    })
    await expect(
      createCatalogService(noMatchRepository).resolveCompanyAlias({
        alias: 'Unknown',
      }),
    ).resolves.toBeNull()
  })

  type Service = ReturnType<typeof createCatalogService>
  const failures: Array<{
    name: string
    invalidCode: ConstructorParameters<typeof CatalogPersistenceError>[0]
    failedCode: ConstructorParameters<typeof CatalogPersistenceError>[0]
    repository: (failure: unknown) => CatalogRepository
    invoke: (service: Service) => Promise<unknown>
  }> = [
    {
      name: 'sector',
      invalidCode: 'SECTOR_RESPONSE_INVALID',
      failedCode: 'SECTOR_LIST_FAILED',
      repository: (failure) =>
        createRepository({
          listActiveSectors: vi.fn().mockRejectedValue(failure),
        }),
      invoke: (service) => service.listActiveSectors({}),
    },
    {
      name: 'role family',
      invalidCode: 'ROLE_FAMILY_RESPONSE_INVALID',
      failedCode: 'ROLE_FAMILY_LIST_FAILED',
      repository: (failure) =>
        createRepository({
          listActiveRoleFamilies: vi.fn().mockRejectedValue(failure),
        }),
      invoke: (service) =>
        service.listActiveRoleFamilies({ taxonomyVersion: 'v1' }),
    },
    {
      name: 'role',
      invalidCode: 'ROLE_RESPONSE_INVALID',
      failedCode: 'ROLE_LIST_FAILED',
      repository: (failure) =>
        createRepository({
          listActiveRoles: vi.fn().mockRejectedValue(failure),
        }),
      invoke: (service) =>
        service.listActiveRoles({
          roleFamilyId: familyId,
          taxonomyVersion: 'v1',
        }),
    },
    {
      name: 'company',
      invalidCode: 'COMPANY_RESPONSE_INVALID',
      failedCode: 'COMPANY_LIST_FAILED',
      repository: (failure) =>
        createRepository({
          listPublishedCompanies: vi.fn().mockRejectedValue(failure),
        }),
      invoke: (service) => service.listPublishedCompanies({}),
    },
    {
      name: 'compensation band',
      invalidCode: 'COMPENSATION_BAND_RESPONSE_INVALID',
      failedCode: 'COMPENSATION_BAND_LIST_FAILED',
      repository: (failure) =>
        createRepository({
          listActiveCompensationBands: vi
            .fn()
            .mockRejectedValue(failure),
        }),
      invoke: (service) =>
        service.listActiveCompensationBands({
          currencyCode: 'TRY',
          payPeriod: 'monthly',
          grossNet: 'gross',
          regionCode: 'tr',
          definitionVersion: 'v1',
        }),
    },
    {
      name: 'company alias',
      invalidCode: 'COMPANY_ALIAS_RESPONSE_INVALID',
      failedCode: 'COMPANY_ALIAS_RESOLUTION_FAILED',
      repository: (failure) =>
        createRepository({
          resolveCompanyAlias: vi.fn().mockRejectedValue(failure),
        }),
      invoke: (service) =>
        service.resolveCompanyAlias({ alias: 'Example' }),
    },
  ]

  it.each(failures)(
    'preserves only the stable invalid-response code for $name',
    async ({ invalidCode, repository, invoke }) => {
      await expect(
        invoke(
          createCatalogService(
            repository(new CatalogPersistenceError(invalidCode)),
          ),
        ),
      ).rejects.toEqual(new CatalogServiceError(invalidCode))
    },
  )

  it.each(failures)(
    'hides raw $name persistence failures',
    async ({ failedCode, repository, invoke }) => {
      await expect(
        invoke(
          createCatalogService(
            repository(new Error('private database detail')),
          ),
        ),
      ).rejects.toEqual(new CatalogServiceError(failedCode))
    },
  )

  it('validates the mapped public DTO before returning it', async () => {
    const repository = createRepository({
      listActiveSectors: vi.fn().mockResolvedValue([
        {
          ...sector,
          id: 'not-a-smallint',
        },
      ] as never),
    })

    await expect(
      createCatalogService(repository).listActiveSectors({}),
    ).rejects.toEqual(new CatalogServiceError('SECTOR_RESPONSE_INVALID'))
  })

  it.each([
    {
      code: 'ROLE_FAMILY_RESPONSE_INVALID',
      repository: createRepository({
        listActiveRoleFamilies: vi.fn().mockResolvedValue([
          { ...family, id: 'not-a-uuid' },
        ] as never),
      }),
      invoke: (service: ReturnType<typeof createCatalogService>) =>
        service.listActiveRoleFamilies({ taxonomyVersion: 'v1' }),
    },
    {
      code: 'ROLE_RESPONSE_INVALID',
      repository: createRepository({
        listActiveRoles: vi.fn().mockResolvedValue([
          { ...role, role_family_id: 'not-a-uuid' },
        ] as never),
      }),
      invoke: (service: ReturnType<typeof createCatalogService>) =>
        service.listActiveRoles({
          roleFamilyId: familyId,
          taxonomyVersion: 'v1',
        }),
    },
    {
      code: 'COMPANY_RESPONSE_INVALID',
      repository: createRepository({
        listPublishedCompanies: vi.fn().mockResolvedValue([
          { ...company, country_code: 'tur' },
        ] as never),
      }),
      invoke: (service: ReturnType<typeof createCatalogService>) =>
        service.listPublishedCompanies({}),
    },
    {
      code: 'COMPENSATION_BAND_RESPONSE_INVALID',
      repository: createRepository({
        listActiveCompensationBands: vi.fn().mockResolvedValue([
          { ...compensation, lower_bound: 'not-a-decimal' },
        ] as never),
      }),
      invoke: (service: ReturnType<typeof createCatalogService>) =>
        service.listActiveCompensationBands({
          currencyCode: 'TRY',
          payPeriod: 'monthly',
          grossNet: 'gross',
          regionCode: 'tr',
          definitionVersion: 'v1',
        }),
    },
    {
      code: 'COMPANY_ALIAS_RESPONSE_INVALID',
      repository: createRepository({
        resolveCompanyAlias: vi.fn().mockResolvedValue({
          company_id: 'not-a-uuid',
        } as never),
      }),
      invoke: (service: ReturnType<typeof createCatalogService>) =>
        service.resolveCompanyAlias({ alias: 'Example' }),
    },
  ] as const)(
    'rejects an invalid mapped $code DTO',
    async ({ code, repository, invoke }) => {
      await expect(
        invoke(createCatalogService(repository)),
      ).rejects.toEqual(new CatalogServiceError(code))
    },
  )
})
