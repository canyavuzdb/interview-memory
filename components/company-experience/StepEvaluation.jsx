import ChoiceGroup from '@/components/application-benchmark/ChoiceGroup'
import FieldError from '@/components/application-benchmark/FieldError'
import { EXPERIENCE_RATINGS } from '@/lib/constants/companyExperience'

const fieldClass =
  'mt-2 w-full border border-[var(--line-strong)] bg-canvas px-4 py-3 text-sm text-ink outline-none transition focus:border-accent'

export default function StepEvaluation({ copy, errors, setField, state }) {
  return (
    <div className="space-y-8">
      <div>
        <label className="text-sm font-semibold text-ink block mb-4">
          {copy.fields.overallExperience.label}
        </label>
        <div className="flex gap-2">
          {EXPERIENCE_RATINGS.map((rating) => {
            const isSelected = Number(state.overallExperience) === rating
            return (
              <button
                key={rating}
                type="button"
                onClick={() => setField('overallExperience', rating)}
                className={`flex h-12 flex-1 items-center justify-center border text-sm font-semibold transition-colors ${
                  isSelected
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-[var(--line-strong)] bg-canvas text-muted hover:border-accent/50 hover:text-ink'
                }`}
              >
                {rating}
              </button>
            )
          })}
        </div>
        <div className="flex justify-between mt-2 text-[10px] uppercase font-semibold text-muted tracking-wide">
          <span>{copy.fields.overallExperience.minLabel}</span>
          <span>{copy.fields.overallExperience.maxLabel}</span>
        </div>
        <FieldError>{errors.overallExperience}</FieldError>
      </div>

      <hr className="border-[var(--line-strong)] opacity-50" />

      <ChoiceGroup
        name="would-reapply"
        label={copy.fields.wouldReapply.label}
        value={state.wouldReapply}
        onChange={(value) => setField('wouldReapply', value)}
        options={copy.booleanOptions}
        error={errors.wouldReapply}
      />

      <div>
        <label htmlFor="free-note" className="text-sm font-semibold text-ink">
          {copy.fields.freeNote.label}
        </label>
        <textarea
          id="free-note"
          value={state.freeNote}
          onChange={(event) => setField('freeNote', event.target.value)}
          placeholder={copy.fields.freeNote.placeholder}
          className={`${fieldClass} min-h-24 resize-none`}
        />
        <FieldError>{errors.freeNote}</FieldError>
      </div>
    </div>
  )
}
