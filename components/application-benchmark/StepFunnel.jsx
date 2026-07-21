import SurveyChoiceGroup from '@/components/survey-flow/SurveyChoiceGroup'
import { SurveyField, surveyControlClass } from '@/components/survey-flow/SurveyField'

export default function StepFunnel({ copy, errors, setField, state, warnings }) {
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

      <SurveyChoiceGroup
        name="counts-are-estimated"
        label={copy.fields.countsAreEstimated.label}
        value={state.countsAreEstimated}
        onChange={(value) => setField('countsAreEstimated', value)}
        options={copy.booleanOptions}
        error={errors.countsAreEstimated}
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
