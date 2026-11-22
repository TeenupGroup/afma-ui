/**
 * Domain Statuses & Steps — mirror of backend PHP Enums & Model constants.
 *
 * Single source of truth for frontend status strings to ensure consistency
 * across Svelte components, API calls, and Inertia props.
 */

// =========================================================================
// ATTENDANCE
// =========================================================================

export const ATTENDANCE_STATUSES = {
  PRESENT: 'present',
  LATE: 'late',
  ABSENT: 'absent',
  EXCUSED: 'excused',
}

export const ATTENDANCE_STATUS_VALUES = Object.values(ATTENDANCE_STATUSES)

export const ATTENDANCE_LABELS = {
  [ATTENDANCE_STATUSES.PRESENT]: 'حاضر',
  [ATTENDANCE_STATUSES.LATE]: 'تأخیر',
  [ATTENDANCE_STATUSES.ABSENT]: 'غایب',
  [ATTENDANCE_STATUSES.EXCUSED]: 'با عذر',
}

/**
 * @param {string} value
 * @returns {boolean}
 */
export function isAttendanceStatus(value) {
  return ATTENDANCE_STATUS_VALUES.includes(value)
}

// =========================================================================
// ORDER
// =========================================================================

export const ORDER_STATUSES = {
  PENDING: 'pending',
  PAID: 'paid',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  FAILED: 'failed',
}

export const ORDER_STATUS_VALUES = Object.values(ORDER_STATUSES)

export const ORDER_LABELS = {
  [ORDER_STATUSES.PENDING]: 'در انتظار پرداخت',
  [ORDER_STATUSES.PAID]: 'پرداخت شده',
  [ORDER_STATUSES.PROCESSING]: 'در حال پردازش',
  [ORDER_STATUSES.SHIPPED]: 'ارسال شده',
  [ORDER_STATUSES.DELIVERED]: 'تحویل شده',
  [ORDER_STATUSES.CANCELLED]: 'لغو شده',
  [ORDER_STATUSES.REFUNDED]: 'مسترد شده',
  [ORDER_STATUSES.FAILED]: 'ناموفق',
}

/**
 * @param {string} value
 * @returns {boolean}
 */
export function isOrderStatus(value) {
  return ORDER_STATUS_VALUES.includes(value)
}

// =========================================================================
// REPORT CARD (KARNAMEH)
// =========================================================================

export const REPORT_CARD_STATUSES = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  FINALIZED: 'finalized',
}

export const REPORT_CARD_STATUS_VALUES = Object.values(REPORT_CARD_STATUSES)

export const REPORT_CARD_LABELS = {
  [REPORT_CARD_STATUSES.DRAFT]: 'پیش‌نویس',
  [REPORT_CARD_STATUSES.PUBLISHED]: 'منتشر شده',
  [REPORT_CARD_STATUSES.FINALIZED]: 'نهایی شده',
}

// =========================================================================
// POL EVENT
// =========================================================================

export const POL_EVENT_STEPS = {
  WELCOME: 'welcome',
  GUIDE: 'guide',
  VIDEOS: 'videos',
  QUIZ: 'quiz',
  PERSONAL_INFO: 'personal_info',
  SELFIE: 'selfie',
  PSYCH_TEST: 'psych_test',
  VALUES_TEST: 'values_test',
  CELEBRATION: 'celebration',
  RESULT: 'result',
  COMPLETED: 'completed',
}

export const POL_EVENT_STEP_VALUES = Object.values(POL_EVENT_STEPS)

export const POL_EVENT_STATUSES = {
  REGISTERED: 'registered',
  DOCUMENT_REVIEW: 'document_review',
  TESTING: 'testing',
  INTERVIEW: 'interview',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
}

export const POL_EVENT_STATUS_VALUES = Object.values(POL_EVENT_STATUSES)

export const POL_EVENT_STATUS_LABELS = {
  [POL_EVENT_STATUSES.REGISTERED]: 'ثبت‌نام اولیه',
  [POL_EVENT_STATUSES.DOCUMENT_REVIEW]: 'بررسی مدارک',
  [POL_EVENT_STATUSES.TESTING]: 'آزمون',
  [POL_EVENT_STATUSES.INTERVIEW]: 'مصاحبه',
  [POL_EVENT_STATUSES.ACCEPTED]: 'پذیرفته شده',
  [POL_EVENT_STATUSES.REJECTED]: 'رد شده',
}

// =========================================================================
// INTERVIEW
// =========================================================================

export const INTERVIEW_STATUSES = {
  PENDING: 'pending',
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

export const INTERVIEW_STATUS_VALUES = Object.values(INTERVIEW_STATUSES)

// =========================================================================
// EXAM
// =========================================================================

export const EXAM_STATUSES = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CLOSED: 'closed',
}

export const EXAM_STATUS_VALUES = Object.values(EXAM_STATUSES)

export const EXAM_PARTICIPANT_STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
}

export const EXAM_PARTICIPANT_STATUS_VALUES = Object.values(EXAM_PARTICIPANT_STATUSES)

// =========================================================================
// EXAM QUESTIONS
// =========================================================================

export const EXAM_QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  TRUE_FALSE: 'true_false',
  SHORT_ANSWER: 'short_answer',
  LONG_ANSWER: 'long_answer',
}

export const EXAM_QUESTION_TYPE_VALUES = Object.values(EXAM_QUESTION_TYPES)

export const EXAM_QUESTION_TYPE_LABELS = {
  [EXAM_QUESTION_TYPES.MULTIPLE_CHOICE]: 'چهار گزینه‌ای',
  [EXAM_QUESTION_TYPES.TRUE_FALSE]: 'درست/نادرست',
  [EXAM_QUESTION_TYPES.SHORT_ANSWER]: 'پاسخ کوتاه',
  [EXAM_QUESTION_TYPES.LONG_ANSWER]: 'پاسخ تشریحی',
}

export const EXAM_QUESTION_TYPE_COLORS = {
  [EXAM_QUESTION_TYPES.MULTIPLE_CHOICE]: 'bg-blue-50 text-blue-600',
  [EXAM_QUESTION_TYPES.TRUE_FALSE]: 'bg-amber-50 text-amber-600',
  [EXAM_QUESTION_TYPES.SHORT_ANSWER]: 'bg-emerald-50 text-emerald-600',
  [EXAM_QUESTION_TYPES.LONG_ANSWER]: 'bg-purple-50 text-purple-600',
}

export const EXAM_QUESTION_DIFFICULTIES = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
}

export const EXAM_QUESTION_DIFFICULTY_LABELS = {
  [EXAM_QUESTION_DIFFICULTIES.EASY]: 'آسان',
  [EXAM_QUESTION_DIFFICULTIES.MEDIUM]: 'متوسط',
  [EXAM_QUESTION_DIFFICULTIES.HARD]: 'سخت',
}

export const EXAM_QUESTION_DIFFICULTY_COLORS = {
  [EXAM_QUESTION_DIFFICULTIES.EASY]: 'bg-emerald-50 text-emerald-600',
  [EXAM_QUESTION_DIFFICULTIES.MEDIUM]: 'bg-amber-50 text-amber-600',
  [EXAM_QUESTION_DIFFICULTIES.HARD]: 'bg-red-50 text-red-600',
}

// =========================================================================
// SMS
// =========================================================================

export const SMS_STATUSES = {
  PENDING: 'pending',
  SENT: 'sent',
  SKIPPED: 'skipped',
  FAILED: 'failed',
}

export const SMS_STATUS_VALUES = Object.values(SMS_STATUSES)

export const SMS_STATUS_LABELS = {
  [SMS_STATUSES.PENDING]: 'در انتظار',
  [SMS_STATUSES.SENT]: 'ارسال شده',
  [SMS_STATUSES.SKIPPED]: 'رد شده',
  [SMS_STATUSES.FAILED]: 'ناموفق',
}

// =========================================================================
// CONSULTATION
// =========================================================================

export const CONSULTATION_STATUSES = {
  PENDING: 'pending',
  ANSWERED: 'answered',
  CLOSED: 'closed',
}

export const CONSULTATION_STATUS_VALUES = Object.values(CONSULTATION_STATUSES)

export const CONSULTATION_STATUS_LABELS = {
  [CONSULTATION_STATUSES.PENDING]: 'در انتظار بررسی',
  [CONSULTATION_STATUSES.ANSWERED]: 'پاسخ داده شده',
  [CONSULTATION_STATUSES.CLOSED]: 'بسته شده',
}

// =========================================================================
// DONATION CAMPAIGN
// =========================================================================

export const DONATION_CAMPAIGN_STATUSES = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  COMPLETED: 'completed',
}

export const DONATION_CAMPAIGN_STATUS_VALUES = Object.values(DONATION_CAMPAIGN_STATUSES)

// =========================================================================
// GRADE TYPES
// =========================================================================

export const GRADE_TYPES = {
  MIDTERM: 'midterm',
  FINAL: 'final',
  QUIZ: 'quiz',
  ASSIGNMENT: 'assignment',
  PARTICIPATION: 'participation',
}

export const GRADE_TYPE_VALUES = Object.values(GRADE_TYPES)

export const GRADE_TYPE_LABELS = {
  [GRADE_TYPES.MIDTERM]: 'میان‌ترم',
  [GRADE_TYPES.FINAL]: 'پایان‌ترم',
  [GRADE_TYPES.QUIZ]: 'کوییز',
  [GRADE_TYPES.ASSIGNMENT]: 'تکلیف',
  [GRADE_TYPES.PARTICIPATION]: 'مشارکت',
}

export const GRADE_TYPE_BADGES = {
  [GRADE_TYPES.MIDTERM]: { label: 'میان‌ترم', class: 'bg-purple-100 text-purple-700' },
  [GRADE_TYPES.FINAL]: { label: 'پایان‌ترم', class: 'bg-red-100 text-red-700' },
  [GRADE_TYPES.QUIZ]: { label: 'آزمون کوتاه', class: 'bg-amber-100 text-amber-700' },
  [GRADE_TYPES.ASSIGNMENT]: { label: 'تکلیف', class: 'bg-blue-100 text-blue-700' },
  [GRADE_TYPES.PARTICIPATION]: { label: 'مشارکت', class: 'bg-emerald-100 text-emerald-700' },
}

export const GRADE_TYPE_FILTER_OPTIONS = [
  { value: 'all', label: 'همه انواع' },
  { value: GRADE_TYPES.MIDTERM, label: 'میان‌ترم' },
  { value: GRADE_TYPES.FINAL, label: 'پایان‌ترم' },
  { value: GRADE_TYPES.QUIZ, label: 'آزمون کوتاه' },
  { value: GRADE_TYPES.ASSIGNMENT, label: 'تکلیف' },
  { value: GRADE_TYPES.PARTICIPATION, label: 'مشارکت' },
]

// =========================================================================
// ASSIGNMENT & SUBMISSIONS
// =========================================================================

export const ASSIGNMENT_TYPES = {
  HOMEWORK: 'homework',
  PROJECT: 'project',
  QUIZ: 'quiz',
  EXAM: 'exam',
}

export const ASSIGNMENT_TYPE_VALUES = Object.values(ASSIGNMENT_TYPES)

export const ASSIGNMENT_TYPE_LABELS = {
  [ASSIGNMENT_TYPES.HOMEWORK]: 'تکلیف',
  [ASSIGNMENT_TYPES.PROJECT]: 'پروژه',
  [ASSIGNMENT_TYPES.QUIZ]: 'کوییز',
  [ASSIGNMENT_TYPES.EXAM]: 'امتحان',
}

export const ASSIGNMENT_SUBMISSION_STATUSES = {
  SUBMITTED: 'submitted',
  GRADED: 'graded',
  LATE: 'late',
  MISSING: 'missing',
}

export const ASSIGNMENT_SUBMISSION_STATUS_VALUES = Object.values(ASSIGNMENT_SUBMISSION_STATUSES)

export const ASSIGNMENT_SUBMISSION_STATUS_LABELS = {
  [ASSIGNMENT_SUBMISSION_STATUSES.SUBMITTED]: 'تحویل داده شده',
  [ASSIGNMENT_SUBMISSION_STATUSES.GRADED]: 'تصحیح شده',
  [ASSIGNMENT_SUBMISSION_STATUSES.LATE]: 'با تأخیر',
  [ASSIGNMENT_SUBMISSION_STATUSES.MISSING]: 'تحویل داده نشده',
}

