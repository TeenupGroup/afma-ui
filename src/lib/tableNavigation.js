import { toEnglishDigits, toPersianDigits, persianInputHandler } from './utils.js'

/**
 * Keyboard Navigation & Data Entry Acceleration Engine
 * 
 * Accelerates repetitive data entry across tables, scorecards, attendance sheets,
 * and forms in the application.
 */

/**
 * Svelte Action: Automatically selects all text inside an input when it receives focus.
 * Allows users to immediately type a replacement value without pressing Backspace.
 *
 * Usage:
 *   <input use:autoSelectOnFocus ... />
 *
 * @param {HTMLInputElement|HTMLTextAreaElement} node
 */
export function autoSelectOnFocus(node) {
  const handleFocus = () => {
    requestAnimationFrame(() => {
      if (document.activeElement === node && typeof node.select === 'function') {
        node.select()
      }
    })
  }

  node.addEventListener('focus', handleFocus)

  return {
    destroy() {
      node.removeEventListener('focus', handleFocus)
    },
  }
}

/**
 * Handle grid keyboard navigation for numeric or tabular data entry.
 *
 * Supported shortcuts:
 * - Enter or ArrowDown: Move to the same column on the NEXT row
 * - Shift+Enter or ArrowUp: Move to the same column on the PREVIOUS row
 * - ArrowLeft (in RTL): Move to the next column to the left (or next row if at end)
 * - ArrowRight (in RTL): Move to the previous column to the right (or prev row if at start)
 * - Tab / Shift+Tab: Seamless cell navigation
 * - Ctrl+S / Cmd+S / Ctrl+Enter: Trigger onSave callback
 * - Escape: Blur current input
 * - '+' or '=': Increment numeric score by step (default 0.5)
 * - '-': Decrement numeric score by step (default 0.5)
 *
 * @param {KeyboardEvent} e - Keydown event
 * @param {Object} options
 * @param {number} options.row - Current row index (0-based)
 * @param {number} [options.col=0] - Current column index (0-based)
 * @param {number} options.maxRows - Total count of rows
 * @param {number} [options.maxCols=1] - Total count of columns
 * @param {HTMLElement|string} [options.container] - Table or container element/selector
 * @param {Function} [options.onSave] - Save callback (for Ctrl+S / Ctrl+Enter)
 * @param {Function} [options.onChange] - Value change callback when using +/-
 * @param {boolean} [options.allowScoreAdjust=true] - Enable +/- quick adjustments
 * @param {number} [options.maxScore=20] - Max score limit for +/- adjustment
 * @param {number} [options.minScore=0] - Min score limit for +/- adjustment
 * @param {number} [options.step=0.5] - Step amount for +/- adjustment
 * @param {boolean} [options.rtl=true] - RTL mode (ArrowLeft goes to next col)
 */
export function handleGridKeydown(e, options = {}) {
  const {
    row = 0,
    col = 0,
    maxRows = 1,
    maxCols = 1,
    container = null,
    onSave = null,
    onChange = null,
    allowScoreAdjust = true,
    maxScore = 20,
    minScore = 0,
    step = 0.5,
    rtl = true,
  } = options

  const targetEl = /** @type {HTMLInputElement} */ (e.target)
  const isInput = targetEl && (targetEl.tagName === 'INPUT' || targetEl.tagName === 'TEXTAREA' || targetEl.tagName === 'SELECT')

  // Ctrl+S / Cmd+S / Ctrl+Enter -> Trigger quick save
  if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S' || e.key === 'Enter')) {
    e.preventDefault()
    if (typeof onSave === 'function') {
      onSave()
    }
    return
  }

  // Escape -> Blur
  if (e.key === 'Escape') {
    targetEl?.blur()
    return
  }

  // '+' or '=' or '-' quick numeric score adjustment
  if (allowScoreAdjust && isInput && (e.key === '+' || e.key === '=' || e.key === '-')) {
    e.preventDefault()
    const currentValStr = toEnglishDigits(String(targetEl.value || '')).replace(/[\/٫،]/g, '.')
    let currentVal = currentValStr !== '' && !isNaN(Number(currentValStr)) ? Number(currentValStr) : minScore

    let nextVal = currentVal
    if (e.key === '+' || e.key === '=') {
      nextVal = Math.min(maxScore, Math.round((currentVal + step) * 10) / 10)
    } else if (e.key === '-') {
      nextVal = Math.max(minScore, Math.round((currentVal - step) * 10) / 10)
    }

    targetEl.value = toPersianDigits(nextVal)
    targetEl.dispatchEvent(new Event('input', { bubbles: true }))
    targetEl.dispatchEvent(new Event('change', { bubbles: true }))

    if (typeof onChange === 'function') {
      onChange(nextVal)
    }

    requestAnimationFrame(() => targetEl.select())
    return
  }

  // Row navigation: Enter, ArrowDown, ArrowUp
  let nextRow = row
  let nextCol = col
  let shouldNavigate = false

  if (e.key === 'Enter' || e.key === 'ArrowDown') {
    e.preventDefault()
    if (e.shiftKey) {
      // Shift+Enter goes UP
      nextRow = Math.max(0, row - 1)
    } else {
      nextRow = Math.min(maxRows - 1, row + 1)
    }
    shouldNavigate = true
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    nextRow = Math.max(0, row - 1)
    shouldNavigate = true
  } else if (e.key === 'ArrowLeft') {
    // In RTL tables: Left moves to the next column towards the left border
    if (rtl) {
      if (col < maxCols - 1) {
        e.preventDefault()
        nextCol = col + 1
        shouldNavigate = true
      }
    } else {
      if (col > 0) {
        e.preventDefault()
        nextCol = col - 1
        shouldNavigate = true
      }
    }
  } else if (e.key === 'ArrowRight') {
    // In RTL tables: Right moves to the previous column towards the right border
    if (rtl) {
      if (col > 0) {
        e.preventDefault()
        nextCol = col - 1
        shouldNavigate = true
      }
    } else {
      if (col < maxCols - 1) {
        e.preventDefault()
        nextCol = col + 1
        shouldNavigate = true
      }
    }
  }

  if (shouldNavigate && (nextRow !== row || nextCol !== col)) {
    const parentContainer = typeof container === 'string'
      ? document.querySelector(container)
      : (container || targetEl?.closest('table') || targetEl?.closest('[data-grid-container]') || document)

    if (parentContainer) {
      // Query target input by data-row and data-col, or fallback by row index
      let nextInput = parentContainer.querySelector(`input[data-row="${nextRow}"][data-col="${nextCol}"], select[data-row="${nextRow}"][data-col="${nextCol}"]`)
      if (!nextInput) {
        nextInput = parentContainer.querySelector(`input[data-row="${nextRow}"], select[data-row="${nextRow}"]`)
      }
      if (!nextInput) {
        nextInput = parentContainer.querySelector(`input[data-matrix-index="${nextRow}"], input[data-grid-index="${nextRow}"]`)
      }

      if (nextInput) {
        const inputElem = /** @type {HTMLInputElement} */ (nextInput)
        inputElem.focus()
        inputElem.scrollIntoView({ block: 'nearest', inline: 'nearest' })
        if (typeof inputElem.select === 'function') {
          requestAnimationFrame(() => inputElem.select())
        }
      }
    }
  }
}

/**
 * Svelte Action: Container-level Grid Navigation
 * Automatically hooks up keyboard navigation across all inputs inside a table or form.
 *
 * Usage:
 *   <table use:gridNavigation={{ onSave: handleSave, maxCols: 2 }}>
 *     ...
 *   </table>
 *
 * @param {HTMLElement} node - Container element (e.g. <table>, <tbody>, <div>)
 * @param {Object} [options]
 * @param {Function} [options.onSave]
 * @param {number} [options.maxCols=1]
 * @param {number} [options.maxScore=20]
 */
export function gridNavigation(node, options = {}) {
  let opts = { ...options }

  function onKeyDown(e) {
    const target = /** @type {HTMLInputElement} */ (e.target)
    if (!target || !target.matches('input, select, textarea')) return

    const rowAttr = target.getAttribute('data-row') ?? target.getAttribute('data-matrix-index') ?? target.getAttribute('data-grid-index')
    if (rowAttr === null) return

    const row = parseInt(rowAttr, 10)
    const col = parseInt(target.getAttribute('data-col') || '0', 10)

    // Calculate max rows from all matching inputs inside the container
    const allRowInputs = node.querySelectorAll('[data-row], [data-matrix-index], [data-grid-index]')
    let highestRow = 0
    allRowInputs.forEach((el) => {
      const r = parseInt(el.getAttribute('data-row') ?? el.getAttribute('data-matrix-index') ?? el.getAttribute('data-grid-index') ?? '0', 10)
      if (r > highestRow) highestRow = r
    })

    handleGridKeydown(e, {
      row,
      col,
      maxRows: highestRow + 1,
      maxCols: opts.maxCols || 1,
      container: node,
      onSave: opts.onSave,
      maxScore: opts.maxScore ?? 20,
    })
  }

  function onFocusIn(e) {
    const target = /** @type {HTMLInputElement} */ (e.target)
    if (target && target.matches('input[type="text"], input[type="tel"], input[type="number"]')) {
      requestAnimationFrame(() => {
        if (document.activeElement === target && typeof target.select === 'function') {
          target.select()
        }
      })
    }
  }

  node.addEventListener('keydown', onKeyDown)
  node.addEventListener('focusin', onFocusIn)

  return {
    update(newOptions) {
      opts = { ...newOptions }
    },
    destroy() {
      node.removeEventListener('keydown', onKeyDown)
      node.removeEventListener('focusin', onFocusIn)
    },
  }
}

/**
 * Quick Attendance Keyboard Handler
 * Allows lightning-fast attendance recording using numeric hotkeys and arrow keys:
 * - '1' or 'h' or 'ح': Present (حاضر)
 * - '2' or 'g' or 'غ': Absent (غایب)
 * - '3' or 't' or 'ت': Late (تأخیر)
 * - '4' or 'm' or 'م': Excused (مرخصی)
 * - 'Space': Cycle to next status
 * - 'ArrowDown' or 'Enter': Advance to next student row
 * - 'ArrowUp': Return to previous student row
 * - '+' / '=': Quick +1 point
 * - '-': Quick -1 point
 * - 'Ctrl+S' / 'Cmd+S': Save attendance
 *
 * @param {KeyboardEvent} e
 * @param {Object} options
 * @param {string|number} options.studentId
 * @param {number} options.index
 * @param {number} options.totalStudents
 * @param {Function} options.setStatus - (studentId, status) => void
 * @param {Function} options.cycleStatus - (studentId) => void
 * @param {Function} [options.addPoint] - (studentId, 'positive'|'negative') => void
 * @param {Function} [options.saveAttendance] - () => void
 * @param {HTMLElement|string} [options.container]
 */
export function handleAttendanceRowKeydown(e, options) {
  const {
    studentId,
    index,
    totalStudents,
    setStatus,
    cycleStatus,
    addPoint,
    saveAttendance,
    container = null,
  } = options

  // Ctrl+S to save attendance
  if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
    e.preventDefault()
    if (typeof saveAttendance === 'function') {
      saveAttendance()
    }
    return
  }

  // Hotkeys for status
  let handledStatus = null
  const key = e.key.toLowerCase()

  if (key === '1' || key === 'h' || key === 'ح') {
    handledStatus = 'present'
  } else if (key === '2' || key === 'g' || key === 'غ') {
    handledStatus = 'absent'
  } else if (key === '3' || key === 't' || key === 'ت') {
    handledStatus = 'late'
  } else if (key === '4' || key === 'm' || key === 'م') {
    handledStatus = 'excused'
  } else if (e.key === ' ') {
    e.preventDefault()
    cycleStatus(studentId)
    return
  } else if (key === '+' || key === '=') {
    e.preventDefault()
    if (typeof addPoint === 'function') addPoint(studentId, 'positive')
    return
  } else if (key === '-') {
    e.preventDefault()
    if (typeof addPoint === 'function') addPoint(studentId, 'negative')
    return
  }

  if (handledStatus) {
    e.preventDefault()
    setStatus(studentId, handledStatus)
    // Automatically advance to next student row for ultra-fast single-keystroke attendance!
    focusStudentRow(index + 1, container)
    return
  }

  if (e.key === 'ArrowDown' || e.key === 'Enter') {
    e.preventDefault()
    focusStudentRow(Math.min(totalStudents - 1, index + 1), container)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    focusStudentRow(Math.max(0, index - 1), container)
  }
}

/**
 * Helper to focus a student row in the attendance table
 * @param {number} targetIndex
 * @param {HTMLElement|string|null} container
 */
function focusStudentRow(targetIndex, container) {
  const parent = typeof container === 'string'
    ? document.querySelector(container)
    : (container || document)

  const row = parent?.querySelector(`[data-attendance-row="${targetIndex}"]`)
  if (row) {
    const focusable = /** @type {HTMLElement} */ (row.querySelector('button, [tabindex="0"]') || row)
    focusable?.focus()
    row.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }
}
