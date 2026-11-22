// Self-contained Gregorian <-> Jalali (Solar Hijri) conversion and calendar
// grid helpers. No external dependencies — algorithm based on the well-known
// Birashk/Borkowski conversion used widely in Persian date libraries.

const PERSIAN_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
]

// Saturday-first week (Persian calendars start the week on شنبه).
const PERSIAN_WEEKDAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه']
const PERSIAN_WEEKDAYS_SHORT = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

function div(a, b) {
  return Math.floor(a / b)
}

/**
 * Convert a Gregorian date to Jalali. Returns [jy, jm, jd] (1-based month/day).
 */
export function gregorianToJalali(gy, gm, gd) {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
  let jy
  const gy2 = gm > 2 ? gy + 1 : gy
  let days = 355666 + 365 * gy + div(gy2 + 3, 4) - div(gy2 + 99, 100) +
    div(gy2 + 399, 400) + gd + g_d_m[gm - 1]
  jy = -1595 + 33 * div(days, 12053)
  days %= 12053
  jy += 4 * div(days, 1461)
  days %= 1461
  if (days > 365) {
    jy += div(days - 1, 365)
    days = (days - 1) % 365
  }
  let jm, jd
  if (days < 186) {
    jm = 1 + div(days, 31)
    jd = 1 + (days % 31)
  } else {
    jm = 7 + div(days - 186, 30)
    jd = 1 + ((days - 186) % 30)
  }
  return [jy, jm, jd]
}

/**
 * Convert a Jalali date to Gregorian. Returns [gy, gm, gd] (1-based month/day).
 */
export function jalaliToGregorian(jy, jm, jd) {
  jy += 1595
  let days = -355668 + 365 * jy + div(jy, 33) * 8 + div((jy % 33) + 3, 4) + jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186)
  let gy = 400 * div(days, 146097)
  days %= 146097
  if (days > 36524) {
    gy += 100 * div(--days, 36524)
    days %= 36524
    if (days >= 365) days++
  }
  gy += 4 * div(days, 1461)
  days %= 1461
  if (days > 365) {
    gy += div(days - 1, 365)
    days = (days - 1) % 365
  }
  let gd = days + 1
  const sal_a = [0, 31, (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
    31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  let gm
  for (gm = 0; gm < 13; gm++) {
    const v = sal_a[gm]
    if (gd <= v) break
    gd -= v
  }
  return [gy, gm, gd]
}

/**
 * Whether a Jalali year is a leap year (has 30 days in Esfand).
 */
export function isJalaliLeapYear(jy) {
  const r = jy % 33
  return [1, 5, 9, 13, 17, 22, 26, 30].includes(r)
}

/**
 * Number of days in a given Jalali month (1-based month).
 */
export function jalaliMonthLength(jy, jm) {
  if (jm <= 6) return 31
  if (jm <= 11) return 30
  return isJalaliLeapYear(jy) ? 30 : 29
}

/**
 * Convert a JS Date to Jalali parts: { jy, jm, jd }.
 */
export function dateToJalali(date) {
  const [jy, jm, jd] = gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate())
  return { jy, jm, jd }
}

/**
 * Today's Jalali date as { jy, jm, jd }.
 */
export function jalaliToday() {
  return dateToJalali(new Date())
}

/**
 * Format a Jalali date as an ISO Gregorian string (YYYY-MM-DD) for API keys.
 */
export function jalaliToISO(jy, jm, jd) {
  const [gy, gm, gd] = jalaliToGregorian(jy, jm, jd)
  return `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`
}

/**
 * Parse a Gregorian ISO string (YYYY-MM-DD) to Jalali parts.
 */
export function isoToJalali(iso) {
  if (!iso) return null
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number)
  if (!y || !m || !d) return null
  const [jy, jm, jd] = gregorianToJalali(y, m, d)
  return { jy, jm, jd }
}

/**
 * The Persian weekday index (0 = Saturday … 6 = Friday) for a Jalali date.
 */
export function jalaliWeekday(jy, jm, jd) {
  const [gy, gm, gd] = jalaliToGregorian(jy, jm, jd)
  // JS getDay(): 0=Sunday … 6=Saturday. Convert so Saturday=0.
  const jsDay = new Date(gy, gm - 1, gd).getDay()
  return (jsDay + 1) % 7
}

/**
 * Build a month grid (array of weeks, each an array of 7 day cells) for a
 * Jalali year/month. Leading/trailing cells from adjacent months are included
 * with `inMonth: false` so the grid is always rectangular.
 */
export function buildMonthGrid(jy, jm) {
  const firstWeekday = jalaliWeekday(jy, jm, 1)
  const monthLen = jalaliMonthLength(jy, jm)

  // Previous month info for leading blanks.
  let prevY = jy, prevM = jm - 1
  if (prevM < 1) { prevM = 12; prevY-- }
  const prevLen = jalaliMonthLength(prevY, prevM)

  const cells = []
  // Leading days from previous month.
  for (let i = firstWeekday - 1; i >= 0; i--) {
    const d = prevLen - i
    cells.push({ jy: prevY, jm: prevM, jd: d, inMonth: false, iso: jalaliToISO(prevY, prevM, d) })
  }
  // Current month days.
  for (let d = 1; d <= monthLen; d++) {
    cells.push({ jy, jm, jd: d, inMonth: true, iso: jalaliToISO(jy, jm, d) })
  }
  // Trailing days from next month to complete the last week.
  let nextY = jy, nextM = jm + 1
  if (nextM > 12) { nextM = 1; nextY++ }
  let trailing = 1
  while (cells.length % 7 !== 0) {
    cells.push({ jy: nextY, jm: nextM, jd: trailing, inMonth: false, iso: jalaliToISO(nextY, nextM, trailing) })
    trailing++
  }

  // Chunk into weeks.
  const weeks = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }
  return weeks
}

/**
 * Build the 7 day cells for the Jalali week containing the given date.
 */
export function buildWeekGrid(jy, jm, jd) {
  const weekday = jalaliWeekday(jy, jm, jd) // 0=Saturday
  const cells = []
  // Start from Saturday of this week.
  let startY = jy, startM = jm, startD = jd - weekday
  // Normalise underflow into the previous month.
  while (startD < 1) {
    startM--
    if (startM < 1) { startM = 12; startY-- }
    startD += jalaliMonthLength(startY, startM)
  }
  let curY = startY, curM = startM, curD = startD
  for (let i = 0; i < 7; i++) {
    const len = jalaliMonthLength(curY, curM)
    cells.push({
      jy: curY, jm: curM, jd: curD,
      inMonth: curM === jm,
      iso: jalaliToISO(curY, curM, curD),
    })
    curD++
    if (curD > len) {
      curD = 1
      curM++
      if (curM > 12) { curM = 1; curY++ }
    }
  }
  return cells
}

export function jalaliMonthName(jm) {
  return PERSIAN_MONTHS[(jm - 1 + 12) % 12]
}

export { PERSIAN_MONTHS, PERSIAN_WEEKDAYS, PERSIAN_WEEKDAYS_SHORT }
