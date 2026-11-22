/**
 * Shared formatting helpers for the Svelte frontend.
 *
 * Consolidates the scattered `formatPrice`, `formatDate`, `formatDuration`,
 * `toFa` and Persian-digit helpers that were previously redefined in many
 * pages and card components. Reuses the existing digit helpers from
 * `@/lib/utils` rather than reimplementing them.
 *
 * @packageDocumentation
 */

import { toPersianDigits, toEnglishDigits, formatJalali } from './utils.js'

export { toPersianDigits, toEnglishDigits, formatJalali }

/**
 * Format a duration (in seconds) as a Persian-digit clock string.
 * Returns HH:MM:SS when an hour or more, otherwise MM:SS.
 * `toFaTime` is the legacy name kept for backwards compatibility.
 */
export function toFaTime(totalSeconds) {
  if (totalSeconds === null || totalSeconds === undefined) return '۰۰:۰۰'
  const secs = Math.max(0, Math.floor(Number(totalSeconds) || 0))
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60

  if (h > 0) {
    return toPersianDigits(String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0'))
  }
  return toPersianDigits(String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0'))
}

/**
 * Persian digits equivalent of an ASCII numeric string/number.
 * Re-exported for convenience; see `@/lib/utils`.
 */
export const toFa = (num) => {
  if (num === null || num === undefined) return '۰'
  return toPersianDigits(num)
}

/**
 * Format a numeric price using the fa-IR locale (Persian digits).
 *
 * @param {number|string|null} price
 * @param {{ freeLabel?: string }} [options] - when price is falsy, return
 *   `freeLabel` instead of '0' (e.g. pass { freeLabel: 'رایگان' }).
 * @returns {string} Localized price.
 */
export function formatPrice(price, { freeLabel = '0' } = {}) {
  if (!price) return freeLabel
  return new Intl.NumberFormat('fa-IR').format(Number(price))
}

/**
 * Format an ISO date string as a long Jalali (Persian) date.
 * Defaults to `year / month / day`; pass options to override/add fields.
 *
 * @param {string|Date|null} date
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string}
 */
export function formatDate(date, options = {}) {
  return formatJalali(date, options)
}

/**
 * Format a duration given in seconds as a Persian-digit clock string.
 * Returns HH:MM:SS when an hour or more, otherwise MM:SS.
 *
 * @param {number|null} seconds
 * @returns {string}
 */
export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return toFa('0:00')
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60)
    const rem = mins % 60
    return `${toFa(hrs)}:${String(rem).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  return `${toFa(mins)}:${String(secs).padStart(2, '0')}`
}
