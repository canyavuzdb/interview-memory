import SurveyChoiceGroup from '@/components/survey-flow/SurveyChoiceGroup'
import { SurveyField, surveyControlClass } from '@/components/survey-flow/SurveyField'

export default function StepOptional({ copy, errors, setField, state }) {
  return (
    <div className="space-y-7">
      <div className="border-l-2 border-accent bg-[var(--accent-soft)] px-4 py-3 text-sm leading-6 text-muted">
        {copy.optionalNote}
      </div>

      <SurveyChoiceGroup
        name="had-referral"
        label={copy.fields.hadReferral.label}
        value={state.hadReferral}
        onChange={(value) => setField('hadReferral', value)}
        options={copy.booleanOptions}
      />

      <SurveyChoiceGroup
        name="shared-portfolio"
        label={copy.fields.sharedPortfolio.label}
        value={state.sharedPortfolio}
        onChange={(value) => setField('sharedPortfolio', value)}
        options={copy.booleanOptions}
      />

      <SurveyField
        id="free-note"
        label={copy.fields.freeNote.label}
        error={errors.freeNote}
        labelAccessory={<span className="font-mono text-[9px] font-bold text-muted">{state.freeNote.length}/300</span>}
      >
        <textarea
          id="free-note"
          rows="5"
          maxLength="300"
          value={state.freeNote}
          onChange={(event) => setField('freeNote', event.target.value)}
          placeholder={copy.fields.freeNote.placeholder}
          aria-invalid={Boolean(errors.freeNote)}
          className={`${surveyControlClass} resize-none leading-6`}
        />
      </SurveyField>
    </div>
  )
}
