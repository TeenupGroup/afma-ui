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

function clearTimerFor(id) {
  if (timers.has(id)) {
    clearTimeout(timers.get(id))
    timers.delete(id)
  }
}

function settlePendingConfirm(item) {
  if (!item || item.settled) return
  item.settled = true
  if (typeof item.onConfirm === 'function') {
    const cb = item.onConfirm
    item.onConfirm = undefined
    try {
      cb()
    } catch (err) {
      console.error('Confirm action failed:', err)
    }
  }
}

export function dismissToast(id, { runConfirm = false } = {}) {
  clearTimerFor(id)
  const target = toasts.find((t) => t.id === id)
  if (target) {
    if (runConfirm) {
      settlePendingConfirm(target)
    } else {
      target.settled = true
    }
  }
  toasts = toasts.filter((t) => t.id !== id)
}

export function clearToasts() {
  timers.forEach((timer) => clearTimeout(timer))
  timers.clear()
  for (const item of toasts) {
    item.settled = true
  }
  toasts = []
}

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
      const activeEl = document.activeElement
      const isInput =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.isContentEditable)
      if (isInput) return

      const latestUndo = [...toasts]
        .reverse()
        .find((t) => t.type === 'undo' && typeof t.onUndo === 'function' && !t.settled)
      if (latestUndo) {
        e.preventDefault()
        triggerUndo(latestUndo.id)
      }
    }
  })
}

export function triggerUndo(id) {
  const target = toasts.find((t) => t.id === id)
  if (target && typeof target.onUndo === 'function' && !target.settled) {
    target.settled = true
    const undoCb = target.onUndo
    target.onUndo = undefined
    target.onConfirm = undefined
    dismissToast(id, { runConfirm: false })
    try {
      undoCb()
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
  replaceDuplicate = false,
} = {}) {
  const cleanMessage = String(message ?? '').trim()
  if (!cleanMessage) return null

  const resolvedType = ['success', 'error', 'warning', 'info', 'undo'].includes(type) ? type : 'info'
  const now = Date.now()

  if (replaceDuplicate) {
    const existing = toasts.filter((t) => t.message === cleanMessage && t.type === resolvedType)
    for (const dup of existing) {
      dismissToast(dup.id, { runConfirm: false })
    }
  } else {
    if (cleanMessage === lastToastMessage && resolvedType === lastToastType && now - lastToastTime < 1500) {
      return null
    }
    if (toasts.some((t) => t.message === cleanMessage && t.type === resolvedType)) {
      return null
    }
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
    settled: false,
  }

  const combined = [...toasts, newToast]
  if (combined.length > 5) {
    const evicted = combined.slice(0, combined.length - 5)
    for (const oldItem of evicted) {
      clearTimerFor(oldItem.id)
      settlePendingConfirm(oldItem)
    }
  }
  toasts = combined.slice(-5)

  if (duration > 0) {
    const timer = setTimeout(() => {
      dismissToast(id, { runConfirm: true })
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
    dismissToast(id, { runConfirm: true })
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
