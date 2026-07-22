import SurveyChoiceGroup from '@/components/survey-flow/SurveyChoiceGroup'
import { SurveyField, SurveySelect, surveyControlClass } from '@/components/survey-flow/SurveyField'
import {
  GHOSTED_AFTER_STAGES,
  IRRELEVANT_QUESTION_TYPES,
  RATING_SCALE,
} from '@/lib/constants/hrProcess'

export default function StepProcessReview({
  booleanOptions,
  copy,
  errors,
  selectPlaceholder,
  setField,
  state,
  warnings,
}) {
  return (
    <div className="space-y-7">
      <SurveyChoiceGroup
        name="promised-timeline"
        label={copy.fields.promisedTimeline.label}
        value={state.promisedTimeline}
        onChange={(value) => setField('promisedTimeline', value)}
        options={copy.fields.promisedTimeline.options}
        error={errors.promisedTimeline}
      />

      {state.promisedTimeline === 'yes' && (
        <SurveyField id="hr-promised-days" label={copy.fields.promisedDays.label} error={errors.promisedDays}>
          <input
            id="hr-promised-days"
            type="number"
            inputMode="numeric"
            min="0"
            value={state.promisedDays}
            onChange={(event) => setField('promisedDays', event.target.value)}
            placeholder="0"
            aria-invalid={Boolean(errors.promisedDays)}
            className={surveyControlClass}
          />
        </SurveyField>
      )}

      <SurveyChoiceGroup
        name="was-ghosted"
        label={copy.fields.wasGhosted.label}
        value={state.wasGhosted}
        onChange={(value) => setField('wasGhosted', value)}
        options={booleanOptions}
        error={errors.wasGhosted}
      />

      {state.wasGhosted === false && (
        <SurveyField id="hr-actual-days" label={copy.fields.actualDays.label} error={errors.actualDays}>
          <input
            id="hr-actual-days"
            type="number"
            inputMode="numeric"
            min="0"
            value={state.actualDays}
            onChange={(event) => setField('actualDays', event.target.value)}
            placeholder="0"
            aria-invalid={Boolean(errors.actualDays)}
            className={surveyControlClass}
          />
        </SurveyField>
      )}

      {state.wasGhosted === false && warnings.length > 0 && (
        <div className="border-l-2 border-warning bg-[var(--surface-muted)] px-4 py-3 text-sm leading-6 text-muted">
          {warnings[0]}
        </div>
      )}

      {state.wasGhosted === true && (
        <SurveyChoiceGroup
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

      <SurveyField id="hr-interviewer-prepared" label={copy.fields.interviewerPrepared.label}>
        <SurveySelect
          id="hr-interviewer-prepared"
          value={state.interviewerPrepared}
          onChange={(event) => setField('interviewerPrepared', event.target.value)}
        >
          <option value="">{selectPlaceholder}</option>
          {RATING_SCALE.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </SurveySelect>
      </SurveyField>

      <SurveyChoiceGroup
        name="was-asked-irrelevant"
        label={copy.fields.wasAskedIrrelevant.label}
        value={state.wasAskedIrrelevant}
        onChange={(value) => setField('wasAskedIrrelevant', value)}
        options={booleanOptions}
        error={errors.wasAskedIrrelevant}
      />

      {state.wasAskedIrrelevant === true && (
        <fieldset aria-describedby={errors.irrelevantTypes ? 'irrelevant-types-error' : undefined}>
          <legend className="text-sm font-semibold text-ink">
            {copy.fields.irrelevantTypes.label}
          </legend>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {IRRELEVANT_QUESTION_TYPES.map((type) => {
              const checked = state.irrelevantTypes.includes(type)
              return (
              <label
                key={type}
                className={`cursor-pointer border px-4 py-3 text-center text-sm font-medium leading-5 transition-[border-color,background-color,color,box-shadow] duration-200 focus-within:border-accent focus-within:ring-4 focus-within:ring-[var(--accent-ring)] ${checked ? 'border-accent bg-[var(--accent-soft)] text-accentDark' : 'border-[var(--line-strong)] bg-canvas text-muted hover:border-[var(--line-emphasis)] hover:bg-surface hover:text-ink'}`}
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
          {errors.irrelevantTypes && (
            <p id="irrelevant-types-error" className="mt-2 text-sm font-medium text-danger">
              {errors.irrelevantTypes}
            </p>
          )}
        </fieldset>
      )}
    </div>
  )
}
