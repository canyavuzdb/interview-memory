import SurveyChoiceGroup from '@/components/survey-flow/SurveyChoiceGroup'
import { SurveyField, SurveySelect, surveyControlClass } from '@/components/survey-flow/SurveyField'
import {
  EMPLOYMENT_TYPES,
  EXPERIENCE_BANDS,
  ROLE_LEVELS,
  SEARCH_STATUSES,
  SECTORS,
  TARGET_REGIONS,
  WORK_MODES,
} from '@/lib/constants/applicationBenchmark'

export default function StepContext({ copy, errors, setField, state }) {
  return (
    <div className="space-y-6">
      <SurveyField id="benchmark-role" label={copy.fields.role.label} error={errors.role}>
        <input
          id="benchmark-role"
          value={state.role}
          onChange={(event) => setField('role', event.target.value)}
          placeholder={copy.fields.role.placeholder}
          aria-invalid={Boolean(errors.role)}
          className={surveyControlClass}
        />
      </SurveyField>

      <div className="grid gap-5 sm:grid-cols-2">
        <SurveyField id="benchmark-sector" label={copy.fields.sector.label} error={errors.sector}>
          <SurveySelect
            id="benchmark-sector"
            value={state.sector}
            onChange={(event) => setField('sector', event.target.value)}
            aria-invalid={Boolean(errors.sector)}
          >
            <option value="">{copy.selectPlaceholder}</option>
            {SECTORS.map((sector) => (
              <option key={sector} value={sector}>{copy.fields.sector.options[sector]}</option>
            ))}
          </SurveySelect>
        </SurveyField>

        <SurveyField id="benchmark-role-level" label={copy.fields.roleLevel.label} error={errors.roleLevel}>
          <SurveySelect
            id="benchmark-role-level"
            value={state.roleLevel}
            onChange={(event) => setField('roleLevel', event.target.value)}
            aria-invalid={Boolean(errors.roleLevel)}
          >
            <option value="">{copy.selectPlaceholder}</option>
            {ROLE_LEVELS.map((level) => (
              <option key={level} value={level}>{copy.fields.roleLevel.options[level]}</option>
            ))}
          </SurveySelect>
        </SurveyField>

        <SurveyField id="experience-band" label={copy.fields.experienceBand.label} error={errors.experienceBand}>
          <SurveySelect
            id="experience-band"
            value={state.experienceBand}
            onChange={(event) => setField('experienceBand', event.target.value)}
            aria-invalid={Boolean(errors.experienceBand)}
          >
            <option value="">{copy.selectPlaceholder}</option>
            {EXPERIENCE_BANDS.map((band) => (
              <option key={band} value={band}>{copy.fields.experienceBand.options[band]}</option>
            ))}
          </SurveySelect>
        </SurveyField>

        <SurveyField id="benchmark-target-region" label={copy.fields.targetRegion.label} error={errors.targetRegion}>
          <SurveySelect
            id="benchmark-target-region"
            value={state.targetRegion}
            onChange={(event) => setField('targetRegion', event.target.value)}
            aria-invalid={Boolean(errors.targetRegion)}
          >
            <option value="">{copy.selectPlaceholder}</option>
            {TARGET_REGIONS.map((region) => (
              <option key={region} value={region}>{copy.fields.targetRegion.options[region]}</option>
            ))}
          </SurveySelect>
        </SurveyField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <SurveyField id="benchmark-employment-type" label={copy.fields.employmentType.label} error={errors.employmentType}>
          <SurveySelect
            id="benchmark-employment-type"
            value={state.employmentType}
            onChange={(event) => setField('employmentType', event.target.value)}
            aria-invalid={Boolean(errors.employmentType)}
          >
            <option value="">{copy.selectPlaceholder}</option>
            {EMPLOYMENT_TYPES.map((type) => (
              <option key={type} value={type}>{copy.fields.employmentType.options[type]}</option>
            ))}
          </SurveySelect>
        </SurveyField>

        <SurveyField id="work-mode" label={copy.fields.workMode.label} error={errors.workMode}>
          <SurveySelect
            id="work-mode"
            value={state.workMode}
            onChange={(event) => setField('workMode', event.target.value)}
            aria-invalid={Boolean(errors.workMode)}
          >
            <option value="">{copy.selectPlaceholder}</option>
            {WORK_MODES.map((mode) => (
              <option key={mode} value={mode}>{copy.fields.workMode.options[mode]}</option>
            ))}
          </SurveySelect>
        </SurveyField>
      </div>

      <SurveyChoiceGroup
        name="employment-status"
        label={copy.fields.isCurrentlyEmployed.label}
        value={state.isCurrentlyEmployed}
        onChange={(value) => setField('isCurrentlyEmployed', value)}
        options={copy.booleanOptions}
        error={errors.isCurrentlyEmployed}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <SurveyField id="search-started" label={copy.fields.searchStartedAt.label} error={errors.searchStartedAt}>
          <input
            id="search-started"
            type="month"
            value={state.searchStartedAt}
            onChange={(event) => setField('searchStartedAt', event.target.value)}
            aria-invalid={Boolean(errors.searchStartedAt)}
            className={surveyControlClass}
          />
        </SurveyField>

        <SurveyField id="search-status" label={copy.fields.searchStatus.label} error={errors.searchStatus}>
          <SurveySelect
            id="search-status"
            value={state.searchStatus}
            onChange={(event) => setField('searchStatus', event.target.value)}
            aria-invalid={Boolean(errors.searchStatus)}
          >
            <option value="">{copy.selectPlaceholder}</option>
            {SEARCH_STATUSES.map((status) => (
              <option key={status} value={status}>{copy.fields.searchStatus.options[status]}</option>
            ))}
          </SurveySelect>
        </SurveyField>
      </div>

      {state.searchStatus && state.searchStatus !== 'ongoing' && (
        <SurveyField id="search-ended" label={copy.fields.searchEndedAt.label} error={errors.searchEndedAt}>
          <input
            id="search-ended"
            type="month"
            value={state.searchEndedAt}
            onChange={(event) => setField('searchEndedAt', event.target.value)}
            aria-invalid={Boolean(errors.searchEndedAt)}
            className={surveyControlClass}
          />
        </SurveyField>
      )}
    </div>
  )
}
