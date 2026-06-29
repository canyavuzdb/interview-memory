import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, BarChart3 } from 'lucide-react'
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
  const copy = messages.benchmarkForm

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
          >
            <ArrowLeft size={16} />
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

        <div className="mt-10 rounded-[2rem] border border-line bg-surface p-6 shadow-sm md:p-8">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-surface">
            <BarChart3 size={23} />
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            {copy.eyebrow}
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
            {copy.title}
          </h1>

          <p className="mt-5 text-base leading-8 text-muted">
            {copy.description}
          </p>

          <div className="mt-8 rounded-2xl border border-line bg-canvas p-4 text-sm leading-7 text-muted">
            {copy.warning}
          </div>

          <form className="mt-8 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold">{copy.targetRole}</span>
                <input
                  className="w-full rounded-2xl border border-line bg-canvas px-4 py-3 text-sm outline-none transition focus:border-accent"
                  placeholder={copy.targetRolePlaceholder}
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold">{copy.experienceYears}</span>
                <input
                  type="number"
                  min="0"
                  className="w-full rounded-2xl border border-line bg-canvas px-4 py-3 text-sm outline-none transition focus:border-accent"
                  placeholder={copy.experienceYearsPlaceholder}
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-2">
                <span className="text-sm font-semibold">{copy.period}</span>
                <select className="w-full rounded-2xl border border-line bg-canvas px-4 py-3 text-sm outline-none transition focus:border-accent">
                  {copy.periodOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold">{copy.workModel}</span>
                <select className="w-full rounded-2xl border border-line bg-canvas px-4 py-3 text-sm outline-none transition focus:border-accent">
                  {copy.workModelOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold">{copy.englishLevel}</span>
                <select className="w-full rounded-2xl border border-line bg-canvas px-4 py-3 text-sm outline-none transition focus:border-accent">
                  {copy.englishLevelOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {copy.countLabels.map((label) => (
                <label key={label} className="space-y-2">
                  <span className="text-sm font-semibold">{label}</span>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-2xl border border-line bg-canvas px-4 py-3 text-sm outline-none transition focus:border-accent"
                    placeholder="0"
                  />
                </label>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-2">
                <span className="text-sm font-semibold">{copy.referredApplications}</span>
                <input
                  type="number"
                  min="0"
                  className="w-full rounded-2xl border border-line bg-canvas px-4 py-3 text-sm outline-none transition focus:border-accent"
                  placeholder="0"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold">{copy.portfolio}</span>
                <select className="w-full rounded-2xl border border-line bg-canvas px-4 py-3 text-sm outline-none transition focus:border-accent">
                  {copy.portfolioOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold">{copy.github}</span>
                <select className="w-full rounded-2xl border border-line bg-canvas px-4 py-3 text-sm outline-none transition focus:border-accent">
                  {copy.githubOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>

            <button
              type="button"
              className="w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-surface transition hover:-translate-y-0.5 hover:bg-accentDark"
            >
              {copy.submit}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
