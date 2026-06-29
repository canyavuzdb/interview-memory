import SurveyCard from './SurveyCard'

export default function SurveyCarousel({ copy, surveys }) {
  return (
    <section id="surveys" className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
      <div className="mb-8 flex min-h-[212px] flex-col justify-between gap-4 md:min-h-0 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            {copy.eyebrow}
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            {copy.title}
          </h2>
        </div>

        <p className="max-w-md text-sm leading-7 text-muted">
          {copy.description}
        </p>
      </div>

      <div className="flex snap-x gap-5 overflow-x-auto pb-4 lg:grid lg:grid-cols-2 lg:overflow-visible">
        {surveys.map((survey) => (
          <div key={survey.id} className="min-w-[88%] sm:min-w-[420px] lg:min-w-0">
            <SurveyCard survey={survey} />
          </div>
        ))}
      </div>
    </section>
  )
}
