import { notFound } from 'next/navigation'
import SurveyCarousel from '@/components/SurveyCarousel'
import SurveyPageHeader from '@/components/survey-flow/SurveyPageHeader'
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
  const activeSurveyIds = new Set(['application-benchmark', 'company-experience'])
  const surveys = messages.surveyCards
    .filter((survey) => activeSurveyIds.has(survey.id))
    .map((survey) => ({
      ...survey,
      href: `/${locale}${survey.path}`,
    }))

  return (
    <main className="landing-grid min-h-screen text-ink">
      <SurveyPageHeader copy={messages.common} locale={locale} path="/surveys" />

      <section className="mx-auto grid max-w-7xl gap-12 px-5 pb-14 pt-16 sm:px-6 md:pb-20 md:pt-20 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end lg:px-8">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-accent">
            {messages.surveyIndex.eyebrow}
          </p>
          <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-ink sm:text-6xl">
            {messages.surveyIndex.title}
          </h1>
        </div>

        <div className="border-l border-[var(--line-strong)] pl-5 sm:pl-7">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
            {messages.surveyIndex.activeCount}
          </p>
          <p className="mt-4 text-base leading-7 text-muted">
            {messages.surveyIndex.description}
          </p>
        </div>
      </section>

      <SurveyCarousel copy={messages.surveyCarousel} surveys={surveys} />
    </main>
  )
}
