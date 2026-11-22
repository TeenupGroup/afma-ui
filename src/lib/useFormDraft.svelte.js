/**
 * Form Draft Auto-Save Rune (Svelte 5)
 *
 * Automatically saves dirty form states into localStorage and provides
 * safe crash-recovery so users never lose their written work.
 *
 * Usage:
 *   const draft = createFormDraft('teacher:exam:create', () => form.data())
 *   // On mount:
 *   if (draft.hasDraft) {
 *     // show recovery banner or draft.restore()
 *   }
 *   // When form submits successfully:
 *   draft.clear()
 */

import { toPersianDigits, fmtDateLong } from './utils.js'

export function createFormDraft(storageKey) {
  const fullKey = `form_draft:${storageKey}`

  let hasDraft = $state(false)
  let savedAt = $state('')
  let savedData = $state(null)
  let saveTimer = null

  // Check on initialization
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(fullKey)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && parsed.data) {
          savedData = parsed.data
          hasDraft = true
          savedAt = parsed.timestamp ? fmtDateLong(parsed.timestamp) : ''
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  function save(data) {
    if (typeof window === 'undefined') return
    clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      try {
        const payload = {
          data,
          timestamp: new Date().toISOString(),
        }
        localStorage.setItem(fullKey, JSON.stringify(payload))
        savedData = data
        savedAt = fmtDateLong(payload.timestamp)
        hasDraft = true
      } catch (e) {
        console.warn('Failed to save form draft:', e)
      }
    }, 400)
  }

  function restore() {
    return savedData
  }

  function clear() {
    if (typeof window === 'undefined') return
    clearTimeout(saveTimer)
    try {
      localStorage.removeItem(fullKey)
    } catch {}
    savedData = null
    hasDraft = false
    savedAt = ''
  }

  return {
    get hasDraft() {
      return hasDraft
    },
    get savedAt() {
      return savedAt
    },
    get savedData() {
      return savedData
    },
    save,
    restore,
    clear,
  }
}
