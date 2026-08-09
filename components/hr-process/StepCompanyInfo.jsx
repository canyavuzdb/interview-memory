import SurveyChoiceGroup from '@/components/survey-flow/SurveyChoiceGroup'
import {
  SurveyField,
  SurveySelect,
  surveyControlClass,
} from '@/components/survey-flow/SurveyField'
import SurveyCompanyCombobox from '@/components/survey-flow/SurveyCompanyCombobox'
import SurveyRoleCombobox from '@/components/survey-flow/SurveyRoleCombobox'
import {
  APPLICATION_CHANNELS,
} from '@/lib/constants/hrProcess'

export default function StepCompanyInfo({
  booleanOptions,
  copy,
  errors,
  locale,
  selectPlaceholder,
  setField,
  state,
}) {
  return (
    <div className="space-y-6">
      {state.companySelection === 'not_listed' ? (
        <div className="border border-[var(--line-strong)] bg-[var(--accent-soft)] px-4 py-3">
          <p className="text-sm font-semibold text-accentDark">Şirket katalogda yok</p>
          <button
            type="button"
            className="mt-2 text-sm font-semibold text-accent underline underline-offset-4"
            onClick={() => {
              setField('companyName', '')
              setField('companySelection', '')
            }}
          >
            Katalogdan şirket seç
          </button>
        </div>
      ) : (
        <SurveyField id="hr-company-name" label={copy.fields.companyName.label} error={errors.companyName}>
          <SurveyCompanyCombobox
            id="hr-company-name"
            error={errors.companyName}
            locale={locale}
            value={state.companyName}
            onChange={(company) => {
              setField('companyName', company?.label ?? '')
              setField('companySelection', 'catalog')
            }}
            onNotListed={(query) => {
              setField('companyName', query)
              setField('companySelection', 'not_listed')
            }}
            placeholder={copy.fields.companyName.placeholder}
          />
        </SurveyField>
      )}

      {state.companySelection === 'not_listed' && (
        <SurveyField
          id="hr-unlisted-company-name"
          label="Şirketin tam adı (opsiyonel)"
          hint="Boş bırakabilirsin. Yazdığın ad katalogda zaten varsa eşleştirilir; yoksa doğrulanana kadar görünmeyen bir öneri olarak tutulur."
        >
          <input
            id="hr-unlisted-company-name"
            value={state.companyName}
            onChange={(event) => setField('companyName', event.target.value)}
            placeholder="Örn. Trendyol"
            className={surveyControlClass}
          />
        </SurveyField>
      )}

      <SurveyField id="hr-applied-role" label={copy.fields.appliedRole.label} error={errors.appliedRole}>
        <SurveyRoleCombobox
          id="hr-applied-role"
          error={errors.appliedRole}
          locale={locale}
          placeholder={copy.fields.appliedRole.placeholder}
          value={state.appliedRole ? { value: state.appliedRole, label: state.appliedRole } : null}
          onChange={(role) => setField('appliedRole', role?.label ?? '')}
        />
      </SurveyField>

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
            setField('processYear', event.target.value.slice(0, 4))
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
