import ChoiceGroup from '@/components/application-benchmark/ChoiceGroup'
import FieldError from '@/components/application-benchmark/FieldError'
import {
  EMPLOYMENT_TYPES,
  EXPERIENCE_BANDS,
  ROLE_LEVELS,
  SEARCH_STATUSES,
  SECTORS,
  TARGET_REGIONS,
  WORK_MODES,
} from '@/lib/constants/applicationBenchmark'

const fieldClass =
  'mt-2 w-full border border-[var(--line-strong)] bg-canvas px-4 py-3 text-sm text-ink outline-none transition focus:border-accent'

export default function StepContext({ copy, errors, setField, state }) {
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="benchmark-role" className="text-sm font-semibold text-ink">
          {copy.fields.role.label}
        </label>
        <input
          id="benchmark-role"
          value={state.role}
          onChange={(event) => setField('role', event.target.value)}
          placeholder={copy.fields.role.placeholder}
          aria-invalid={Boolean(errors.role)}
          aria-describedby={errors.role ? 'benchmark-role-error' : undefined}
          className={fieldClass}
        />
        <FieldError id="benchmark-role-error">{errors.role}</FieldError>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="benchmark-sector" className="text-sm font-semibold text-ink">
            {copy.fields.sector.label}
          </label>
          <select
            id="benchmark-sector"
            value={state.sector}
            onChange={(event) => setField('sector', event.target.value)}
            aria-invalid={Boolean(errors.sector)}
            className={fieldClass}
          >
            <option value="">{copy.selectPlaceholder}</option>
            {SECTORS.map((sector) => (
              <option key={sector} value={sector}>{copy.fields.sector.options[sector]}</option>
            ))}
          </select>
          <FieldError>{errors.sector}</FieldError>
        </div>

        <div>
          <label htmlFor="benchmark-role-level" className="text-sm font-semibold text-ink">
            {copy.fields.roleLevel.label}
          </label>
          <select
            id="benchmark-role-level"
            value={state.roleLevel}
            onChange={(event) => setField('roleLevel', event.target.value)}
            aria-invalid={Boolean(errors.roleLevel)}
            className={fieldClass}
          >
            <option value="">{copy.selectPlaceholder}</option>
            {ROLE_LEVELS.map((level) => (
              <option key={level} value={level}>{copy.fields.roleLevel.options[level]}</option>
            ))}
          </select>
          <FieldError>{errors.roleLevel}</FieldError>
        </div>

        <div>
          <label htmlFor="experience-band" className="text-sm font-semibold text-ink">
            {copy.fields.experienceBand.label}
          </label>
          <select
            id="experience-band"
            value={state.experienceBand}
            onChange={(event) => setField('experienceBand', event.target.value)}
            aria-invalid={Boolean(errors.experienceBand)}
            className={fieldClass}
          >
            <option value="">{copy.selectPlaceholder}</option>
            {EXPERIENCE_BANDS.map((band) => (
              <option key={band} value={band}>{copy.fields.experienceBand.options[band]}</option>
            ))}
          </select>
          <FieldError>{errors.experienceBand}</FieldError>
        </div>

        <div>
          <label htmlFor="benchmark-target-region" className="text-sm font-semibold text-ink">
            {copy.fields.targetRegion.label}
          </label>
          <select
            id="benchmark-target-region"
            value={state.targetRegion}
            onChange={(event) => setField('targetRegion', event.target.value)}
            aria-invalid={Boolean(errors.targetRegion)}
            className={fieldClass}
          >
            <option value="">{copy.selectPlaceholder}</option>
            {TARGET_REGIONS.map((region) => (
              <option key={region} value={region}>{copy.fields.targetRegion.options[region]}</option>
            ))}
          </select>
          <FieldError>{errors.targetRegion}</FieldError>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="benchmark-employment-type" className="text-sm font-semibold text-ink">
            {copy.fields.employmentType.label}
          </label>
          <select
            id="benchmark-employment-type"
            value={state.employmentType}
            onChange={(event) => setField('employmentType', event.target.value)}
            aria-invalid={Boolean(errors.employmentType)}
            className={fieldClass}
          >
            <option value="">{copy.selectPlaceholder}</option>
            {EMPLOYMENT_TYPES.map((type) => (
              <option key={type} value={type}>{copy.fields.employmentType.options[type]}</option>
            ))}
          </select>
          <FieldError>{errors.employmentType}</FieldError>
        </div>

        <div>
          <label htmlFor="work-mode" className="text-sm font-semibold text-ink">
            {copy.fields.workMode.label}
          </label>
          <select
            id="work-mode"
            value={state.workMode}
            onChange={(event) => setField('workMode', event.target.value)}
            aria-invalid={Boolean(errors.workMode)}
            className={fieldClass}
          >
            <option value="">{copy.selectPlaceholder}</option>
            {WORK_MODES.map((mode) => (
              <option key={mode} value={mode}>{copy.fields.workMode.options[mode]}</option>
            ))}
          </select>
          <FieldError>{errors.workMode}</FieldError>
        </div>
      </div>

      <ChoiceGroup
        name="employment-status"
        label={copy.fields.isCurrentlyEmployed.label}
        value={state.isCurrentlyEmployed}
        onChange={(value) => setField('isCurrentlyEmployed', value)}
        options={copy.booleanOptions}
        error={errors.isCurrentlyEmployed}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="search-started" className="text-sm font-semibold text-ink">
            {copy.fields.searchStartedAt.label}
          </label>
          <input
            id="search-started"
            type="month"
            value={state.searchStartedAt}
            onChange={(event) => setField('searchStartedAt', event.target.value)}
            aria-invalid={Boolean(errors.searchStartedAt)}
            className={fieldClass}
          />
          <FieldError>{errors.searchStartedAt}</FieldError>
        </div>

        <div>
          <label htmlFor="search-status" className="text-sm font-semibold text-ink">
            {copy.fields.searchStatus.label}
          </label>
          <select
            id="search-status"
            value={state.searchStatus}
            onChange={(event) => setField('searchStatus', event.target.value)}
            aria-invalid={Boolean(errors.searchStatus)}
            className={fieldClass}
          >
            <option value="">{copy.selectPlaceholder}</option>
            {SEARCH_STATUSES.map((status) => (
              <option key={status} value={status}>{copy.fields.searchStatus.options[status]}</option>
            ))}
          </select>
          <FieldError>{errors.searchStatus}</FieldError>
        </div>
      </div>

      {state.searchStatus && state.searchStatus !== 'ongoing' && (
        <div>
          <label htmlFor="search-ended" className="text-sm font-semibold text-ink">
            {copy.fields.searchEndedAt.label}
          </label>
          <input
            id="search-ended"
            type="month"
            value={state.searchEndedAt}
            onChange={(event) => setField('searchEndedAt', event.target.value)}
            aria-invalid={Boolean(errors.searchEndedAt)}
            className={fieldClass}
          />
          <FieldError>{errors.searchEndedAt}</FieldError>
        </div>
      )}
    </div>
  )
}
