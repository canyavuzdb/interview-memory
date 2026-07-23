import SurveyChoiceGroup from '@/components/survey-flow/SurveyChoiceGroup'
import {
  SurveyField,
  SurveySelect,
  surveyControlClass,
} from '@/components/survey-flow/SurveyField'
import {
  APPLICATION_CHANNELS,
  PROCESS_YEARS,
} from '@/lib/constants/hrProcess'

export default function StepCompanyInfo({
  booleanOptions,
  copy,
  errors,
  selectPlaceholder,
  setField,
  state,
}) {
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

      <SurveyField
        id="hr-application-month"
        label={copy.fields.applicationMonth.label}
        error={errors.applicationMonth}
      >
        <input
          id="hr-application-month"
          type="month"
          value={state.applicationMonth}
          onChange={(event) => {
            setField('applicationMonth', event.target.value)
            if (event.target.value) {
              setField('processYear', event.target.value.slice(0, 4))
            }
          }}
          aria-invalid={Boolean(errors.applicationMonth)}
          className={surveyControlClass}
        />
      </SurveyField>

      <SurveyField
        id="hr-application-channel"
        label={copy.fields.applicationChannel.label}
        error={errors.applicationChannel}
      >
        <SurveySelect
          id="hr-application-channel"
          value={state.applicationChannel}
          onChange={(event) => setField('applicationChannel', event.target.value)}
        >
          <option value="">{selectPlaceholder}</option>
          {APPLICATION_CHANNELS.map((channel) => (
            <option key={channel} value={channel}>
              {copy.fields.applicationChannel.options[channel]}
            </option>
          ))}
        </SurveySelect>
      </SurveyField>

      <SurveyChoiceGroup
        name="had-referral"
        label={copy.fields.hadReferral.label}
        value={state.hadReferral}
        onChange={(value) => setField('hadReferral', value)}
        options={booleanOptions}
        error={errors.hadReferral}
      />
    </div>
  )
}
