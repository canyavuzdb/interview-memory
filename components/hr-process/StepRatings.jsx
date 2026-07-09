import SurveyChoiceGroup from '@/components/survey-flow/SurveyChoiceGroup'
import { SurveyField, SurveySelect, surveyControlClass } from '@/components/survey-flow/SurveyField'
import { RATING_SCALE, REJECTION_DETAIL_LEVELS } from '@/lib/constants/hrProcess'

export default function StepRatings({ copy, errors, selectPlaceholder, setField, state }) {
  return (
    <div className="space-y-7">
      <SurveyChoiceGroup
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
        <SurveyField id="hr-feedback-useful" label={copy.fields.feedbackUseful.label}>
          <SurveySelect
            id="hr-feedback-useful"
            value={state.feedbackUseful}
            onChange={(event) => setField('feedbackUseful', event.target.value)}
          >
            <option value="">{selectPlaceholder}</option>
            {RATING_SCALE.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </SurveySelect>
        </SurveyField>
      )}

      <SurveyField
        id="hr-process-transparency"
        label={copy.fields.processTransparency.label}
        error={errors.processTransparency}
      >
        <SurveySelect
          id="hr-process-transparency"
          value={state.processTransparency}
          onChange={(event) => setField('processTransparency', event.target.value)}
          aria-invalid={Boolean(errors.processTransparency)}
        >
          <option value="">{selectPlaceholder}</option>
          {RATING_SCALE.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </SurveySelect>
      </SurveyField>

      <SurveyField id="hr-professionalism" label={copy.fields.hrProfessionalism.label} error={errors.hrProfessionalism}>
        <SurveySelect
          id="hr-professionalism"
          value={state.hrProfessionalism}
          onChange={(event) => setField('hrProfessionalism', event.target.value)}
          aria-invalid={Boolean(errors.hrProfessionalism)}
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
        name="would-recommend-process"
        label={copy.fields.wouldRecommendProcess.label}
        value={state.wouldRecommendProcess}
        onChange={(value) => setField('wouldRecommendProcess', value)}
        options={copy.fields.wouldRecommendProcess.options}
      />

      <SurveyField
        id="hr-free-note"
        label={copy.fields.freeNote.label}
        error={errors.freeNote}
        labelAccessory={<span className="font-mono text-[9px] font-bold text-muted">{state.freeNote.length}/500</span>}
      >
        <textarea
          id="hr-free-note"
          rows="5"
          maxLength="500"
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
