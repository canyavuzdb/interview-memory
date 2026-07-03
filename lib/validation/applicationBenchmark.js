function required(value) {
  return value !== '' && value !== null && value !== undefined
}

function nonNegativeNumber(value) {
  return required(value) && Number.isInteger(Number(value)) && Number(value) >= 0
}

export function validateApplicationBenchmarkStep(step, state, messages) {
  const errors = {}

  if (step === 1) {
    if (state.role.trim().length < 2) errors.role = messages.required
    if (!required(state.experienceBand)) errors.experienceBand = messages.required
    if (!required(state.workMode)) errors.workMode = messages.required
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
      'interviewsCount',
      'offersCount',
    ]

    countFields.forEach((field) => {
      if (!nonNegativeNumber(state[field])) errors[field] = messages.nonNegativeNumber
    })
  }

  if (step === 3 && state.freeNote.length > 300) {
    errors.freeNote = messages.noteTooLong
  }

  return errors
}

export function getApplicationBenchmarkWarnings(state, messages) {
  const applications = Number(state.applicationsCount)
  const responses = Number(state.responsesCount)
  const interviews = Number(state.interviewsCount)
  const offers = Number(state.offersCount)

  if ([applications, responses, interviews, offers].some(Number.isNaN)) return []

  if (responses > applications || interviews > responses || offers > interviews) {
    return [messages.countOrder]
  }

  return []
}
