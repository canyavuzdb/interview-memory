import FieldError from '@/components/application-benchmark/FieldError'
import { COMPANY_SIZES, APPLICATION_CHANNELS } from '@/lib/constants/companyExperience'

const fieldClass =
  'mt-2 w-full border border-[var(--line-strong)] bg-canvas px-4 py-3 text-sm text-ink outline-none transition focus:border-accent'

export default function StepCompanyDetails({ copy, errors, setField, state }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="company-name" className="text-sm font-semibold text-ink">
            {copy.fields.companyName.label}
          </label>
          <input
            id="company-name"
            value={state.companyName}
            onChange={(event) => setField('companyName', event.target.value)}
            placeholder={copy.fields.companyName.placeholder}
            aria-invalid={Boolean(errors.companyName)}
            className={fieldClass}
          />
          <FieldError>{errors.companyName}</FieldError>
        </div>
        <div>
          <label htmlFor="applied-role" className="text-sm font-semibold text-ink">
            {copy.fields.appliedRole.label}
          </label>
          <input
            id="applied-role"
            value={state.appliedRole}
            onChange={(event) => setField('appliedRole', event.target.value)}
            placeholder={copy.fields.appliedRole.placeholder}
            aria-invalid={Boolean(errors.appliedRole)}
            className={fieldClass}
          />
          <FieldError>{errors.appliedRole}</FieldError>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="company-sector" className="text-sm font-semibold text-ink">
            {copy.fields.companySector.label}
          </label>
          <select
            id="company-sector"
            value={state.companySector}
            onChange={(event) => setField('companySector', event.target.value)}
            aria-invalid={Boolean(errors.companySector)}
            className={fieldClass}
          >
            <option value="">{copy.selectPlaceholder}</option>
            {Object.keys(copy.fields.companySector.options).map((key) => (
              <option key={key} value={key}>{copy.fields.companySector.options[key]}</option>
            ))}
          </select>
          <FieldError>{errors.companySector}</FieldError>
        </div>

        <div>
          <label htmlFor="company-size" className="text-sm font-semibold text-ink">
            {copy.fields.companySize.label}
          </label>
          <select
            id="company-size"
            value={state.companySize}
            onChange={(event) => setField('companySize', event.target.value)}
            aria-invalid={Boolean(errors.companySize)}
            className={fieldClass}
          >
            <option value="">{copy.selectPlaceholder}</option>
            {COMPANY_SIZES.map((size) => (
              <option key={size} value={size}>{copy.fields.companySize.options[size]}</option>
            ))}
          </select>
          <FieldError>{errors.companySize}</FieldError>
        </div>
      </div>

      <div>
        <label htmlFor="application-channel" className="text-sm font-semibold text-ink">
          {copy.fields.applicationChannel.label}
        </label>
        <select
          id="application-channel"
          value={state.applicationChannel}
          onChange={(event) => setField('applicationChannel', event.target.value)}
          aria-invalid={Boolean(errors.applicationChannel)}
          className={fieldClass}
        >
          <option value="">{copy.selectPlaceholder}</option>
          {APPLICATION_CHANNELS.map((channel) => (
            <option key={channel} value={channel}>{copy.fields.applicationChannel.options[channel]}</option>
          ))}
        </select>
        <FieldError>{errors.applicationChannel}</FieldError>
      </div>
    </div>
  )
}
