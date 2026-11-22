import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import {
  gregorianToJalali,
  jalaliToGregorian,
  jalaliToday,
  dateToJalali,
  isoToJalali,
  jalaliToISO,
  jalaliWeekday,
  buildMonthGrid,
  buildWeekGrid,
  jalaliMonthLength,
  jalaliMonthName,
  PERSIAN_MONTHS,
  PERSIAN_WEEKDAYS,
  PERSIAN_WEEKDAYS_SHORT,
} from '../utils/jalali.js'

export const FALLBACK_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23f3f4f6'/%3E%3C/svg%3E"

/**
 * Merge Tailwind CSS classes with clsx and tailwind-merge
 * This allows conditional classes and proper Tailwind class merging
 * 
 * @example
 * cn('text-red-500', condition && 'bg-blue-500', 'p-4')
 * // Returns: 'text-red-500 bg-blue-500 p-4'
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Convert Persian and Arabic digits back to English (for sending to server and standard UI display)
 *
 * @param {string|number} str - String or number with Persian/Arabic digits
 * @returns {string} String with English digits
 */
export function toEnglishDigits(str) {
  if (str === null || str === undefined) return ''
  return String(str)
    .replace(/[\u06F0-\u06F9]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x06F0 + 48))
    .replace(/[\u0660-\u0669]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x0660 + 48))
}

/**
 * Format a number or string with Persian digits (۰-۹)
 * 
 * @param {number|string} num - The number to format
 * @returns {string} Number with Persian digits
 */
export function toPersianDigits(num) {
  if (num === null || num === undefined) return ''
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return String(num)
    .replace(/[0-9]/g, (digit) => persianDigits[parseInt(digit, 10)])
    .replace(/[\u0660-\u0669]/g, (digit) => persianDigits[digit.charCodeAt(0) - 0x0660])
}

/**
 * Normalize Persian text for reliable comparison (removes harakat, ZWNJ, converts Arabic Yeh/Kaf/Teh Marbuta to Persian).
 *
 * @param {string} str
 * @returns {string}
 */
export function normalizePersianText(str) {
  if (str === null || str === undefined) return ''
  return String(str)
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[\u200C\u200B]/g, ' ')
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ة/g, 'ه')
    .replace(/[إأآ]/g, 'ا')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ی')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Clean national code digits and pad with leading zeros up to 10 digits.
 *
 * @param {string|number} code
 * @returns {string}
 */
export function cleanNationalCode(code) {
  if (code === null || code === undefined) return ''
  const clean = toEnglishDigits(String(code)).replace(/\D+/g, '')
  if (clean.length > 0 && clean.length <= 10) {
    return clean.padStart(10, '0')
  }
  return clean
}

/**
 * Svelte action: auto-converts all numbers in the element's text to Persian digits.
 * Also watches for child additions via MutationObserver so dynamically rendered
 * numbers (e.g. from Inertia page props) are converted automatically.
 *
 * Usage in Svelte:
 *   <span use:persianDigits>{someNumber}</span>
 *   <div use:persianDigits>...</div>
 *
 * @param {HTMLElement} node
 */
export function persianDigits(node) {
  const DIGIT_MAP = {
    '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴', '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹',
    '\u0660': '۰', '\u0661': '۱', '\u0662': '۲', '\u0663': '۳', '\u0664': '۴', '\u0665': '۵', '\u0666': '۶', '\u0667': '۷', '\u0668': '۸', '\u0669': '۹'
  }

  function convert(el) {
    if (!el) return
    if (el.nodeType === Node.TEXT_NODE) {
      const original = el.textContent
      if (!original) return
      const converted = original
        .replace(/[0-9]/g, d => DIGIT_MAP[d])
        .replace(/[\u0660-\u0669]/g, d => DIGIT_MAP[d])
      if (converted !== original) el.textContent = converted
    } else if (el.nodeType === Node.ELEMENT_NODE) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') return
      if (typeof el.closest === 'function') {
        if (el.closest('.no-persian-nums')) return
        if (el.closest('[dir="ltr"]') || el.getAttribute?.('dir') === 'ltr') return
        if (el.closest('.font-mono') || el.classList?.contains('font-mono')) return
      }
      for (const child of el.childNodes) convert(child)
    }
  }

  function convertInputValue(e) {
    const el = e?.target
    if (!el || typeof el.value !== 'string') return
    if (el.tagName === 'SELECT') return
    if (el.type === 'file' || el.type === 'password' || el.type === 'email' || el.type === 'url' || el.type === 'number' || el.type === 'date' || el.type === 'time') return
    if (typeof el.closest === 'function') {
      if (el.closest('.no-persian-nums') || el.classList?.contains('no-persian-nums')) return
      if (el.closest('[dir="ltr"]') || el.getAttribute?.('dir') === 'ltr') return
      if (el.closest('.font-mono') || el.classList?.contains('font-mono')) return
    }
    const start = el.selectionStart
    const converted = el.value
      .replace(/[0-9]/g, d => DIGIT_MAP[d])
      .replace(/[\u0660-\u0669]/g, d => DIGIT_MAP[d])
    if (converted !== el.value) {
      el.value = converted
      if (start !== null && typeof el.setSelectionRange === 'function') el.setSelectionRange(start, start)
    }
  }

  convert(node)

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'childList') {
        for (const n of m.addedNodes) convert(n)
      } else if (m.type === 'characterData') {
        const t = m.target
        const original = t?.textContent
        if (!original) continue
        const converted = original
          .replace(/[0-9]/g, d => DIGIT_MAP[d])
          .replace(/[\u0660-\u0669]/g, d => DIGIT_MAP[d])
        if (converted !== original) t.textContent = converted
      }
    }
  })
  observer.observe(node, { childList: true, subtree: true, characterData: true })

  node.addEventListener('input', convertInputValue, true)

  return { destroy() { observer.disconnect(); node.removeEventListener('input', convertInputValue, true) } }
}

/**
 * Convert English/Persian/Arabic digits in an input event to Persian digits.
 * Use as: oninput={persianInputHandler} on an <input> element.
 *
 * @param {Event} e - The input event
 */
export function persianInputHandler(e) {
  const el = e?.target
  if (!el || typeof el.value !== 'string' || el.type === 'file') return
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  const start = el.selectionStart
  const converted = el.value
    .replace(/[0-9]/g, (d) => persianDigits[parseInt(d, 10)])
    .replace(/[\u0660-\u0669]/g, (d) => persianDigits[d.charCodeAt(0) - 0x0660])
  if (converted !== el.value) {
    el.value = converted
    if (start !== null && typeof el.setSelectionRange === 'function') el.setSelectionRange(start, start)
  }
}

/**
 * Convert Persian/Arabic digits in a password input event back to ASCII English digits (0-9).
 * Use as: oninput={englishPasswordInputHandler} on password fields.
 *
 * @param {Event} e - The input event
 */
export function englishPasswordInputHandler(e) {
  const el = e?.target
  if (!el || typeof el.value !== 'string' || el.type === 'file') return
  const start = el.selectionStart
  const converted = toEnglishDigits(el.value)
  if (converted !== el.value) {
    el.value = converted
    if (start !== null && typeof el.setSelectionRange === 'function') {
      try {
        el.setSelectionRange(start, start)
      } catch {
        // Ignore selection errors on unsupported input types
      }
    }
  }
}

/**
 * Format a date to Jalali (Persian) format.
 * Handles ISO timestamps, Date objects, and pre-formatted Jalali strings safely.
 *
 * @param {Date|string|null} date - The date to format
 * @param {object} options - Format options for Intl.DateTimeFormat
 * @returns {string} Formatted Jalali date with Persian digits
 */
export function formatJalali(date, options = {}) {
  if (!date) return ''
  const str = String(date).trim()
  if (!str || str === '—' || str === '-') return ''

  const englishDigits = toEnglishDigits(str)
  // If already Jalali (e.g. 1405/07/14 or 1405-07-14)
  if (/^1[34]\d{2}[\/\-]\d{1,2}[\/\-]\d{1,2}/.test(englishDigits)) {
    const parts = englishDigits.split(/[\/\-]/)
    const jy = Number(parts[0])
    const jm = Number(parts[1])
    const jd = Number(parts[2].substring(0, 2))
    const [gy, gm, gd] = jalaliToGregorian(jy, jm, jd)
    const d = new Date(Date.UTC(gy, gm - 1, gd, 12, 0, 0))
    try {
      const formatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options,
      })
      return toPersianDigits(formatter.format(d))
    } catch {
      const mName = PERSIAN_MONTHS[(jm - 1 + 12) % 12] || ''
      return toPersianDigits(`${jd} ${mName} ${jy}`)
    }
  }

  try {
    let d
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      d = new Date(`${str}T12:00:00Z`)
    } else {
      d = typeof date === 'string' ? new Date(date) : date
    }
    if (isNaN(d.getTime())) return toPersianDigits(str)
    const formatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options,
    })
    return toPersianDigits(formatter.format(d))
  } catch {
    return toPersianDigits(str)
  }
}

/**
 * Format any date value (ISO timestamp, Y-m-d, Date, or already Jalali string) as a short Jalali date.
 * Returns '—' for empty/invalid input.
 *
 * @param {Date|string|null} date
 * @returns {string} e.g. ۱۴۰۵/۰۷/۱۴
 */
export function fmtDate(date) {
  if (!date) return '—'
  const str = String(date).trim()
  if (!str || str === '—' || str === '-') return '—'

  // If already Jalali (e.g. 1380/01/01 or 1405-07-09 or with Persian digits)
  const englishDigits = toEnglishDigits(str)
  if (/^1[34]\d{2}[\/\-]\d{1,2}[\/\-]\d{1,2}/.test(englishDigits)) {
    const parts = englishDigits.split(/[\/\-]/)
    const y = parts[0]
    const m = parts[1].padStart(2, '0')
    const d = parts[2].substring(0, 2).padStart(2, '0')
    return toPersianDigits(`${y}/${m}/${d}`)
  }

  try {
    let d
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      // Midday avoids timezone day-shifting across UTC boundaries
      d = new Date(`${str}T12:00:00Z`)
    } else {
      d = typeof date === 'string' ? new Date(date) : date
    }
    if (isNaN(d.getTime())) return toPersianDigits(str)
    return toPersianDigits(new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d))
  } catch {
    return toPersianDigits(str)
  }
}

/**
 * Format any date value (ISO timestamp, Y-m-d, Date, or already Jalali string) as a full Persian date.
 * Returns '—' for empty/invalid input.
 *
 * @param {Date|string|null} date
 * @param {boolean} includeWeekday - Whether to prepend weekday name (e.g. "سه‌شنبه ۱۴ مهر ۱۴۰۵")
 * @returns {string} e.g. "۱۴ مهر ۱۴۰۵"
 */
export function fmtDateLong(date, includeWeekday = false) {
  if (!date) return '—'
  const str = String(date).trim()
  if (!str || str === '—' || str === '-') return '—'

  const englishDigits = toEnglishDigits(str)
  if (/^1[34]\d{2}[\/\-]\d{1,2}[\/\-]\d{1,2}/.test(englishDigits)) {
    const parts = englishDigits.split(/[\/\-]/)
    const jy = Number(parts[0])
    const jm = Number(parts[1])
    const jd = Number(parts[2].substring(0, 2))
    const monthName = PERSIAN_MONTHS[(jm - 1 + 12) % 12] || ''
    if (includeWeekday) {
      const weekdayName = PERSIAN_WEEKDAYS[jalaliWeekday(jy, jm, jd)] || ''
      return toPersianDigits(`${weekdayName} ${jd} ${monthName} ${jy}`)
    }
    return toPersianDigits(`${jd} ${monthName} ${jy}`)
  }

  try {
    let d
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      d = new Date(`${str}T12:00:00Z`)
    } else {
      d = typeof date === 'string' ? new Date(date) : date
    }
    if (isNaN(d.getTime())) return toPersianDigits(str)
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
    if (includeWeekday) {
      options.weekday = 'long'
    }
    return toPersianDigits(new Intl.DateTimeFormat('fa-IR-u-ca-persian', options).format(d))
  } catch {
    return toPersianDigits(str)
  }
}

/**
 * Returns today's universal Jalali date object.
 *
 * @returns {{ jy: number, jm: number, jd: number, weekday: string, month_name: string, short: string, formatted: string }}
 */
export function getTodayJalali() {
  const { jy, jm, jd } = jalaliToday()
  const weekdayIndex = jalaliWeekday(jy, jm, jd)
  const weekday = PERSIAN_WEEKDAYS[weekdayIndex] || ''
  const monthName = PERSIAN_MONTHS[(jm - 1 + 12) % 12] || ''
  const short = toPersianDigits(`${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`)
  const formatted = toPersianDigits(`${weekday} ${jd} ${monthName} ${jy}`)
  return {
    jy,
    jm,
    jd,
    weekday,
    month_name: monthName,
    short,
    formatted,
  }
}

/**
 * Format a time string ("08:00:00" or "08:00") as HH:MM.
 *
 * @param {string|null} time
 * @returns {string}
 */
export function fmtTime(time) {
  if (!time) return ''
  const clean = toEnglishDigits(String(time).trim())
  if (!clean || clean === '—' || clean === '-') return ''
  return toPersianDigits(clean.substring(0, 5))
}

/**
 * Format Gregorian date cleanly as YYYY/MM/DD.
 * Strips time/ISO offset from inputs like "2027-01-08T20:30:00.000000Z".
 *
 * @param {string|null} date
 * @returns {string}
 */
export function fmtGregorianDate(date) {
  if (!date) return '-'
  const str = String(date).trim()
  if (!str || str === '-' || str === '—') return '-'
  const dateOnly = str.split('T')[0]
  if (/^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/.test(dateOnly)) {
    return dateOnly.replace(/-/g, '/')
  }
  return dateOnly || '-'
}

/**
 * Format any date/time string to Persian Jalali date with time (e.g. "۱۴۰۵/۰۷/۲۸ - ۰۹:۱۲").
 *
 * @param {Date|string|null} date
 * @returns {string}
 */
export function fmtDateTime(date) {
  if (!date) return '—'
  const str = String(date).trim()
  if (!str || str === '—' || str === '-') return '—'
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) return toPersianDigits(str)
    const formatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    return toPersianDigits(formatter.format(d).replace(',', ' -'))
  } catch {
    return toPersianDigits(str)
  }
}

/**
 * Re-export Jalali utilities from '../utils/jalali.js'.
 */
export {
  gregorianToJalali,
  jalaliToGregorian,
  jalaliToday,
  dateToJalali,
  isoToJalali,
  jalaliToISO,
  jalaliWeekday,
  buildMonthGrid,
  buildWeekGrid,
  jalaliMonthLength,
  jalaliMonthName,
  PERSIAN_MONTHS,
  PERSIAN_WEEKDAYS,
  PERSIAN_WEEKDAYS_SHORT,
} from '../utils/jalali.js'

/**
 * Debounce a function
 * 
 * @param {Function} func - The function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Resolve a storage path to a full URL.
 *
 * Handles all common storage formats used across the app:
 * - null/empty → returns null
 * - Full URL (http/https) → returned as-is
 * - Absolute path starting with / → returned as-is
 * - Relative path (e.g. "articles/image.jpg") → prefixed with /storage/
 *
 * @param {string|null} path - The stored path or URL
 * @returns {string|null} Full URL or null
 *
 * @example
 * storageUrl('articles/2024/01/photo.jpg') // '/storage/articles/2024/01/photo.jpg'
 * storageUrl('https://cdn.example.com/img.jpg') // 'https://cdn.example.com/img.jpg'
 * storageUrl(null) // null
 */
export function storageUrl(path) {
  if (!path) return null
  const s = String(path).trim()
  if (!s) return null
  if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('data:') || s.startsWith('blob:')) return s
  if (s.startsWith('/')) return s
  return `/storage/${s}`
}

/**
 * Normalizes score and numeric inputs by converting Persian/Arabic digits,
 * replacing Persian decimal slash and commas with standard dot '.',
 * and stripping any invalid characters.
 *
 * @param {string|number} str
 * @returns {string}
 */
export function normalizeScore(str) {
  if (str === null || str === undefined) return ''
  return toEnglishDigits(String(str))
    .replace(/[\/٫،]/g, '.')
    .replace(/[^0-9.]/g, '')
    .replace(/(\..*?)\..*/g, '$1')
}

/**
 * Generate a URL-safe slug from Persian or English title text.
 *
 * @param {string} text
 * @returns {string}
 */
export function generateSlug(text) {
  if (!text) return ''
  return toEnglishDigits(String(text))
    .trim()
    .toLowerCase()
    .replace(/[\s\u200C]+/g, '-')
    .replace(/[^\u0600-\u06FFa-z0-9\-_]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Escape HTML special characters to prevent XSS in `{@html ...}` blocks and attribute contexts.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Convert inline Markdown syntax (images, links, bold, italic, strike, code)
 * into HTML while preserving existing HTML tags.
 *
 * @param {string} str
 * @returns {string}
 */
function parseInlineMarkdown(str) {
  if (!str) return ''
  return str
    // Images: ![alt](url)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-xl max-w-full h-auto my-3" />')
    // Links: [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">$1</a>')
    // Bold: **text**
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Underline: __text__
    .replace(/__([^_]+)__/g, '<u>$1</u>')
    // Strikethrough: ~~text~~
    .replace(/~~([^~]+)~~/g, '<s>$1</s>')
    // Italic: *text*
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>')
    // Inline code: `code`
    .replace(/`([^`\n]+)`/g, '<code>$1</code>')
}

/**
 * Render rich text that may contain HTML (from TipTap RichEditor),
 * Markdown syntax, or plain text with newlines into styled HTML.
 *
 * @param {string|null|undefined} text
 * @returns {string}
 */
export function renderRichText(text) {
  if (!text) return ''
  const raw = String(text).trim()
  if (!raw) return ''

  // If it already contains block-level HTML tags from RichEditor, also parse any inline markdown inside
  if (/<(p|h[1-6]|ul|ol|li|blockquote|div|pre|table|img|br)\b/i.test(raw)) {
    return parseInlineMarkdown(raw)
  }

  // Convert Markdown / plain text blocks to HTML
  const lines = raw.replace(/\r\n/g, '\n').split('\n')
  const html = []
  let inUl = false
  let inOl = false
  let inCodeBlock = false
  let codeLines = []

  function closeLists() {
    if (inUl) {
      html.push('</ul>')
      inUl = false
    }
    if (inOl) {
      html.push('</ol>')
      inOl = false
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.startsWith('```')) {
      closeLists()
      if (inCodeBlock) {
        html.push(`<pre><code>${codeLines.join('\n')}</code></pre>`)
        codeLines = []
        inCodeBlock = false
      } else {
        inCodeBlock = true
      }
      continue
    }

    if (inCodeBlock) {
      codeLines.push(line)
      continue
    }

    if (!trimmed) {
      closeLists()
      continue
    }

    if (/^---+$/.test(trimmed)) {
      closeLists()
      html.push('<hr />')
      continue
    }

    const h3Match = trimmed.match(/^###\s+(.+)$/)
    if (h3Match) {
      closeLists()
      html.push(`<h3>${parseInlineMarkdown(h3Match[1])}</h3>`)
      continue
    }

    const h2Match = trimmed.match(/^##\s+(.+)$/)
    if (h2Match) {
      closeLists()
      html.push(`<h2>${parseInlineMarkdown(h2Match[1])}</h2>`)
      continue
    }

    const h1Match = trimmed.match(/^#\s+(.+)$/)
    if (h1Match) {
      closeLists()
      html.push(`<h1>${parseInlineMarkdown(h1Match[1])}</h1>`)
      continue
    }

    const quoteMatch = trimmed.match(/^>\s*(.+)$/)
    if (quoteMatch) {
      closeLists()
      html.push(`<blockquote><p>${parseInlineMarkdown(quoteMatch[1])}</p></blockquote>`)
      continue
    }

    const ulMatch = trimmed.match(/^[-*]\s+(.+)$/)
    if (ulMatch) {
      if (inOl) {
        html.push('</ol>')
        inOl = false
      }
      if (!inUl) {
        html.push('<ul>')
        inUl = true
      }
      html.push(`<li>${parseInlineMarkdown(ulMatch[1])}</li>`)
      continue
    }

    const olMatch = trimmed.match(/^[\d\u06F0-\u06F9]+[.)]\s+(.+)$/)
    if (olMatch) {
      if (inUl) {
        html.push('</ul>')
        inUl = false
      }
      if (!inOl) {
        html.push('<ol>')
        inOl = true
      }
      html.push(`<li>${parseInlineMarkdown(olMatch[1])}</li>`)
      continue
    }

    closeLists()
    html.push(`<p>${parseInlineMarkdown(trimmed)}</p>`)
  }

  closeLists()
  if (inCodeBlock && codeLines.length > 0) {
    html.push(`<pre><code>${codeLines.join('\n')}</code></pre>`)
  }

  return html.join('\n')
}

/**
 * Convert HTML from RichEditor into readable Markdown for Markdown editing mode.
 *
 * @param {string|null|undefined} html
 * @returns {string}
 */
export function htmlToMarkdown(html) {
  if (!html) return ''
  let s = String(html).trim()
  if (!s) return ''

  // If it doesn't contain HTML tags, return as-is
  if (!/<[a-z][\s\S]*>/i.test(s)) return s

  return s
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<blockquote[^>]*>\s*<p[^>]*>([\s\S]*?)<\/p>\s*<\/blockquote>/gi, '> $1\n\n')
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '> $1\n\n')
    .replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```\n\n')
    .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, inner) => {
      return inner.replace(/<li[^>]*>\s*(?:<p[^>]*>)?([\s\S]*?)(?:<\/p>)?\s*<\/li>/gi, '- $1\n') + '\n'
    })
    .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, inner) => {
      let idx = 1
      return inner.replace(/<li[^>]*>\s*(?:<p[^>]*>)?([\s\S]*?)(?:<\/p>)?\s*<\/li>/gi, (__, item) => `${idx++}. ${item}\n`) + '\n'
    })
    .replace(/<img[^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*\/?>/gi, '![$2]($1)')
    .replace(/<img[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']+)["'][^>]*\/?>/gi, '![$1]($2)')
    .replace(/<img[^>]*src=["']([^"']+)["'][^>]*\/?>/gi, '![]($1)')
    .replace(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')
    .replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**')
    .replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, '*$2*')
    .replace(/<u[^>]*>([\s\S]*?)<\/u>/gi, '__$1__')
    .replace(/<(s|strike|del)[^>]*>([\s\S]*?)<\/\1>/gi, '~~$2~~')
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`')
    .replace(/<hr\s*\/?>/gi, '\n---\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
    .replace(/<\/?p[^>]*>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Strip HTML tags and Markdown formatting for plain-text previews (cards, meta tags).
 *
 * @param {string|null|undefined} text
 * @returns {string}
 */
export function stripRichText(text) {
  if (!text) return ''
  return String(text)
    .replace(/<[^>]*>/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*_~`>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Normalize a phone number string into a safe `tel:...` href or return null when empty / non-dialable
 * (e.g. "مشخص نیست", "-", empty string). Supports Persian/Arabic digits.
 *
 * @param {string|number|null|undefined} phone
 * @returns {string|null}
 */
export function sanitizeTelHref(phone) {
  if (phone === null || phone === undefined) return null
  const ascii = toEnglishDigits(String(phone)).trim()
  if (!ascii) return null
  const hasLeadingPlus = ascii.startsWith('+')
  const digits = ascii.replace(/[^0-9]/g, '')
  if (digits.length < 3) return null
  return `tel:${hasLeadingPlus ? '+' : ''}${digits}`
}

/**
 * Extract international WhatsApp phone digits from a raw phone number or wa.me URL.
 * Converts local Iranian mobile numbers (09...) to 989... format.
 *
 * @param {string|null|undefined} input
 * @param {string} fallback
 * @returns {string}
 */
export function sanitizeWhatsAppDigits(input, fallback = '') {
  const normalize = (raw) => {
    if (raw === null || raw === undefined) return ''
    const ascii = toEnglishDigits(String(raw)).trim()
    if (!ascii) return ''
    const waMatch = ascii.match(/wa\.me\/([0-9+]+)/i)
    const candidate = waMatch ? waMatch[1] : ascii
    let digits = candidate.replace(/[^0-9]/g, '')
    if (digits.startsWith('0098') && digits.length >= 12) {
      digits = digits.slice(2)
    } else if (digits.startsWith('0') && digits.length >= 10) {
      digits = '98' + digits.slice(1)
    }
    return digits.length >= 7 ? digits : ''
  }

  return normalize(input) || normalize(fallback)
}

/**
 * Build a WhatsApp chat URL from a raw phone or wa.me URL, or return '' if invalid.
 *
 * @param {string|null|undefined} input
 * @param {string} fallback
 * @param {string} text
 * @returns {string}
 */
export function whatsappUrl(input, fallback = '', text = '') {
  const digits = sanitizeWhatsAppDigits(input, fallback)
  if (!digits) return ''
  return text
    ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
    : `https://wa.me/${digits}`
}

/**
 * Resolve current Jalali year formatted with Persian digits.
 *
 * @param {{ jy?: number }|null|undefined} currentDate
 * @returns {string}
 */
export function currentJalaliYear(currentDate = null) {
  const jy = currentDate?.jy || jalaliToday().jy
  return toPersianDigits(jy)
}

export {
  handleGridKeydown,
  gridNavigation,
  autoSelectOnFocus,
  handleAttendanceRowKeydown,
} from './tableNavigation.js'

export { formatPrice } from './format.js'



