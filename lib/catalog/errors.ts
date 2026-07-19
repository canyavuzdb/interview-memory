export type CatalogPersistenceErrorCode =
  | 'SECTOR_LIST_FAILED'
  | 'SECTOR_RESPONSE_INVALID'
  | 'ROLE_FAMILY_LIST_FAILED'
  | 'ROLE_FAMILY_RESPONSE_INVALID'
  | 'ROLE_LIST_FAILED'
  | 'ROLE_RESPONSE_INVALID'
  | 'COMPANY_LIST_FAILED'
  | 'COMPANY_RESPONSE_INVALID'
  | 'COMPENSATION_BAND_LIST_FAILED'
  | 'COMPENSATION_BAND_RESPONSE_INVALID'
  | 'COMPANY_ALIAS_RESOLUTION_FAILED'
  | 'COMPANY_ALIAS_RESPONSE_INVALID'

export class CatalogPersistenceError extends Error {
  constructor(public readonly code: CatalogPersistenceErrorCode) {
    super(code)
    this.name = 'CatalogPersistenceError'
  }
}
