import { describe, expect, it, vi } from 'vitest'

import { ModerationServiceError } from '@/lib/moderation/errors'
import { resolveModerationActor } from '@/lib/server/moderation/actor'

const userId = '11111111-1111-4111-8111-111111111111'

describe('moderation actor', () => {
  it('returns the verified active account id', async () => {
    await expect(
      resolveModerationActor(
        vi.fn().mockResolvedValue({ userId }) as never,
      ),
    ).resolves.toEqual({ userId })
  })

  it.each([
    vi.fn().mockResolvedValue(null),
    vi.fn().mockRejectedValue(new Error('private')),
  ])('requires an active authenticated account', async (resolver) => {
    await expect(
      resolveModerationActor(resolver as never),
    ).rejects.toBeInstanceOf(ModerationServiceError)
  })
})
