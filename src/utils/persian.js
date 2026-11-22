// Thin re-export layer over the canonical formatting helpers in `@/lib/utils`
// and `@/lib/format`. All digit-conversion logic now lives in a single place
// (`@/lib/utils`); this file only keeps the few helpers that don't yet have a
// canonical home, preserving the historical import paths used across the app.

import { toPersianDigits } from '../lib/utils.js'
import { toFa, toFaTime } from '../lib/format.js'

/**
 * Convert all ASCII digits in a value to Persian digits.
 */
export function toPersian(str) {
  return toPersianDigits(str)
}

// Aliases of toPersian kept for backwards compatibility across the codebase.
export { toPersian as toPersianNumber }
export { toPersian as toPersianDigits }

/**
 * Like toPersian, but returns '۰' for null/undefined (used in numeric displays).
 */
export { toFa }

/**
 * Format a duration (in seconds) as a Persian-digit clock string.
 */
export { toFaTime }
