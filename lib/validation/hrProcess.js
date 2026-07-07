function required(value) {
  return value !== '' && value !== null && value !== undefined
}

function nonNegativeNumber(value) {
  return required(value) && Number.isInteger(Number(value)) && Number(value) >= 0
}

export function validateHRProcessStep(step, state, messages) {
  const errors = {}

  if (step === 1) {
    if (state.companyName.trim().length < 2) errors.companyName = messages.required
    if (state.appliedRole.trim().length < 2) errors.appliedRole = messages.required
    if (!required(state.processYear)) errors.processYear = messages.required
  }

  if (step === 2) {
    if (!required(state.promisedTimeline)) errors.promisedTimeline = messages.required
    if (!nonNegativeNumber(state.actualDays)) errors.actualDays = messages.nonNegativeNumber
    if (!required(state.wasGhosted)) errors.wasGhosted = messages.required

    if (state.wasGhosted === true && !required(state.ghostedAfterStage)) {
      errors.ghostedAfterStage = messages.required
    }

    if (state.promisedTimeline === 'yes' && !nonNegativeNumber(state.promisedDays)) {
      errors.promisedDays = messages.nonNegativeNumber
    }

    if (!required(state.wasAskedIrrelevant)) errors.wasAskedIrrelevant = messages.required
  }

  if (step === 3) {
    if (!required(state.rejectionShared)) errors.rejectionShared = messages.required
    if (!required(state.processTransparency)) errors.processTransparency = messages.required
    if (!required(state.hrProfessionalism)) errors.hrProfessionalism = messages.required
    if (state.freeNote.length > 500) errors.freeNote = messages.noteTooLong
  }

  return errors
}

export function getHRProcessWarnings(state, messages) {
  const promised = Number(state.promisedDays)
  const actual = Number(state.actualDays)

  if (Number.isNaN(promised) || Number.isNaN(actual)) return []

  if (state.promisedTimeline === 'yes' && promised < actual) {
    return [messages.timelineGap]
  }

  return []
}
