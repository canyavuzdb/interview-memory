import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import PreferenceControls from '@/components/PreferenceControls'
import CompanyExperienceWizard from '@/components/company-experience/CompanyExperienceWizard'
import { getMessages, isSupportedLocale } from '@/data/i18n'

export async function generateMetadata({ params }) {
  const { locale } = await params

  if (!isSupportedLocale(locale)) return {}

  return getMessages(locale).metadata.companyExperience
}

export default async function CompanyExperienceSurveyPage({ params }) {
  const { locale } = await params

  if (!isSupportedLocale(locale)) notFound()

  const messages = getMessages(locale)

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
            path="/surveys/company-experience"
            languageLabel={messages.common.languageLabel}
            themeLabel={messages.common.themeToggle}
            themeTitle={messages.common.themeTitle}
          />
        </div>

        <div className="mt-10">
          <CompanyExperienceWizard
            copy={messages.companyExperienceForm}
            sampleSize={messages.home.signal.sampleSize}
          />
        </div>
      </div>
    </main>
  )
}
