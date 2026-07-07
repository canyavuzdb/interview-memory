/**
 * Central survey definitions.
 *
 * Each entry links a survey to its route, icon key, estimated duration,
 * and the dashboard slider it feeds into.  UI copy lives in data/i18n.js;
 * this file holds structural metadata only.
 */

export const SURVEYS = [
  {
    id: 'application-benchmark',
    path: '/surveys/application-benchmark',
    icon: 'chart',
    durationMinutes: '1-2',
    sliderId: 'application-marathon',
  },
  {
    id: 'company-experience',
    path: '/surveys/company-experience',
    icon: 'building',
    durationMinutes: '3-5',
    sliderId: 'company-report',
  },
  {
    id: 'hr-process',
    path: '/surveys/hr-process',
    icon: 'userSearch',
    durationMinutes: '3-4',
    sliderId: 'silent-processes',
  },
  {
    id: 'salary-benchmark',
    path: '/surveys/salary-benchmark',
    icon: 'wallet',
    durationMinutes: '2-3',
    sliderId: 'salary-reality',
  },
]

export function getSurveyById(id) {
  return SURVEYS.find((s) => s.id === id)
}
