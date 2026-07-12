'use client'

import { useEffect, useReducer } from 'react'
import { INITIAL_APPLICATION_BENCHMARK_STATE } from '@/lib/constants/applicationBenchmark'
import { validateApplicationBenchmarkStep } from '@/lib/validation/applicationBenchmark'

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD': {
      const remainingErrors = { ...state.errors }
      delete remainingErrors[action.field]

      const nextState = {
        ...state,
        [action.field]: action.value,
        dirty: true,
        errors: remainingErrors,
      }

      if (action.field === 'searchStatus' && action.value === 'ongoing') {
        nextState.searchEndedAt = ''
      }

      if (action.field === 'offersCount' && Number(action.value) === 0) {
        nextState.highestOfferBand = ''
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

export function useApplicationBenchmarkForm(validationMessages) {
  const [state, dispatch] = useReducer(reducer, INITIAL_APPLICATION_BENCHMARK_STATE)

  useEffect(() => {
    function warnBeforeUnload(event) {
      if (!state.dirty || state.submitStatus === 'success') return
      event.preventDefault()
    }

    window.addEventListener('beforeunload', warnBeforeUnload)
    return () => window.removeEventListener('beforeunload', warnBeforeUnload)
  }, [state.dirty, state.submitStatus])

  function validateCurrentStep() {
    const errors = validateApplicationBenchmarkStep(state.step, state, validationMessages)
    dispatch({ type: 'SET_ERRORS', errors })
    return Object.keys(errors).length === 0
  }

  return { state, dispatch, validateCurrentStep }
}
