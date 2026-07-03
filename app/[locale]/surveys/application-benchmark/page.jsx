import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import ApplicationBenchmarkWizard from '@/components/application-benchmark/ApplicationBenchmarkWizard'
import PreferenceControls from '@/components/PreferenceControls'
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

  return (
    <main className="landing-grid min-h-screen text-ink">
      <header className="border-b border-[var(--line-strong)] bg-[var(--nav-surface)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-6 lg:px-8">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            {messages.common.backHome}
          </Link>
          <PreferenceControls
            locale={locale}
            path="/surveys/application-benchmark"
            languageLabel={messages.common.languageLabel}
            themeLabel={messages.common.themeToggle}
            themeTitle={messages.common.themeTitle}
          />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 md:py-12 lg:px-8">
        <ApplicationBenchmarkWizard
          copy={messages.benchmarkForm}
          sampleSize={messages.home.signal.sampleSize}
        />
      </div>
    </main>
  )
}
