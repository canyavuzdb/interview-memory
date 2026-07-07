import ChoiceGroup from '@/components/application-benchmark/ChoiceGroup'
import FieldError from '@/components/application-benchmark/FieldError'
import {
  GHOSTED_AFTER_STAGES,
  IRRELEVANT_QUESTION_TYPES,
  RATING_SCALE,
} from '@/lib/constants/hrProcess'

const fieldClass =
  'mt-2 w-full border border-[var(--line-strong)] bg-canvas px-4 py-3 text-sm text-ink outline-none transition focus:border-accent'

export default function StepProcessReview({ copy, errors, setField, state, warnings }) {
  return (
    <div className="space-y-7">
      <ChoiceGroup
        name="promised-timeline"
        label={copy.fields.promisedTimeline.label}
        value={state.promisedTimeline}
        onChange={(value) => setField('promisedTimeline', value)}
        options={copy.fields.promisedTimeline.options}
        error={errors.promisedTimeline}
      />

      {state.promisedTimeline === 'yes' && (
        <div>
          <label htmlFor="hr-promised-days" className="text-sm font-semibold text-ink">
            {copy.fields.promisedDays.label}
          </label>
          <input
            id="hr-promised-days"
            type="number"
            inputMode="numeric"
            min="0"
            value={state.promisedDays}
            onChange={(event) => setField('promisedDays', event.target.value)}
            placeholder="0"
            aria-invalid={Boolean(errors.promisedDays)}
            className={fieldClass}
          />
          <FieldError>{errors.promisedDays}</FieldError>
        </div>
      )}

      <div>
        <label htmlFor="hr-actual-days" className="text-sm font-semibold text-ink">
          {copy.fields.actualDays.label}
        </label>
        <input
          id="hr-actual-days"
          type="number"
          inputMode="numeric"
          min="0"
          value={state.actualDays}
          onChange={(event) => setField('actualDays', event.target.value)}
          placeholder="0"
          aria-invalid={Boolean(errors.actualDays)}
          className={fieldClass}
        />
        <FieldError>{errors.actualDays}</FieldError>
      </div>

      {warnings.length > 0 && (
        <div className="border-l-2 border-warning bg-[var(--surface-muted)] px-4 py-3 text-sm leading-6 text-muted">
          {warnings[0]}
        </div>
      )}

      <ChoiceGroup
        name="was-ghosted"
        label={copy.fields.wasGhosted.label}
        value={state.wasGhosted}
        onChange={(value) => setField('wasGhosted', value)}
        options={copy.booleanOptions}
        error={errors.wasGhosted}
      />

      {state.wasGhosted === true && (
        <ChoiceGroup
          name="ghosted-after-stage"
          label={copy.fields.ghostedAfterStage.label}
          value={state.ghostedAfterStage}
          onChange={(value) => setField('ghostedAfterStage', value)}
          options={GHOSTED_AFTER_STAGES.map((stage) => ({
            value: stage,
            label: copy.fields.ghostedAfterStage.options[stage],
          }))}
          error={errors.ghostedAfterStage}
        />
      )}

      <div>
        <label htmlFor="hr-interviewer-prepared" className="text-sm font-semibold text-ink">
          {copy.fields.interviewerPrepared.label}
        </label>
        <select
          id="hr-interviewer-prepared"
          value={state.interviewerPrepared}
          onChange={(event) => setField('interviewerPrepared', event.target.value)}
          className={fieldClass}
        >
          <option value="">{copy.selectPlaceholder}</option>
          {RATING_SCALE.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <ChoiceGroup
        name="was-asked-irrelevant"
        label={copy.fields.wasAskedIrrelevant.label}
        value={state.wasAskedIrrelevant}
        onChange={(value) => setField('wasAskedIrrelevant', value)}
        options={copy.booleanOptions}
        error={errors.wasAskedIrrelevant}
      />

      {state.wasAskedIrrelevant === true && (
        <fieldset>
          <legend className="text-sm font-semibold text-ink">
            {copy.fields.irrelevantTypes.label}
          </legend>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {IRRELEVANT_QUESTION_TYPES.map((type) => {
              const checked = state.irrelevantTypes.includes(type)
              return (
                <label
                  key={type}
                  className={`cursor-pointer border px-4 py-3 text-center text-sm font-medium transition ${checked ? 'border-accent bg-[var(--accent-soft)] text-accentDark' : 'border-[var(--line-strong)] bg-canvas text-muted hover:border-[var(--accent-border)] hover:text-ink'}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      const next = checked
                        ? state.irrelevantTypes.filter((t) => t !== type)
                        : [...state.irrelevantTypes, type]
                      setField('irrelevantTypes', next)
                    }}
                    className="sr-only"
                  />
                  {copy.fields.irrelevantTypes.options[type]}
                </label>
              )
            })}
          </div>
        </fieldset>
      )}
    </div>
  )
}
