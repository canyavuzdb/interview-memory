import SurveyCard from './SurveyCard'

export default function SurveyCarousel({ copy, surveys }) {
  return (
    <section id="surveys" className="mx-auto max-w-7xl px-5 pb-24 sm:px-6 lg:px-8">
      <div className="grid gap-6 border-y border-[var(--line-strong)] py-7 md:grid-cols-[11rem_minmax(0,1fr)_minmax(16rem,24rem)] md:items-center md:gap-10 lg:gap-14">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-accent">
          {copy.eyebrow}
        </p>
        <div>
          <h2 className="max-w-2xl text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
            {copy.title}
          </h2>
        </div>

        <p className="max-w-md text-sm leading-6 text-muted">
          {copy.description}
        </p>
      </div>

      <div className="mt-8 space-y-6">
        {surveys.map((survey) => (
          <SurveyCard
            key={survey.id}
            survey={survey}
            includesLabel={copy.includesLabel}
          />
        ))}
      </div>
    </section>
  )
}
