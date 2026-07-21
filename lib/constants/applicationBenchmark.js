export const EXPERIENCE_BANDS = ['0-1', '1-3', '3-5', '5-8', '8+']

// Temporary frontend catalogue. This list will be replaced by the role catalogue
// returned from the data layer without changing the form state shape.
export const JOB_ROLES = [
  'software_engineer',
  'frontend_developer',
  'backend_developer',
  'full_stack_developer',
  'mobile_developer',
  'data_analyst',
  'data_scientist',
  'product_manager',
  'product_designer',
  'devops_engineer',
  'qa_engineer',
  'business_analyst',
  'other',
]

export const WORK_MODES = ['remote', 'hybrid', 'onsite']

export const ROLE_LEVELS = ['intern', 'junior', 'mid', 'senior', 'lead_manager']

export const TARGET_REGIONS = ['turkiye', 'europe', 'uk_ireland', 'mena', 'north_america', 'other']

export const EMPLOYMENT_TYPES = ['full_time', 'part_time', 'freelance', 'internship']

export const SEARCH_STATUSES = [
  'ongoing',
  'offer_accepted',
  'employment_started',
  'offer_rejected',
  'abandoned',
]

export const SECTORS = [
  'technology',
  'finance',
  'ecommerce',
  'consulting',
  'healthcare',
  'manufacturing',
  'education',
  'media',
  'telecom',
  'other',
]

export const INITIAL_APPLICATION_BENCHMARK_STATE = {
  step: 1,
  role: '',
  sector: '',
  roleLevel: '',
  experienceBand: '',
  targetRegion: '',
  employmentType: '',
  workMode: '',
  isCurrentlyEmployed: null,
  searchStartedAt: '',
  searchStatus: '',
  searchEndedAt: '',
  applicationsCount: '',
  humanResponsesCount: '',
  anyInterviewsCount: '',
  hrInterviewsCount: '',
  technicalInterviewsCount: '',
  offersCount: '',
  acceptedOffersCount: '',
  employmentStartedCount: '',
  countsAreEstimated: null,
  consentGranted: false,
  receiptId: null,
  searchEpisodeId: null,
  submissionCapability: null,
  replayed: false,
  submitStatus: 'idle',
  errors: {},
  dirty: false,
}
