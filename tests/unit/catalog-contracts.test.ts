import { describe, expect, it } from 'vitest'

import {
  companyPageDtoSchema,
  companySelectionSchema,
  compensationBandPageDtoSchema,
  compensationBandSelectionSchema,
  listActiveCompensationBandsQuerySchema,
  listActiveRoleFamiliesQuerySchema,
  listActiveRolesQuerySchema,
  listPublishedCompaniesQuerySchema,
  roleFamilyPageDtoSchema,
  rolePageDtoSchema,
  roleSelectionSchema,
  sectorPageDtoSchema,
  sectorSelectionSchema,
} from '@/lib/catalog/contracts'

const id = '11111111-1111-4111-8111-111111111111'
const secondId = '22222222-2222-4222-8222-222222222222'

describe('catalog API contracts', () => {
  it('normalizes and defaults resource-specific list queries', () => {
    expect(
      listActiveRoleFamiliesQuerySchema.parse({
        taxonomyVersion: ' v1 ',
      }),
    ).toEqual({
      taxonomyVersion: 'v1',
      cursor: null,
      limit: 50,
    })
    expect(
      listActiveRolesQuerySchema.parse({
        roleFamilyId: id,
        taxonomyVersion: 'v1',
        cursor: { sortOrder: 10, id: secondId },
        limit: 20,
      }),
    ).toEqual({
      roleFamilyId: id,
      taxonomyVersion: 'v1',
      cursor: { sortOrder: 10, id: secondId },
      limit: 20,
    })
    expect(
      listPublishedCompaniesQuerySchema.parse({
        countryCode: ' tr ',
      }),
    ).toEqual({
      sectorId: null,
      countryCode: 'TR',
      cursor: null,
      limit: 25,
    })
    expect(
      listActiveCompensationBandsQuerySchema.parse({
        currencyCode: ' try ',
        payPeriod: 'monthly',
        grossNet: 'gross',
        regionCode: 'tr',
        definitionVersion: 'v1',
      }),
    ).toEqual({
      currencyCode: 'TRY',
      payPeriod: 'monthly',
      grossNet: 'gross',
      regionCode: 'tr',
      definitionVersion: 'v1',
      cursor: null,
      limit: 50,
    })
  })

  it.each([
    [
      listActiveRoleFamiliesQuerySchema,
      { taxonomyVersion: 'v1', roleFamilyId: id },
    ],
    [
      listActiveRolesQuerySchema,
      {
        roleFamilyId: id,
        taxonomyVersion: 'v1',
        countryCode: 'TR',
      },
    ],
    [
      listPublishedCompaniesQuerySchema,
      { taxonomyVersion: 'v1' },
    ],
    [
      listActiveCompensationBandsQuerySchema,
      {
        currencyCode: 'TRY',
        payPeriod: 'monthly',
        grossNet: 'gross',
        regionCode: 'tr',
        definitionVersion: 'v1',
        effectiveOn: '2026-07-19',
      },
    ],
  ])('rejects fields owned by a different catalog resource', (schema, input) => {
    expect(() => schema.parse(input)).toThrow()
  })

  it('validates strict, resource-specific page DTOs', () => {
    expect(
      sectorPageDtoSchema.parse({
        items: [
          {
            id: 1,
            slug: 'software',
            displayName: 'Software',
            sortOrder: 10,
          },
        ],
        nextCursor: null,
      }),
    ).toBeTruthy()
    expect(
      roleFamilyPageDtoSchema.parse({
        items: [
          {
            id,
            slug: 'engineering',
            displayName: 'Engineering',
            taxonomyVersion: 'v1',
            sortOrder: 10,
          },
        ],
        nextCursor: { sortOrder: 10, id },
      }),
    ).toBeTruthy()
    expect(
      rolePageDtoSchema.parse({
        items: [
          {
            id,
            roleFamilyId: secondId,
            slug: 'backend-engineer',
            displayName: 'Backend Engineer',
            taxonomyVersion: 'v1',
            sortOrder: 20,
          },
        ],
        nextCursor: null,
      }),
    ).toBeTruthy()
    expect(
      companyPageDtoSchema.parse({
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
      }),
    ).toBeTruthy()
    expect(
      compensationBandPageDtoSchema.parse({
        items: [
          {
            id,
            currencyCode: 'TRY',
            payPeriod: 'monthly',
            grossNet: 'gross',
            regionCode: 'tr',
            lowerBound: '10000.5000',
            upperBound: '20000',
            definitionVersion: 'v1',
            validFrom: '2026-01-01',
            validTo: null,
          },
        ],
        nextCursor: { lowerBound: '10000.5000', id },
      }),
    ).toBeTruthy()
  })

  it('enforces the database decimal precision at the API boundary', () => {
    const base = {
      currencyCode: 'TRY',
      payPeriod: 'monthly',
      grossNet: 'gross',
      regionCode: 'tr',
      definitionVersion: 'v1',
      limit: 10,
    }

    expect(() =>
      listActiveCompensationBandsQuerySchema.parse({
        ...base,
        cursor: { lowerBound: '1234567890123456', id },
      }),
    ).toThrow()
    expect(() =>
      listActiveCompensationBandsQuerySchema.parse({
        ...base,
        cursor: { lowerBound: '1.12345', id },
      }),
    ).toThrow()
  })

  it('allows controlled raw fallbacks only for role and company', () => {
    expect(
      roleSelectionSchema.parse({
        kind: 'raw',
        rawValue: '  Platform Wizard  ',
      }),
    ).toEqual({ kind: 'raw', rawValue: 'Platform Wizard' })
    expect(
      companySelectionSchema.parse({
        kind: 'raw',
        rawValue: '  Example Labs  ',
        countryCode: 'tr',
        locale: 'TR-tr',
      }),
    ).toEqual({
      kind: 'raw',
      rawValue: 'Example Labs',
      countryCode: 'TR',
      locale: 'tr-tr',
    })
    expect(
      sectorSelectionSchema.parse({
        kind: 'canonical',
        sectorId: 1,
      }),
    ).toEqual({ kind: 'canonical', sectorId: 1 })
    expect(
      compensationBandSelectionSchema.parse({
        kind: 'canonical',
        compensationBandId: id,
      }),
    ).toEqual({ kind: 'canonical', compensationBandId: id })
  })

  it.each([
    [roleSelectionSchema, { kind: 'raw', rawValue: 'bad\u0000value' }],
    [
      roleSelectionSchema,
      { kind: 'canonical', roleId: id, rawValue: 'not allowed' },
    ],
    [sectorSelectionSchema, { kind: 'raw', rawValue: 'Other' }],
    [
      compensationBandSelectionSchema,
      { kind: 'raw', rawValue: 'Secret salary' },
    ],
  ])('rejects unsafe or unsupported selection data', (schema, input) => {
    expect(() => schema.parse(input)).toThrow()
  })
})
