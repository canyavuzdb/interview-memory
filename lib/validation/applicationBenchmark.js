function required(value) {
  return value !== '' && value !== null && value !== undefined
}

function nonNegativeNumber(value) {
  return required(value) && Number.isInteger(Number(value)) && Number(value) >= 0
}

export function validateApplicationBenchmarkStep(step, state, messages) {
  const errors = {}

  if (step === 1) {
    if (!required(state.role)) errors.role = messages.required
    if (!required(state.roleLevel)) errors.roleLevel = messages.required
    if (!required(state.experienceBand)) errors.experienceBand = messages.required
    if (!required(state.targetRegion)) errors.targetRegion = messages.required
    if (!required(state.isCurrentlyEmployed)) errors.isCurrentlyEmployed = messages.required
    if (!required(state.searchStartedAt)) errors.searchStartedAt = messages.required
    if (!required(state.searchStatus)) errors.searchStatus = messages.required
    if (state.searchStatus !== 'ongoing' && !required(state.searchEndedAt)) {
      errors.searchEndedAt = messages.endDateRequired
    }
  }

  if (step === 2) {
    const countFields = [
      'applicationsCount',
      'responsesCount',
      'hrInterviewsCount',
      'technicalInterviewsCount',
      'offersCount',
    ]

    countFields.forEach((field) => {
      if (!nonNegativeNumber(state[field])) errors[field] = messages.nonNegativeNumber
    })

  }

  if (step === 3) {
    const hasSalaryData = [
      state.currentSalaryBand,
      state.expectedSalaryBand,
      state.highestOfferBand,
    ].some(Boolean)

    if (hasSalaryData && !required(state.salaryCurrency)) {
      errors.salaryCurrency = messages.currencyRequired
    }

    if (state.freeNote.length > 300) errors.freeNote = messages.noteTooLong
  }

  return errors
}

export function getApplicationBenchmarkWarnings(state, messages) {
  const applications = Number(state.applicationsCount)
  const responses = Number(state.responsesCount)
  const hrInterviews = Number(state.hrInterviewsCount)
  const technicalInterviews = Number(state.technicalInterviewsCount)
  const offers = Number(state.offersCount)

  if ([applications, responses, hrInterviews, technicalInterviews, offers].some(Number.isNaN)) return []

  if (
    responses > applications
    || hrInterviews > responses
    || technicalInterviews > Math.max(responses, hrInterviews)
    || offers > Math.max(hrInterviews, technicalInterviews)
  ) {
    return [messages.countOrder]
  }

  return []
}
