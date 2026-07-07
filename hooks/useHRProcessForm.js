'use client'

import { useEffect, useReducer } from 'react'
import { INITIAL_HR_PROCESS_STATE } from '@/lib/constants/hrProcess'
import { validateHRProcessStep } from '@/lib/validation/hrProcess'

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD': {
      const nextState = {
        ...state,
        [action.field]: action.value,
        dirty: true,
        errors: { ...state.errors, [action.field]: undefined },
      }

      if (action.field === 'wasGhosted' && action.value === false) {
        nextState.ghostedAfterStage = ''
      }

      if (action.field === 'wasGhosted' && action.value === true) {
        nextState.actualDays = ''
      }

      if (action.field === 'promisedTimeline' && action.value !== 'yes') {
        nextState.promisedDays = ''
      }

      return nextState
    }
    case 'GO_TO_STEP':
      return { ...state, step: action.step, errors: {} }
    case 'SET_ERRORS':
      return { ...state, errors: action.errors }
    case 'SUBMIT_START':
      return { ...state, submitStatus: 'submitting', errors: {} }
    case 'SUBMIT_SUCCESS':
      return { ...state, submitStatus: 'success', dirty: false }
    case 'SUBMIT_ERROR':
      return { ...state, submitStatus: 'error' }
    default:
      return state
  }
}

export function useHRProcessForm(validationMessages) {
  const [state, dispatch] = useReducer(reducer, INITIAL_HR_PROCESS_STATE)

  useEffect(() => {
    function warnBeforeUnload(event) {
      if (!state.dirty || state.submitStatus === 'success') return
      event.preventDefault()
    }

    window.addEventListener('beforeunload', warnBeforeUnload)
    return () => window.removeEventListener('beforeunload', warnBeforeUnload)
  }, [state.dirty, state.submitStatus])

  function validateCurrentStep() {
    const errors = validateHRProcessStep(state.step, state, validationMessages)
    dispatch({ type: 'SET_ERRORS', errors })
    return Object.keys(errors).length === 0
  }

  return { state, dispatch, validateCurrentStep }
}
