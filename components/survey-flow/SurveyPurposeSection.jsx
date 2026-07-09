export default function SurveyPurposeSection({ copy }) {
  if (!copy) return null

  return (
    <section
      aria-labelledby="survey-purpose-title"
      className="mt-16 border-t border-[var(--line-strong)] py-14 sm:mt-20 sm:py-20"
    >
      <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-accent">
            {copy.eyebrow}
          </p>
          <h2
            id="survey-purpose-title"
            className="mt-4 max-w-xl text-3xl font-semibold tracking-[-0.045em] text-ink sm:text-4xl"
          >
            {copy.title}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted">
            {copy.intro}
          </p>
        </div>

        <div className="space-y-12">
          <section>
            <h3 className="text-xl font-semibold tracking-[-0.025em] text-ink">
              {copy.whyTitle}
            </h3>
            <div className="mt-6 divide-y divide-[var(--line-strong)] border-y border-[var(--line-strong)]">
              {copy.reasons.map((reason, index) => (
                <article key={reason.title} className="grid gap-3 py-5 sm:grid-cols-[3.5rem_1fr]">
                  <span className="font-mono text-[10px] font-bold tracking-[0.1em] text-accentDark">
                    {String(index + 1).padStart(2, '0')}/
                  </span>
                  <div>
                    <h4 className="font-semibold text-ink">{reason.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-muted">{reason.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold tracking-[-0.025em] text-ink">
              {copy.measurementTitle}
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
              {copy.measurementDescription}
            </p>
            <ul className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {copy.metrics.map((metric, index) => (
                <li
                  key={metric}
                  className="flex items-start gap-3 border-t border-line pt-3 font-mono text-[10px] font-bold uppercase leading-5 tracking-[0.08em] text-ink"
                >
                  <span className="text-accentDark">{String(index + 1).padStart(2, '0')}</span>
                  <span>{metric}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold tracking-[-0.025em] text-ink">
              {copy.howTitle}
            </h3>
            <ol className="mt-6 grid gap-4 sm:grid-cols-3">
              {copy.steps.map((step, index) => (
                <li key={step.title} className="border-l border-[var(--line-strong)] pl-4">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-accent">
                    0{index + 1}
                  </p>
                  <h4 className="mt-3 text-sm font-semibold text-ink">{step.title}</h4>
                  <p className="mt-2 text-xs leading-5 text-muted">{step.description}</p>
                </li>
              ))}
            </ol>
          </section>

          <aside className="border-l-2 border-accent px-5 py-1">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-accentDark">
              {copy.transparencyTitle}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">{copy.transparencyText}</p>
          </aside>
        </div>
      </div>
    </section>
  )
}
