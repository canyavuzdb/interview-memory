export const PROCESS_YEARS = ['2024', '2025', '2026']

export const GHOSTED_AFTER_STAGES = [
  'application',
  'hr_screen',
  'technical',
  'final',
]

export const IRRELEVANT_QUESTION_TYPES = [
  'age',
  'marital_status',
  'salary_history',
  'personal_questions',
  'other',
]

export const REJECTION_DETAIL_LEVELS = [
  'yes_detailed',
  'yes_generic',
  'no',
]

export const RATING_SCALE = [1, 2, 3, 4, 5]

export const INITIAL_HR_PROCESS_STATE = {
  step: 1,
  // Step 1 — Company & role info
  companyName: '',
  appliedRole: '',
  processYear: '',
  // Step 2 — Process experience
  promisedTimeline: null,
  promisedDays: '',
  actualDays: '',
  wasGhosted: null,
  ghostedAfterStage: '',
  interviewerPrepared: '',
  wasAskedIrrelevant: null,
  irrelevantTypes: [],
  // Step 3 — Ratings & outcome
  rejectionShared: '',
  feedbackUseful: '',
  processTransparency: '',
  hrProfessionalism: '',
  wouldRecommendProcess: null,
  freeNote: '',
  // Meta
  submitStatus: 'idle',
  errors: {},
  dirty: false,
}
