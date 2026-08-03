function required(value) {
  return value !== '' && value !== null && value !== undefined
}

const MAX_FUNNEL_COUNT = 10_000

function validFunnelCount(value) {
  return required(value)
    && Number.isInteger(Number(value))
    && Number(value) >= 0
    && Number(value) <= MAX_FUNNEL_COUNT
}

const requiredFunnelCountFields = [
  'applicationsCount',
  'humanResponsesCount',
  'anyInterviewsCount',
]

const zeroDefaultFunnelCountFields = [
  'hrInterviewsCount',
  'technicalInterviewsCount',
  'offersCount',
  'acceptedOffersCount',
  'employmentStartedCount',
]

export function validateApplicationBenchmarkStep(step, state, messages) {
  const errors = {}

  if (step === 1) {
    if (!required(state.role)) errors.role = messages.required
    if (!required(state.sector)) errors.sector = messages.required
    if (!required(state.roleLevel)) errors.roleLevel = messages.required
    if (!required(state.experienceBand)) errors.experienceBand = messages.required
    if (!required(state.targetRegion)) errors.targetRegion = messages.required
    if (!required(state.isCurrentlyEmployed)) errors.isCurrentlyEmployed = messages.required
    if (!required(state.searchStartedAt)) errors.searchStartedAt = messages.required
    if (!required(state.searchStatus)) errors.searchStatus = messages.required
    if (state.searchStatus !== 'ongoing' && !required(state.searchEndedAt)) {
      errors.searchEndedAt = messages.endDateRequired
    }
    if (
      required(state.searchStartedAt)
      && required(state.searchEndedAt)
      && state.searchEndedAt < state.searchStartedAt
    ) {
      errors.searchEndedAt = messages.endDateBeforeStart
    }
  }

  if (step === 2) {
    requiredFunnelCountFields.forEach((field) => {
      if (!validFunnelCount(state[field])) errors[field] = messages.nonNegativeNumber
    })

    zeroDefaultFunnelCountFields.forEach((field) => {
      if (required(state[field]) && !validFunnelCount(state[field])) {
        errors[field] = messages.nonNegativeNumber
      }
    })

    if (typeof state.countsAreEstimated !== 'boolean') {
      errors.countsAreEstimated = messages.required
    }

    if (requiredFunnelCountFields.every((field) => validFunnelCount(state[field]))) {
      const applications = Number(state.applicationsCount)
      const humanResponses = Number(state.humanResponsesCount || 0)
      const anyInterviews = Number(state.anyInterviewsCount || 0)
      const hrInterviews = Number(state.hrInterviewsCount || 0)
      const technicalInterviews = Number(state.technicalInterviewsCount || 0)
      const offers = Number(state.offersCount || 0)
      const acceptedOffers = Number(state.acceptedOffersCount || 0)
      const employmentStarted = Number(state.employmentStartedCount || 0)

      const boundedByApplications = [
        'humanResponsesCount',
        'anyInterviewsCount',
        'hrInterviewsCount',
        'technicalInterviewsCount',
        'offersCount',
        'acceptedOffersCount',
        'employmentStartedCount',
      ]

      boundedByApplications.forEach((field) => {
        if (Number(state[field] || 0) > applications) {
          errors[field] = messages.countOrder
        }
      })

      if (anyInterviews > humanResponses) {
        errors.anyInterviewsCount = messages.countOrder
      }
      if (hrInterviews > anyInterviews) {
        errors.hrInterviewsCount = messages.countOrder
      }
      if (technicalInterviews > anyInterviews) {
        errors.technicalInterviewsCount = messages.countOrder
      }
      if (acceptedOffers > offers) {
        errors.acceptedOffersCount = messages.countOrder
      }
      if (employmentStarted > acceptedOffers) {
        errors.employmentStartedCount = messages.countOrder
      }

    }
  }

  if (step === 3 && state.consentGranted !== true) {
    errors.consentGranted = messages.consentRequired
  }

  return errors
}

export function getApplicationBenchmarkWarnings(state, messages) {
  const applications = Number(state.applicationsCount)
  const humanResponses = Number(state.humanResponsesCount)
  const anyInterviews = Number(state.anyInterviewsCount)
  const hrInterviews = Number(state.hrInterviewsCount)
  const technicalInterviews = Number(state.technicalInterviewsCount)
  const offers = Number(state.offersCount)
  const acceptedOffers = Number(state.acceptedOffersCount)
  const employmentStarted = Number(state.employmentStartedCount)

  if (
    [
      applications,
      humanResponses,
      anyInterviews,
      hrInterviews,
      technicalInterviews,
      offers,
      acceptedOffers,
      employmentStarted,
    ].some(Number.isNaN)
  ) return []

  if (
    humanResponses > applications
    || anyInterviews > humanResponses
    || hrInterviews > anyInterviews
    || technicalInterviews > anyInterviews
    || offers > applications
    || acceptedOffers > offers
    || employmentStarted > acceptedOffers
  ) {
    return [messages.countOrder]
  }

  return []
}
