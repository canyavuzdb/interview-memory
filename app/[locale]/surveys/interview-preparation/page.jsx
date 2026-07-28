import { notFound } from 'next/navigation'

import InterviewPreparationContributionForm from '@/components/interview-preparation/InterviewPreparationContributionForm'
import PublicHeader from '@/components/PublicHeader'
import SurveyFlowLayout from '@/components/survey-flow/SurveyFlowLayout'
import { getMessages, isSupportedLocale } from '@/data/i18n'

export default async function InterviewPreparationSurveyPage({ params }) {
  const { locale } = await params
  if (!isSupportedLocale(locale)) notFound()
  const messages = getMessages(locale)
  const alternateMessages = getMessages(locale === 'tr' ? 'en' : 'tr')
  const formCopy = {
    ...messages.interviewPreparation.contribution,
    formats: messages.interviewPreparation.formats,
    questionOutcomes: messages.interviewPreparation.questionOutcomes,
    questionTypes: messages.interviewPreparation.questionTypes,
    seniorities: messages.interviewPreparation.seniorities,
    skills: messages.interviewPreparation.skills,
    stages: messages.interviewPreparation.stages,
    topics: messages.interviewPreparation.topics,
  }

  return (
    <main className="landing-grid min-h-screen text-ink">
      <PublicHeader
        alternateCopy={alternateMessages.header}
        common={messages.common}
        copy={messages.header}
        locale={locale}
        path="/surveys/interview-preparation"
      />
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 md:py-12 lg:px-8">
        <SurveyFlowLayout introCopy={messages.interviewPreparation.contribution.intro} sampleSize={messages.home.signal.sampleSize} survey="interview-preparation">
          <InterviewPreparationContributionForm copy={formCopy} locale={locale} />
        </SurveyFlowLayout>
      </div>
    </main>
  )
}
