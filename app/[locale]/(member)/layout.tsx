import { redirect } from 'next/navigation'

import { authLocaleSchema } from '@/lib/auth/contracts'
import { getLoginPath } from '@/lib/auth/navigation'
import { resolveActiveAccount } from '@/lib/server/auth/session'

export default async function MemberLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale: rawLocale } = await params
  const locale = authLocaleSchema.parse(rawLocale)
  const account = await resolveActiveAccount()

  if (!account) {
    redirect(
      getLoginPath(locale, {
        next: `/${locale}/account`,
        status: 'sessionRequired',
      }),
    )
  }

  return children
}
