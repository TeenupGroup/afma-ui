/**
 * Domain Exam & Quiz Utilities for Iranian School LMS
 */

/**
 * Calculates current status and actionable permissions for an exam
 *
 * @param {Object} exam
 * @param {Object|null|undefined} participation
 * @returns {{
 *   type: 'completed' | 'in_progress' | 'open' | 'upcoming' | 'expired',
 *   label: string,
 *   color: string,
 *   badgeVariant: string,
 *   badgeClass: string,
 *   canTake: boolean,
 *   canContinue: boolean,
 *   canReview: boolean,
 *   canRetake: boolean,
 *   isUpcoming: boolean,
 *   isExpired: boolean,
 *   participation: Object|null
 * }}
 */
export function getExamState(exam, participation = null) {
  const p = participation || null
  const now = new Date()
  const startsAt = exam?.starts_at ? new Date(exam.starts_at) : null
  const endsAt = exam?.ends_at ? new Date(exam.ends_at) : null

  const isUpcoming = Boolean(startsAt && startsAt > now)
  const isExpired = Boolean(endsAt && endsAt < now)

  if (p) {
    if (p.status === 'completed') {
      const canRetake = Boolean(exam?.allow_multiple_attempts && !isExpired)
      return {
        type: 'completed',
        label: 'تکمیل شده',
        color: 'emerald',
        badgeVariant: 'emerald',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        canTake: false,
        canContinue: false,
        canReview: true,
        canRetake,
        isUpcoming: false,
        isExpired,
        participation: p,
      }
    }
    if (p.status === 'in_progress') {
      return {
        type: 'in_progress',
        label: 'در حال پاسخگویی',
        color: 'blue',
        badgeVariant: 'blue',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/80',
        canTake: false,
        canContinue: true,
        canReview: false,
        canRetake: false,
        isUpcoming: false,
        isExpired,
        participation: p,
      }
    }
  }

  if (isUpcoming) {
    return {
      type: 'upcoming',
      label: 'هنوز آغاز نشده',
      color: 'slate',
      badgeVariant: 'slate',
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-200/80',
      canTake: false,
      canContinue: false,
      canReview: false,
      canRetake: false,
      isUpcoming: true,
      isExpired: false,
      participation: null,
    }
  }

  if (isExpired) {
    return {
      type: 'expired',
      label: 'پایان مهلت آزمون',
      color: 'rose',
      badgeVariant: 'rose',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/80',
      canTake: false,
      canContinue: false,
      canReview: false,
      canRetake: false,
      isUpcoming: false,
      isExpired: true,
      participation: null,
    }
  }

  // Ready to take
  return {
    type: 'open',
    label: 'آماده شرکت',
    color: 'violet',
    badgeVariant: 'purple',
    badgeClass: 'bg-violet-50 text-violet-700 border-violet-200/80',
    canTake: true,
    canContinue: false,
    canReview: false,
    canRetake: false,
    isUpcoming: false,
    isExpired: false,
    participation: null,
  }
}
