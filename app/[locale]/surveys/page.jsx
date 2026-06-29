import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import PreferenceControls from '@/components/PreferenceControls'
import SurveyCarousel from '@/components/SurveyCarousel'
import { getMessages, isSupportedLocale } from '@/data/i18n'

export async function generateMetadata({ params }) {
  const { locale } = await params

  if (!isSupportedLocale(locale)) return {}

  return getMessages(locale).metadata.surveys
}

export default async function SurveysPage({ params }) {
  const { locale } = await params

  if (!isSupportedLocale(locale)) notFound()

  const messages = getMessages(locale)
  const surveys = messages.surveyCards.map((survey) => ({
    ...survey,
    href: `/${locale}${survey.path}`,
  }))

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-8 sm:px-6 lg:px-8">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
        >
          <ArrowLeft size={16} />
          {messages.common.backHome}
        </Link>
        <PreferenceControls
          locale={locale}
          path="/surveys"
          languageLabel={messages.common.languageLabel}
          themeLabel={messages.common.themeToggle}
          themeTitle={messages.common.themeTitle}
        />
      </div>

      <section className="mx-auto max-w-7xl px-5 pb-6 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
          {messages.surveyIndex.eyebrow}
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
          {messages.surveyIndex.title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-muted">
          {messages.surveyIndex.description}
        </p>
      </section>

      <SurveyCarousel copy={messages.surveyCarousel} surveys={surveys} />
    </main>
  )
}
