/**
 * Locale-neutral preview of the reporting API contract.
 *
 * All values are illustrative. Keeping labels out of this file makes it
 * possible to replace the preview with an API response without coupling the
 * reporting model to a locale or to the presentation layer.
 */
const illustrativeCompanyPrefixes = [
  'Aster',
  'Beacon',
  'Cobalt',
  'Delta',
  'Ember',
  'Fable',
  'Grove',
  'Harbor',
  'Ilex',
  'Juniper',
  'Kora',
  'Meridian',
  'Nera',
  'Onyx',
  'Pera',
  'Quartz',
  'Rota',
  'Solace',
  'Tera',
  'Umber',
  'Vela',
  'Willow',
  'Yonda',
  'Zenith',
]

const illustrativeCompanySegments = [
  'Analytics',
  'Commerce',
  'Digital',
  'Energy',
  'Finance',
  'Health',
  'Logistics',
  'Systems',
]

const illustrativeRoleProfiles = [
  { id: 'backend_development', roleFamily: 'software' },
  { id: 'frontend_development', roleFamily: 'software' },
  { id: 'full_stack_development', roleFamily: 'software' },
  { id: 'mobile_development', roleFamily: 'software' },
  { id: 'game_development', roleFamily: 'software' },
  { id: 'embedded_systems', roleFamily: 'software' },
  { id: 'devops_engineering', roleFamily: 'software' },
  { id: 'cloud_engineering', roleFamily: 'software' },
  { id: 'security_engineering', roleFamily: 'software' },
  { id: 'solutions_architecture', roleFamily: 'software' },
  { id: 'data_analysis', roleFamily: 'data_ai' },
  { id: 'data_engineering', roleFamily: 'data_ai' },
  { id: 'data_science', roleFamily: 'data_ai' },
  { id: 'machine_learning', roleFamily: 'data_ai' },
  { id: 'ai_engineering', roleFamily: 'data_ai' },
  { id: 'business_intelligence', roleFamily: 'data_ai' },
  { id: 'analytics_engineering', roleFamily: 'data_ai' },
  { id: 'mlops_engineering', roleFamily: 'data_ai' },
  { id: 'product_management', roleFamily: 'product' },
  { id: 'product_ownership', roleFamily: 'product' },
  { id: 'growth_product', roleFamily: 'product' },
  { id: 'technical_product', roleFamily: 'product' },
  { id: 'product_operations', roleFamily: 'product' },
  { id: 'product_marketing', roleFamily: 'product' },
  { id: 'product_design', roleFamily: 'design' },
  { id: 'ux_research', roleFamily: 'design' },
  { id: 'ui_design', roleFamily: 'design' },
  { id: 'interaction_design', roleFamily: 'design' },
  { id: 'service_design', roleFamily: 'design' },
  { id: 'content_design', roleFamily: 'design' },
  { id: 'quality_assurance', roleFamily: 'platform_quality' },
  { id: 'test_automation', roleFamily: 'platform_quality' },
  { id: 'site_reliability', roleFamily: 'platform_quality' },
  { id: 'platform_engineering', roleFamily: 'platform_quality' },
  { id: 'release_engineering', roleFamily: 'platform_quality' },
  { id: 'systems_administration', roleFamily: 'platform_quality' },
  { id: 'business_analysis', roleFamily: 'business_operations' },
  { id: 'operations_management', roleFamily: 'business_operations' },
  { id: 'project_management', roleFamily: 'business_operations' },
  { id: 'customer_success', roleFamily: 'business_operations' },
  { id: 'sales_operations', roleFamily: 'business_operations' },
  { id: 'financial_analysis', roleFamily: 'business_operations' },
  { id: 'human_resources', roleFamily: 'business_operations' },
  { id: 'talent_acquisition', roleFamily: 'business_operations' },
  { id: 'management_consulting', roleFamily: 'business_operations' },
]

const illustrativeRoleSeniorities = ['junior', 'mid', 'senior']
const illustrativeMonths = [
  '2026-01',
  '2026-02',
  '2026-03',
  '2026-04',
  '2026-05',
  '2026-06',
]

function buildIllustrativeCompanyResponsiveness(count) {
  return Array.from({ length: count }, (_, index) => {
    const prefix = illustrativeCompanyPrefixes[
      Math.floor(index / illustrativeCompanySegments.length) % illustrativeCompanyPrefixes.length
    ]
    const segment = illustrativeCompanySegments[index % illustrativeCompanySegments.length]
    const seed = index + 17
    const eligibleMatureApplicationsCount = 24 + ((seed * 37) % 212)
    const noUpdateBasisPoints = 1800 + ((seed * 977) % 4100)
    const interviewedApplicationsCount = Math.max(
      8,
      Math.round(eligibleMatureApplicationsCount * (0.18 + ((seed * 13) % 25) / 100)),
    )
    const postInterviewBasisPoints = 700 + ((seed * 613) % 3300)

    return {
      id: `${prefix}-${segment}`.toLowerCase(),
      company: `${prefix} ${segment}`,
      eligibleMatureApplicationsCount,
      noSubstantiveUpdateCount: Math.max(
        1,
        Math.round(eligibleMatureApplicationsCount * noUpdateBasisPoints / 10000),
      ),
      interviewedApplicationsCount,
      postInterviewNoFollowUpCount: Math.max(
        1,
        Math.round(interviewedApplicationsCount * postInterviewBasisPoints / 10000),
      ),
      contributorsCount: Math.max(
        10,
        eligibleMatureApplicationsCount - 4 - ((seed * 11) % 18),
      ),
    }
  })
}

function distributeMonthlyApplications(total, seed) {
  const weights = Array.from(
    { length: 6 },
    (_, monthIndex) => 72 + ((seed * (monthIndex + 3) * 17 + monthIndex * 29) % 59),
  )
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  const values = weights.map((weight) => Math.floor(total * weight / totalWeight))
  let remainder = total - values.reduce((sum, value) => sum + value, 0)
  let offset = 0

  while (remainder > 0) {
    values[(seed + offset) % values.length] += 1
    remainder -= 1
    offset += 1
  }

  return values
}

function buildIllustrativeCompanyFunnels(count) {
  return Array.from({ length: count }, (_, index) => {
    const prefix = illustrativeCompanyPrefixes[
      Math.floor(index / illustrativeCompanySegments.length) % illustrativeCompanyPrefixes.length
    ]
    const segment = illustrativeCompanySegments[index % illustrativeCompanySegments.length]
    const seed = index + 23
    const applicationsCount = 36 + ((seed * 43) % 365)
    const responsesCount = Math.max(
      8,
      Math.round(applicationsCount * (0.28 + ((seed * 17) % 40) / 100)),
    )
    const interviewsCount = Math.min(
      responsesCount,
      Math.max(
        3,
        Math.round(applicationsCount * (0.1 + ((seed * 13) % 24) / 100)),
      ),
    )
    const offersCount = Math.max(
      1,
      Math.round(interviewsCount * (0.18 + ((seed * 11) % 29) / 100)),
    )
    const employmentStartedCount = Math.max(
      1,
      Math.round(offersCount * (0.45 + ((seed * 7) % 34) / 100)),
    )
    const salaryMinimum = 45000 + ((seed * 5) % 16) * 5000

    return {
      id: `${prefix}-${segment}`.toLowerCase(),
      company: `${prefix} ${segment}`,
      uniqueCandidates: Math.max(10, applicationsCount - 4 - ((seed * 11) % 28)),
      applicationsCount,
      responsesCount,
      interviewsCount,
      offersCount,
      employmentStartedCount,
      acceptedSalarySampleSize: Math.max(
        0,
        employmentStartedCount - ((seed * 5) % 4),
      ),
      medianAcceptedSalary: {
        min: salaryMinimum,
        max: seed % 5 === 0 ? null : salaryMinimum + (seed % 3 === 0 ? 20000 : 10000),
        currency: 'TRY',
      },
      monthlyApplications: distributeMonthlyApplications(applicationsCount, seed),
    }
  })
}

function buildIllustrativeRoleBenchmarks() {
  return illustrativeRoleProfiles.flatMap((profile, profileIndex) => (
    illustrativeRoleSeniorities.map((seniority, seniorityIndex) => {
      const seed = profileIndex * illustrativeRoleSeniorities.length + seniorityIndex + 31
      const applicationsCount = 32 + ((seed * 47) % 284)
      const uniqueCandidates = Math.max(
        10,
        applicationsCount - 5 - ((seed * 7) % 31),
      )
      const matureSearchEpisodesCount = Math.max(
        6,
        Math.round(uniqueCandidates * (0.42 + ((seed * 11) % 30) / 100)),
      )
      const responsesCount = Math.max(
        5,
        Math.round(applicationsCount * (0.26 + ((seed * 17) % 42) / 100)),
      )
      const interviewsCount = Math.min(
        responsesCount,
        Math.max(
          2,
          Math.round(applicationsCount * (0.09 + ((seed * 13) % 26) / 100)),
        ),
      )
      const offersCount = Math.max(
        1,
        Math.round(interviewsCount * (0.16 + ((seed * 5) % 31) / 100)),
      )
      const employmentStartedCount = Math.min(
        matureSearchEpisodesCount,
        Math.max(
          1,
          Math.round(offersCount * (0.44 + ((seed * 7) % 35) / 100)),
        ),
      )

      return {
        id: `${profile.id}-${seniority}`,
        roleFamily: profile.roleFamily,
        roleSpecialization: profile.id,
        seniority,
        uniqueCandidates,
        matureSearchEpisodesCount,
        responsesCount,
        interviewsCount,
        offersCount,
        employmentStartedCount,
        monthlyApplications: distributeMonthlyApplications(applicationsCount, seed)
          .map((count, monthIndex) => ({
            month: illustrativeMonths[monthIndex],
            count,
          })),
      }
    })
  ))
}

export const benchmarkPreviewReport = {
  meta: {
    status: 'illustrative',
    generatedAt: '2026-07-12',
    periodStart: '2026-01',
    periodEnd: '2026-06',
    region: 'turkiye',
    recordCount: 1248,
    uniqueCandidates: 866,
    minPublicCohortSize: 10,
    minSalarySampleSize: 10,
  },
  roleMonthly: [
    {
      id: 'software',
      roleFamily: 'software',
      uniqueCandidates: 318,
      matureSearchEpisodesCount: 196,
      responsesCount: 378,
      interviewsCount: 177,
      offersCount: 48,
      employmentStartedCount: 29,
      monthlyApplications: [
        { month: '2026-01', count: 148 },
        { month: '2026-02', count: 156 },
        { month: '2026-03', count: 171 },
        { month: '2026-04', count: 183 },
        { month: '2026-05', count: 191 },
        { month: '2026-06', count: 204 },
      ],
    },
    {
      id: 'data-ai',
      roleFamily: 'data_ai',
      uniqueCandidates: 148,
      matureSearchEpisodesCount: 91,
      responsesCount: 185,
      interviewsCount: 92,
      offersCount: 29,
      employmentStartedCount: 16,
      monthlyApplications: [
        { month: '2026-01', count: 64 },
        { month: '2026-02', count: 69 },
        { month: '2026-03', count: 73 },
        { month: '2026-04', count: 78 },
        { month: '2026-05', count: 86 },
        { month: '2026-06', count: 94 },
      ],
    },
    {
      id: 'product',
      roleFamily: 'product',
      uniqueCandidates: 121,
      matureSearchEpisodesCount: 74,
      responsesCount: 126,
      interviewsCount: 58,
      offersCount: 18,
      employmentStartedCount: 9,
      monthlyApplications: [
        { month: '2026-01', count: 58 },
        { month: '2026-02', count: 61 },
        { month: '2026-03', count: 56 },
        { month: '2026-04', count: 67 },
        { month: '2026-05', count: 72 },
        { month: '2026-06', count: 70 },
      ],
    },
    {
      id: 'design',
      roleFamily: 'design',
      uniqueCandidates: 102,
      matureSearchEpisodesCount: 62,
      responsesCount: 91,
      interviewsCount: 43,
      offersCount: 12,
      employmentStartedCount: 6,
      monthlyApplications: [
        { month: '2026-01', count: 44 },
        { month: '2026-02', count: 49 },
        { month: '2026-03', count: 51 },
        { month: '2026-04', count: 48 },
        { month: '2026-05', count: 56 },
        { month: '2026-06', count: 63 },
      ],
    },
    {
      id: 'platform-quality',
      roleFamily: 'platform_quality',
      uniqueCandidates: 94,
      matureSearchEpisodesCount: 57,
      responsesCount: 104,
      interviewsCount: 52,
      offersCount: 15,
      employmentStartedCount: 8,
      monthlyApplications: [
        { month: '2026-01', count: 38 },
        { month: '2026-02', count: 41 },
        { month: '2026-03', count: 46 },
        { month: '2026-04', count: 50 },
        { month: '2026-05', count: 49 },
        { month: '2026-06', count: 55 },
      ],
    },
    {
      id: 'business-operations',
      roleFamily: 'business_operations',
      uniqueCandidates: 83,
      matureSearchEpisodesCount: 49,
      responsesCount: 79,
      interviewsCount: 34,
      offersCount: 10,
      employmentStartedCount: 5,
      monthlyApplications: [
        { month: '2026-01', count: 31 },
        { month: '2026-02', count: 35 },
        { month: '2026-03', count: 39 },
        { month: '2026-04', count: 42 },
        { month: '2026-05', count: 40 },
        { month: '2026-06', count: 47 },
      ],
    },
    ...buildIllustrativeRoleBenchmarks(),
  ],
  companyFunnel: [
    {
      id: 'northstar-fintech',
      company: 'Northstar Fintech',
      uniqueCandidates: 162,
      applicationsCount: 174,
      responsesCount: 98,
      interviewsCount: 47,
      offersCount: 24,
      employmentStartedCount: 15,
      acceptedSalarySampleSize: 12,
      medianAcceptedSalary: { min: 80000, max: 100000, currency: 'TRY' },
      monthlyApplications: [25, 27, 28, 31, 30, 33],
    },
    {
      id: 'luma-commerce',
      company: 'Luma Commerce',
      uniqueCandidates: 138,
      applicationsCount: 146,
      responsesCount: 91,
      interviewsCount: 51,
      offersCount: 20,
      employmentStartedCount: 14,
      acceptedSalarySampleSize: 11,
      medianAcceptedSalary: { min: 60000, max: 80000, currency: 'TRY' },
      monthlyApplications: [21, 23, 22, 25, 27, 28],
    },
    {
      id: 'orbit-labs',
      company: 'Orbit Labs',
      uniqueCandidates: 112,
      applicationsCount: 119,
      responsesCount: 46,
      interviewsCount: 21,
      offersCount: 8,
      employmentStartedCount: 4,
      acceptedSalarySampleSize: 4,
      medianAcceptedSalary: { min: 100000, max: null, currency: 'TRY' },
      monthlyApplications: [18, 21, 19, 20, 22, 19],
    },
    {
      id: 'atlas-retail',
      company: 'Atlas Retail',
      uniqueCandidates: 104,
      applicationsCount: 111,
      responsesCount: 64,
      interviewsCount: 29,
      offersCount: 12,
      employmentStartedCount: 8,
      acceptedSalarySampleSize: 7,
      medianAcceptedSalary: { min: 50000, max: 60000, currency: 'TRY' },
      monthlyApplications: [16, 17, 20, 18, 19, 21],
    },
    {
      id: 'nova-systems',
      company: 'Nova Systems',
      uniqueCandidates: 91,
      applicationsCount: 97,
      responsesCount: 52,
      interviewsCount: 27,
      offersCount: 14,
      employmentStartedCount: 9,
      acceptedSalarySampleSize: 8,
      medianAcceptedSalary: { min: 80000, max: 100000, currency: 'TRY' },
      monthlyApplications: [13, 15, 16, 17, 18, 18],
    },
    {
      id: 'marmara-health',
      company: 'Marmara Health',
      uniqueCandidates: 76,
      applicationsCount: 82,
      responsesCount: 49,
      interviewsCount: 18,
      offersCount: 7,
      employmentStartedCount: 5,
      acceptedSalarySampleSize: 3,
      medianAcceptedSalary: { min: 40000, max: 50000, currency: 'TRY' },
      monthlyApplications: [11, 12, 13, 14, 15, 17],
    },
    ...buildIllustrativeCompanyFunnels(178),
  ],
  activityTiming: {
    meta: {
      status: 'illustrative',
      period: 'rolling_12_months',
      source: 'candidate_reported_aggregate',
      metricDefinitionVersion: '2.0',
      minimumPublicSample: 10,
    },
    candidateTempo: {
      rows: [
        {
          durationBand: 'one_month',
          cells: [
            { paceBand: 'under_five', episodeCount: 18, applicationsCount: 54, responsesCount: 18, offersCount: 2 },
            { paceBand: 'five_to_nine', episodeCount: 34, applicationsCount: 238, responsesCount: 91, offersCount: 12 },
            { paceBand: 'ten_to_nineteen', episodeCount: 29, applicationsCount: 406, responsesCount: 138, offersCount: 18 },
            { paceBand: 'twenty_plus', episodeCount: 16, applicationsCount: 416, responsesCount: 125, offersCount: 12 },
          ],
        },
        {
          durationBand: 'two_to_three_months',
          cells: [
            { paceBand: 'under_five', episodeCount: 26, applicationsCount: 156, responsesCount: 48, offersCount: 5 },
            { paceBand: 'five_to_nine', episodeCount: 49, applicationsCount: 686, responsesCount: 246, offersCount: 33 },
            { paceBand: 'ten_to_nineteen', episodeCount: 57, applicationsCount: 1710, responsesCount: 564, offersCount: 73 },
            { paceBand: 'twenty_plus', episodeCount: 31, applicationsCount: 1612, responsesCount: 468, offersCount: 52 },
          ],
        },
        {
          durationBand: 'four_to_six_months',
          cells: [
            { paceBand: 'under_five', episodeCount: 21, applicationsCount: 252, responsesCount: 65, offersCount: 6 },
            { paceBand: 'five_to_nine', episodeCount: 42, applicationsCount: 1176, responsesCount: 376, offersCount: 41 },
            { paceBand: 'ten_to_nineteen', episodeCount: 51, applicationsCount: 3443, responsesCount: 1033, offersCount: 107 },
            { paceBand: 'twenty_plus', episodeCount: 28, applicationsCount: 3276, responsesCount: 884, offersCount: 84 },
          ],
        },
        {
          durationBand: 'seven_plus_months',
          cells: [
            { paceBand: 'under_five', episodeCount: 17, applicationsCount: 408, responsesCount: 90, offersCount: 7 },
            { paceBand: 'five_to_nine', episodeCount: 29, applicationsCount: 1624, responsesCount: 438, offersCount: 39 },
            { paceBand: 'ten_to_nineteen', episodeCount: 38, applicationsCount: 4560, responsesCount: 1094, offersCount: 95 },
            { paceBand: 'twenty_plus', episodeCount: 24, applicationsCount: 4992, responsesCount: 1098, offersCount: 82 },
          ],
        },
      ],
    },
    companyResponseTempo: {
      rows: [
        {
          promisedBand: 'not_provided',
          eligibleCount: 182,
          cells: [
            { actualBand: 'zero_to_three', count: 28 },
            { actualBand: 'four_to_seven', count: 39 },
            { actualBand: 'eight_to_fourteen', count: 31 },
            { actualBand: 'fifteen_to_thirty', count: 24 },
            { actualBand: 'over_thirty', count: 18 },
            { actualBand: 'reported_no_response', count: 42 },
          ],
        },
        {
          promisedBand: 'zero_to_three',
          eligibleCount: 126,
          cells: [
            { actualBand: 'zero_to_three', count: 54 },
            { actualBand: 'four_to_seven', count: 32 },
            { actualBand: 'eight_to_fourteen', count: 17 },
            { actualBand: 'fifteen_to_thirty', count: 8 },
            { actualBand: 'over_thirty', count: 4 },
            { actualBand: 'reported_no_response', count: 11 },
          ],
        },
        {
          promisedBand: 'four_to_seven',
          eligibleCount: 149,
          cells: [
            { actualBand: 'zero_to_three', count: 19 },
            { actualBand: 'four_to_seven', count: 51 },
            { actualBand: 'eight_to_fourteen', count: 38 },
            { actualBand: 'fifteen_to_thirty', count: 17 },
            { actualBand: 'over_thirty', count: 8 },
            { actualBand: 'reported_no_response', count: 16 },
          ],
        },
        {
          promisedBand: 'eight_to_fourteen',
          eligibleCount: 132,
          cells: [
            { actualBand: 'zero_to_three', count: 8 },
            { actualBand: 'four_to_seven', count: 21 },
            { actualBand: 'eight_to_fourteen', count: 44 },
            { actualBand: 'fifteen_to_thirty', count: 29 },
            { actualBand: 'over_thirty', count: 12 },
            { actualBand: 'reported_no_response', count: 18 },
          ],
        },
        {
          promisedBand: 'fifteen_plus',
          eligibleCount: 109,
          cells: [
            { actualBand: 'zero_to_three', count: 4 },
            { actualBand: 'four_to_seven', count: 9 },
            { actualBand: 'eight_to_fourteen', count: 18 },
            { actualBand: 'fifteen_to_thirty', count: 31 },
            { actualBand: 'over_thirty', count: 22 },
            { actualBand: 'reported_no_response', count: 25 },
          ],
        },
      ],
    },
  },
  companyResponsivenessMeta: {
    responseWindowDays: 30,
    period: 'rolling_12_months',
    source: 'candidate_reported_aggregate',
    metricDefinitionVersion: '1.0',
  },
  companyResponsiveness: [
    {
      id: 'orbit-labs',
      company: 'Orbit Labs',
      eligibleMatureApplicationsCount: 119,
      noSubstantiveUpdateCount: 73,
      interviewedApplicationsCount: 21,
      postInterviewNoFollowUpCount: 9,
      contributorsCount: 112,
    },
    {
      id: 'atlas-retail',
      company: 'Atlas Retail',
      eligibleMatureApplicationsCount: 111,
      noSubstantiveUpdateCount: 47,
      interviewedApplicationsCount: 29,
      postInterviewNoFollowUpCount: 7,
      contributorsCount: 104,
    },
    {
      id: 'nova-systems',
      company: 'Nova Systems',
      eligibleMatureApplicationsCount: 97,
      noSubstantiveUpdateCount: 39,
      interviewedApplicationsCount: 27,
      postInterviewNoFollowUpCount: 6,
      contributorsCount: 91,
    },
    {
      id: 'marmara-health',
      company: 'Marmara Health',
      eligibleMatureApplicationsCount: 82,
      noSubstantiveUpdateCount: 33,
      interviewedApplicationsCount: 18,
      postInterviewNoFollowUpCount: 5,
      contributorsCount: 76,
    },
    {
      id: 'luma-commerce',
      company: 'Luma Commerce',
      eligibleMatureApplicationsCount: 146,
      noSubstantiveUpdateCount: 49,
      interviewedApplicationsCount: 51,
      postInterviewNoFollowUpCount: 4,
      contributorsCount: 138,
    },
    {
      id: 'northstar-fintech',
      company: 'Northstar Fintech',
      eligibleMatureApplicationsCount: 174,
      noSubstantiveUpdateCount: 58,
      interviewedApplicationsCount: 47,
      postInterviewNoFollowUpCount: 5,
      contributorsCount: 162,
    },
    ...buildIllustrativeCompanyResponsiveness(178),
  ],
}

/**
 * Public home-page DTO. It intentionally contains only the values rendered in
 * the unlocked part of each preview; locked rows/cells are decorative and no
 * hidden benchmark values are serialized into the home-page payload.
 */
export const benchmarkShowcasePreview = {
  roleMonthly: benchmarkPreviewReport.roleMonthly.slice(0, 2),
  activityTiming: {
    candidateTempo: {
      rows: benchmarkPreviewReport.activityTiming.candidateTempo.rows
        .slice(0, 3)
        .map((row) => ({
          durationBand: row.durationBand,
          cells: row.cells.slice(0, 3).map((cell) => ({
            paceBand: cell.paceBand,
            applicationsCount: cell.applicationsCount,
            responsesCount: cell.responsesCount,
          })),
        })),
    },
  },
  companyResponsiveness: benchmarkPreviewReport.companyResponsiveness.slice(0, 2),
}
