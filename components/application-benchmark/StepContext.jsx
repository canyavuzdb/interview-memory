import SurveyChoiceGroup from '@/components/survey-flow/SurveyChoiceGroup'
import { SurveyField, SurveySelect, surveyControlClass } from '@/components/survey-flow/SurveyField'
import {
  EMPLOYMENT_TYPES,
  EXPERIENCE_BANDS,
  JOB_ROLES,
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
        <SurveySelect
          id="benchmark-role"
          value={state.role}
          onChange={(event) => setField('role', event.target.value)}
          aria-invalid={Boolean(errors.role)}
        >
          <option value="">{copy.selectPlaceholder}</option>
          {JOB_ROLES.map((role) => (
            <option key={role} value={role}>{copy.fields.role.options[role]}</option>
          ))}
        </SurveySelect>
      </SurveyField>

      <div className="grid gap-5 sm:grid-cols-2">
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
      </div>

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

      <section className="border-t border-line pt-6" aria-labelledby="benchmark-optional-context-title">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h3 id="benchmark-optional-context-title" className="text-base font-semibold text-ink">
            {copy.optionalContextTitle}
          </h3>
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted">
            {copy.optional}
          </span>
        </div>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted">{copy.optionalContextNote}</p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <SurveyField id="benchmark-sector" label={copy.fields.sector.label}>
            <SurveySelect
              id="benchmark-sector"
              value={state.sector}
              onChange={(event) => setField('sector', event.target.value)}
            >
              <option value="">{copy.selectPlaceholder}</option>
              {SECTORS.map((sector) => (
                <option key={sector} value={sector}>{copy.fields.sector.options[sector]}</option>
              ))}
            </SurveySelect>
          </SurveyField>

          <SurveyField id="benchmark-employment-type" label={copy.fields.employmentType.label}>
            <SurveySelect
              id="benchmark-employment-type"
              value={state.employmentType}
              onChange={(event) => setField('employmentType', event.target.value)}
            >
              <option value="">{copy.selectPlaceholder}</option>
              {EMPLOYMENT_TYPES.map((type) => (
                <option key={type} value={type}>{copy.fields.employmentType.options[type]}</option>
              ))}
            </SurveySelect>
          </SurveyField>

          <SurveyField id="work-mode" label={copy.fields.workMode.label}>
            <SurveySelect
              id="work-mode"
              value={state.workMode}
              onChange={(event) => setField('workMode', event.target.value)}
            >
              <option value="">{copy.selectPlaceholder}</option>
              {WORK_MODES.map((mode) => (
                <option key={mode} value={mode}>{copy.fields.workMode.options[mode]}</option>
              ))}
            </SurveySelect>
          </SurveyField>
        </div>
      </section>
    </div>
  )
}
