import 'server-only'

import { createHash, createHmac, randomBytes } from 'node:crypto'

type KeyMaterial = {
  version: number
  secret: string
}

export type RespondentKeyRing = {
  active: KeyMaterial
  previous: KeyMaterial | null
}

function decodeSecret(secret: string): Buffer {
  return Buffer.from(secret, 'base64url')
}

function createPurposeHmac(secret: string, purpose: string, value: string) {
  return createHmac('sha256', decodeSecret(secret))
    .update(`${purpose}\u0000`, 'utf8')
    .update(value, 'utf8')
}

export function createOpaqueToken(): string {
  return randomBytes(32).toString('base64url')
}

export function hmacValue(
  secret: string,
  purpose: string,
  value: string,
): string {
  const digest = createPurposeHmac(secret, purpose, value).digest('hex')

  return `\\x${digest}`
}

export function deriveOpaqueToken(
  secret: string,
  purpose: string,
  value: string,
): string {
  return createPurposeHmac(secret, purpose, value).digest('base64url')
}

export function findKeyMaterial(
  keyRing: RespondentKeyRing,
  version: number,
): KeyMaterial | null {
  if (keyRing.active.version === version) return keyRing.active
  if (keyRing.previous?.version === version) return keyRing.previous
  return null
}

export function respondentTokenHmacs(
  token: string,
  keyRing: RespondentKeyRing,
) {
  return {
    active: {
      hmac: hmacValue(
        keyRing.active.secret,
        'respondent-cookie:v1',
        token,
      ),
      version: keyRing.active.version,
    },
    previous: keyRing.previous
      ? {
          hmac: hmacValue(
            keyRing.previous.secret,
            'respondent-cookie:v1',
            token,
          ),
          version: keyRing.previous.version,
        }
      : null,
  }
}

export function submissionCapabilityHmacs(
  token: string,
  keyRing: RespondentKeyRing,
) {
  return {
    active: {
      hmac: hmacValue(
        keyRing.active.secret,
        'submission-capability:v1',
        token,
      ),
      version: keyRing.active.version,
    },
    previous: keyRing.previous
      ? {
          hmac: hmacValue(
            keyRing.previous.secret,
            'submission-capability:v1',
            token,
          ),
          version: keyRing.previous.version,
        }
      : null,
  }
}

export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value)
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalJson(item)).join(',')}]`
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, child]) => `${JSON.stringify(key)}:${canonicalJson(child)}`)

  return `{${entries.join(',')}}`
}

export function sha256Value(value: unknown): string {
  return `\\x${createHash('sha256').update(canonicalJson(value)).digest('hex')}`
}
