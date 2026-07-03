import FieldError from '@/components/application-benchmark/FieldError'
import { SALARY_BANDS } from '@/lib/constants/applicationBenchmark'

const fieldClass =
  'mt-2 w-full border border-[var(--line-strong)] bg-canvas px-4 py-3 text-sm text-ink outline-none transition focus:border-accent'

export default function StepNumbersAndSalary({ copy, errors, setField, state, warnings }) {
  return (
    <div className="space-y-7">
      <div className="grid gap-4 sm:grid-cols-2">
        {copy.countFields.map((field) => (
          <div key={field.name}>
            <label htmlFor={field.name} className="text-sm font-semibold text-ink">
              {field.label}
            </label>
            <input
              id={field.name}
              type="number"
              inputMode="numeric"
              min="0"
              value={state[field.name]}
              onChange={(event) => setField(field.name, event.target.value)}
              placeholder="0"
              aria-invalid={Boolean(errors[field.name])}
              className={fieldClass}
            />
            <FieldError>{errors[field.name]}</FieldError>
          </div>
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

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {copy.salaryFields
            .filter((field) => field.name !== 'highestOfferBand' || Number(state.offersCount) > 0)
            .map((field) => (
              <div key={field.name}>
                <label htmlFor={field.name} className="text-sm font-semibold text-ink">
                  {field.label}
                </label>
                <select
                  id={field.name}
                  value={state[field.name]}
                  onChange={(event) => setField(field.name, event.target.value)}
                  className={fieldClass}
                >
                  <option value="">{copy.preferNotToSay}</option>
                  {SALARY_BANDS.map((band) => (
                    <option key={band.id} value={band.id}>{band.label}</option>
                  ))}
                </select>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
