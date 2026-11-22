/**
 * Offline Sync Queue Manager (Svelte 5 Runes)
 *
 * Catches operations executed during network drops or flaky school connections,
 * queues them safely in localStorage, and automatically replays them when
 * connectivity returns.
 */

import { apiFetch } from './api.js'
import { toast } from './toast.svelte.js'
import { toPersianDigits } from './utils.js'

const STORAGE_KEY = 'offline_sync_queue'

let isOnline = $state(typeof navigator !== 'undefined' ? navigator.onLine : true)
let queue = $state([])
let isSyncing = $state(false)

// Initialize from localStorage
if (typeof window !== 'undefined') {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      queue = JSON.parse(raw) || []
    }
  } catch {}

  window.addEventListener('online', () => {
    isOnline = true
    toast.info('ارتباط با سرور برقرار شد.')
    flushQueue()
  })

  window.addEventListener('offline', () => {
    isOnline = false
    toast.warning('اتصال اینترنت قطع شد. تغییرات به صورت محلی در صف ذخیره می‌شوند.')
  })
}

function persistQueue() {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue))
  } catch {}
}

export async function flushQueue() {
  if (isSyncing || queue.length === 0 || !isOnline) return
  isSyncing = true

  const total = queue.length
  let succeeded = 0
  const remaining = []

  for (const item of queue) {
    try {
      await apiFetch(item.url, {
        method: item.method || 'POST',
        body: item.body,
      })
      succeeded++
    } catch (err) {
      // If server returned 4xx client validation error, discard so it doesn't loop forever
      if (err?.status && err.status >= 400 && err.status < 500) {
        console.warn('Discarding invalid queued request:', item, err)
      } else {
        // Network or server temporary failure, keep in queue
        remaining.push(item)
      }
    }
  }

  queue = remaining
  persistQueue()
  isSyncing = false

  if (succeeded > 0) {
    toast.success(`همگام‌سازی موفق: ${toPersianDigits(succeeded)} تغییر در سرور ثبت شد.`)
  }
}

export const syncQueue = {
  get isOnline() {
    return isOnline
  },
  get isSyncing() {
    return isSyncing
  },
  get count() {
    return queue.length
  },
  get items() {
    return queue
  },
  enqueue({ url, method = 'POST', body = null, title = '' }) {
    const id = 'q_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)
    const item = {
      id,
      url,
      method,
      body,
      title: title || url,
      createdAt: new Date().toISOString(),
    }
    queue = [...queue, item]
    persistQueue()

    if (isOnline) {
      // Try to flush in background
      flushQueue()
    }
    return id
  },
  flush() {
    return flushQueue()
  },
  clear() {
    queue = []
    persistQueue()
  },
}
