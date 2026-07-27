import { notFound } from 'next/navigation'
import InformationPage from '@/components/InformationPage'
import { getMessages, isSupportedLocale, supportedLocales } from '@/data/i18n'

const slugs = ['about', 'faq', 'contact', 'privacy', 'terms']

export function generateStaticParams() {
  return supportedLocales.flatMap((locale) => slugs.map((info) => ({ locale, info })))
}

export async function generateMetadata({ params }) {
  const { info, locale } = await params
  if (!isSupportedLocale(locale) || !slugs.includes(info)) return {}
  return { title: `${getMessages(locale).infoPages[info].title} — Interview Memory` }
}

export default async function InfoRoute({ params }) {
  const { info, locale } = await params
  if (!isSupportedLocale(locale) || !slugs.includes(info)) notFound()
  const messages = getMessages(locale)
  return <InformationPage alternateMessages={getMessages(locale === 'tr' ? 'en' : 'tr')} locale={locale} messages={messages} page={messages.infoPages[info]} slug={info} />
}
