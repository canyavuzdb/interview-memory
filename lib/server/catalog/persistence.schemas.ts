import 'server-only'

import { z } from 'zod'

import {
  catalogGrossNetValues,
  catalogPayPeriods,
} from '@/lib/catalog/contracts'
import type {
  ActiveCompensationBandRecord,
  ActiveRoleFamilyRecord,
  ActiveRoleRecord,
  ActiveSectorRecord,
  CompanyAliasResolutionRecord as GeneratedCompanyAliasResolutionRecord,
  PublishedCompanyRecord,
} from '@/lib/database/database.types'

const uuidSchema = z.uuid()
const sectorIdSchema = z.int().positive().max(32767)
const sortOrderSchema = z.int().nonnegative()
const slugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u)
const versionSchema = z.string().min(1).max(50)
const decimalSchema = z
  .string()
  .max(20)
  .regex(/^(?:0|[1-9][0-9]{0,14})(?:\.[0-9]{1,4})?$/u)
const regionCodeSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/u)

export const sectorRecordSchema: z.ZodType<ActiveSectorRecord> =
  z.strictObject({
    id: sectorIdSchema,
    slug: slugSchema.max(80),
    display_name: z.string().min(1).max(120),
    sort_order: sortOrderSchema,
  })

export const roleFamilyRecordSchema: z.ZodType<ActiveRoleFamilyRecord> =
  z.strictObject({
    id: uuidSchema,
    slug: slugSchema.max(80),
    display_name: z.string().min(1).max(120),
    taxonomy_version: versionSchema,
    sort_order: sortOrderSchema,
  })

export const roleRecordSchema: z.ZodType<ActiveRoleRecord> = z.strictObject({
  id: uuidSchema,
  role_family_id: uuidSchema,
  slug: slugSchema.max(80),
  display_name: z.string().min(1).max(120),
  taxonomy_version: versionSchema,
  sort_order: sortOrderSchema,
})

export const companyRecordSchema: z.ZodType<PublishedCompanyRecord> =
  z.strictObject({
    id: uuidSchema,
    slug: slugSchema,
    display_name: z.string().min(1).max(200),
    sector_id: sectorIdSchema.nullable(),
    country_code: z.string().regex(/^[A-Z]{2}$/u).nullable(),
  })

export const compensationBandRecordSchema: z.ZodType<
  ActiveCompensationBandRecord
> = z.strictObject({
  id: uuidSchema,
  currency_code: z.string().regex(/^[A-Z]{3}$/u),
  pay_period: z.enum(catalogPayPeriods),
  gross_net: z.enum(catalogGrossNetValues),
  region_code: regionCodeSchema,
  lower_bound: decimalSchema,
  upper_bound: decimalSchema,
  definition_version: versionSchema,
  valid_from: z.iso.date(),
  valid_to: z.iso.date().nullable(),
})

export const companyAliasResolutionRecordSchema: z.ZodType<
  GeneratedCompanyAliasResolutionRecord
> = z.strictObject({
  company_id: uuidSchema,
})

export const sectorRecordListSchema = z.array(sectorRecordSchema)
export const roleFamilyRecordListSchema = z.array(roleFamilyRecordSchema)
export const roleRecordListSchema = z.array(roleRecordSchema)
export const companyRecordListSchema = z.array(companyRecordSchema)
export const compensationBandRecordListSchema = z.array(
  compensationBandRecordSchema,
)
export const companyAliasResolutionRecordListSchema = z
  .array(companyAliasResolutionRecordSchema)
  .max(1)

export type SectorRecord = z.infer<typeof sectorRecordSchema>
export type RoleFamilyRecord = z.infer<typeof roleFamilyRecordSchema>
export type RoleRecord = z.infer<typeof roleRecordSchema>
export type CompanyRecord = z.infer<typeof companyRecordSchema>
export type CompensationBandRecord = z.infer<
  typeof compensationBandRecordSchema
>
export type CompanyAliasResolutionRecord = z.infer<
  typeof companyAliasResolutionRecordSchema
>
