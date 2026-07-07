import ChoiceGroup from '@/components/application-benchmark/ChoiceGroup'
import FieldError from '@/components/application-benchmark/FieldError'
import { RATING_SCALE, REJECTION_DETAIL_LEVELS } from '@/lib/constants/hrProcess'

const fieldClass =
  'mt-2 w-full border border-[var(--line-strong)] bg-canvas px-4 py-3 text-sm text-ink outline-none transition focus:border-accent'

export default function StepRatings({ copy, errors, selectPlaceholder, setField, state }) {
  return (
    <div className="space-y-7">
      <ChoiceGroup
        name="rejection-shared"
        label={copy.fields.rejectionShared.label}
        value={state.rejectionShared}
        onChange={(value) => setField('rejectionShared', value)}
        options={REJECTION_DETAIL_LEVELS.map((level) => ({
          value: level,
          label: copy.fields.rejectionShared.options[level],
        }))}
        error={errors.rejectionShared}
      />

      {state.rejectionShared && state.rejectionShared !== 'no' && (
        <div>
          <label htmlFor="hr-feedback-useful" className="text-sm font-semibold text-ink">
            {copy.fields.feedbackUseful.label}
          </label>
          <select
            id="hr-feedback-useful"
            value={state.feedbackUseful}
            onChange={(event) => setField('feedbackUseful', event.target.value)}
            className={fieldClass}
          >
            <option value="">{selectPlaceholder}</option>
            {RATING_SCALE.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="hr-process-transparency" className="text-sm font-semibold text-ink">
          {copy.fields.processTransparency.label}
        </label>
        <select
          id="hr-process-transparency"
          value={state.processTransparency}
          onChange={(event) => setField('processTransparency', event.target.value)}
          aria-invalid={Boolean(errors.processTransparency)}
          className={fieldClass}
        >
          <option value="">{selectPlaceholder}</option>
          {RATING_SCALE.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <FieldError>{errors.processTransparency}</FieldError>
      </div>

      <div>
        <label htmlFor="hr-professionalism" className="text-sm font-semibold text-ink">
          {copy.fields.hrProfessionalism.label}
        </label>
        <select
          id="hr-professionalism"
          value={state.hrProfessionalism}
          onChange={(event) => setField('hrProfessionalism', event.target.value)}
          aria-invalid={Boolean(errors.hrProfessionalism)}
          className={fieldClass}
        >
          <option value="">{selectPlaceholder}</option>
          {RATING_SCALE.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <FieldError>{errors.hrProfessionalism}</FieldError>
      </div>

      <ChoiceGroup
        name="would-recommend-process"
        label={copy.fields.wouldRecommendProcess.label}
        value={state.wouldRecommendProcess}
        onChange={(value) => setField('wouldRecommendProcess', value)}
        options={copy.fields.wouldRecommendProcess.options}
      />

      <div>
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="hr-free-note" className="text-sm font-semibold text-ink">
            {copy.fields.freeNote.label}
          </label>
          <span className="font-mono text-[9px] font-bold text-muted">
            {state.freeNote.length}/500
          </span>
        </div>
        <textarea
          id="hr-free-note"
          rows="5"
          maxLength="500"
          value={state.freeNote}
          onChange={(event) => setField('freeNote', event.target.value)}
          placeholder={copy.fields.freeNote.placeholder}
          aria-invalid={Boolean(errors.freeNote)}
          className="mt-2 w-full resize-none border border-[var(--line-strong)] bg-canvas px-4 py-3 text-sm leading-6 text-ink outline-none transition focus:border-accent"
        />
        <FieldError>{errors.freeNote}</FieldError>
      </div>
    </div>
  )
}
