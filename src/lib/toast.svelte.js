/**
 * Unified Toast Notification Store (Svelte 5 Runes)
 *
 * Provides a reactive, singleton toast state and helper methods to trigger
 * toasts from any component, action, or service.
 *
 * Usage:
 *   import { toast, flashToast } from './toast.svelte.js'
 *
 *   toast.success('عملیات با موفقیت انجام شد')
 *   toast.error('خطا در برقراری ارتباط با سرور')
 *   toast.warning('توجه: این عمل غیرقابل بازگشت است')
 *   toast.info('اطلاعات بروزرسانی شدند')
 *
 *   // Backward compatibility alias:
 *   flashToast('پیام مورد نظر', 'success')
 */

let toasts = $state([])
let counter = 0
const timers = new Map()
let lastToastMessage = ''
let lastToastType = ''
let lastToastTime = 0

export function getToastsState() {
  return toasts
}

export function dismissToast(id) {
  if (timers.has(id)) {
    clearTimeout(timers.get(id))
    timers.delete(id)
  }
  toasts = toasts.filter((t) => t.id !== id)
}

export function clearToasts() {
  timers.forEach((timer) => clearTimeout(timer))
  timers.clear()
  toasts = []
}

let activeUndoAction = null

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
      const activeEl = document.activeElement
      const isInput = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.isContentEditable
      )
      if (isInput) return

      if (activeUndoAction) {
        e.preventDefault()
        triggerUndo(activeUndoAction.id)
      }
    }
  })
}

export function triggerUndo(id) {
  if (activeUndoAction && activeUndoAction.id === id) {
    const { onUndo } = activeUndoAction
    dismissToast(id)
    activeUndoAction = null
    try {
      onUndo?.()
    } catch (err) {
      console.error('Undo action failed:', err)
    }
    return true
  }
  return false
}

export function addToast({
  message = '',
  title = null,
  type = 'info', // 'success' | 'error' | 'warning' | 'info' | 'undo'
  duration = 4000,
  dismissible = true,
  onUndo = undefined,
  onConfirm = undefined,
} = {}) {
  const cleanMessage = String(message ?? '').trim()
  if (!cleanMessage) return null

  const resolvedType = ['success', 'error', 'warning', 'info', 'undo'].includes(type) ? type : 'info'

  // Prevent duplicate identical toasts triggered within 1500ms
  const now = Date.now()
  if (cleanMessage === lastToastMessage && resolvedType === lastToastType && (now - lastToastTime) < 1500) {
    return null
  }

  // Prevent duplicate if an identical toast is already active on screen
  if (toasts.some(t => t.message === cleanMessage && t.type === resolvedType)) {
    return null
  }

  lastToastMessage = cleanMessage
  lastToastType = resolvedType
  lastToastTime = now

  const id = ++counter
  const newToast = {
    id,
    message: cleanMessage,
    title: title ? String(title) : null,
    type: resolvedType,
    dismissible,
    duration,
    onUndo,
    onConfirm,
  }

  if (type === 'undo' && onUndo) {
    activeUndoAction = { id, onUndo, onConfirm }
  }

  // Prepend or append? Append so new toasts stack below, or max 5 toasts visible
  toasts = [...toasts, newToast].slice(-5)

  if (duration > 0) {
    const timer = setTimeout(() => {
      if (activeUndoAction?.id === id) {
        const { onConfirm: confirmCb } = activeUndoAction
        activeUndoAction = null
        try {
          confirmCb?.()
        } catch (err) {
          console.error('Confirm action failed:', err)
        }
      }
      dismissToast(id)
    }, duration)
    timers.set(id, timer)
  }

  return id
}

export const toast = {
  success(message, options = {}) {
    return addToast({ ...options, message, type: 'success' })
  },
  error(message, options = {}) {
    return addToast({ ...options, message, type: 'error', duration: options.duration ?? 5000 })
  },
  warning(message, options = {}) {
    return addToast({ ...options, message, type: 'warning' })
  },
  info(message, options = {}) {
    return addToast({ ...options, message, type: 'info' })
  },
  undo(message, { onUndo, onConfirm, duration = 6000, title = null } = {}) {
    return addToast({
      message,
      title,
      type: 'undo',
      duration,
      dismissible: true,
      onUndo,
      onConfirm,
    })
  },
  dismiss(id) {
    dismissToast(id)
  },
  clear() {
    clearToasts()
  },
}

/**
 * Drop-in replacement for the common `flashToast(message, type)` pattern
 * duplicated across various panel views.
 */
export function flashToast(message, type = 'success') {
  const normalizedType = type === 'danger' ? 'error' : type
  return toast[normalizedType] ? toast[normalizedType](message) : toast.info(message)
}
