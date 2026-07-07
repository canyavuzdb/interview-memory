function required(value) {
  return value !== '' && value !== null && value !== undefined
}

function nonNegativeNumber(value) {
  return required(value) && Number.isInteger(Number(value)) && Number(value) >= 0
}

export function validateCompanyExperienceStep(step, state, messages) {
  const errors = {}

  if (step === 1) {
    if (state.companyName.trim().length < 2) errors.companyName = messages.required
    if (!required(state.companySector)) errors.companySector = messages.required
    if (!required(state.companySize)) errors.companySize = messages.required
    if (state.appliedRole.trim().length < 2) errors.appliedRole = messages.required
    if (!required(state.applicationChannel)) errors.applicationChannel = messages.required
  }

  if (step === 2) {
    if (!required(state.lastStage)) errors.lastStage = messages.required
    if (!required(state.gotResponse)) errors.gotResponse = messages.required
    
    if (state.gotResponse === true) {
      if (!nonNegativeNumber(state.responseTimeDays)) errors.responseTimeDays = messages.nonNegativeNumber
    }
  }

  if (step === 3) {
    if (!required(state.overallExperience)) errors.overallExperience = messages.required
    if (!required(state.wouldReapply)) errors.wouldReapply = messages.required
    
    if (state.freeNote && state.freeNote.length > 500) {
      errors.freeNote = messages.noteTooLong
    }
  }

  return errors
}

export function getCompanyExperienceWarnings(state, messages) {
  const warnings = []
  
  if (state.gotResponse === false && state.lastStage.includes('interview')) {
    warnings.push(messages.ghostingWarning || 'Mülakat aşamasına gelip hiç dönüş almadığınızı belirttiniz. Bu ciddi bir ghosting vakasıdır.')
  }
  
  return warnings
}
