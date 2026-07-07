function required(value) {
  return value !== '' && value !== null && value !== undefined
}

function validNumber(value) {
  if (!required(value)) return false
  const num = Number(value)
  return !Number.isNaN(num) && num > 0
}

export function validateSalaryBenchmarkStep(step, state, messages) {
  const errors = {}

  if (step === 1) {
    if (state.role.trim().length < 2) errors.role = messages.required
    if (!required(state.sector)) errors.sector = messages.required
    if (!required(state.experienceBand)) errors.experienceBand = messages.required
    if (!required(state.city)) errors.city = messages.required
  }

  if (step === 2) {
    if (!required(state.jobPostHadSalary)) errors.jobPostHadSalary = messages.required
    
    if (state.jobPostHadSalary === 'yes_range') {
      if (!validNumber(state.postedSalaryMin)) errors.postedSalaryMin = messages.invalidNumber
      if (!validNumber(state.postedSalaryMax)) errors.postedSalaryMax = messages.invalidNumber
    } else if (state.jobPostHadSalary === 'yes_fixed') {
      if (!validNumber(state.postedSalaryMin)) errors.postedSalaryMin = messages.invalidNumber
    }

    if (!validNumber(state.expectedSalary)) errors.expectedSalary = messages.invalidNumber
    if (!validNumber(state.offeredSalary)) errors.offeredSalary = messages.invalidNumber
    
    if (!required(state.negotiated)) errors.negotiated = messages.required
    if (state.negotiated === true && !validNumber(state.afterNegotiation)) {
      errors.afterNegotiation = messages.invalidNumber
    }
  }

  if (step === 3) {
    // Step 3 is mostly optional ratings, but we require feltFairOffer
    if (!required(state.feltFairOffer)) errors.feltFairOffer = messages.required
  }

  return errors
}

export function getSalaryBenchmarkWarnings(state, messages) {
  const warnings = []
  
  if (state.jobPostHadSalary === 'yes_range' && state.postedSalaryMin && state.postedSalaryMax) {
    const min = Number(state.postedSalaryMin)
    const max = Number(state.postedSalaryMax)
    if (min >= max) {
      warnings.push(messages.invalidRange || 'İlandaki tavan maaş, taban maaştan büyük olmalıdır.')
    }
  }
  
  return warnings
}
