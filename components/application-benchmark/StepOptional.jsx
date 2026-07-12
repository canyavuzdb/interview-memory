import SurveyChoiceGroup from '@/components/survey-flow/SurveyChoiceGroup'
import { SurveyField, SurveySelect, surveyControlClass } from '@/components/survey-flow/SurveyField'
import { SALARY_BANDS, SALARY_CURRENCIES } from '@/lib/constants/applicationBenchmark'

export default function StepOptional({ copy, errors, setField, state }) {
  return (
    <div className="space-y-7">
      <div className="border-l-2 border-accent bg-[var(--accent-soft)] px-4 py-3 text-sm leading-6 text-muted">
        {copy.optionalNote}
      </div>

      <section className="border-t border-line pt-6" aria-labelledby="benchmark-salary-title">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h3 id="benchmark-salary-title" className="text-base font-semibold text-ink">{copy.salaryTitle}</h3>
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted">{copy.optional}</span>
        </div>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted">{copy.salaryNote}</p>

        <SurveyField
          className="mt-5 max-w-xs"
          id="salaryCurrency"
          label={copy.salaryCurrency.label}
          error={errors.salaryCurrency}
        >
          <SurveySelect
            id="salaryCurrency"
            value={state.salaryCurrency}
            onChange={(event) => setField('salaryCurrency', event.target.value)}
            aria-invalid={Boolean(errors.salaryCurrency)}
          >
            <option value="">{copy.preferNotToSay}</option>
            {SALARY_CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </SurveySelect>
        </SurveyField>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {copy.salaryFields
            .filter((field) => field.name !== 'highestOfferBand' || Number(state.offersCount) > 0)
            .map((field) => (
              <SurveyField key={field.name} id={field.name} label={field.label}>
                <SurveySelect
                  id={field.name}
                  value={state[field.name]}
                  onChange={(event) => setField(field.name, event.target.value)}
                >
                  <option value="">{copy.preferNotToSay}</option>
                  {SALARY_BANDS.map((band) => (
                    <option key={band.id} value={band.id}>{band.label}</option>
                  ))}
                </SurveySelect>
              </SurveyField>
            ))}
        </div>
      </section>

      <section className="border-t border-line pt-6" aria-labelledby="benchmark-signal-title">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h3 id="benchmark-signal-title" className="text-base font-semibold text-ink">{copy.signalTitle}</h3>
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted">{copy.optional}</span>
        </div>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted">{copy.signalNote}</p>

        <div className="mt-5 space-y-7">
          <SurveyChoiceGroup
            name="had-referral"
            label={copy.fields.hadReferral.label}
            value={state.hadReferral}
            onChange={(value) => setField('hadReferral', value)}
            options={copy.booleanOptions}
          />

          <SurveyChoiceGroup
            name="shared-portfolio"
            label={copy.fields.sharedPortfolio.label}
            value={state.sharedPortfolio}
            onChange={(value) => setField('sharedPortfolio', value)}
            options={copy.booleanOptions}
          />
        </div>
      </section>

      <SurveyField
        id="free-note"
        label={copy.fields.freeNote.label}
        error={errors.freeNote}
        labelAccessory={<span className="font-mono text-[9px] font-bold text-muted">{state.freeNote.length}/300</span>}
      >
        <textarea
          id="free-note"
          rows="5"
          maxLength="300"
          value={state.freeNote}
          onChange={(event) => setField('freeNote', event.target.value)}
          placeholder={copy.fields.freeNote.placeholder}
          aria-invalid={Boolean(errors.freeNote)}
          className={`${surveyControlClass} resize-none leading-6`}
        />
      </SurveyField>
    </div>
  )
}
