import SurveyChoiceGroup from '@/components/survey-flow/SurveyChoiceGroup'
import { SurveyField, surveyControlClass } from '@/components/survey-flow/SurveyField'

const MAX_FUNNEL_COUNT = 10_000

function formatCount(value, locale) {
  if (value === '') return ''

  return new Intl.NumberFormat(locale === 'tr' ? 'tr-TR' : 'en-US').format(Number(value))
}

function CountField({ errors, field, locale, setField, state }) {
  return (
    <SurveyField id={field.name} label={field.label} error={errors[field.name]} hint={field.hint} required={field.required}>
      <input
        id={field.name}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={formatCount(state[field.name], locale)}
        onChange={(event) => {
          const digits = event.target.value.replace(/\D/g, '')
          const value = digits === '' ? '' : String(Math.min(Number(digits), MAX_FUNNEL_COUNT))
          setField(field.name, value)
        }}
        placeholder="0"
        aria-invalid={Boolean(errors[field.name])}
        className={surveyControlClass}
      />
    </SurveyField>
  )
}

export default function StepFunnel({ copy, errors, locale, setField, state, warnings }) {
  const primaryFields = copy.countFields.filter((field) => field.required)
  const detailFields = copy.countFields.filter((field) => !field.required)

  return (
    <div className="space-y-7">
      <div className="grid gap-x-5 gap-y-6 md:grid-cols-3">
        {primaryFields.map((field) => (
          <CountField key={field.name} errors={errors} field={field} locale={locale} setField={setField} state={state} />
        ))}
      </div>

      <details className="border-y border-line py-4">
        <summary className="cursor-pointer list-none text-sm font-semibold text-ink marker:content-none">
          <span>{copy.detailFieldsTitle}</span>
          <span className="ml-2 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted">
            {copy.optional}
          </span>
        </summary>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted">{copy.detailFieldsNote}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {detailFields.map((field) => (
            <CountField key={field.name} errors={errors} field={field} locale={locale} setField={setField} state={state} />
          ))}
        </div>
      </details>

      <SurveyChoiceGroup
        name="counts-are-estimated"
        label={copy.fields.countsAreEstimated.label}
        value={state.countsAreEstimated}
        onChange={(value) => setField('countsAreEstimated', value)}
        options={copy.booleanOptions}
        error={errors.countsAreEstimated}
        required
      />

      {warnings.length > 0 && (
        <aside className="border-l-2 border-warning bg-[var(--surface-muted)] px-4 py-3 text-sm leading-6 text-muted">
          {warnings[0]}
        </aside>
      )}

      <aside className="border-t border-line pt-5">
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted">
          {copy.helperEyebrow}
        </p>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted">{copy.helperText}</p>
      </aside>
    </div>
  )
}
