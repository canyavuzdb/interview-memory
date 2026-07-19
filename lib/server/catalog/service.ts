import 'server-only'

import {
  companyAliasResolutionDtoSchema,
  companyPageDtoSchema,
  compensationBandPageDtoSchema,
  listActiveCompensationBandsQuerySchema,
  listActiveRoleFamiliesQuerySchema,
  listActiveRolesQuerySchema,
  listActiveSectorsQuerySchema,
  listPublishedCompaniesQuerySchema,
  resolveCompanyAliasQuerySchema,
  roleFamilyPageDtoSchema,
  rolePageDtoSchema,
  sectorPageDtoSchema,
  type CompanyAliasResolutionDto,
  type CompanyPageDto,
  type CompensationBandPageDto,
  type RoleFamilyPageDto,
  type RolePageDto,
  type SectorPageDto,
} from '@/lib/catalog/contracts'
import {
  CatalogPersistenceError,
  type CatalogPersistenceErrorCode,
} from '@/lib/catalog/errors'
import type {
  CompanyAliasResolutionRecord,
  CompanyRecord,
  CompensationBandRecord,
  RoleFamilyRecord,
  RoleRecord,
  SectorRecord,
} from '@/lib/server/catalog/persistence.schemas'

export type RoleFamilyPersistenceQuery = {
  taxonomyVersion: string
  afterSortOrder: number | null
  afterId: string | null
  limit: number
}

export type RolePersistenceQuery = {
  roleFamilyId: string
  taxonomyVersion: string
  afterSortOrder: number | null
  afterId: string | null
  limit: number
}

export type CompanyPersistenceQuery = {
  sectorId: number | null
  countryCode: string | null
  afterDisplayName: string | null
  afterId: string | null
  limit: number
}

export type CompensationBandPersistenceQuery = {
  currencyCode: string
  payPeriod: string
  grossNet: string
  regionCode: string
  definitionVersion: string
  afterLowerBound: string | null
  afterId: string | null
  limit: number
}

export type CompanyAliasResolutionPersistenceQuery = {
  alias: string
  countryCode: string | null
  locale: string | null
}

export interface CatalogRepository {
  listActiveSectors(): Promise<SectorRecord[]>
  listActiveRoleFamilies(
    query: RoleFamilyPersistenceQuery,
  ): Promise<RoleFamilyRecord[]>
  listActiveRoles(query: RolePersistenceQuery): Promise<RoleRecord[]>
  listPublishedCompanies(
    query: CompanyPersistenceQuery,
  ): Promise<CompanyRecord[]>
  listActiveCompensationBands(
    query: CompensationBandPersistenceQuery,
  ): Promise<CompensationBandRecord[]>
  resolveCompanyAlias(
    query: CompanyAliasResolutionPersistenceQuery,
  ): Promise<CompanyAliasResolutionRecord | null>
}

export class CatalogServiceError extends Error {
  constructor(public readonly code: CatalogPersistenceErrorCode) {
    super(code)
    this.name = 'CatalogServiceError'
  }
}

function throwMappedPersistenceError(
  error: unknown,
  responseInvalidCode: CatalogPersistenceErrorCode,
  operationFailedCode: CatalogPersistenceErrorCode,
): never {
  if (
    error instanceof CatalogPersistenceError &&
    error.code === responseInvalidCode
  ) {
    throw new CatalogServiceError(responseInvalidCode)
  }

  throw new CatalogServiceError(operationFailedCode)
}

export function createCatalogService(repository: CatalogRepository) {
  return {
    async listActiveSectors(input: unknown = {}): Promise<SectorPageDto> {
      listActiveSectorsQuerySchema.parse(input)
      let records: SectorRecord[]

      try {
        records = await repository.listActiveSectors()
      } catch (error) {
        throwMappedPersistenceError(
          error,
          'SECTOR_RESPONSE_INVALID',
          'SECTOR_LIST_FAILED',
        )
      }

      const result = sectorPageDtoSchema.safeParse({
        items: records.map((record) => ({
          id: record.id,
          slug: record.slug,
          displayName: record.display_name,
          sortOrder: record.sort_order,
        })),
        nextCursor: null,
      })

      if (!result.success) {
        throw new CatalogServiceError('SECTOR_RESPONSE_INVALID')
      }

      return result.data
    },

    async listActiveRoleFamilies(
      input: unknown,
    ): Promise<RoleFamilyPageDto> {
      const query = listActiveRoleFamiliesQuerySchema.parse(input)
      let records: RoleFamilyRecord[]

      try {
        records = await repository.listActiveRoleFamilies({
          taxonomyVersion: query.taxonomyVersion,
          afterSortOrder: query.cursor?.sortOrder ?? null,
          afterId: query.cursor?.id ?? null,
          limit: query.limit + 1,
        })
      } catch (error) {
        throwMappedPersistenceError(
          error,
          'ROLE_FAMILY_RESPONSE_INVALID',
          'ROLE_FAMILY_LIST_FAILED',
        )
      }

      const hasNextPage = records.length > query.limit
      const pageRecords = records.slice(0, query.limit)
      const lastRecord = pageRecords.at(-1)!
      const result = roleFamilyPageDtoSchema.safeParse({
        items: pageRecords.map((record) => ({
          id: record.id,
          slug: record.slug,
          displayName: record.display_name,
          taxonomyVersion: record.taxonomy_version,
          sortOrder: record.sort_order,
        })),
        nextCursor:
          hasNextPage
            ? { sortOrder: lastRecord.sort_order, id: lastRecord.id }
            : null,
      })

      if (!result.success) {
        throw new CatalogServiceError('ROLE_FAMILY_RESPONSE_INVALID')
      }

      return result.data
    },

    async listActiveRoles(input: unknown): Promise<RolePageDto> {
      const query = listActiveRolesQuerySchema.parse(input)
      let records: RoleRecord[]

      try {
        records = await repository.listActiveRoles({
          roleFamilyId: query.roleFamilyId,
          taxonomyVersion: query.taxonomyVersion,
          afterSortOrder: query.cursor?.sortOrder ?? null,
          afterId: query.cursor?.id ?? null,
          limit: query.limit + 1,
        })
      } catch (error) {
        throwMappedPersistenceError(
          error,
          'ROLE_RESPONSE_INVALID',
          'ROLE_LIST_FAILED',
        )
      }

      const hasNextPage = records.length > query.limit
      const pageRecords = records.slice(0, query.limit)
      const lastRecord = pageRecords.at(-1)!
      const result = rolePageDtoSchema.safeParse({
        items: pageRecords.map((record) => ({
          id: record.id,
          roleFamilyId: record.role_family_id,
          slug: record.slug,
          displayName: record.display_name,
          taxonomyVersion: record.taxonomy_version,
          sortOrder: record.sort_order,
        })),
        nextCursor:
          hasNextPage
            ? { sortOrder: lastRecord.sort_order, id: lastRecord.id }
            : null,
      })

      if (!result.success) {
        throw new CatalogServiceError('ROLE_RESPONSE_INVALID')
      }

      return result.data
    },

    async listPublishedCompanies(input: unknown): Promise<CompanyPageDto> {
      const query = listPublishedCompaniesQuerySchema.parse(input)
      let records: CompanyRecord[]

      try {
        records = await repository.listPublishedCompanies({
          sectorId: query.sectorId,
          countryCode: query.countryCode,
          afterDisplayName: query.cursor?.displayName ?? null,
          afterId: query.cursor?.id ?? null,
          limit: query.limit + 1,
        })
      } catch (error) {
        throwMappedPersistenceError(
          error,
          'COMPANY_RESPONSE_INVALID',
          'COMPANY_LIST_FAILED',
        )
      }

      const hasNextPage = records.length > query.limit
      const pageRecords = records.slice(0, query.limit)
      const lastRecord = pageRecords.at(-1)!
      const result = companyPageDtoSchema.safeParse({
        items: pageRecords.map((record) => ({
          id: record.id,
          slug: record.slug,
          displayName: record.display_name,
          sectorId: record.sector_id,
          countryCode: record.country_code,
        })),
        nextCursor:
          hasNextPage
            ? { displayName: lastRecord.display_name, id: lastRecord.id }
            : null,
      })

      if (!result.success) {
        throw new CatalogServiceError('COMPANY_RESPONSE_INVALID')
      }

      return result.data
    },

    async listActiveCompensationBands(
      input: unknown,
    ): Promise<CompensationBandPageDto> {
      const query = listActiveCompensationBandsQuerySchema.parse(input)
      let records: CompensationBandRecord[]

      try {
        records = await repository.listActiveCompensationBands({
          currencyCode: query.currencyCode,
          payPeriod: query.payPeriod,
          grossNet: query.grossNet,
          regionCode: query.regionCode,
          definitionVersion: query.definitionVersion,
          afterLowerBound: query.cursor?.lowerBound ?? null,
          afterId: query.cursor?.id ?? null,
          limit: query.limit + 1,
        })
      } catch (error) {
        throwMappedPersistenceError(
          error,
          'COMPENSATION_BAND_RESPONSE_INVALID',
          'COMPENSATION_BAND_LIST_FAILED',
        )
      }

      const hasNextPage = records.length > query.limit
      const pageRecords = records.slice(0, query.limit)
      const lastRecord = pageRecords.at(-1)!
      const result = compensationBandPageDtoSchema.safeParse({
        items: pageRecords.map((record) => ({
          id: record.id,
          currencyCode: record.currency_code,
          payPeriod: record.pay_period,
          grossNet: record.gross_net,
          regionCode: record.region_code,
          lowerBound: record.lower_bound,
          upperBound: record.upper_bound,
          definitionVersion: record.definition_version,
          validFrom: record.valid_from,
          validTo: record.valid_to,
        })),
        nextCursor:
          hasNextPage
            ? { lowerBound: lastRecord.lower_bound, id: lastRecord.id }
            : null,
      })

      if (!result.success) {
        throw new CatalogServiceError('COMPENSATION_BAND_RESPONSE_INVALID')
      }

      return result.data
    },

    async resolveCompanyAlias(
      input: unknown,
    ): Promise<CompanyAliasResolutionDto | null> {
      const query = resolveCompanyAliasQuerySchema.parse(input)
      let record: CompanyAliasResolutionRecord | null

      try {
        record = await repository.resolveCompanyAlias(query)
      } catch (error) {
        throwMappedPersistenceError(
          error,
          'COMPANY_ALIAS_RESPONSE_INVALID',
          'COMPANY_ALIAS_RESOLUTION_FAILED',
        )
      }

      if (!record) {
        return null
      }

      const result = companyAliasResolutionDtoSchema.safeParse({
        companyId: record.company_id,
      })

      if (!result.success) {
        throw new CatalogServiceError('COMPANY_ALIAS_RESPONSE_INVALID')
      }

      return result.data
    },
  }
}
