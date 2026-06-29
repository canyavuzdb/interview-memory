import { notFound } from 'next/navigation'
import { isSupportedLocale, supportedLocales } from '@/data/i18n'

export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params

  if (!isSupportedLocale(locale)) notFound()

  return <div lang={locale}>{children}</div>
}
