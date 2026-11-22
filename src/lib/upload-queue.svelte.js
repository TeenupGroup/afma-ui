/**
 * Universal Asynchronous Upload Queue Manager (Svelte 5 Runes)
 *
 * Designed for shared hosting resilience:
 * - Bounded concurrency (e.g. 2 parallel image uploads, 1 video upload)
 * - Automatic client-side pre-compression via HTML5 Canvas (downsizes multi-megapixel photos)
 * - Prevents 504 Gateway Timeouts, 413 Payload Too Large, and PHP OOM errors
 * - Real-time per-file progress, cancel, and individual retry
 */

import { compressImageFile } from './compression.js'

/**
 * Get active CSRF token from DOM meta tags.
 *
 * @returns {string}
 */
function getCsrfToken() {
  if (typeof document === 'undefined') return ''
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
}

/**
 * Check if a file is an image based on MIME or extension.
 *
 * @param {File} file
 * @returns {boolean}
 */
export function isImageFile(file) {
  if (!file) return false
  if (file.type && file.type.startsWith('image/')) return true
  return /\.(jpe?g|png|webp|gif|bmp|heic|heif|jfif|svg|tiff?)$/i.test(file.name || '')
}

/**
 * Check if a file is a video based on MIME or extension.
 *
 * @param {File} file
 * @returns {boolean}
 */
export function isVideoFile(file) {
  if (!file) return false
  if (file.type && file.type.startsWith('video/')) return true
  return /\.(mp4|webm|ogg|mov|m4v|avi|mkv)$/i.test(file.name || '')
}

/**
 * Factory to create an isolated reactive upload queue.
 *
 * @param {Object} [options]
 * @param {string} [options.endpoint='/admin/media/upload'] - Upload POST endpoint
 * @param {string} [options.fieldName='image'] - FormData field name ('image', 'video', 'file')
 * @param {number} [options.concurrency=2] - Max parallel active uploads
 * @param {boolean} [options.autoCompress=true] - Auto-compress images before network transmission
 * @param {Object} [options.compressOptions] - Options passed to compressImageFile
 * @param {string} [options.category] - Server storage category (e.g. 'news/gallery')
 * @param {number} [options.maxSize=15728640] - Max file size in bytes (default 15MB)
 * @param {Function} [options.onItemComplete] - Callback on item completion
 * @param {Function} [options.onQueueComplete] - Callback when all items in queue finish
 * @returns {UploadQueue}
 */
export function createUploadQueue(options = {}) {
  const {
    endpoint = '/admin/media/upload',
    fieldName = 'image',
    concurrency = 2,
    autoCompress = true,
    compressOptions = { maxWidth: 1920, maxHeight: 1920, quality: 0.82 },
    category = '',
    maxSize = 15 * 1024 * 1024,
    onItemComplete = null,
    onQueueComplete = null,
  } = options

  let items = $state([])
  let activeWorkers = $state(0)

  // Derived metrics
  let totalCount = $derived(items.length)
  let completedCount = $derived(items.filter((i) => i.status === 'completed').length)
  let failedCount = $derived(items.filter((i) => i.status === 'error').length)
  let activeCount = $derived(items.filter((i) => i.status === 'uploading' || i.status === 'compressing').length)
  let isBusy = $derived(items.some((i) => i.status === 'queued' || i.status === 'compressing' || i.status === 'uploading'))
  let hasErrors = $derived(failedCount > 0)

  let progress = $derived.by(() => {
    if (items.length === 0) return 0
    const sum = items.reduce((acc, curr) => {
      if (curr.status === 'completed') return acc + 100
      if (curr.status === 'uploading') return acc + (curr.progress || 0)
      if (curr.status === 'compressing') return acc + 10
      return acc
    }, 0)
    return Math.round(sum / items.length)
  })

  /**
   * Process the next queued items respecting concurrency limits.
   */
  function pump() {
    if (activeWorkers >= concurrency) return

    const nextItem = items.find((i) => i.status === 'queued')
    if (!nextItem) {
      if (activeWorkers === 0 && items.length > 0) {
        const allDone = items.every((i) => i.status === 'completed' || i.status === 'error' || i.status === 'cancelled')
        if (allDone && onQueueComplete) {
          onQueueComplete(items.filter((i) => i.status === 'completed'))
        }
      }
      return
    }

    startUpload(nextItem)
    pump()
  }

  /**
   * Execute single item upload flow.
   *
   * @param {Object} item
   */
  async function startUpload(item) {
    activeWorkers++

    try {
      let fileToSend = item.file

      // Step 1: Pre-compression if image
      if (autoCompress && isImageFile(item.file)) {
        item.status = 'compressing'
        try {
          const compressed = await compressImageFile(item.file, compressOptions)
          if (compressed && compressed.size > 0 && compressed.size < item.file.size) {
            fileToSend = compressed
            item.wasCompressed = true
            item.compressedSize = compressed.size
          }
        } catch {
          // If compression fails, proceed with original file safely
        }
      }

      // Check if cancelled during compression
      if (item.status === 'cancelled') {
        activeWorkers--
        pump()
        return
      }

      // Step 2: Upload via XMLHttpRequest
      item.status = 'uploading'
      item.progress = 0

      const formData = new FormData()
      formData.append(fieldName, fileToSend)
      if (category) {
        formData.append('category', category)
      }

      const xhr = new XMLHttpRequest()
      item.xhr = xhr

      xhr.open('POST', endpoint, true)
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
      xhr.setRequestHeader('Accept', 'application/json')

      const token = getCsrfToken()
      if (token) {
        xhr.setRequestHeader('X-CSRF-TOKEN', token)
      }

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && item.status === 'uploading') {
          item.progress = Math.round((e.loaded / e.total) * 100)
        }
      }

      xhr.onload = () => {
        activeWorkers--
        item.xhr = null

        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText)
            const finalUrl = data.url || (Array.isArray(data.urls) ? data.urls[0] : null)
            if (finalUrl) {
              item.status = 'completed'
              item.progress = 100
              item.url = finalUrl
              item.error = ''
              if (onItemComplete) {
                onItemComplete(item, data)
              }
            } else {
              item.status = 'error'
              item.error = data.message || 'پاسخ سرور فاقد آدرس فایل بود.'
            }
          } catch {
            item.status = 'error'
            item.error = 'قالب پاسخ سرور نامعتبر است.'
          }
        } else if (xhr.status === 504) {
          item.status = 'error'
          item.error = 'مهلت زمان سرور به پایان رسید (خطای ۵۰۴). لطفاً دکمه تلاش مجدد را بزنید.'
        } else if (xhr.status === 413) {
          item.status = 'error'
          item.error = 'حجم فایل بیش از سقف مجاز سرور است.'
        } else if (xhr.status === 419) {
          item.status = 'error'
          item.error = 'نشست کاری شما منقضی شده است. لطفاً صفحه را تازه‌سازی کنید.'
        } else if (xhr.status === 422) {
          try {
            const errData = JSON.parse(xhr.responseText)
            const msg = errData.message || (errData.errors ? Object.values(errData.errors).flat()[0] : null)
            item.status = 'error'
            item.error = msg || 'فرمت یا مشخصات فایل تایید نشد.'
          } catch {
            item.status = 'error'
            item.error = 'خطای اعتبارسنجی فایل در سرور.'
          }
        } else {
          item.status = 'error'
          item.error = `خطای سرور (${xhr.status}).`
        }

        pump()
      }

      xhr.onerror = () => {
        activeWorkers--
        item.xhr = null
        item.status = 'error'
        item.error = 'خطا در ارتباط شبکه با سرور.'
        pump()
      }

      xhr.onabort = () => {
        activeWorkers--
        item.xhr = null
        item.status = 'cancelled'
        pump()
      }

      xhr.send(formData)
    } catch (err) {
      activeWorkers--
      item.xhr = null
      item.status = 'error'
      item.error = err?.message || 'خطای پردازش فایل.'
      pump()
    }
  }

  return {
    get items() {
      return items
    },
    get isBusy() {
      return isBusy
    },
    get hasErrors() {
      return hasErrors
    },
    get totalCount() {
      return totalCount
    },
    get completedCount() {
      return completedCount
    },
    get failedCount() {
      return failedCount
    },
    get activeCount() {
      return activeCount
    },
    get progress() {
      return progress
    },

    /**
     * Enqueue one or more files.
     *
     * @param {File|FileList|File[]} files
     */
    addFiles(files) {
      const fileArr = Array.isArray(files) ? files : Array.from(files || [])
      const newEntries = []

      for (const f of fileArr) {
        if (!f || !(f instanceof File)) continue

        let previewUrl = null
        if (isImageFile(f) || isVideoFile(f)) {
          try {
            previewUrl = URL.createObjectURL(f)
          } catch {}
        }

        const id = 'uq_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8)
        const isOverSize = maxSize && f.size > maxSize

        newEntries.push({
          id,
          file: f,
          name: f.name,
          size: f.size,
          type: f.type,
          status: isOverSize ? 'error' : 'queued',
          progress: 0,
          url: null,
          previewUrl,
          error: isOverSize ? `حجم فایل بیش از حد مجاز (${Math.round(maxSize / (1024 * 1024))}MB) است.` : '',
          wasCompressed: false,
          compressedSize: 0,
          xhr: null,
        })
      }

      if (newEntries.length > 0) {
        items = [...items, ...newEntries]
        pump()
      }
    },

    /**
     * Retry a specific failed or cancelled item.
     *
     * @param {string} id
     */
    retry(id) {
      const target = items.find((i) => i.id === id)
      if (target && (target.status === 'error' || target.status === 'cancelled')) {
        target.status = 'queued'
        target.error = ''
        target.progress = 0
        pump()
      }
    },

    /**
     * Retry all failed items in the queue.
     */
    retryAll() {
      let retried = false
      items.forEach((i) => {
        if (i.status === 'error' || i.status === 'cancelled') {
          i.status = 'queued'
          i.error = ''
          i.progress = 0
          retried = true
        }
      })
      if (retried) pump()
    },

    /**
     * Cancel an ongoing upload.
     *
     * @param {string} id
     */
    cancel(id) {
      const target = items.find((i) => i.id === id)
      if (!target) return

      if (target.xhr) {
        try {
          target.xhr.abort()
        } catch {}
      }
      target.status = 'cancelled'
    },

    /**
     * Remove an item from the queue and revoke its preview URL.
     *
     * @param {string} id
     */
    remove(id) {
      const target = items.find((i) => i.id === id)
      if (target) {
        if (target.xhr) {
          try {
            target.xhr.abort()
          } catch {}
        }
        if (target.previewUrl) {
          try {
            URL.revokeObjectURL(target.previewUrl)
          } catch {}
        }
      }
      items = items.filter((i) => i.id !== id)
    },

    /**
     * Clear all items in queue and abort running requests.
     */
    clear() {
      items.forEach((i) => {
        if (i.xhr) {
          try {
            i.xhr.abort()
          } catch {}
        }
        if (i.previewUrl) {
          try {
            URL.revokeObjectURL(i.previewUrl)
          } catch {}
        }
      })
      items = []
      activeWorkers = 0
    },

    /**
     * Get array of all successfully uploaded URLs.
     *
     * @returns {string[]}
     */
    getCompletedUrls() {
      return items.filter((i) => i.status === 'completed' && i.url).map((i) => i.url)
    },
  }
}
