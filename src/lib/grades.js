import { toPersianDigits } from './utils.js'

/**
 * Educational grading utilities for Iranian schools (0-20 and 0-100 scale, plus descriptive grades).
 */

export const GRADE_TIERS = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  AVERAGE: 'average',
  POOR: 'poor',
}

/**
 * Determine Iranian grade tier and associated metadata.
 *
 * @param {number|string|null|undefined} score
 * @param {number} [maxScore=20]
 * @returns {{ tier: string, label: string, color: string, emoji: string, percentage: number }}
 */
export function getIranianGradeTier(score, maxScore = 20) {
  if (score === null || score === undefined || score === '') {
    return {
      tier: 'unknown',
      label: 'نامشخص',
      color: 'slate',
      emoji: '—',
      percentage: 0,
    }
  }

  // Handle descriptive Persian grades
  const sStr = String(score).trim()
  if (sStr === 'خیلی خوب' || sStr === 'عالی') {
    return { tier: GRADE_TIERS.EXCELLENT, label: 'خیلی خوب', color: 'emerald', emoji: '⭐', percentage: 100 }
  }
  if (sStr === 'خوب') {
    return { tier: GRADE_TIERS.GOOD, label: 'خوب', color: 'sky', emoji: '✨', percentage: 80 }
  }
  if (sStr === 'قابل قبول') {
    return { tier: GRADE_TIERS.AVERAGE, label: 'قابل قبول', color: 'amber', emoji: '👍', percentage: 60 }
  }
  if (sStr === 'نیاز به تلاش' || sStr === 'نیاز به تلاش بیشتر') {
    return { tier: GRADE_TIERS.POOR, label: 'نیاز به تلاش بیشتر', color: 'rose', emoji: '💪', percentage: 40 }
  }

  // Normalize numeric score
  const numeric = parseFloat(String(score).replace(/[^0-9.]/g, ''))
  if (Number.isNaN(numeric)) {
    return { tier: 'unknown', label: sStr, color: 'slate', emoji: '—', percentage: 0 }
  }

  // Calculate percentage
  const percentage = maxScore > 0 ? (numeric / maxScore) * 100 : 0

  if (percentage >= 85) {
    return {
      tier: GRADE_TIERS.EXCELLENT,
      label: maxScore <= 20 ? (numeric >= 19 ? 'عالی' : 'بسیار خوب') : 'عالی',
      color: 'emerald',
      emoji: '⭐',
      percentage: Math.round(percentage),
    }
  }

  if (percentage >= 70) {
    return {
      tier: GRADE_TIERS.GOOD,
      label: 'خوب',
      color: 'sky',
      emoji: '✨',
      percentage: Math.round(percentage),
    }
  }

  if (percentage >= 50) {
    return {
      tier: GRADE_TIERS.AVERAGE,
      label: 'متوسط',
      color: 'amber',
      emoji: '👍',
      percentage: Math.round(percentage),
    }
  }

  return {
    tier: GRADE_TIERS.POOR,
    label: 'نیاز به تلاش',
    color: 'rose',
    emoji: '💪',
    percentage: Math.round(percentage),
  }
}

/**
 * Format score into Persian digits with optional scale.
 * e.g. 19.5 -> "۱۹.۵", with scale -> "۱۹.۵ از ۲۰"
 *
 * @param {number|string|null|undefined} score
 * @param {{ showScale?: boolean, maxScore?: number }} [options]
 * @returns {string}
 */
export function formatPersianScore(score, options = {}) {
  if (score === null || score === undefined || score === '') return '—'
  const { showScale = false, maxScore = 20 } = options

  const formatted = toPersianDigits(score)
  if (showScale && maxScore) {
    return `${formatted} از ${toPersianDigits(maxScore)}`
  }
  return formatted
}
