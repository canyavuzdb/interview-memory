import ChoiceGroup from '@/components/application-benchmark/ChoiceGroup'
import FieldError from '@/components/application-benchmark/FieldError'
import { PROCESS_STAGES } from '@/lib/constants/companyExperience'

const fieldClass =
  'mt-2 w-full border border-[var(--line-strong)] bg-canvas px-4 py-3 text-sm text-ink outline-none transition focus:border-accent'

export default function StepProcessOutcome({ copy, errors, setField, state, warnings }) {
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="last-stage" className="text-sm font-semibold text-ink">
          {copy.fields.lastStage.label}
        </label>
        <select
          id="last-stage"
          value={state.lastStage}
          onChange={(event) => setField('lastStage', event.target.value)}
          aria-invalid={Boolean(errors.lastStage)}
          className={fieldClass}
        >
          <option value="">{copy.selectPlaceholder}</option>
          {PROCESS_STAGES.map((stage) => (
            <option key={stage} value={stage}>{copy.fields.lastStage.options[stage]}</option>
          ))}
        </select>
        <FieldError>{errors.lastStage}</FieldError>
      </div>

      <ChoiceGroup
        name="got-response"
        label={copy.fields.gotResponse.label}
        value={state.gotResponse}
        onChange={(value) => setField('gotResponse', value)}
        options={copy.booleanOptions}
        error={errors.gotResponse}
      />

      {state.gotResponse === true && (
        <div className="w-full sm:w-1/2">
          <label htmlFor="response-time" className="text-sm font-semibold text-ink">
            {copy.fields.responseTimeDays.label}
          </label>
          <div className="relative mt-2">
            <input
              id="response-time"
              type="number"
              value={state.responseTimeDays}
              onChange={(event) => setField('responseTimeDays', event.target.value)}
              className="w-full border border-[var(--line-strong)] bg-canvas py-3 pl-4 pr-16 text-sm text-ink outline-none transition focus:border-accent"
            />
            <span className="absolute inset-y-0 right-4 flex items-center text-sm text-muted">{copy.fields.responseTimeDays.suffix}</span>
          </div>
          <FieldError>{errors.responseTimeDays}</FieldError>
        </div>
      )}

      {warnings.length > 0 && (
        <ul className="mt-4 list-disc space-y-1 pl-4 text-sm text-accent">
          {warnings.map((w, idx) => (
            <li key={idx}>{w}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
