import { z } from 'zod'

export const catalogPayPeriods = ['hourly', 'monthly', 'annual'] as const
export const catalogGrossNetValues = ['gross', 'net', 'unknown'] as const

const uuidSchema = z.uuid()
const sectorIdSchema = z.int().positive().max(32767)
const sortOrderSchema = z.int().nonnegative()
const slugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u)
const taxonomyVersionSchema = z.string().trim().min(1).max(50)
const definitionVersionSchema = z.string().trim().min(1).max(50)
const decimalSchema = z
  .string()
  .trim()
  .max(20)
  .regex(/^(?:0|[1-9][0-9]{0,14})(?:\.[0-9]{1,4})?$/u)
const regionCodeSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/u)
const countryCodeSchema = z
  .string()
  .trim()
  .length(2)
  .transform((value) => value.toUpperCase())
  .pipe(z.string().regex(/^[A-Z]{2}$/u))
const currencyCodeSchema = z
  .string()
  .trim()
  .length(3)
  .transform((value) => value.toUpperCase())
  .pipe(z.string().regex(/^[A-Z]{3}$/u))
const localeSchema = z
  .string()
  .trim()
  .min(2)
  .max(5)
  .transform((value) => value.toLowerCase())
  .pipe(z.string().regex(/^[a-z]{2}(?:-[a-z]{2})?$/u))
const rawValueSchema = (maximumLength: number) =>
  z
    .string()
    .trim()
    .min(2)
    .max(maximumLength)
    .regex(
      /^[^\u0000-\u001f\u007f-\u009f]+$/u,
      'Control characters are not allowed',
    )

const defaultPageLimitSchema = z.int().min(1).max(100).default(50)
const companyPageLimitSchema = z.int().min(1).max(100).default(25)

export const sectorDtoSchema = z.strictObject({
  id: sectorIdSchema,
  slug: slugSchema.max(80),
  displayName: z.string().trim().min(1).max(120),
  sortOrder: sortOrderSchema,
})

export const roleFamilyDtoSchema = z.strictObject({
  id: uuidSchema,
  slug: slugSchema.max(80),
  displayName: z.string().trim().min(1).max(120),
  taxonomyVersion: taxonomyVersionSchema,
  sortOrder: sortOrderSchema,
})

export const roleDtoSchema = z.strictObject({
  id: uuidSchema,
  roleFamilyId: uuidSchema,
  slug: slugSchema.max(80),
  displayName: z.string().trim().min(1).max(120),
  taxonomyVersion: taxonomyVersionSchema,
  sortOrder: sortOrderSchema,
})

export const companyDtoSchema = z.strictObject({
  id: uuidSchema,
  slug: slugSchema,
  displayName: z.string().trim().min(1).max(200),
  sectorId: sectorIdSchema.nullable(),
  countryCode: z.string().regex(/^[A-Z]{2}$/u).nullable(),
})

export const compensationBandDtoSchema = z.strictObject({
  id: uuidSchema,
  currencyCode: z.string().regex(/^[A-Z]{3}$/u),
  payPeriod: z.enum(catalogPayPeriods),
  grossNet: z.enum(catalogGrossNetValues),
  regionCode: regionCodeSchema,
  lowerBound: decimalSchema,
  upperBound: decimalSchema,
  definitionVersion: definitionVersionSchema,
  validFrom: z.iso.date(),
  validTo: z.iso.date().nullable(),
})

export const listActiveSectorsQuerySchema = z.strictObject({})

export const roleFamilyCursorSchema = z.strictObject({
  sortOrder: sortOrderSchema,
  id: uuidSchema,
})

export const listActiveRoleFamiliesQuerySchema = z.strictObject({
  taxonomyVersion: taxonomyVersionSchema,
  cursor: roleFamilyCursorSchema.nullable().default(null),
  limit: defaultPageLimitSchema,
})

export const roleCursorSchema = z.strictObject({
  sortOrder: sortOrderSchema,
  id: uuidSchema,
})

export const listActiveRolesQuerySchema = z.strictObject({
  roleFamilyId: uuidSchema,
  taxonomyVersion: taxonomyVersionSchema,
  cursor: roleCursorSchema.nullable().default(null),
  limit: defaultPageLimitSchema,
})

export const companyCursorSchema = z.strictObject({
  displayName: z.string().trim().min(1).max(200),
  id: uuidSchema,
})

export const listPublishedCompaniesQuerySchema = z.strictObject({
  sectorId: sectorIdSchema.nullable().default(null),
  countryCode: countryCodeSchema.nullable().default(null),
  cursor: companyCursorSchema.nullable().default(null),
  limit: companyPageLimitSchema,
})

export const compensationBandCursorSchema = z.strictObject({
  lowerBound: decimalSchema,
  id: uuidSchema,
})

export const listActiveCompensationBandsQuerySchema = z.strictObject({
  currencyCode: currencyCodeSchema,
  payPeriod: z.enum(catalogPayPeriods),
  grossNet: z.enum(catalogGrossNetValues),
  regionCode: regionCodeSchema,
  definitionVersion: definitionVersionSchema,
  cursor: compensationBandCursorSchema.nullable().default(null),
  limit: defaultPageLimitSchema,
})

export const resolveCompanyAliasQuerySchema = z.strictObject({
  alias: rawValueSchema(200),
  countryCode: countryCodeSchema.nullable().default(null),
  locale: localeSchema.nullable().default(null),
})

export const sectorPageDtoSchema = z.strictObject({
  items: z.array(sectorDtoSchema),
  nextCursor: z.null(),
})

export const roleFamilyPageDtoSchema = z.strictObject({
  items: z.array(roleFamilyDtoSchema),
  nextCursor: roleFamilyCursorSchema.nullable(),
})

export const rolePageDtoSchema = z.strictObject({
  items: z.array(roleDtoSchema),
  nextCursor: roleCursorSchema.nullable(),
})

export const companyPageDtoSchema = z.strictObject({
  items: z.array(companyDtoSchema),
  nextCursor: companyCursorSchema.nullable(),
})

export const compensationBandPageDtoSchema = z.strictObject({
  items: z.array(compensationBandDtoSchema),
  nextCursor: compensationBandCursorSchema.nullable(),
})

export const companyAliasResolutionDtoSchema = z.strictObject({
  companyId: uuidSchema,
})

const canonicalRoleSelectionSchema = z.strictObject({
  kind: z.literal('canonical'),
  roleId: uuidSchema,
})

const rawRoleSelectionSchema = z.strictObject({
  kind: z.literal('raw'),
  rawValue: rawValueSchema(120),
})

export const roleSelectionSchema = z.discriminatedUnion('kind', [
  canonicalRoleSelectionSchema,
  rawRoleSelectionSchema,
])

const canonicalCompanySelectionSchema = z.strictObject({
  kind: z.literal('canonical'),
  companyId: uuidSchema,
})

const rawCompanySelectionSchema = z.strictObject({
  kind: z.literal('raw'),
  rawValue: rawValueSchema(200),
  countryCode: countryCodeSchema.nullable().default(null),
  locale: localeSchema.nullable().default(null),
})

export const companySelectionSchema = z.discriminatedUnion('kind', [
  canonicalCompanySelectionSchema,
  rawCompanySelectionSchema,
])

export const sectorSelectionSchema = z
  .strictObject({
    kind: z.literal('canonical'),
    sectorId: sectorIdSchema,
  })
  .nullable()

export const compensationBandSelectionSchema = z
  .strictObject({
    kind: z.literal('canonical'),
    compensationBandId: uuidSchema,
  })
  .nullable()

export type SectorDto = z.infer<typeof sectorDtoSchema>
export type RoleFamilyDto = z.infer<typeof roleFamilyDtoSchema>
export type RoleDto = z.infer<typeof roleDtoSchema>
export type CompanyDto = z.infer<typeof companyDtoSchema>
export type CompensationBandDto = z.infer<typeof compensationBandDtoSchema>
export type RoleFamilyCursor = z.infer<typeof roleFamilyCursorSchema>
export type RoleCursor = z.infer<typeof roleCursorSchema>
export type CompanyCursor = z.infer<typeof companyCursorSchema>
export type CompensationBandCursor = z.infer<
  typeof compensationBandCursorSchema
>
export type SectorPageDto = z.infer<typeof sectorPageDtoSchema>
export type RoleFamilyPageDto = z.infer<typeof roleFamilyPageDtoSchema>
export type RolePageDto = z.infer<typeof rolePageDtoSchema>
export type CompanyPageDto = z.infer<typeof companyPageDtoSchema>
export type CompensationBandPageDto = z.infer<
  typeof compensationBandPageDtoSchema
>
export type CompanyAliasResolutionDto = z.infer<
  typeof companyAliasResolutionDtoSchema
>
export type RoleSelection = z.infer<typeof roleSelectionSchema>
export type CompanySelection = z.infer<typeof companySelectionSchema>
export type SectorSelection = z.infer<typeof sectorSelectionSchema>
export type CompensationBandSelection = z.infer<
  typeof compensationBandSelectionSchema
>
