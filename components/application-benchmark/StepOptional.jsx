import ChoiceGroup from '@/components/application-benchmark/ChoiceGroup'
import FieldError from '@/components/application-benchmark/FieldError'

export default function StepOptional({ copy, errors, setField, state }) {
  return (
    <div className="space-y-7">
      <div className="border-l-2 border-accent bg-[var(--accent-soft)] px-4 py-3 text-sm leading-6 text-muted">
        {copy.optionalNote}
      </div>

      <ChoiceGroup
        name="had-referral"
        label={copy.fields.hadReferral.label}
        value={state.hadReferral}
        onChange={(value) => setField('hadReferral', value)}
        options={copy.booleanOptions}
      />

      <ChoiceGroup
        name="shared-portfolio"
        label={copy.fields.sharedPortfolio.label}
        value={state.sharedPortfolio}
        onChange={(value) => setField('sharedPortfolio', value)}
        options={copy.booleanOptions}
      />

      <div>
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="free-note" className="text-sm font-semibold text-ink">
            {copy.fields.freeNote.label}
          </label>
          <span className="font-mono text-[9px] font-bold text-muted">
            {state.freeNote.length}/300
          </span>
        </div>
        <textarea
          id="free-note"
          rows="5"
          maxLength="300"
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
