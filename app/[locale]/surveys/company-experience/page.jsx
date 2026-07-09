import { notFound } from 'next/navigation'
import HRProcessWizard from '@/components/hr-process/HRProcessWizard'
import SurveyPageHeader from '@/components/survey-flow/SurveyPageHeader'
import SurveyPurposeSection from '@/components/survey-flow/SurveyPurposeSection'
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
    <main className="landing-grid min-h-screen text-ink">
      <SurveyPageHeader
        copy={messages.common}
        locale={locale}
        path="/surveys/company-experience"
      />
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 md:py-12 lg:px-8">
        <HRProcessWizard
          copy={messages.hrProcessForm}
          sampleSize={messages.home.signal.sampleSize}
        />
        <SurveyPurposeSection copy={messages.hrProcessForm.explainer} />
      </div>
    </main>
  )
}   
