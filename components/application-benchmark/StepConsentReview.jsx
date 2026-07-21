import { SurveyFieldError } from '@/components/survey-flow/SurveyField'

export default function StepConsentReview({ copy, errors, setField, state }) {
  const errorId = errors.consentGranted ? 'benchmark-consent-error' : undefined

  return (
    <div className="space-y-7">
      <section className="border border-[var(--line-strong)] bg-[var(--surface-muted)] p-5">
        <h3 className="text-base font-semibold text-ink">{copy.reviewTitle}</h3>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-muted">
          {copy.reviewItems.map((item) => (
            <li key={item} className="flex gap-3">
              <span aria-hidden="true" className="mt-[0.65rem] h-1 w-1 shrink-0 bg-accent" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-l-2 border-accent bg-[var(--accent-soft)] px-5 py-5">
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-accentDark">
          {copy.consentEyebrow}
        </p>
        <label
          htmlFor="benchmark-consent"
          className="mt-4 flex cursor-pointer items-start gap-3 text-sm font-semibold leading-6 text-ink"
        >
          <input
            id="benchmark-consent"
            type="checkbox"
            checked={state.consentGranted}
            onChange={(event) => setField('consentGranted', event.target.checked)}
            aria-invalid={Boolean(errors.consentGranted)}
            aria-describedby={errorId}
            className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]"
          />
          <span>{copy.consentNotice}</span>
        </label>
        <SurveyFieldError id={errorId}>{errors.consentGranted}</SurveyFieldError>
      </section>
    </div>
  )
}
