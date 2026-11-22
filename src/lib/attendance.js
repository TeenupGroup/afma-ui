import { CheckCircle2, Clock, XCircle, AlertCircle, HelpCircle } from 'lucide-svelte'
import { ATTENDANCE_STATUSES } from './statuses'

export const ATTENDANCE_CONFIG = {
  [ATTENDANCE_STATUSES.PRESENT]: {
    label: 'حاضر',
    icon: CheckCircle2,
    color: 'emerald',
    textClass: 'text-emerald-700 dark:text-emerald-300',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderClass: 'border-emerald-200/80 dark:border-emerald-800/50',
    dotClass: 'bg-emerald-500',
    glowClass: 'shadow-emerald-500/20',
  },
  [ATTENDANCE_STATUSES.LATE]: {
    label: 'تأخیر',
    icon: Clock,
    color: 'amber',
    textClass: 'text-amber-700 dark:text-amber-300',
    bgClass: 'bg-amber-50 dark:bg-amber-950/40',
    borderClass: 'border-amber-200/80 dark:border-amber-800/50',
    dotClass: 'bg-amber-500',
    glowClass: 'shadow-amber-500/20',
  },
  [ATTENDANCE_STATUSES.ABSENT]: {
    label: 'غایب',
    icon: XCircle,
    color: 'rose',
    textClass: 'text-rose-700 dark:text-rose-300',
    bgClass: 'bg-rose-50 dark:bg-rose-950/40',
    borderClass: 'border-rose-200/80 dark:border-rose-800/50',
    dotClass: 'bg-rose-500',
    glowClass: 'shadow-rose-500/20',
  },
  [ATTENDANCE_STATUSES.EXCUSED]: {
    label: 'مرخصی / موجه',
    icon: AlertCircle,
    color: 'sky',
    textClass: 'text-sky-700 dark:text-sky-300',
    bgClass: 'bg-sky-50 dark:bg-sky-950/40',
    borderClass: 'border-sky-200/80 dark:border-sky-800/50',
    dotClass: 'bg-sky-500',
    glowClass: 'shadow-sky-500/20',
  },
}

const DEFAULT_ATTENDANCE_CONFIG = {
  label: 'نامشخص',
  icon: HelpCircle,
  color: 'slate',
  textClass: 'text-slate-600 dark:text-slate-400',
  bgClass: 'bg-slate-100 dark:bg-slate-800',
  borderClass: 'border-slate-200 dark:border-slate-700',
  dotClass: 'bg-slate-400',
  glowClass: 'shadow-slate-500/10',
}

/**
 * Returns complete visual and localized metadata for an attendance status
 * @param {string} status
 * @returns {typeof DEFAULT_ATTENDANCE_CONFIG}
 */
export function getAttendanceMeta(status) {
  if (!status) return DEFAULT_ATTENDANCE_CONFIG
  const normalized = String(status).toLowerCase().trim()
  return ATTENDANCE_CONFIG[normalized] || DEFAULT_ATTENDANCE_CONFIG
}

/**
 * Returns localized Persian label for an attendance status
 * @param {string} status
 * @returns {string}
 */
export function getAttendanceLabel(status) {
  return getAttendanceMeta(status).label
}
