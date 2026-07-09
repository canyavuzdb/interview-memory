import { SurveyField, SurveySelect, surveyControlClass } from '@/components/survey-flow/SurveyField'
import { SALARY_BANDS, SALARY_CURRENCIES } from '@/lib/constants/applicationBenchmark'

export default function StepNumbersAndSalary({ copy, errors, setField, state, warnings }) {
  return (
    <div className="space-y-7">
      <div className="grid gap-4 sm:grid-cols-2">
        {copy.countFields.map((field) => (
          <SurveyField key={field.name} id={field.name} label={field.label} error={errors[field.name]}>
            <input
              id={field.name}
              type="number"
              inputMode="numeric"
              min="0"
              value={state[field.name]}
              onChange={(event) => setField(field.name, event.target.value)}
              placeholder="0"
              aria-invalid={Boolean(errors[field.name])}
              className={surveyControlClass}
            />
          </SurveyField>
        ))}
      </div>

      {warnings.length > 0 && (
        <div className="border-l-2 border-warning bg-[var(--surface-muted)] px-4 py-3 text-sm leading-6 text-muted">
          {warnings[0]}
        </div>
      )}

      <div className="border-t border-line pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="text-base font-semibold text-ink">{copy.salaryTitle}</h3>
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted">
            {copy.optional}
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted">{copy.salaryNote}</p>

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
      </div>
    </div>
  )
}
