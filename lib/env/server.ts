import 'server-only'

import { requireSupabaseSecretKey } from '@/lib/env/validation'

export function getServerSupabaseEnvironment() {
  return {
    secretKey: requireSupabaseSecretKey(
      process.env.SUPABASE_SECRET_KEY,
      'SUPABASE_SECRET_KEY',
    ),
  }
}
