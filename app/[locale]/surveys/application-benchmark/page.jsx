import { notFound } from 'next/navigation'
import ApplicationBenchmarkWizard from '@/components/application-benchmark/ApplicationBenchmarkWizard'
import PublicHeader from '@/components/PublicHeader'
import SurveyPurposeSection from '@/components/survey-flow/SurveyPurposeSection'
import { getMessages, isSupportedLocale } from '@/data/i18n'

export async function generateMetadata({ params }) {
  const { locale } = await params

  if (!isSupportedLocale(locale)) return {}

  return getMessages(locale).metadata.applicationBenchmark
}

export default async function ApplicationBenchmarkSurveyPage({ params }) {
  const { locale } = await params

  if (!isSupportedLocale(locale)) notFound()

  const messages = getMessages(locale)
  const alternateMessages = getMessages(locale === 'tr' ? 'en' : 'tr')

  return (
    <main className="landing-grid min-h-screen text-ink">
      <PublicHeader
        alternateCopy={alternateMessages.header}
        common={messages.common}
        copy={messages.header}
        locale={locale}
        path="/surveys/application-benchmark"
      />

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 md:py-12 lg:px-8">
        <ApplicationBenchmarkWizard
          copy={messages.benchmarkForm}
          locale={locale}
          sampleSize={messages.home.signal.sampleSize}
        />
        <SurveyPurposeSection copy={messages.benchmarkForm.explainer} />
      </div>
    </main>
  )
}
