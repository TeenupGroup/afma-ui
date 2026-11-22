/**
 * Universal client-side poller for background async tasks.
 *
 * Keeps user informed with smooth progress updates while freeing up
 * web server worker processes from long-running HTTP connections.
 *
 * @param {string} taskId UUID of the async task
 * @param {Object} options
 * @param {function(Object): void} [options.onProgress] Callback receiving task state { progress, message, status }
 * @param {function(Object): void} [options.onComplete] Callback receiving final task result
 * @param {function(string): void} [options.onError] Callback receiving error message
 * @param {number} [options.interval=1200] Polling interval in ms
 * @returns {{ cancel: () => void }} Polling control object
 */
export function pollAsyncTask(taskId, options = {}) {
  const {
    onProgress = () => {},
    onComplete = () => {},
    onError = () => {},
    interval = 1200,
  } = options

  let timer = null
  let cancelled = false

  async function check() {
    if (cancelled || !taskId) return

    try {
      const response = await fetch(`/async-tasks/${taskId}`, {
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          onError('وظیفه مورد نظر یافت نشد.')
          return
        }
        throw new Error(`خطای سرور (${response.status})`)
      }

      const data = await response.json()
      const task = data.task

      if (!task) {
        throw new Error('ساختار پاسخ سرور نامعتبر است.')
      }

      onProgress(task)

      if (task.is_completed) {
        onComplete(task.result || {})
        return
      }

      if (task.is_failed) {
        onError(task.error || task.message || 'عملیات با خطا متوقف شد.')
        return
      }

      if (task.is_cancelled) {
        onError(task.message || 'عملیات لغو گردید.')
        return
      }

      // Continue polling
      if (!cancelled) {
        timer = setTimeout(check, interval)
      }
    } catch (err) {
      if (!cancelled) {
        // Retry on network glitch up to a few seconds
        timer = setTimeout(check, interval * 1.5)
      }
    }
  }

  // Initial check
  check()

  return {
    cancel() {
      cancelled = true
      if (timer) clearTimeout(timer)
      // Best-effort notify server
      try {
        fetch(`/async-tasks/${taskId}/cancel`, {
          method: 'POST',
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          },
        }).catch(() => {})
      } catch {
        // Ignore
      }
    },
  }
}
