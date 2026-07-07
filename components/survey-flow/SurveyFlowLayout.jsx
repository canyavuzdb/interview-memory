import SurveyIntroPanel from '@/components/survey-flow/SurveyIntroPanel'

export default function SurveyFlowLayout({ children, introCopy, sampleSize }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
      <SurveyIntroPanel copy={introCopy} sampleSize={sampleSize} />
      <section className="min-w-0 border border-[var(--line-strong)] bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
        {children}
      </section>
    </div>
  )
}
