import { SurveyFieldError } from '@/components/survey-flow/SurveyField'

export default function StepConsentReview({ copy, errors, setField, state }) {
  const errorId = errors.consentGranted ? 'benchmark-consent-error' : undefined

  return (
    <div className="space-y-7">
      <ul className="grid gap-3 border-y border-line py-4 text-sm leading-6 text-muted sm:grid-cols-3 sm:gap-5">
        {copy.reviewItems.map((item) => (
          <li key={item} className="flex gap-3">
            <span aria-hidden="true" className="mt-[0.65rem] h-1.5 w-1.5 shrink-0 bg-accent" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <section className={`border-l-2 pl-4 ${errors.consentGranted ? 'border-danger' : 'border-accent'}`}>
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-accentDark">
          {copy.consentEyebrow}
        </p>
        <label
          htmlFor="benchmark-consent"
          className="mt-3 flex cursor-pointer items-start gap-3 text-sm leading-6 text-ink"
        >
          <input
            id="benchmark-consent"
            type="checkbox"
            checked={state.consentGranted}
            onChange={(event) => setField('consentGranted', event.target.checked)}
            aria-invalid={Boolean(errors.consentGranted)}
            aria-describedby={errorId}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)]"
          />
          <span>{copy.consentNotice}</span>
        </label>
        <SurveyFieldError id={errorId}>{errors.consentGranted}</SurveyFieldError>
      </section>
    </div>
  )
}
