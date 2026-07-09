import SurveyChoiceGroup from '@/components/survey-flow/SurveyChoiceGroup'
import { SurveyField, surveyControlClass } from '@/components/survey-flow/SurveyField'
import { PROCESS_YEARS } from '@/lib/constants/hrProcess'

export default function StepCompanyInfo({ copy, errors, setField, state }) {
  return (
    <div className="space-y-6">
      <SurveyField id="hr-company-name" label={copy.fields.companyName.label} error={errors.companyName}>
        <input
          id="hr-company-name"
          value={state.companyName}
          onChange={(event) => setField('companyName', event.target.value)}
          placeholder={copy.fields.companyName.placeholder}
          aria-invalid={Boolean(errors.companyName)}
          className={surveyControlClass}
        />
      </SurveyField>

      <SurveyField id="hr-applied-role" label={copy.fields.appliedRole.label} error={errors.appliedRole}>
        <input
          id="hr-applied-role"
          value={state.appliedRole}
          onChange={(event) => setField('appliedRole', event.target.value)}
          placeholder={copy.fields.appliedRole.placeholder}
          aria-invalid={Boolean(errors.appliedRole)}
          className={surveyControlClass}
        />
      </SurveyField>

      <SurveyChoiceGroup
        name="process-year"
        label={copy.fields.processYear.label}
        value={state.processYear}
        onChange={(value) => setField('processYear', value)}
        options={PROCESS_YEARS.map((year) => ({ value: year, label: year }))}
        error={errors.processYear}
      />
    </div>
  )
}
