export const EXPERIENCE_BANDS = ['0-1', '1-3', '3-5', '5-8', '8+']

export const WORK_MODES = ['remote', 'hybrid', 'onsite']

export const SEARCH_STATUSES = [
  'ongoing',
  'offer_accepted',
  'offer_rejected',
  'abandoned',
]

export const SALARY_BANDS = [
  { id: 'b0_20', label: '0 - 20K' },
  { id: 'b20_30', label: '20K - 30K' },
  { id: 'b30_40', label: '30K - 40K' },
  { id: 'b40_50', label: '40K - 50K' },
  { id: 'b50_60', label: '50K - 60K' },
  { id: 'b60_80', label: '60K - 80K' },
  { id: 'b80_100', label: '80K - 100K' },
  { id: 'b100_plus', label: '100K+' },
]

export const INITIAL_APPLICATION_BENCHMARK_STATE = {
  step: 1,
  role: '',
  experienceBand: '',
  workMode: '',
  isCurrentlyEmployed: null,
  searchStartedAt: '',
  searchStatus: '',
  searchEndedAt: '',
  applicationsCount: '',
  responsesCount: '',
  interviewsCount: '',
  offersCount: '',
  currentSalaryBand: '',
  expectedSalaryBand: '',
  highestOfferBand: '',
  hadReferral: null,
  sharedPortfolio: null,
  freeNote: '',
  submitStatus: 'idle',
  errors: {},
  dirty: false,
}
