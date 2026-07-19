import { describe, expect, it } from 'vitest'

import {
  companyAliasResolutionRecordListSchema,
  companyRecordListSchema,
  compensationBandRecordListSchema,
  roleFamilyRecordListSchema,
  roleRecordListSchema,
  sectorRecordListSchema,
} from '@/lib/server/catalog/persistence.schemas'

const id = '11111111-1111-4111-8111-111111111111'
const familyId = '22222222-2222-4222-8222-222222222222'

const rows = {
  sector: {
    id: 1,
    slug: 'software',
    display_name: 'Software',
    sort_order: 10,
  },
  family: {
    id: familyId,
    slug: 'engineering',
    display_name: 'Engineering',
    taxonomy_version: 'v1',
    sort_order: 10,
  },
  role: {
    id,
    role_family_id: familyId,
    slug: 'backend-engineer',
    display_name: 'Backend Engineer',
    taxonomy_version: 'v1',
    sort_order: 20,
  },
  company: {
    id,
    slug: 'example',
    display_name: 'Example',
    sector_id: 1,
    country_code: 'TR',
  },
  compensation: {
    id,
    currency_code: 'TRY',
    pay_period: 'monthly',
    gross_net: 'gross',
    region_code: 'tr',
    lower_bound: '10000.5000',
    upper_bound: '20000',
    definition_version: 'v1',
    valid_from: '2026-01-01',
    valid_to: null,
  },
} as const

describe('catalog persistence response schemas', () => {
  it('accepts the exact snake-case records returned by each RPC', () => {
    expect(sectorRecordListSchema.parse([rows.sector])).toEqual([
      rows.sector,
    ])
    expect(roleFamilyRecordListSchema.parse([rows.family])).toEqual([
      rows.family,
    ])
    expect(roleRecordListSchema.parse([rows.role])).toEqual([rows.role])
    expect(companyRecordListSchema.parse([rows.company])).toEqual([
      rows.company,
    ])
    expect(
      compensationBandRecordListSchema.parse([rows.compensation]),
    ).toEqual([rows.compensation])
    expect(
      companyAliasResolutionRecordListSchema.parse([
        { company_id: id },
      ]),
    ).toEqual([{ company_id: id }])
  })

  it.each([
    [sectorRecordListSchema, [{ ...rows.sector, internal: true }]],
    [
      roleFamilyRecordListSchema,
      [{ ...rows.family, taxonomy_version: '' }],
    ],
    [
      roleRecordListSchema,
      [{ ...rows.role, role_family_id: 'not-a-uuid' }],
    ],
    [
      companyRecordListSchema,
      [{ ...rows.company, country_code: 'tur' }],
    ],
    [
      compensationBandRecordListSchema,
      [{ ...rows.compensation, lower_bound: '1234567890123456' }],
    ],
    [
      companyAliasResolutionRecordListSchema,
      [{ company_id: id, alias: 'must-not-cross-boundary' }],
    ],
  ])('rejects malformed or over-broad RPC data', (schema, input) => {
    expect(() => schema.parse(input)).toThrow()
  })

  it('accepts no alias match but rejects ambiguous matches', () => {
    expect(companyAliasResolutionRecordListSchema.parse([])).toEqual([])
    expect(() =>
      companyAliasResolutionRecordListSchema.parse([
        { company_id: id },
        { company_id: familyId },
      ]),
    ).toThrow()
  })
})
