import {
  requireSiteUrl,
  requireSupabasePublishableKey,
  requireSupabaseUrl,
} from '@/lib/env/validation'

export function getPublicSupabaseEnvironment() {
  return {
    url: requireSupabaseUrl(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      'NEXT_PUBLIC_SUPABASE_URL',
    ),
    publishableKey: requireSupabasePublishableKey(
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    ),
  }
}

export function getPublicSiteUrl() {
  return requireSiteUrl(
    process.env.NEXT_PUBLIC_SITE_URL,
    'NEXT_PUBLIC_SITE_URL',
  )
}
